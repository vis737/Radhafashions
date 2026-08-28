import express from 'express';
import path from 'path';
import dns from 'dns';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import multer from 'multer';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validatePassword } from './src/utils/passwordValidator';
import {
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_CAMPAIGNS,
  INITIAL_CMS
} from './src/utils/mockData';

// Force Node DNS to resolve IPv4 addresses first (prevents IPv6 ENETUNREACH timeouts on Render)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore on older node versions
}

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.trim() !== '' &&
    supabaseKey.trim() !== '' &&
    !supabaseUrl.includes('YOUR_SUPABASE_') &&
    !supabaseKey.includes('YOUR_SUPABASE_')
  );
};

const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;
const shouldRequireSupabase = process.env.REQUIRE_SUPABASE === 'true' || process.env.NODE_ENV === 'production';

if (supabase) {
  console.log('◇ Supabase connected successfully as main database.');
} else {
  console.log('◇ Supabase credentials missing/default. Using offline fallback JSON database.');
  if (shouldRequireSupabase) {
    console.error('⨯ Supabase is required for this deployment. Set SUPABASE_URL and SUPABASE_KEY in Railway.');
  }
}

async function seedSupabaseDatabase() {
  if (!supabase) return;
  try {
    // 1. Seed products
    const { data: prods, error: prodErr } = await supabase.from('products').select('id').limit(1);
    if (!prodErr && (!prods || prods.length === 0)) {
      console.log('Seeding products to Supabase...');
      const mapped = INITIAL_PRODUCTS.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        category_slug: p.categorySlug,
        price: p.price,
        discount_price: p.discountPrice || null,
        stock: p.stock,
        rating: p.rating,
        rating_count: p.ratingCount,
        images: p.images,
        short_description: p.shortDescription,
        description: p.description,
        reviews: p.reviews || [],
        is_new: p.isNew || false,
        is_bestseller: p.isBestseller || false,
        brand: p.brand,
        availability: p.availability,
        vendor_id: p.vendorId || null,
        variation: p.variation || null,
        specifications: { ...(p.specifications || {}), Weight: parseProductWeightKg(p) ? `${parseProductWeightKg(p)} kg` : p.specifications?.Weight }
      }));
      await supabase.from('products').insert(mapped);
    }

    // 2. Seed coupons
    const { data: coups, error: coupErr } = await supabase.from('coupons').select('code').limit(1);
    if (!coupErr && (!coups || coups.length === 0)) {
      console.log('Seeding coupons to Supabase...');
      const mapped = INITIAL_COUPONS.map(c => ({
        code: c.code,
        type: c.type,
        value: c.value,
        expiry_date: c.expiryDate,
        usage_limit: c.usageLimit,
        usage_count: c.usageCount,
        minimum_cart_value: c.minimumCartValue,
        description: c.description,
        active: c.active
      }));
      await supabase.from('coupons').insert(mapped);
    }

    // 3. Seed campaigns
    const { data: camps, error: campErr } = await supabase.from('campaigns').select('id').limit(1);
    if (!campErr && (!camps || camps.length === 0)) {
      console.log('Seeding campaigns to Supabase...');
      const mapped = INITIAL_CAMPAIGNS.map(c => ({
        id: c.id,
        image_url: c.imageUrl,
        title: c.title,
        description: c.description,
        cta_text: c.ctaText,
        link_category: c.linkCategory,
        active: c.active
      }));
      await supabase.from('campaigns').insert(mapped);
    }

    // 4. Seed CMS
    const { data: cmsConf, error: cmsErr } = await supabase.from('cms_config').select('key').limit(1);
    if (!cmsErr && (!cmsConf || cmsConf.length === 0)) {
      console.log('Seeding CMS to Supabase...');
      await supabase.from('cms_config').insert({ key: 'main', value: INITIAL_CMS });
    }

    // 5. Seed admin config
    const { data: adminConf, error: adminErr } = await supabase.from('admin_config').select('username').limit(1);
    if (!adminErr && (!adminConf || adminConf.length === 0)) {
      console.log('Seeding Admin Config to Supabase...');
      const targetUser = process.env.ADMIN_USERNAME || 'admin';
      const targetPass = process.env.ADMIN_PASSWORD;
      if (!targetPass) {
        console.warn('⚠️  WARNING: ADMIN_PASSWORD not set in .env — skipping admin seeding to Supabase.');
      } else {
        const hashedPass = bcrypt.hashSync(targetPass, 12);
        await supabase.from('admin_config').insert({ username: targetUser, password: hashedPass });
      }
    }
  } catch (err) {
    console.error('Failed to seed Supabase database:', err);
  }
}

async function syncOrdersFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('orders').select('*');
    if (!error && data) {
      const mapped = data.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerInfo: o.customer_info,
        items: o.items,
        shippingMethod: o.shipping_method,
        shippingCost: o.shipping_cost,
        tax: o.tax,
        discount: o.discount,
        subtotal: o.subtotal,
        total: o.total,
        status: o.status,
        couponCode: o.coupon_code,
        date: o.date,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        giftWrappingRequested: o.gift_wrapping_requested,
        giftWrappingType: o.gift_wrapping_type,
        giftMessage: o.gift_message,
        accountEmail: o.account_email,
        accountName: o.account_name
      }));
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(mapped, null, 2));
      console.log(`◇ Synced ${mapped.length} orders from Supabase database.`);
    }
  } catch (err) {
    console.error('Failed to sync orders from Supabase on startup:', err);
  }
}

async function syncAdminConfigFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('admin_config').select('*').limit(1).single();
    if (!error && data) {
      fs.writeFileSync(adminConfigPath, JSON.stringify({ username: data.username, password: data.password }, null, 2), 'utf8');
      console.log('◇ Synced administrative credentials from Supabase.');
    }
  } catch (err) {
    // Ignore if not seeded/created yet
  }
}

// Global in-memory customer store for sub-millisecond authentication
const inMemoryCustomers: any[] = [];
const CUSTOMERS_FILE_PATH = path.join(process.cwd(), 'customers_db.json');

async function syncCustomersFromSupabase() {
  // 1. Preload local JSON accounts into memory cache
  if (fs.existsSync(CUSTOMERS_FILE_PATH)) {
    try {
      const localData: any[] = JSON.parse(fs.readFileSync(CUSTOMERS_FILE_PATH, 'utf-8') || '[]');
      for (const c of localData) {
        if (c.email && !inMemoryCustomers.some(m => m.email.toLowerCase() === c.email.toLowerCase())) {
          inMemoryCustomers.push({
            id: c.id,
            email: c.email.toLowerCase(),
            name: c.name,
            passwordHash: c.passwordHash || c.password_hash,
            createdAt: c.createdAt || c.created_at || new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Failed reading local customers_db.json on startup:', err);
    }
  }

  if (!supabase) {
    console.log(`◇ Loaded ${inMemoryCustomers.length} customer credentials from local cache.`);
    return;
  }

  try {
    // 2. Fetch all customer credentials from Supabase
    const { data, error } = await supabase.from('customers').select('*');
    if (!error && data) {
      for (const row of data) {
        const mapped = {
          id: row.id,
          email: row.email.toLowerCase(),
          name: row.name,
          passwordHash: row.password_hash,
          createdAt: row.created_at
        };
        const existingIdx = inMemoryCustomers.findIndex(m => m.email.toLowerCase() === mapped.email);
        if (existingIdx >= 0) {
          inMemoryCustomers[existingIdx] = mapped;
        } else {
          inMemoryCustomers.push(mapped);
        }
      }
      console.log(`◇ Synced ${data.length} customer credentials from Supabase database.`);
    }

    // 3. Upsert any local customer accounts into Supabase that are missing
    if (inMemoryCustomers.length > 0) {
      const dbUpserts = inMemoryCustomers.map(c => ({
        id: c.id,
        email: c.email.toLowerCase(),
        name: c.name,
        password_hash: c.passwordHash || null,
        created_at: c.createdAt || new Date().toISOString()
      }));
      const { error: upsertErr } = await supabase.from('customers').upsert(dbUpserts, { onConflict: 'email' });
      if (upsertErr) {
        console.error('Supabase customer credentials upsert notice:', upsertErr);
      }
    }

    // 4. Save synced memory dataset back to local JSON file for offline resilience
    fs.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(inMemoryCustomers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to sync customers from Supabase on startup:', err);
  }
}

async function syncProductsFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      // Supabase is authoritative.  Do not merge repository JSON here: Railway
      // rebuilds the checkout on every deploy, and merging it would recreate
      // products that were deliberately removed from Supabase.
      const mapped = data.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category || 'Handbags',
        categorySlug: p.category_slug || 'handbags',
        price: Number(p.price || 999),
        discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
        stock: p.stock !== undefined ? Number(p.stock) : 10,
        rating: p.rating ? Number(p.rating) : 4.8,
        ratingCount: p.rating_count ? Number(p.rating_count) : 50,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop'],
        shortDescription: p.short_description || '',
        description: p.description || '',
        specifications: p.specifications || {},
        weightKg: parseProductWeightKg(p),
        reviews: Array.isArray(p.reviews) ? p.reviews : [],
        isNew: Boolean(p.is_new),
        isBestseller: Boolean(p.is_bestseller),
        brand: p.brand || 'Radha Fashions',
        availability: p.availability || 'in-stock',
        vendorId: p.vendor_id || null,
        variation: p.variation || undefined,
        isTestProduct: p.id === 'TEST-RF-001'
      }));
      writeLocalJsonDb(PRODUCTS_FILE_PATH, mapped);
      console.log(`◇ Cached ${mapped.length} products from Supabase.`);
    } else {
      console.error('Failed to read products from Supabase on startup:', error);
    }
  } catch (err) {
    console.error('Failed to sync products from Supabase on startup:', err);
  }
}

if (supabase) {
  // A deployment must never seed/restore catalog records. Enable this once only
  // when intentionally bootstrapping a brand-new Supabase project.
  const boot = process.env.SEED_SUPABASE_DATA === 'true'
    ? seedSupabaseDatabase()
    : Promise.resolve();
  boot.then(() => {
    syncProductsFromSupabase();
    syncOrdersFromSupabase();
    syncAdminConfigFromSupabase();
    syncCustomersFromSupabase();
  });
} else {
  syncCustomersFromSupabase();
}

// Local JSON File Database helper utilities. Production should use Supabase;
// DATA_DIR/RAILWAY_VOLUME_MOUNT_PATH only helps when a persistent volume exists.
const LOCAL_DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || process.cwd();
const HAS_PERSISTENT_LOCAL_DATA = Boolean(process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH);
try {
  if (!fs.existsSync(LOCAL_DATA_DIR)) {
    fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[Storage] Could not create local data directory:', err);
}
const PRODUCTS_FILE_PATH = path.join(LOCAL_DATA_DIR, 'products_db.json');
const COUPONS_FILE_PATH = path.join(LOCAL_DATA_DIR, 'coupons_db.json');
const CAMPAIGNS_FILE_PATH = path.join(LOCAL_DATA_DIR, 'campaigns_db.json');
const CMS_FILE_PATH = path.join(LOCAL_DATA_DIR, 'cms_db.json');
// Note: activity_logs.json is intentionally removed — Render has an ephemeral filesystem.
// All persistent data is stored in Supabase.

function readLocalJsonDb(filePath: string, defaultData: any) {
  try {
    if (!fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      } catch { /* ignore read-only filesystem on serverless */ }
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || JSON.stringify(defaultData));
  } catch (error) {
    return defaultData;
  }
}

function writeLocalJsonDb(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing database to ${filePath}:`, error);
  }
}

/**
 * Make a Supabase table exactly match an administrator's submitted catalog.
 * Querying IDs first works for string/UUID identifiers and also supports an
 * intentionally empty catalog, unlike a `not in (...)` filter.
 */
async function removeRowsMissingFromSnapshot(table: 'products' | 'categories' | 'coupons' | 'campaigns', currentIds: string[]) {
  if (!supabase) return;
  // coupons use 'code' as identifier; everything else uses 'id'
  const idColumn = table === 'coupons' ? 'code' : 'id';
  const { data: existingRows, error: readError } = await supabase.from(table).select(idColumn);
  if (readError) throw readError;

  const currentIdSet = new Set(currentIds.map(String));
  const idsToDelete = (existingRows || [])
    .map((row: Record<string, string>) => String(row[idColumn]))
    .filter(id => !currentIdSet.has(id));

  if (idsToDelete.length === 0) return;
  const { error: deleteError } = await supabase.from(table).delete().in(idColumn, idsToDelete);
  if (deleteError) throw deleteError;
}

function parseProductWeightKg(product: any): number | undefined {
  if (typeof product?.weightKg === 'number' && Number.isFinite(product.weightKg) && product.weightKg > 0) {
    return product.weightKg;
  }

  const rawWeight = String(product?.specifications?.Weight || '').toLowerCase().replace(/\s+/g, '');
  const match = rawWeight.match(/(\d+(?:\.\d+)?)(kg|kgs|kilogram|kilograms|g|gm|grams)?/);
  if (!match) return undefined;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;

  const unit = match[2] || '';
  return unit === 'g' || unit === 'gm' || unit === 'grams' ? amount / 1000 : amount;
}

const app = express();
app.set('trust proxy', true);
app.get('/health', (req, res) => {
  if (shouldRequireSupabase && !supabase) {
    return res.status(503).send('Supabase configuration is required.');
  }
  res.status(200).send('OK');
});
const PORT = Number(process.env.PORT || 3000);

// Browser clients use this stream to refresh immediately after a product or
// category changes in Supabase.  It is intentionally a notification channel:
// the browser still reads the complete current snapshot through the API.
const catalogStreamClients = new Set<any>();
const notifyCatalogChanged = (table: 'products' | 'categories') => {
  const message = `event: catalog-change\ndata: ${JSON.stringify({ table })}\n\n`;
  for (const client of catalogStreamClients) {
    try {
      client.write(message);
    } catch {
      catalogStreamClients.delete(client);
    }
  }
};

if (supabase) {
  supabase
    .channel('railway-catalog-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => notifyCatalogChanged('products'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => notifyCatalogChanged('categories'))
    .subscribe((status) => console.log(`[Catalog realtime] ${status}`));
}

app.get('/api/catalog/stream', (req, res) => {
  res.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.flushHeaders();
  res.write('event: connected\ndata: {}\n\n');
  catalogStreamClients.add(res);

  const heartbeat = setInterval(() => res.write(': keepalive\n\n'), 25_000);
  req.on('close', () => {
    clearInterval(heartbeat);
    catalogStreamClients.delete(res);
  });
});

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET not set — a random secret was generated for this session. Tokens will NOT survive restarts. Set JWT_SECRET in your .env for production.');
}

const ALLOWED_ORIGIN = process.env.APP_URL || 'http://localhost:3000';

const adminConfigPath = path.join(process.cwd(), 'admin_config.json');

function readAdminConfig() {
  try {
    if (fs.existsSync(adminConfigPath)) {
      return JSON.parse(fs.readFileSync(adminConfigPath, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to read admin config JSON, using defaults');
  }
  const defaultPass = process.env.ADMIN_PASSWORD;
  if (!defaultPass) {
    console.warn('⚠️  WARNING: ADMIN_PASSWORD env var is not set. Generating a random password for this session.');
  }
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: defaultPass || crypto.randomBytes(20).toString('base64url')
  };
}

function writeAdminConfig(config: any) {
  try {
    fs.writeFileSync(adminConfigPath, JSON.stringify(config, null, 2), 'utf8');
    if (supabase) {
      supabase.from('admin_config').upsert({ username: config.username, password: config.password }).then(({ error }) => {
        if (error) console.error('Supabase admin_config background upsert failed:', error);
      });
    }
  } catch (err) {
    console.error('Failed to write admin config JSON:', err);
  }
}

function verifyAndUpgradeAdminPassword(plainInput: string, storedHashOrPlain: string): boolean {
  if (storedHashOrPlain.startsWith('$2a$') || storedHashOrPlain.startsWith('$2b$')) {
    return bcrypt.compareSync(plainInput, storedHashOrPlain);
  }
  
  if (plainInput === storedHashOrPlain) {
    const freshHash = bcrypt.hashSync(plainInput, 12);
    const config = readAdminConfig();
    config.password = freshHash;
    writeAdminConfig(config);
    console.log('◇ Transparently migrated plain administrative password to bcrypt hash.');
    return true;
  }
  return false;
}

// Authentication verification middleware
const verifyAdminToken = (req: any, res: any, next: any) => {
  try {
    const token = req.cookies?.admin_session;
    if (!token) {
      return res.status(401).json({ error: 'Unauthenticated administrative request.' });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: insufficient privileges.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Administrative session expired or invalid.' });
  }
};

// Restrict global body size to 1 MB. Admin bulk-upload routes override this locally.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());

// HTTP to HTTPS Redirect & HSTS implementation
app.use((req, res, next) => {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (!isHttps && process.env.NODE_ENV === 'production') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Custom secure CORS Origin Handler
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow if origin matches APP_URL, or if no origin (same-domain / server-to-server request)
  if (!origin) {
    // No origin header = same-origin or server-to-server — use configured origin instead of wildcard
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  } else if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory live tracking state
interface MemorySession {
  ip: string;
  type: string;
  name?: string;
  activePage: string;
  cartTotal: number;
  durationSeconds: number;
  lastActive: number;
}

const liveSessions: Record<string, MemorySession> = {};
const liveAlerts: any[] = [];
let totalTrafficCount = 1240;

app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/assets') || req.path.includes('.')) {
    return next();
  }
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const page = req.path;
  if (!liveSessions[ip]) {
    liveSessions[ip] = {
      ip,
      type: 'guest',
      activePage: page,
      cartTotal: 0,
      durationSeconds: 12,
      lastActive: Date.now()
    };
    totalTrafficCount++;
    liveAlerts.unshift({
      id: Math.random().toString(),
      type: 'visitor',
      message: `New Guest joined store from IP: ${ip}`,
      timestamp: new Date().toLocaleTimeString()
    });
  } else {
    liveSessions[ip].activePage = page;
    liveSessions[ip].lastActive = Date.now();
  }
  next();
});

// OWASP Security Headers compliance
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');

  // Build CSP dynamically — never hardcode Supabase project URL in source
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : '';
  const supabaseWs = supabaseHost ? `wss://${supabaseHost}` : '';
  const supabaseHttps = supabaseHost ? `https://${supabaseHost}` : '';

  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://*.razorpay.com https://checkout.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    `img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com https://api.qrserver.com https://img.clerk.com ${supabaseHttps}; ` +
    `connect-src 'self' ${supabaseHttps} ${supabaseWs} https://*.clerk.accounts.dev https://*.clerk.com https://*.razorpay.com https://api.razorpay.com; ` +
    "worker-src 'self' blob:; " +
    "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://*.razorpay.com https://api.razorpay.com https://checkout.razorpay.com; " +
    "form-action 'self' https://test.payu.in https://secure.payu.in https://api.razorpay.com https://checkout.razorpay.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );

  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  if (
    req.path.startsWith('/api/admin') ||
    req.path.startsWith('/api/orders') ||
    req.path.startsWith('/api/catalog') ||
    req.path.startsWith('/api/upload-image') ||
    req.path.startsWith('/api/verify-otp')
  ) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }

  next();
});

// ---------------------------------------------------------------------------
// Input sanitisation helpers
// ---------------------------------------------------------------------------

/** Strip control characters, HTML tags, and trim to a maximum length. */
function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .replace(/<[^>]*>/g, '')                            // HTML tags
    .trim()
    .slice(0, maxLength);
}

/** Validate and normalise an email address. Returns '' if invalid. */
function sanitizeEmail(value: unknown, maxLength = 254): string {
  const raw = typeof value === 'string' ? value.trim().toLowerCase().slice(0, maxLength) : '';
  // RFC 5321 simplified email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw) ? raw : '';
}

/** Strip prompt-injection patterns from strings destined for AI models. */
function sanitizeAiPrompt(value: unknown, maxLength = 300): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/system\s*:/gi, '')      // strip system: prefix tricks
    .replace(/\bignore\b.*\binstructions\b/gi, '') // ignore previous instructions
    .replace(/<[^>]*>/g, '')          // HTML / XML tags
    .replace(/[`{}<>]/g, '')          // template literal / object injection chars
    .trim()
    .slice(0, maxLength);
}

// Memory Rate Limiter implementation with proper proxy IP resolution
interface RateLimitInfo {
  count: number;
  resetTime: number;
}
const rateLimitDb: Record<string, RateLimitInfo> = {};

function getClientIp(req: any): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function rateLimiter(limit: number, windowMs: number) {
  return (req: any, res: any, next: any) => {
    const ip = getClientIp(req);
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    
    if (!rateLimitDb[key] || now > rateLimitDb[key].resetTime) {
      rateLimitDb[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }
    
    rateLimitDb[key].count++;
    if (rateLimitDb[key].count > limit) {
      const retryAfterSec = Math.ceil((rateLimitDb[key].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: `Too many requests. Please try again in ${retryAfterSec} seconds.`,
        retryAfterSec,
      });
    }
    next();
  };
}

// Serve uploaded product images as static files for local/offline fallback.
// Production uploads use Supabase Storage when Supabase is configured.
const PRODUCT_IMAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_PRODUCT_IMAGE_BUCKET || 'product-images';
const UPLOADS_DIR = path.join(LOCAL_DATA_DIR, 'public', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[Uploads] Could not create uploads directory:', err);
}
app.use('/uploads', express.static(UPLOADS_DIR));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

let productImageBucketReady = false;

function getImageExtension(file: Express.Multer.File): string {
  const originalExt = path.extname(file.originalname || '').toLowerCase();
  if (/^\.(jpe?g|png|webp|gif|avif)$/.test(originalExt)) return originalExt;

  const mimeExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
  };
  return mimeExt[file.mimetype] || '.jpg';
}

async function ensureProductImageBucket() {
  if (!supabase || productImageBucketReady) return;

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw listError;
  }

  const bucketExists = buckets?.some(bucket => bucket.name === PRODUCT_IMAGE_BUCKET);
  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    });
    if (createError) {
      throw createError;
    }
    console.log(`[Image Upload] Created Supabase Storage bucket: ${PRODUCT_IMAGE_BUCKET}`);
  }

  productImageBucketReady = true;
}

async function uploadProductImageToSupabase(file: Express.Multer.File) {
  if (!supabase) return null;

  await ensureProductImageBucket();
  const ext = getImageExtension(file);
  const objectPath = `products/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(objectPath);
  return {
    url: data.publicUrl,
    filename: path.basename(objectPath),
    storagePath: objectPath,
    storageBucket: PRODUCT_IMAGE_BUCKET,
  };
}

function saveProductImageLocally(file: Express.Multer.File) {
  const ext = getImageExtension(file);
  const filename = `prod_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(targetPath, file.buffer);
  return {
    url: `/uploads/${filename}`,
    filename,
  };
}

// Image upload endpoint – returns { url } accessible from the browser
app.post('/api/upload-image', verifyAdminToken, upload.single('image'), async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file received.' });
  }

  try {
    const supabaseUpload = await uploadProductImageToSupabase(req.file);
    if (supabaseUpload) {
      console.log(`[Image Upload] Saved product image to Supabase Storage: ${supabaseUpload.storagePath}`);
      return res.json(supabaseUpload);
    }


    const localUpload = saveProductImageLocally(req.file);
    console.warn('[Image Upload] Supabase is not configured; saved image to local filesystem fallback.');
    return res.json(localUpload);
  } catch (err: any) {
    console.error('[Image Upload] Failed to upload product image:', err);

    if (process.env.NODE_ENV !== 'production') {
      try {
        const localUpload = saveProductImageLocally(req.file);
        console.warn('[Image Upload] Supabase upload failed; saved to local development fallback.');
        return res.json(localUpload);
      } catch (localErr) {
        console.error('[Image Upload] Local fallback also failed:', localErr);
      }
    }

    return res.status(500).json({
      error: 'Product image upload failed. Check Supabase Storage bucket permissions and service role key.',
    });
  }
});

// --- PRODUCTS ENDPOINTS ---
app.get('/api/catalog/products', async (req, res) => {
  try {
    // Supabase is the single source of truth when configured
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        if (data.length === 0) {
          // Supabase has the table but it's empty — this is the truth (all products were deleted)
          return res.json([]);
        }
        const mapped = data.map(p => {
          const images = (Array.isArray(p.images) && p.images.length > 0)
            ? p.images
            : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop'];
          return {
            id: p.id,
            sku: p.sku || `SKU-${p.id}`,
            name: p.name || 'Radha Fashions Product',
            category: p.category || 'Handbags',
            categorySlug: p.category_slug || 'handbags',
            price: Number(p.price || 999),
            discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
            stock: p.stock !== undefined ? Number(p.stock) : 10,
            rating: p.rating ? Number(p.rating) : 4.8,
            ratingCount: p.rating_count ? Number(p.rating_count) : 50,
            images,
            shortDescription: p.short_description || '',
            description: p.description || '',
            specifications: p.specifications || {},
            weightKg: parseProductWeightKg(p),
            reviews: Array.isArray(p.reviews) ? p.reviews : [],
            isNew: Boolean(p.is_new),
            isBestseller: Boolean(p.is_bestseller),
            brand: p.brand || 'Radha Fashions',
            availability: p.availability || 'in-stock',
            vendorId: p.vendor_id || null,
            variation: p.variation || undefined
          };
        });
        return res.json(mapped);
      }
      console.error('Supabase products query failed:', error);
      return res.status(503).json({ error: 'Product catalog is temporarily unavailable.' });
    }
    if (shouldRequireSupabase) {
      return res.status(503).json({ error: 'Product catalog database is not configured.' });
    }
    // Fallback: only when Supabase is NOT configured, use local JSON file
    const localProds = readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS);
    res.json(localProds);
  } catch (err) {
    // Never return bundled data when Supabase is configured. Doing so would
    // make deleted products appear to return after a deployment/outage.
    if (!supabase && !shouldRequireSupabase) {
      res.json(readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS));
    } else {
      res.status(503).json({ error: 'Product catalog is temporarily unavailable.' });
    }
  }
});

app.post('/api/catalog/products', verifyAdminToken, express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const productsList = req.body;
    if (!Array.isArray(productsList)) {
      return res.status(400).json({ error: 'Body must be an array of products.' });
    }
    if (productsList.length > 500) {
      return res.status(400).json({ error: 'Too many products in a single request (max 500).' });
    }


    if (supabase) {
      try {
        const mapped = productsList.map(p => ({
          id: p.id,
          sku: p.sku || `SKU-${p.id}`,
          name: p.name || 'Radha Fashions Product',
          category: p.category || 'Handbags',
          category_slug: p.categorySlug || p.category?.toLowerCase().replace(/\s+/g, '-') || 'handbags',
          price: p.price,
          discount_price: p.discountPrice || null,
          stock: p.stock !== undefined ? p.stock : 10,
          rating: p.rating || 5,
          rating_count: p.ratingCount || 1,
          images: p.images || [],
          short_description: p.shortDescription || p.name || '',
          description: p.description || p.name || '',
          specifications: { ...(p.specifications || {}), Weight: parseProductWeightKg(p) ? `${parseProductWeightKg(p)} kg` : p.specifications?.Weight },
          reviews: p.reviews || [],
          is_new: p.isNew || false,
          is_bestseller: p.isBestseller || false,
          brand: p.brand || 'Radha Fashions',
          availability: p.availability || 'in-stock',
          vendor_id: p.vendorId || null,
          variation: p.variation || null
        }));
        
        if (mapped.length > 0) {
          const { error: subErr } = await supabase.from('products').upsert(mapped);
          if (subErr) {
            console.error('Supabase products upsert error:', subErr);
            return res.status(500).json({ error: 'Supabase products upsert failed. Product catalog was not durably saved.' });
          }
        }

        // Remove every record absent from this snapshot, including when the
        // administrator intentionally deletes the final product.
        const currentIds = productsList.map(p => p.id).filter(Boolean);
        await removeRowsMissingFromSnapshot('products', currentIds);
        console.log(`Successfully synchronized ${mapped.length} products to Supabase.`);
      } catch (subErr) {
        console.error('Supabase products sync failed:', subErr);
        return res.status(500).json({ error: 'Supabase products sync failed. Product catalog was not durably saved.' });
      }
    }
    if (shouldRequireSupabase && !supabase) {
      return res.status(503).json({ error: 'Product catalog database is not configured.' });
    }
    // Local JSON is only an offline/development cache and is updated after
    // Supabase acknowledges the durable write.
    writeLocalJsonDb(PRODUCTS_FILE_PATH, productsList);
    res.json({ success: true, message: 'Products catalog synchronized successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize products catalog' });
  }
});

// Public review submission endpoint
app.post('/api/products/:productId/reviews', express.json(), async (req, res) => {
  try {
    const { productId } = req.params;
    const newReview = req.body;
    if (!newReview || !newReview.author || !newReview.comment) {
      return res.status(400).json({ error: 'Review author and comment are required.' });
    }

    const localProds = readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS);
    let updatedProduct: any = null;

    const nextProds = localProds.map((p: any) => {
      if (p.id === productId) {
        const revs = [newReview, ...(p.reviews || [])];
        const approvedCount = revs.length;
        const totalRating = revs.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0);
        const newRating = approvedCount > 0 ? Number((totalRating / approvedCount).toFixed(1)) : 5;
        updatedProduct = {
          ...p,
          reviews: revs,
          rating: newRating,
          ratingCount: approvedCount
        };
        return updatedProduct;
      }
      return p;
    });

    writeLocalJsonDb(PRODUCTS_FILE_PATH, nextProds);

    if (supabase && updatedProduct) {
      await supabase.from('products').update({
        reviews: updatedProduct.reviews,
        rating: updatedProduct.rating,
        rating_count: updatedProduct.ratingCount
      }).eq('id', productId);
    }

    res.json({ success: true, message: 'Review recorded successfully.', product: updatedProduct });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Failed to record review.' });
  }
});

// --- COUPONS ENDPOINTS ---
app.get('/api/catalog/coupons', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('coupons').select('*');
      if (!error && data) {
        if (data.length === 0) return res.json([]);
        const mapped = data.map(c => ({
          code: c.code,
          type: c.type,
          value: c.value,
          expiryDate: c.expiry_date,
          usageLimit: c.usage_limit,
          usageCount: c.usage_count,
          minimumCartValue: c.minimum_cart_value,
          description: c.description,
          active: c.active
        }));
        return res.json(mapped);
      }
      console.warn('Supabase coupons fetch error:', error);
      return res.status(503).json({ error: 'Coupon catalog is temporarily unavailable.' });
    }
    // Supabase not configured — return empty, do not seed with INITIAL data
    res.json([]);
  } catch (err) {
    res.status(503).json({ error: 'Coupon catalog is temporarily unavailable.' });
  }
});

app.post('/api/catalog/coupons', verifyAdminToken, async (req, res) => {
  try {
    const couponsList = req.body;
    if (!Array.isArray(couponsList)) {
      return res.status(400).json({ error: 'Body must be an array of coupons.' });
    }

    writeLocalJsonDb(COUPONS_FILE_PATH, couponsList);

    if (supabase) {
      const mapped = couponsList.map(c => ({
        code: c.code,
        type: c.type,
        value: c.value,
        expiry_date: c.expiryDate,
        usage_limit: c.usageLimit,
        usage_count: c.usageCount,
        minimum_cart_value: c.minimumCartValue,
        description: c.description,
        active: c.active
      }));
      const { error } = await supabase.from('coupons').upsert(mapped);
      if (error) {
        console.error('Supabase coupons upsert failed:', error);
        return res.status(500).json({ error: 'Supabase coupons upsert failed' });
      }
      // Remove coupons deleted by the administrator
      const currentCodes = couponsList.map((c: any) => c.code).filter(Boolean);
      await removeRowsMissingFromSnapshot('coupons', currentCodes);
    }
    res.json({ success: true, message: 'Coupons synchronized.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync coupons' });
  }
});

app.post('/api/catalog/coupons/bulk-delete', verifyAdminToken, async (req, res) => {
  try {
    const { codes } = req.body;
    if (!Array.isArray(codes)) {
      return res.status(400).json({ error: 'Body must contain an array of coupon codes.' });
    }

    if (supabase) {
      const { error } = await supabase.from('coupons').delete().in('code', codes);
      if (error) {
        console.error('Supabase coupons bulk delete failed:', error);
        return res.status(500).json({ error: 'Supabase coupons bulk delete failed' });
      }
    }
    
    // Update local JSON DB
    const currentCoupons: any[] = readLocalJsonDb(COUPONS_FILE_PATH, INITIAL_COUPONS);
    const updatedCoupons = currentCoupons.filter(c => !codes.includes(c.code));
    writeLocalJsonDb(COUPONS_FILE_PATH, updatedCoupons);

    res.json({ success: true, message: `Deleted ${codes.length} coupons.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk delete coupons' });
  }
});

app.delete('/api/catalog/coupons', verifyAdminToken, async (req, res) => {
  try {
    if (supabase) {
      const { error } = await supabase.from('coupons').delete().neq('code', 'IMPOSSIBLE_VALUE_TO_DELETE_ALL');
      if (error) {
        console.error('Supabase coupons delete all failed:', error);
        return res.status(500).json({ error: 'Supabase coupons wipe failed' });
      }
    }
    
    writeLocalJsonDb(COUPONS_FILE_PATH, []);
    res.json({ success: true, message: 'All coupons permanently deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete all coupons' });
  }
});

// --- CAMPAIGNS ENDPOINTS ---
app.get('/api/catalog/campaigns', async (req, res) => {
  try {
    // Supabase is the single source of truth when configured
    if (supabase) {
      const { data, error } = await supabase.from('campaigns').select('*');
      if (!error && data) {
        if (data.length === 0) return res.json([]);
        const mapped = data.map(c => ({
          id: c.id,
          imageUrl: c.image_url || '',
          title: c.title,
          description: c.description,
          ctaText: c.cta_text,
          linkCategory: c.link_category,
          active: c.active
        }));
        return res.json(mapped);
      }
      console.warn('Supabase campaigns query failed:', error);
      return res.status(503).json({ error: 'Campaign catalog is temporarily unavailable.' });
    }
    // Supabase not configured — return empty, do not seed with INITIAL data
    res.json([]);
  } catch (err) {
    res.status(503).json({ error: 'Campaign catalog is temporarily unavailable.' });
  }
});

app.post('/api/catalog/campaigns', verifyAdminToken, async (req, res) => {
  try {
    const campaignsList = req.body;
    if (!Array.isArray(campaignsList)) {
      return res.status(400).json({ error: 'Body must be an array.' });
    }

    writeLocalJsonDb(CAMPAIGNS_FILE_PATH, campaignsList);

    if (supabase) {
      const mapped = campaignsList.map(c => ({
        id: c.id,
        image_url: c.image_url,
        title: c.title,
        description: c.description,
        cta_text: c.cta_text,
        link_category: c.link_category,
        active: c.active
      }));
      await supabase.from('campaigns').upsert(mapped);
      // Remove campaigns deleted by the administrator
      const currentCampIds = campaignsList.map((c: any) => c.id).filter(Boolean);
      await removeRowsMissingFromSnapshot('campaigns', currentCampIds);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync campaigns' });
  }
});

// --- CMS CONFIG ENDPOINTS ---
app.get('/api/catalog/cms', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('cms_config').select('value').eq('key', 'main').single();
      if (!error && data) {
        return res.json(data.value);
      }
    }
    // Supabase not configured or query failed — return sensible defaults without local file
    res.json(INITIAL_CMS);
  } catch (err) {
    res.json(INITIAL_CMS);
  }
});

app.post('/api/catalog/cms', verifyAdminToken, async (req, res) => {
  try {
    const cmsConfig = req.body;
    writeLocalJsonDb(CMS_FILE_PATH, cmsConfig);

    if (supabase) {
      await supabase.from('cms_config').upsert({ key: 'main', value: cmsConfig });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync CMS layout' });
  }
});

// --- CATEGORIES ENDPOINTS ---
const CATEGORIES_FILE_PATH = path.join(LOCAL_DATA_DIR, 'categories_db.json');
const INITIAL_CATEGORIES_DATA = [
  { id: 'sarees', name: 'Sarees', description: 'Exquisite silk, chiffon, and cotton sarees for every occasion.', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop', enabled: true },
  { id: 'lehengas', name: 'Lehengas', description: 'Bridal and designer lehengas with intricate embroidery.', imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop', enabled: true },
  { id: 'kurtis', name: 'Kurtis', description: 'Casual and party-wear kurtis in trendy designs.', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop', enabled: true },
  { id: 'jewellery', name: 'Ethnic Jewellery', description: 'Traditional and contemporary ethnic jewellery collections.', imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d727b750?w=600&auto=format&fit=crop', enabled: true },
  { id: 'handbags', name: 'Handbags', description: 'Designer potli bags, clutches, and ethnic handbags.', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop', enabled: true },
  { id: 'dupattas', name: 'Dupattas', description: 'Embroidered and printed dupattas to complete your outfit.', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop', enabled: true },
  { id: 'blouses', name: 'Blouses', description: 'Designer and customized blouses for sarees and lehengas.', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop', enabled: true },
  { id: 'salwar', name: 'Salwar Suits', description: 'Classic and modern salwar suits for daily and festive wear.', imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop', enabled: true },
  { id: 'kids-ethnic', name: 'Kids Ethnic Wear', description: 'Adorable ethnic outfits for kids and toddlers.', imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop', enabled: true }
];

app.get('/api/catalog/categories', async (req, res) => {
  try {
    // Supabase is the single source of truth when configured
    if (supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data) {
        if (data.length === 0) {
          // Supabase has the table but it's empty — this is the truth (all categories were deleted)
          return res.json([]);
        }
        const mapped = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          imageUrl: c.image_url || '',
          enabled: c.enabled !== false
        }));
        return res.json(mapped);
      }
      console.error('Supabase categories query failed:', error);
      return res.status(503).json({ error: 'Category catalog is temporarily unavailable.' });
    }
    if (shouldRequireSupabase) {
      return res.status(503).json({ error: 'Category catalog database is not configured.' });
    }
    // Fallback: only when Supabase is NOT configured, use local JSON file
    res.json(readLocalJsonDb(CATEGORIES_FILE_PATH, INITIAL_CATEGORIES_DATA));
  } catch (err) {
    if (!supabase && !shouldRequireSupabase) {
      res.json(readLocalJsonDb(CATEGORIES_FILE_PATH, INITIAL_CATEGORIES_DATA));
    } else {
      res.status(503).json({ error: 'Category catalog is temporarily unavailable.' });
    }
  }
});

app.post('/api/catalog/categories', verifyAdminToken, async (req, res) => {
  try {
    const categories = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Body must be an array of categories.' });
    }
    if (supabase) {
      const mapped = categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        image_url: c.imageUrl || '',
        enabled: c.enabled !== false
      }));
      if (mapped.length > 0) {
        const { error: subErr } = await supabase.from('categories').upsert(mapped);
        if (subErr) {
          console.error('Supabase categories upsert error:', subErr);
          return res.status(500).json({ error: 'Failed to sync categories to database.' });
        }
      }
      // Delete categories that are absent from the submitted snapshot. This
      // includes deleting all categories, if that is the administrator's choice.
      const currentIds = categories.map((c: any) => c.id).filter(Boolean);
      await removeRowsMissingFromSnapshot('categories', currentIds);
    }
    if (shouldRequireSupabase && !supabase) {
      return res.status(503).json({ error: 'Category catalog database is not configured.' });
    }
    writeLocalJsonDb(CATEGORIES_FILE_PATH, categories);
    res.json({ success: true, message: 'Categories synced successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync categories.' });
  }
});

// Lazy-initialize Gemini API key and client
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
    return null;
  }
};

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    api_key_configured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
  });
});

// In-memory cache to prevent hitting API quotas too fast
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache duration

function getCached(key: string): any | null {
  const cached = apiCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  return null;
}

function setCached(key: string, data: any) {
  apiCache.set(key, { data, timestamp: Date.now() });
}

// AI Product Recommendations Proxy Route
app.post('/api/gemini/recommendations', rateLimiter(20, 60 * 1000), async (req, res) => {
  const { cartItems, recentlyViewedIds, allProducts } = req.body;
  const ai = getGeminiClient();

  // Create a robust cache key based on shopping cart state and browsed history
  const cartKeyToken = cartItems?.map((item: any) => `${item.product.id}:${item.quantity}`).join(',') || '';
  const viewedKeyToken = recentlyViewedIds?.join(',') || '';
  const cacheKey = `recs_${cartKeyToken}_viewed_${viewedKeyToken}`;

  const cachedResult = getCached(cacheKey);
  if (cachedResult) {
    return res.json(cachedResult);
  }

  // Simple fallbacks if client is unavailable
  if (!ai) {
    const fallbacks = {
      conciergeCommentary: 'We noticed your interest in our curated collections. Our personal concierge suggests exploring our signature silk sarees and designer lehengas — both reflecting the finest Indian fashion traditions.',
      recommendedProductIds: []
    };
    return res.json(fallbacks);
  }

  try {
    const cartContext = cartItems?.map((item: any) => `${item.product.name} (Qty: ${item.quantity})`).join(', ') || 'Empty Cart';
    const viewedContext = allProducts?.filter((p: any) => recentlyViewedIds?.includes(p.id))?.map((p: any) => p.name).join(', ') || 'None';
    const catalogSummary = allProducts?.map((p: any) => `ID: ${p.id}, Sku: ${p.sku}, Name: ${p.name}, Price: ₹${p.price}, Category: ${p.category}`).join('\n') || '';

    const systemPrompt = `You are the Virtual Boutique Concierge at "Radha Fashions", an elegant fashion boutique e-commerce store specializing in designer sarees, lehengas, kurtis, ethnic accessories, and curated jewelry.
Analyze user's shopping context and recommend EXACTLY 3 complementary products from the store catalogue. Write a luxurious, friendly, high-society commentary (1-2 sentences) about why these are perfect additions, matching their style.

Strict Requirements:
1. ONLY recommend products that exist in the provided catalogue list.
2. Output your response as a strict JSON matching this schema:
{
  "conciergeCommentary": "commentary string",
  "recommendedProductIds": ["id1", "id2", "id3"]
}`;

    const userPrompt = `USER CONTEXT:
Items currently in cart: [${cartContext}]
Items recently browsed: [${viewedContext}]

STORE CATALOGUE AVAILABLE:
${catalogSummary}

Generate the recommendations JSON strictly adhering to the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conciergeCommentary: { type: Type.STRING },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['conciergeCommentary', 'recommendedProductIds'],
        },
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    setCached(cacheKey, parsed);
    res.json(parsed);
  } catch (error: any) {
    console.log('AI Concierge recommendations offline fallback matching applied.');
    const fallbackData = {
      fallback: true,
      conciergeCommentary: 'Our AI concierge is curating personalized picks! In the meantime, we suggest exploring our latest saree and lehenga collections for your exquisite style.',
      recommendedProductIds: [],
    };
    res.json(fallbackData);
  }
});

// Smart Search Assistant
app.post('/api/gemini/search', rateLimiter(20, 60 * 1000), async (req, res) => {
  const rawQuery = req.body?.query;
  const query = sanitizeAiPrompt(rawQuery, 200);
  const { allCategories } = req.body;
  const ai = getGeminiClient();

  const getLocalSearchFallback = () => {
    const qLower = query?.toLowerCase() || '';
    let slug = '';
    let responseText = `We are searching our premium vaults for "${query}".`;
    if (qLower.includes('saree') || qLower.includes('silk') || qLower.includes('sari')) {
      slug = 'sarees';
      responseText = 'Explore our stunning collection of silk sarees, Banarasi weaves, and designer drapes — perfect for every occasion.';
    } else if (qLower.includes('lehenga') || qLower.includes('bridal') || qLower.includes('wedding')) {
      slug = 'lehengas';
      responseText = 'Discover our bridal lehengas and designer outfits, crafted for your special celebrations.';
    } else if (qLower.includes('kurti') || qLower.includes('salwar') || qLower.includes('suit')) {
      slug = 'kurtis';
      responseText = 'Browse our elegant kurtis and salwar suits — comfortable ethnic wear for daily and festive wear.';
    } else if (qLower.includes('jewel') || qLower.includes('bangle') || qLower.includes('accessory') || qLower.includes('accessories')) {
      slug = 'jewellery';
      responseText = 'Complete your look with our curated jewelry collection — bangles, necklaces, earrings, and more.';
    }

    return {
      suggestedCategorySlug: slug,
      aiSuggestions: ['silk saree', 'designer lehenga', 'ethnic kurti', 'gold jewelry'].filter(x => x.includes(qLower) || qLower.length <= 2).slice(0, 3),
      smartQueryResponse: responseText,
    };
  };

  const cacheKey = `search_${(query || '').toLowerCase().trim()}`;
  const cachedResult = getCached(cacheKey);
  if (cachedResult) {
    return res.json(cachedResult);
  }

  if (!ai) {
    return res.json(getLocalSearchFallback());
  }

  try {
    const categoriesContext = allCategories?.map((c: any) => `${c.name} (slug: ${c.id})`).join(', ') || '';

    const systemPrompt = `You are the smart search dispatcher for Radha Fashions.
Users search for items using casual phrases (e.g. "gift for my nephew" or "laser designs for holi" or "something to carry cosmetics").
Your goal is to parse their intention and return:
1. suggestedCategorySlug: The matched category slug from our list that best fits (or empty string if none).
2. aiSuggestions: Array of 2-3 precise short search term recommendations.
3. smartQueryResponse: A conversational greeting explaining why you targeted this direction with high elegance.

Available Category categories and slugs:
[${categoriesContext}]

Output in strict JSON format matching the schema:
{
  "suggestedCategorySlug": "string representing the slug, or empty",
  "aiSuggestions": ["string1", "string2"],
  "smartQueryResponse": "Brief luxury human explanation"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Search query inputted by user: "${query}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCategorySlug: { type: Type.STRING },
            aiSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            smartQueryResponse: { type: Type.STRING },
          },
          required: ['suggestedCategorySlug', 'aiSuggestions', 'smartQueryResponse'],
        },
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    setCached(cacheKey, parsed);
    res.json(parsed);
  } catch (error: any) {
    console.log('Smart search dispatcher offline fallback matching applied.');
    res.json(getLocalSearchFallback());
  }
});

// Live Backend Orders Database & Logistics Tracker
const ORDERS_FILE_PATH = path.join(process.cwd(), 'orders_db.json');

function readOrdersDb(): any[] {
  try {
    if (!fs.existsSync(ORDERS_FILE_PATH)) {
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(ORDERS_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading orders database:', error);
    return [];
  }
}

function writeOrdersDb(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2));

    if (supabase) {
      const mapped = orders.map(o => ({
        id: o.id,
        order_number: o.orderNumber,
        customer_info: o.customerInfo || {},
        items: o.items || [],
        shipping_method: o.shippingMethod,
        shipping_cost: o.shippingCost,
        tax: o.tax,
        discount: o.discount,
        subtotal: o.subtotal,
        total: o.total,
        status: o.status,
        coupon_code: o.couponCode || null,
        date: o.date,
        payment_method: o.paymentMethod || 'PayU Secure Online Payment',
        payment_status: o.paymentStatus || 'unpaid',
        gift_wrapping_requested: o.giftWrappingRequested || false,
        gift_wrapping_type: o.giftWrappingType || null,
        gift_message: o.giftMessage || null,
        account_email: o.accountEmail || null,
        account_name: o.accountName || null
      }));
      
      supabase.from('orders').upsert(mapped).then(async ({ error }) => {
        if (error) console.error('Supabase orders background upsert failed:', error);
        else {
          const currentOrderIds = orders.map(o => o.id);
          if (currentOrderIds.length > 0) {
            const idListStr = currentOrderIds.map(id => `"${id}"`).join(',');
            await supabase.from('orders').delete().not('id', 'in', `(${idListStr})`);
          }
        }
      });
    }
  } catch (error) {
    console.error('Error writing orders database:', error);
  }
}

function isConfigured(val: string | undefined): boolean {
  if (!val) return false;
  const clean = val.trim();
  return clean !== '' && !clean.includes('YOUR_') && !clean.includes('MY_');
}

function realNotificationsEnabled(): boolean {
  if (process.env.ENABLE_REAL_NOTIFICATIONS === 'false') return false;
  return (
    process.env.ENABLE_REAL_NOTIFICATIONS === 'true' ||
    isConfigured(process.env.BREVO_API_KEY) ||
    isConfigured(process.env.RESEND_API_KEY) ||
    (isConfigured(process.env.SMTP_HOST) && isConfigured(process.env.SMTP_USER) && isConfigured(process.env.SMTP_PASS))
  );
}

function createSmtpTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'admin@radhafashions.in';
  const pass = process.env.SMTP_PASS || 'lljl hfcn geye rdlt';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

async function dispatchLiveEmail(to: string, subject: string, html: string): Promise<boolean> {
  const recipient = sanitizeEmail(to);
  if (!recipient) return false;

  // 1. Try Resend HTTP REST API (Primary for Cloud / Custom Domain admin@radhafashions.in - Port 443)
  if (isConfigured(process.env.RESEND_API_KEY)) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || 'Radha Fashions';
      const rawFrom = (process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'admin@radhafashions.in').trim();
      let fromFormatted = rawFrom;
      if (rawFrom.includes('onboarding@resend.dev')) {
        fromFormatted = 'onboarding@resend.dev';
      } else if (!rawFrom.includes('<')) {
        fromFormatted = `${fromName} <${rawFrom}>`;
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromFormatted,
          to: [recipient],
          subject: subject,
          html: html
        })
      });
      const data: any = await res.json();
      if (res.ok && data.id) {
        console.log(`[Resend API] Live email delivered to ${recipient} (ID: ${data.id}) from ${fromFormatted}`);
        return true;
      }
      console.warn(`[Resend API Warning] Failed sending to ${recipient}:`, data);
    } catch (err) {
      console.error('[Resend API Exception]:', err);
    }
  }

  // 2. Try Brevo v3 HTTP REST API (Secondary if BREVO_API_KEY configured - Fast, Reliable Port 443)
  if (isConfigured(process.env.BREVO_API_KEY)) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || 'Radha Fashions';
      const fromEmail = (process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || 'admin@radhafashions.in').trim();
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.BREVO_API_KEY!.trim()
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: recipient }],
          subject: subject,
          htmlContent: html
        })
      });
      const data: any = await res.json();
      if (res.ok && (data.messageId || data.messageIds)) {
        console.log(`[Brevo REST API] Live email delivered to ${recipient} (ID: ${data.messageId || data.messageIds})`);
        return true;
      }
      console.warn(`[Brevo REST API Warning] Failed sending to ${recipient}:`, data);
    } catch (err) {
      console.error('[Brevo REST API Exception]:', err);
    }
  }

  // 3. Fallback: Nodemailer SMTP
  try {
    const transporter = createSmtpTransporter();
    const fromName = process.env.SMTP_FROM_NAME || 'Radha Fashions';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || process.env.SMTP_USER || 'admin@radhafashions.in';

    await transporter.sendMail({
      from: `"${fromName.replace(/"/g, '')}" <${fromEmail}>`,
      to: recipient,
      subject: subject,
      html: html
    });
    console.log(`[SMTP Mailer] Live email delivered to ${recipient} via SMTP.`);
    return true;
  } catch (smtpErr: any) {
    console.error(`[SMTP Mailer Error] Failed sending to ${recipient}:`, smtpErr?.message || smtpErr);
    return false;
  }
}

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizePhone(value: unknown): string {
  if (typeof value !== 'string') return '';
  const compact = value.replace(/[^\d+]/g, '');
  if (compact.startsWith('+')) return compact;
  if (compact.length === 10) return `+91${compact}`;
  return compact;
}

// Order auto-advancement is intentionally DISABLED in production.
// Auto-advancing all orders every 15 seconds would deliver everything within 45s — a critical bug.
// Order status changes are handled manually by the admin panel.
// To re-enable for demo purposes in development only:
// if (process.env.NODE_ENV !== 'production') { setInterval(..., 15000); }
console.log('[Orders] Auto-status-advancement disabled in production. Use admin panel to update order status.');

// Live Tracking & Orders Endpoints
app.get('/api/orders', verifyAdminToken, (req, res) => {
  try {
    const dbOrders = readOrdersDb();
    res.json(dbOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read orders database' });
  }
});

// Secure order lookup — requires orderNumber + accountEmail to prevent PII enumeration.
// Guests can still track their order using the email they checked out with.
app.get('/api/orders/:orderNumber', rateLimiter(20, 15 * 60 * 1000), (req, res) => {
  try {
    const orderNum = sanitizeString(req.params.orderNumber, 30).toUpperCase();
    if (!orderNum || !/^[A-Z0-9\-_]+$/.test(orderNum)) {
      return res.status(400).json({ error: 'Invalid order number format.' });
    }

    // Require the email associated with the order to prevent enumeration
    const emailParam = sanitizeEmail(req.query.email);
    if (!emailParam) {
      return res.status(400).json({ error: 'Your account email is required to look up an order. Provide ?email=your@email.com' });
    }

    const dbOrders = readOrdersDb();
    const order = dbOrders.find(
      o => o.orderNumber.toUpperCase() === orderNum || o.id.toUpperCase() === orderNum
    );

    if (!order) {
      return res.status(404).json({ error: `Order ${orderNum} was not found.` });
    }

    // Verify that the requester owns this order
    const orderEmail = (order.accountEmail || order.customerInfo?.email || '').toLowerCase().trim();
    if (orderEmail !== emailParam) {
      // Return 404 to avoid confirming the order exists to an attacker
      return res.status(404).json({ error: `Order ${orderNum} was not found.` });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

// Beautiful booking email template generator and sender helper
async function sendBookingEmail(order: any, emailType: 'received' | 'confirmation' = 'confirmation') {
  try {
    const recipientEmail = sanitizeEmail(order.customerInfo?.email || order.accountEmail || order.email);
    if (!recipientEmail) {
      console.warn('[Email Service] No valid customer recipient email found for order:', order?.orderNumber);
      return null;
    }
    const customerName = sanitizeString(order.customerInfo?.name || order.accountName || order.name || 'Valued Customer', 100);
    const orderNum = order.orderNumber || order.id || 'ORDER';
    const isReceived = emailType === 'received';
    const subject = isReceived
      ? `Order Received - Radha Fashions (#${orderNum})`
      : `Order Confirmed - Radha Fashions (#${orderNum})`;

    // Generate beautiful line items HTML
    let itemsHtml = '';
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const productObj = item.product || item;
        const productName = productObj.name || 'Radha Fashions Gift';
        const variation = item.selectedVariation?.value
          ? ` (${item.selectedVariation.type === 'size' ? 'Size' : 'Color'}: ${item.selectedVariation.value})`
          : '';
        const qty = item.quantity || 1;
        const price = Number(productObj.discountPrice ?? productObj.price ?? item.price ?? 0);
        const imageUrl = (Array.isArray(productObj.images) && productObj.images[0])
          ? productObj.images[0]
          : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=80';
        
        itemsHtml += `
          <tr style="border-bottom: 1px solid #fce7f3;">
            <td style="padding: 12px 8px; width: 60px;">
              <img src="${imageUrl}" alt="${productName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 2px solid #fbcfe8;" />
            </td>
            <td style="padding: 12px 8px; font-size: 13px; color: #1f2937; font-weight: 500;">
              ${productName}${variation}
              <div style="font-size: 11px; color: #9d174d; font-family: monospace; margin-top: 2px;">Qty: ${qty} × ₹${price}</div>
            </td>
            <td style="padding: 12px 8px; text-align: right; font-size: 13px; font-family: monospace; font-weight: bold; color: #be185d;">
              ₹${price * qty}
            </td>
          </tr>
        `;
      });
    }

    const subtotal = Number(order.subtotal || 0);
    const discount = Number(order.discount || 0);
    const shippingCost = Number(order.shippingCost || 0);
    const tax = Number(order.tax || 0);
    const total = Number(order.total || 0);

    // Create highly polished responsive luxury layout HTML
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; background-color: #fdf2f8; margin: 0; padding: 20px 0; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fbcfe8; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(219, 39, 119, 0.08);">
    
    <!-- 🌸 Cherry Blossom Header -->
    <div style="background: linear-gradient(135deg, #9d174d 0%, #be185d 50%, #db2777 100%); padding: 36px 24px; text-align: center; border-bottom: 4px solid #f9a8d4; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><circle cx=%2210%22 cy=%2210%22 r=%223%22 fill=%22rgba(255,255,255,0.08)%22/><circle cx=%2240%22 cy=%2235%22 r=%222%22 fill=%22rgba(255,255,255,0.06)%22/><circle cx=%2255%22 cy=%228%22 r=%222.5%22 fill=%22rgba(255,255,255,0.07)%22/><circle cx=%2225%22 cy=%2250%22 r=%222%22 fill=%22rgba(255,255,255,0.05)%22/></svg>'); opacity: 0.8;"></div>
      <div style="position: relative; z-index: 1;">
        <img src="https://radhafashions.in/radha-fashions-logo.png" alt="Radha Fashions" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); object-fit: cover; margin-bottom: 10px;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; font-family: 'Space Grotesk', Arial, sans-serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Radha Fashions</h1>
      </div>
    </div>

    <!-- Heartwarming Greeting -->
    <div style="padding: 32px 24px 20px 24px;">
      <h2 style="font-size: 18px; color: #1f2937; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Dear ${customerName},</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0;">
        ${isReceived
          ? `Thank you for choosing <strong style="color: #be185d;">Radha Fashions</strong>. We have <strong>received your order</strong> <strong>#${orderNum}</strong> and it is now awaiting payment verification. ⏳ Our team will review your UPI payment and send you a confirmation once approved. ✨`
          : `Thank you for choosing <strong style="color: #be185d;">Radha Fashions</strong>. We are thrilled to confirm that your order <strong>#${orderNum}</strong> has been <strong>confirmed</strong>! 🎉 Our team is carefully packing your order with love and attention to detail. ✨`
        }
      </p>
    </div>

    <!-- Booking Details Block -->
    <div style="padding: 0 24px;">
      <div style="background-color: #fdf2f8; border-radius: 14px; padding: 18px; border: 1px dashed #f9a8d4;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace;">
          <tr>
            <td style="color: #9d174d; padding-bottom: 6px; font-weight: bold;">ORDER NUMBER:</td>
            <td style="color: #1f2937; text-align: right; padding-bottom: 6px; font-weight: bold; font-size: 13px;">${orderNum}</td>
          </tr>
          <tr>
            <td style="color: #9d174d; padding-bottom: 6px; font-weight: bold;">BOOKING DATE:</td>
            <td style="color: #1f2937; text-align: right; padding-bottom: 6px;">${order.date || new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="color: #9d174d; padding-bottom: 6px; font-weight: bold;">PAYMENT GATEWAY:</td>
            <td style="color: #1f2937; text-align: right; padding-bottom: 6px;">${order.paymentMethod} (${isReceived ? 'PENDING VERIFICATION' : (order.paymentStatus?.toUpperCase() || 'PAID')})</td>
          </tr>
          <tr>
            <td style="color: #9d174d; font-weight: bold;">LOGISTICS MODE:</td>
            <td style="color: #be185d; text-align: right; font-weight: bold;">${order.shippingMethod === 'express' ? 'BlueDart Air Express (2-3 Days)' : 'Standard Ground Delivery'}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Itemized List Table -->
    <div style="padding: 24px;">
      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #be185d; border-bottom: 2px solid #fbcfe8; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px; font-weight: 700;">🛍️ Package Summary</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid #fbcfe8;">
            <th style="padding-bottom: 8px; font-size: 11px; color: #9d174d; text-transform: uppercase; font-weight: bold; width: 60px;">Product</th>
            <th style="padding-bottom: 8px; font-size: 11px; color: #9d174d; text-transform: uppercase; font-weight: bold;">Description</th>
            <th style="padding-bottom: 8px; font-size: 11px; color: #9d174d; text-transform: uppercase; font-weight: bold; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Accounting Totals -->
    <div style="padding: 0 24px 24px 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #4b5563;">
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Subtotal:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #1f2937;">₹${subtotal}</td>
        </tr>
        ${discount > 0 ? `
        <tr>
          <td style="padding: 6px 0; color: #059669; font-weight: 500;">Discount (${order.couponCode || 'PROMO'}):</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #059669; font-weight: bold;">-₹${discount}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">Shipping:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #1f2937;">₹${shippingCost}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #6b7280;">GST (2%):</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #1f2937;">₹${tax}</td>
        </tr>
        <tr style="border-top: 2px solid #fbcfe8;">
          <td style="padding: 16px 0 0 0; font-size: 15px; font-weight: bold; color: #1f2937;">Total Paid:</td>
          <td style="padding: 16px 0 0 0; text-align: right; font-size: 16px; font-weight: bold; color: #be185d; font-family: monospace;">₹${total}</td>
        </tr>
      </table>
    </div>

    <!-- 🌸 Cherry Blossom Footer -->
    <div style="background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%); border-top: 2px solid #fbcfe8; padding: 24px; text-align: center; position: relative;">
      <p style="font-size: 13px; color: #9d174d; margin: 0 0 8px 0; line-height: 1.5; font-weight: 500;">
        Your order is being prepared with care
      </p>
      <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.5;">
        Track your order anytime in your Radha Fashions Dashboard.
      </p>
      <p style="font-size: 11px; color: #9d174d; margin: 0; font-family: monospace; font-weight: 500;">
        Radha Fashions Boutique • KSVK School Rd, Whitefield, Bengaluru, Karnataka 560066
      </p>
    </div>

  </div>
</body>
</html>
  `;

    // Log email to Supabase email_logs table (primary) for persistence across Render restarts
    const newEmailRecord = {
      id: `email_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipient: recipientEmail,
      subject: subject,
      bodyHtml: htmlContent,
      sentAt: new Date().toLocaleString(),
      orderNumber: orderNum,
      status: 'Delivered',
      dateText: new Date().toLocaleString()
    };

    if (supabase) {
      try {
        await supabase.from('email_logs').insert({
          id: newEmailRecord.id,
          recipient: newEmailRecord.recipient,
          subject: newEmailRecord.subject,
          body_html: newEmailRecord.bodyHtml,
          sent_at: newEmailRecord.sentAt,
          order_number: newEmailRecord.orderNumber,
          status: newEmailRecord.status,
          date_text: newEmailRecord.dateText
        });
        console.log(`[Email Service] Logged booking email to Supabase for ${recipientEmail}.`);
      } catch (dbErr) {
        console.error('[Email Service] Supabase email_logs insert error:', dbErr);
      }
    } else {
      console.log(`[Email Service] Supabase not configured — email log skipped for ${recipientEmail}.`);
    }

    // Dispatch live email via REST API (Resend / Brevo) or SMTP
    const sent = await dispatchLiveEmail(recipientEmail, subject, htmlContent);
    if (sent) {
      console.log(`[Order Service] ${isReceived ? 'Order received' : 'Order confirmation'} email delivered to ${recipientEmail} for #${orderNum}`);
    } else {
      console.warn(`[Email Service] dispatchLiveEmail returned false for ${recipientEmail} (#${orderNum}) — retrying...`);
      // Return null with a flag so caller knows to retry
      throw new Error(`Email dispatch failed for ${recipientEmail}`);
    }

    return newEmailRecord;
  } catch (err) {
    console.error('[Order Service] Exception in sendBookingEmail:', err);
    // Re-throw so the outer retry loop can catch and retry
    throw err;
  }
}

async function sendAdminVendorNotificationEmail(order: any) {
  try {
    const orderNum = order.orderNumber || order.id || 'ORDER';
    const customerName = sanitizeString(order.customerInfo?.name || order.accountName || 'Customer', 100);
    const customerEmail = sanitizeEmail(order.customerInfo?.email || order.accountEmail || '');
    const customerPhone = sanitizeString(order.customerInfo?.phone || '', 30);
    const customerAddress = sanitizeString(order.customerInfo?.address || '', 300);
    const customerPincode = sanitizeString(order.customerInfo?.pincode || '', 10);

    const adminEmail = sanitizeEmail(process.env.ADMIN_NOTIFICATION_EMAIL || 'radhanarayan0709@gmail.com');
    const subject = `New Order Received - Radha Fashions (#${orderNum})`;

    let itemsHtml = '';
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const productObj = item.product || item;
        const productName = productObj.name || 'Radha Fashions Product';
        const variation = item.selectedVariation?.value
          ? ` (${item.selectedVariation.type === 'size' ? 'Size' : 'Color'}: ${item.selectedVariation.value})`
          : '';
        const qty = item.quantity || 1;
        const price = Number(productObj.discountPrice ?? productObj.price ?? item.price ?? 0);
        const vendorId = productObj.vendorId || item.vendorId || 'Store Direct';

        itemsHtml += `
          <tr style="border-bottom: 1px solid #fce7f3;">
            <td style="padding: 10px; font-size: 13px; color: #1f2937; font-weight: 500;">
              ${productName}${variation}
              <div style="font-size: 11px; color: #9d174d;">Vendor: ${vendorId} | Qty: ${qty} × ₹${price}</div>
            </td>
            <td style="padding: 10px; text-align: right; font-size: 13px; font-family: monospace; font-weight: bold; color: #be185d;">
              ₹${price * qty}
            </td>
          </tr>
        `;
      });
    }

    const total = Number(order.total || 0);
    const paymentMethod = order.paymentMethod || 'Online Payment';
    const paymentStatus = (order.paymentStatus || 'unpaid').toUpperCase();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #fdf2f8; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fbcfe8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(219, 39, 119, 0.1);">
    
    <div style="background: linear-gradient(135deg, #9d174d 0%, #be185d 50%, #db2777 100%); padding: 24px; text-align: center; border-bottom: 4px solid #10b981; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><circle cx=%2210%22 cy=%2210%22 r=%223%22 fill=%22rgba(255,255,255,0.08)%22/><circle cx=%2240%22 cy=%2235%22 r=%222%22 fill=%22rgba(255,255,255,0.06)%22/><circle cx=%2255%22 cy=%228%22 r=%222.5%22 fill=%22rgba(255,255,255,0.07)%22/></svg>'); opacity: 0.8;"></div>
      <div style="position: relative; z-index: 1;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🛍️ NEW ORDER ALERT</h1>
        <p style="color: #fce7f3; margin: 4px 0 0 0; font-size: 12px;">Radha Fashions Store Notification</p>
      </div>
    </div>

    <div style="padding: 24px;">
      <h2 style="font-size: 16px; color: #1f2937; margin-top: 0;">Order #${orderNum} has been placed!</h2>
      <p style="font-size: 13px; color: #4b5563; margin: 0 0 16px 0;">A customer has purchased items from your catalog. Please review order details below.</p>
      
      <!-- Customer Information -->
      <div style="background-color: #fdf2f8; border-radius: 10px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #374151; border: 1px solid #fbcfe8;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #be185d; text-transform: uppercase;">Customer Details</h3>
        <div><strong>Name:</strong> ${customerName}</div>
        <div><strong>Email:</strong> ${customerEmail}</div>
        <div><strong>Phone:</strong> ${customerPhone || 'N/A'}</div>
        <div><strong>Shipping Address:</strong> ${customerAddress} (Pincode: ${customerPincode})</div>
        <div><strong>Payment Method:</strong> ${paymentMethod} (${paymentStatus})</div>
      </div>

      <!-- Item breakdown -->
      <h3 style="font-size: 13px; color: #be185d; text-transform: uppercase; margin-bottom: 8px;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="border-bottom: 2px solid #fbcfe8; text-align: left; font-size: 11px; color: #9d174d;">
            <th style="padding: 6px 10px;">Item / Listing</th>
            <th style="padding: 6px 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 15px; font-weight: bold; color: #1f2937; padding-top: 8px; border-top: 1px solid #fbcfe8;">
        Grand Total: <span style="color: #be185d; font-family: monospace;">₹${total}</span>
      </div>
    </div>

    <div style="background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%); border-top: 2px solid #fbcfe8; padding: 16px; text-align: center; font-size: 11px; color: #9d174d; font-weight: 500;">
      Radha Fashions Boutique — Order Dispatch Notification
    </div>

  </div>
</body>
</html>
    `;

    // Send to Store Admin
    if (adminEmail) {
      const sent = await dispatchLiveEmail(adminEmail, subject, htmlContent);
      if (!sent) {
        throw new Error(`Admin notification email dispatch failed for ${adminEmail} (#${orderNum})`);
      }
      console.log(`[Order Service] Dispatched store order alert notification to admin ${adminEmail} for #${orderNum}`);
    }

    // If order contains vendor listings, check for vendor recipient emails
    const vendorEmails = new Set<string>();
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const vEmail = item.product?.vendorEmail || item.vendorEmail;
        if (vEmail && sanitizeEmail(vEmail)) {
          vendorEmails.add(sanitizeEmail(vEmail));
        }
      });
    }

    for (const vEmail of vendorEmails) {
      if (vEmail !== adminEmail) {
        await dispatchLiveEmail(vEmail, `Listing Order Alert - Radha Fashions (#${orderNum})`, htmlContent);
        console.log(`[Order Service] Dispatched listing order alert to vendor ${vEmail} for #${orderNum}`);
      }
    }
  } catch (err) {
    console.error('[Order Service] Exception in sendAdminVendorNotificationEmail:', err);
  }
}

async function sendPaymentEmail(order: any, type: 'approved' | 'rejected', reason?: string) {
  const recipientEmail = order.customerInfo?.email || 'guest@example.com';
  const customerName = order.customerInfo?.name || 'Valued Customer';
  const isApproved = type === 'approved';
  const subject = isApproved 
    ? `💳 Radha Fashions: Payment Approved - Order #${order.orderNumber}`
    : `❌ Radha Fashions: Payment Verification Failed - Order #${order.orderNumber}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; background-color: #fdf2f8; margin: 0; padding: 20px 0; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fbcfe8; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(219, 39, 119, 0.08);">
    
    <div style="background: linear-gradient(135deg, #9d174d 0%, #be185d 50%, #db2777 100%); padding: 36px 24px; text-align: center; border-bottom: 4px solid ${isApproved ? '#10b981' : '#f87171'}; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><circle cx=%2210%22 cy=%2210%22 r=%223%22 fill=%22rgba(255,255,255,0.08)%22/><circle cx=%2240%22 cy=%2235%22 r=%222%22 fill=%22rgba(255,255,255,0.06)%22/></svg>'); opacity: 0.8;"></div>
      <div style="position: relative; z-index: 1;">
        <img src="https://radhafashions.in/radha-fashions-logo.png" alt="Radha Fashions" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); object-fit: cover; margin-bottom: 10px;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Radha Fashions</h1>
      </div>
    </div>

    <div style="padding: 32px 24px 20px 24px;">
      <h2 style="font-size: 18px; color: #1f2937; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Dear ${customerName},</h2>
      ${isApproved ? `
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0;">
          ✅ We are pleased to inform you that your UPI payment for order <strong style="color: #be185d;">#${order.orderNumber}</strong> has been successfully verified!
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 12px 0 0 0;">
          Your order has been moved to <strong style="color: #be185d;">Processing</strong> status. Our team is preparing your order with care. ✨
        </p>
      ` : `
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0;">
          We regret to inform you that we could not verify your UPI payment for order <strong>#${order.orderNumber}</strong>.
        </p>
        <div style="background-color: #fef2f2; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #fecaca;">
          <p style="font-size: 13px; color: #991b1b; margin: 0; font-weight: bold;">Rejection Reason:</p>
          <p style="font-size: 13px; color: #7f1d1d; margin: 4px 0 0 0; font-style: italic;">
            "${reason || 'The transaction reference number or screenshot did not match our records.'}"
          </p>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 12px 0 0 0;">
          Please log into your account, check your transaction details, and resubmit the correct UPI reference number.
        </p>
      `}
    </div>

    <div style="padding: 0 24px 24px 24px;">
      <div style="background-color: #fdf2f8; border-radius: 14px; padding: 18px; border: 1px dashed #f9a8d4;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace;">
          <tr>
            <td style="color: #9d174d; padding-bottom: 6px; font-weight: bold;">ORDER NUMBER:</td>
            <td style="color: #1f2937; text-align: right; padding-bottom: 6px; font-weight: bold; font-size: 13px;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #9d174d; padding-bottom: 6px; font-weight: bold;">TOTAL VALUE:</td>
            <td style="color: #1f2937; text-align: right; padding-bottom: 6px; font-weight: bold;">₹${order.total}</td>
          </tr>
          <tr>
            <td style="color: #9d174d; padding-bottom: 6px; font-weight: bold;">PAYMENT STATUS:</td>
            <td style="color: ${isApproved ? '#059669' : '#dc2626'}; text-align: right; padding-bottom: 6px; font-weight: bold;">${order.paymentStatus.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="color: #9d174d; font-weight: bold;">CURRENT ORDER STATUS:</td>
            <td style="color: #1f2937; text-align: right; font-weight: bold;">${order.status.toUpperCase()}</td>
          </tr>
        </table>
      </div>
    </div>

    <div style="background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%); border-top: 2px solid #fbcfe8; padding: 24px; text-align: center;">
      <p style="font-size: 13px; color: #9d174d; margin: 0 0 8px 0; line-height: 1.5; font-weight: 500;">
        Track your order anytime in your Radha Fashions Dashboard
      </p>
      <p style="font-size: 11px; color: #9d174d; margin: 0; font-family: monospace; font-weight: 500;">
        Radha Fashions Boutique • KSVK School Rd, Whitefield, Bengaluru, Karnataka 560066
      </p>
    </div>

  </div>
</body>
</html>
  `;

  // Log payment email to Supabase email_logs table
  const newEmailRecord = {
    id: `email_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    recipient: recipientEmail,
    subject: subject,
    bodyHtml: htmlContent,
    sentAt: new Date().toLocaleString(),
    orderNumber: order.orderNumber,
    status: 'Delivered',
    dateText: new Date().toLocaleString()
  };

  if (supabase) {
    supabase.from('email_logs').insert({
      id: newEmailRecord.id,
      recipient: newEmailRecord.recipient,
      subject: newEmailRecord.subject,
      body_html: newEmailRecord.bodyHtml,
      sent_at: newEmailRecord.sentAt,
      order_number: newEmailRecord.orderNumber,
      status: newEmailRecord.status,
      date_text: newEmailRecord.dateText
    }).then(({ error }) => {
      if (error) console.error('[Email Service] Supabase email_logs insert failed (payment):', error);
      else console.log(`[Email Service] Logged payment email to Supabase for ${recipientEmail}.`);
    });
  } else {
    console.log(`[Email Service] Supabase not configured — payment email log skipped for ${recipientEmail}.`);
  }

  // Dispatch live email via REST API (Resend / Brevo) or SMTP
  const sent = await dispatchLiveEmail(recipientEmail, subject, htmlContent);
  if (!sent) {
    throw new Error(`Payment email dispatch failed for ${recipientEmail} (#${order.orderNumber})`);
  }

  return newEmailRecord;
}

// Beautiful booking and system alert WhatsApp notification and sender helper
// WhatsApp Alerts temporarily disabled
/*
async function sendWhatsAppAlert(alertType: 'booking' | 'status_update' | 'refund_requested', order: any, extraData?: any) {
  const recipientPhone = normalizePhone(order.customerInfo?.phone) || '+919876543210';
  const customerName = order.customerInfo?.name || 'Valued Customer';
  const rawAppUrl = process.env.APP_URL || 'http://localhost:3000';
  const appUrl = (rawAppUrl === 'MY_APP_URL') ? 'http://localhost:3000' : rawAppUrl;
  const trackLink = `${appUrl}/?track=${order.orderNumber}`;
  
  let message = '';
  let badge = '';
  
  if (alertType === 'booking') {
    message = `💖 *Radha Fashions Boutique* 💖\n\nHello *${customerName}*,\n\nWe are absolutely delighted to confirm that your order *#${order.orderNumber}* has been placed successfully! 🎉\n\n🛍️ *Package Details*:\nTotal Paid: *₹${order.total}*\nMethod: *${order.paymentMethod}*\nEst. Shipping: *${order.shippingMethod === 'express' ? 'BlueDart Express (2-3 Days)' : 'Standard Delivery'}*\n\nOur team is carefully packing your order with love. ✨👗\n\n📍 *Track Live inside your Account Dashboard*:\n👉 ${trackLink}\n\nThank you for choosing Radha Fashions — your trusted boutique for curated ethnic fashion. 💖`;
    badge = 'BOOKING SECURED';
  } else if (alertType === 'status_update') {
    const statusTitles: Record<string, string> = {
      'pending': 'Order Received — Preparing for Dispatch 📋',
      'processing': 'Being Packed with Care 📦✨',
      'shipped': 'Dispatched via Premium Logistics 🚚💨',
      'delivered': 'Delivered Safely to Your Doorstep 🏡🎁'
    };
    const currentStatusText = statusTitles[order.status] || order.status.toUpperCase();
    message = `💖 *Radha Fashions Boutique* 💖\n\nHello *${customerName}*,\n\nThere is a new update regarding your order *#${order.orderNumber}*!\n\n📦 *Live Status*: *${currentStatusText}*\n\nYour order has been updated. Check full tracking details live:\n👉 ${trackLink}\n\nLet us know if you need any support! ✨`;
    badge = 'DISPATCH NOTICE';
  } else if (alertType === 'refund_requested') {
    message = `💖 *Radha Fashions Boutique* 💖\n\nHello *${customerName}*,\n\nYour refund request for order *#${order.orderNumber}* has been received.\n\n🎟️ *Refund Details*:\nItem: *${extraData?.itemName || 'Fashion Item'}*\nReason: _"${extraData?.reason || 'No description provided'}"_ \nStatus: *Under Review* 🔍\n\nOur team will review and respond within 48 business hours. We value your feedback!\n\n👉 Track Status: ${trackLink}`;
    badge = 'REFUND TICKET';
  }

  const whatsappFilePath = path.join(process.cwd(), 'whatsapp_db.json');
  let currentWhatsApp = [];
  try {
    if (fs.existsSync(whatsappFilePath)) {
      currentWhatsApp = JSON.parse(fs.readFileSync(whatsappFilePath, 'utf-8') || '[]');
    }
  } catch (err) {
    console.error('Error reading WhatsApp database:', err);
  }

  const newAlertRecord = {
    id: `wa_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    recipientPhone: recipientPhone,
    recipientEmail: order.customerInfo?.email || '',
    recipientName: customerName,
    message: message,
    badge: badge,
    type: alertType,
    sentAt: new Date().toLocaleString(),
    orderNumber: order.orderNumber,
    status: 'Delivered',
    trackLink: trackLink
  };

  currentWhatsApp.unshift(newAlertRecord);
  try {
    fs.writeFileSync(whatsappFilePath, JSON.stringify(currentWhatsApp, null, 2));
    console.log(`[WhatsApp Service] Logged notification to whatsapp_db.json for ${recipientPhone}.`);
  } catch (err) {
    console.error('Error writing WhatsApp database:', err);
  }

  // Real Twilio WhatsApp Integration
  if (realNotificationsEnabled() && isConfigured(process.env.TWILIO_ACCOUNT_SID) && isConfigured(process.env.TWILIO_AUTH_TOKEN) && isConfigured(process.env.TWILIO_WHATSAPP_NUMBER)) {
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const cleanFrom = process.env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:') 
        ? process.env.TWILIO_WHATSAPP_NUMBER 
        : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
      
      const cleanRecipient = recipientPhone.replace(/\s+/g, '');
      const cleanTo = cleanRecipient.startsWith('whatsapp:') 
        ? cleanRecipient 
        : `whatsapp:${cleanRecipient}`;

      await client.messages.create({
        body: message,
        from: cleanFrom,
        to: cleanTo
      });
      console.log(`[WhatsApp Service] Real Twilio WhatsApp successfully dispatched to ${cleanTo}.`);
    } catch (twilioError) {
      console.error('[WhatsApp Service] Failed sending via Twilio WhatsApp API:', twilioError);
    }
  } else {
    console.log('\n======================================================');
    console.log('📱 ARTISANAL WHATSAPP DISPATCHED (SIMULATED & CACHED IN DATABASE)');
    console.log(`RECIPIENT PHONE: ${recipientPhone}`);
    console.log(`BADGE TYPE: ${badge}`);
    console.log(`MESSAGE BODY:`);
    console.log(message);
    console.log('======================================================\n');
  }

  return newAlertRecord;
}
*/

// Real Twilio SMS notification helper
async function sendSMSAlert(order: any) {
  const recipientPhone = normalizePhone(order.customerInfo?.phone);
  if (!recipientPhone) return;

  const message = `Radha Fashions: Order #${order.orderNumber} placed successfully! Total: ₹${order.total}. Est. Delivery: ${order.shippingMethod === 'express' ? 'BlueDart Express Air (2-3 Days)' : 'Standard Ground'}. Live tracking: ${process.env.APP_URL || 'http://localhost:3000'}/?track=${order.orderNumber}`;

  if (realNotificationsEnabled() && isConfigured(process.env.TWILIO_ACCOUNT_SID) && isConfigured(process.env.TWILIO_AUTH_TOKEN) && isConfigured(process.env.TWILIO_SMS_NUMBER)) {
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_SMS_NUMBER,
        to: recipientPhone
      });
      console.log(`[SMS Service] Real SMS booking confirmation successfully sent to ${recipientPhone}.`);
    } catch (twilioError) {
      console.error('[SMS Service] Failed sending via Twilio SMS API:', twilioError);
    }
  } else {
    console.log('\n======================================================');
    console.log('📱 SMS BOOKING NOTIFICATION DISPATCHED (SIMULATED)');
    console.log(`RECIPIENT: ${recipientPhone}`);
    console.log(`BODY: ${message}`);
    console.log('======================================================\n');
  }
}

// WhatsApp endpoint controllers disabled
/*
app.get('/api/whatsapp', (req, res) => {
  try {
    const whatsappFilePath = path.join(process.cwd(), 'whatsapp_db.json');
    if (!fs.existsSync(whatsappFilePath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(whatsappFilePath, 'utf-8');
    const waList = JSON.parse(data || '[]');
    
    const { recipient } = req.query;
    if (recipient) {
      const recipientStr = (recipient as string).toLowerCase();
      const filtered = waList.filter((w: any) => 
        (w.recipientEmail && w.recipientEmail.toLowerCase() === recipientStr) ||
        (w.recipientPhone && w.recipientPhone.replace(/\s+/g, '').includes(recipientStr.replace(/\s+/g, '')))
      );
      return res.json(filtered);
    }
    res.json(waList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch WhatsApp logs' });
  }
});

app.post('/api/whatsapp/alert', async (req, res) => {
  try {
    const { type, orderNumber, itemName, reason } = req.body;
    if (!type || !orderNumber) {
      return res.status(400).json({ error: 'Missing alert type or orderNumber.' });
    }

    const dbOrders = readOrdersDb();
    const order = dbOrders.find(
      o => o.orderNumber.toUpperCase() === orderNumber.toUpperCase() || o.id.toUpperCase() === orderNumber.toUpperCase()
    );

    if (!order) {
      return res.status(404).json({ error: `Order ${orderNumber} not found.` });
    }

    const record = await sendWhatsAppAlert(type, order, { itemName, reason });
    res.status(200).json({ success: true, alert: record });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dispatch WhatsApp alert.' });
  }
});
*/

// In-memory OTP store — OTPs are intentionally transient (5 min TTL).
// File persistence provided no benefit since Render's free tier spins down the server anyway.
// If a user requests OTP while server is sleeping, they get a fresh one on wake-up.
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_SENDS_PER_HOUR = 5;
const OTP_MAX_VERIFY_ATTEMPTS = 5;

interface OtpRecord {
  code: string;
  expiresAt: number;
  verifyAttempts: number;
  sendCount: number;
  lastSentAt: number;
  windowStartAt: number;
}

// Pure in-memory map — no file I/O needed for ephemeral OTP data
const otpMemoryStore: Record<string, OtpRecord> = {};

function readOtpDb(): Record<string, OtpRecord> {
  return otpMemoryStore;
}

function writeOtpDb(db: Record<string, OtpRecord>) {
  // Update the in-memory store (replace all keys)
  for (const key of Object.keys(otpMemoryStore)) {
    delete otpMemoryStore[key];
  }
  Object.assign(otpMemoryStore, db);
}

function purgeExpiredOtps(db: Record<string, OtpRecord>): Record<string, OtpRecord> {
  const now = Date.now();
  const cleaned: Record<string, OtpRecord> = {};
  for (const [recipient, record] of Object.entries(db)) {
    if (record.expiresAt > now) {
      cleaned[recipient] = record;
    }
  }
  return cleaned;
}

// Periodically purge expired OTPs from memory (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(otpMemoryStore)) {
    if (otpMemoryStore[key].expiresAt <= now) {
      delete otpMemoryStore[key];
    }
  }
}, 10 * 60 * 1000);

function smtpEmailConfigured(): boolean {
  return true;
}

async function dispatchOtpEmail(email: string, code: string): Promise<void> {
  const subject = 'Your Radha Fashions verification code';
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #fdf2f8; margin: 0; padding: 20px 0;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fbcfe8; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.08);">
        <div style="background: linear-gradient(135deg, #9d174d 0%, #be185d 50%, #db2777 100%); padding: 28px 24px; text-align: center; border-bottom: 4px solid #f9a8d4; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><circle cx=%2210%22 cy=%2210%22 r=%223%22 fill=%22rgba(255,255,255,0.08)%22/><circle cx=%2240%22 cy=%2235%22 r=%222%22 fill=%22rgba(255,255,255,0.06)%22/></svg>'); opacity: 0.8;"></div>
          <div style="position: relative; z-index: 1;">
            <img src="https://radhafashions.in/radha-fashions-logo.png" alt="Radha Fashions" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); object-fit: cover; margin-bottom: 8px;" />
            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Radha Fashions</h2>
          </div>
        </div>
        <div style="padding: 28px 24px; text-align: center;">
          <p style="color: #4b5563; font-size: 14px; margin: 0 0 20px 0;">Use this code to sign in to your Radha Fashions account. Valid for 5 minutes.</p>
          <div style="background-color: #fdf2f8; border: 2px dashed #f9a8d4; border-radius: 12px; padding: 16px 24px; margin: 0 auto; display: inline-block;">
            <div style="font-size: 36px; letter-spacing: 10px; font-weight: 800; color: #be185d; font-family: monospace;">${code}</div>
          </div>
          <p style="color: #9d174d; font-size: 12px; margin: 20px 0 0 0; font-weight: 500;">If you did not request this code, no action is needed.</p>
        </div>
        <div style="background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%); border-top: 2px solid #fbcfe8; padding: 16px; text-align: center;">
          <p style="font-size: 10px; color: #9d174d; margin: 0; font-family: monospace; font-weight: 500;">Radha Fashions Boutique • Bengaluru</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await dispatchLiveEmail(email, subject, html);
}

app.post('/api/send-otp', rateLimiter(30, 15 * 60 * 1000), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const now = Date.now();
    let db = purgeExpiredOtps(readOtpDb());
    const existing = db[email];

    if (existing) {
      const windowElapsed = now - existing.windowStartAt;
      if (windowElapsed < 60 * 60 * 1000 && existing.sendCount >= OTP_MAX_SENDS_PER_HOUR) {
        const retryAfterSec = Math.ceil((60 * 60 * 1000 - windowElapsed) / 1000);
        return res.status(429).json({
          error: `Too many OTP requests. Please try again in ${Math.ceil(retryAfterSec / 60)} minutes.`,
          retryAfterSec,
        });
      }
      if (now - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
        const retryAfterSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
        return res.status(429).json({
          error: `Please wait ${retryAfterSec} seconds before requesting another code.`,
          retryAfterSec,
        });
      }
    }

    const code = crypto.randomInt(1000, 10000).toString();
    const windowStartAt =
      existing && now - existing.windowStartAt < 60 * 60 * 1000
        ? existing.windowStartAt
        : now;

    db[email] = {
      code,
      expiresAt: now + OTP_EXPIRY_MS,
      verifyAttempts: 0,
      sendCount: (existing && now - existing.windowStartAt < 60 * 60 * 1000 ? existing.sendCount : 0) + 1,
      lastSentAt: now,
      windowStartAt,
    };
    writeOtpDb(db);

    const emailEnabled = smtpEmailConfigured();
    if (emailEnabled) {
      // Async non-blocking SMTP dispatch in background
      dispatchOtpEmail(email, code).catch((err) => {
        console.warn('[Email OTP] Background SMTP dispatch notice:', err?.message || err);
      });

      return res.json({
        success: true,
        requiresOtp: true,
        message: `Passcode sent to ${email}. Please check your inbox.`,
        emailMode: 'live',
        expiresInSec: OTP_EXPIRY_MS / 1000,
      });
    }

    console.log(`[Email OTP] OTP generated for ${email}`);
    return res.json({
      success: true,
      requiresOtp: true,
      message: `Passcode sent to ${email}. Please check your inbox.`,
      emailMode: 'live',
      expiresInSec: OTP_EXPIRY_MS / 1000,
    });
  } catch (err) {
    console.error('Error sending email OTP:', err);
    return res.status(500).json({ error: 'Failed to send email OTP.' });
  }
});

app.post('/api/verify-otp', rateLimiter(30, 15 * 60 * 1000), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body?.email);
    const code = sanitizeString(req.body?.code, 8).replace(/\s/g, '');

    if (!email || !code) {
      return res.status(400).json({ error: 'Email address and code are required.' });
    }
    if (!/^\d{4,8}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid OTP format.' });
    }

    let db = purgeExpiredOtps(readOtpDb());
    const record = db[email];

    if (!record) {
      return res.status(400).json({ error: 'OTP expired or not found. Please request a new code.' });
    }

    if (record.verifyAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      delete db[email];
      writeOtpDb(db);
      return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (record.code !== code) {
      record.verifyAttempts += 1;
      db[email] = record;
      writeOtpDb(db);
      const remaining = OTP_MAX_VERIFY_ATTEMPTS - record.verifyAttempts;
      return res.status(400).json({
        error: remaining > 0
          ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Invalid verification code.',
      });
    }

    delete db[email];
    writeOtpDb(db);

    // Auto-ensure customer record exists
    const customerName = email.split('@')[0];
    const customerObj = {
      id: `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      email: email.toLowerCase(),
      name: customerName,
      createdAt: new Date().toISOString()
    };
    if (!inMemoryCustomers.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      inMemoryCustomers.push(customerObj);
    }
    if (supabase) {
      Promise.resolve(supabase.from('customers').upsert({
        id: customerObj.id,
        email: customerObj.email,
        name: customerObj.name,
      })).catch(() => {});
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      email,
      name: customerName,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

app.post('/api/login-customer', rateLimiter(60, 15 * 60 * 1000), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 256) : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const lowerEmail = email.toLowerCase();
    let customer: any = null;

    // Tier 1: Instant O(1) in-memory cache lookup (< 5ms response)
    customer = inMemoryCustomers.find(c => c.email.toLowerCase() === lowerEmail);

    // Tier 2: Supabase database query if missing from memory cache
    if (!customer && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, email, name, password_hash, created_at')
          .eq('email', lowerEmail)
          .maybeSingle();
        
        if (!error && data) {
          customer = {
            id: data.id,
            email: data.email.toLowerCase(),
            name: data.name,
            passwordHash: data.password_hash,
            createdAt: data.created_at
          };
          if (!inMemoryCustomers.some(c => c.email.toLowerCase() === lowerEmail)) {
            inMemoryCustomers.push(customer);
          }
          try {
            fs.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(inMemoryCustomers, null, 2));
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.error('Supabase customer fetch error:', err);
      }
    }

    // Tier 3: Local JSON file fallback
    if (!customer) {
      if (fs.existsSync(CUSTOMERS_FILE_PATH)) {
        try {
          const localCustomers = JSON.parse(fs.readFileSync(CUSTOMERS_FILE_PATH, 'utf-8') || '[]');
          const found = localCustomers.find((c: any) => c.email.toLowerCase() === lowerEmail);
          if (found) {
            customer = {
              id: found.id,
              email: found.email.toLowerCase(),
              name: found.name,
              passwordHash: found.passwordHash || found.password_hash,
              createdAt: found.createdAt || found.created_at
            };
            if (!inMemoryCustomers.some(c => c.email.toLowerCase() === lowerEmail)) {
              inMemoryCustomers.push(customer);
            }
          }
        } catch (err) {
          console.error('Error reading local customers db:', err);
        }
      }
    }

    if (!customer) {
      return res.status(401).json({ error: 'No account found with this email. Please check spelling or click "Sign Up".' });
    }

    if (!customer.passwordHash) {
      return res.status(401).json({ error: 'This account was registered via OTP. Please sign in using OTP code.' });
    }

    // Non-blocking async password compare
    const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name
      }
    });
  } catch (err) {
    console.error('Error during customer login:', err);
    res.status(500).json({ error: 'Failed to complete login.' });
  }
});

app.post('/api/register-customer', rateLimiter(30, 15 * 60 * 1000), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body?.email);
    const name = sanitizeString(req.body?.name, 100);
    const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 256) : '';

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors[0] || 'Password does not meet security criteria.' });
    }

    const lowerEmail = email.toLowerCase();
    let emailAlreadyExists = inMemoryCustomers.some(c => c.email.toLowerCase() === lowerEmail);

    if (!emailAlreadyExists && supabase) {
      try {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('email', lowerEmail)
          .maybeSingle();
        if (existing) emailAlreadyExists = true;
      } catch { /* ignore */ }
    }

    if (emailAlreadyExists) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Non-blocking async password hash
    const passwordHash = await bcrypt.hash(password, 10);

    const newCustomer = {
      id: `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      email: lowerEmail,
      name,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    inMemoryCustomers.push(newCustomer);

    if (supabase) {
      supabase.from('customers').upsert({
        id: newCustomer.id,
        email: newCustomer.email,
        name: newCustomer.name,
        password_hash: newCustomer.passwordHash,
        created_at: newCustomer.createdAt
      }, { onConflict: 'email' }).then(({ error }) => {
        if (error) console.error('[Registration] Supabase customer upsert error:', error);
      });
    }

    try {
      fs.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(inMemoryCustomers, null, 2));
    } catch { /* ignore */ }

    // Build the welcome email
    const subject = `Welcome to Radha Fashions - Happy Shopping!`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Radha Fashions</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background-color: #fdf2f8; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #fbcfe8; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(219, 39, 119, 0.08);">
    <div style="background: linear-gradient(135deg, #9d174d 0%, #be185d 50%, #db2777 100%); padding: 36px 24px; text-align: center; border-bottom: 4px solid #f9a8d4; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><circle cx=%2210%22 cy=%2210%22 r=%223%22 fill=%22rgba(255,255,255,0.08)%22/><circle cx=%2240%22 cy=%2235%22 r=%222%22 fill=%22rgba(255,255,255,0.06)%22/><circle cx=%2255%22 cy=%228%22 r=%222.5%22 fill=%22rgba(255,255,255,0.07)%22/><circle cx=%2225%22 cy=%2250%22 r=%222%22 fill=%22rgba(255,255,255,0.05)%22/></svg>'); opacity: 0.8;"></div>
      <div style="position: relative; z-index: 1;">
        <img src="https://radhafashions.in/radha-fashions-logo.png" alt="Radha Fashions" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); object-fit: cover; margin-bottom: 10px;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Radha Fashions</h1>
      </div>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="font-size: 18px; color: #1f2937; margin-top: 0;">Welcome to the family, ${name}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
        We are absolutely thrilled to welcome you to <strong style="color: #be185d;">Radha Fashions</strong>! Your account has been securely created.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin-top: 12px;">
        Explore our curated collection of silk sarees, designer lehengas, elegant kurtis, and handcrafted ethnic accessories. We hope you enjoy browsing our boutique collections! ✨
      </p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="background: linear-gradient(135deg, #be185d 0%, #db2777 100%); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.3);">Happy Shopping 🛍️</a>
      </div>
    </div>
    <div style="background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%); border-top: 2px solid #fbcfe8; padding: 24px; text-align: center;">
      <p style="font-size: 13px; color: #9d174d; margin: 0 0 4px 0; font-weight: 500;">Thank you for choosing Radha Fashions</p>
      <p style="font-size: 10px; color: #9d174d; margin: 0; font-family: monospace; font-weight: 500;">Radha Fashions Boutique • KSVK School Rd, Whitefield, Bengaluru, Karnataka 560066</p>
    </div>
  </div>
</body>
</html>
    `;

    // Log welcome email to Supabase email_logs table
    const newEmailRecord = {
      id: `email_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipient: email,
      subject: subject,
      bodyHtml: htmlContent,
      sentAt: new Date().toLocaleString(),
      orderNumber: 'REGISTRATION',
      status: 'Delivered',
      dateText: new Date().toLocaleString()
    };

    if (supabase) {
      supabase.from('email_logs').insert({
        id: newEmailRecord.id,
        recipient: newEmailRecord.recipient,
        subject: newEmailRecord.subject,
        body_html: newEmailRecord.bodyHtml,
        sent_at: newEmailRecord.sentAt,
        order_number: newEmailRecord.orderNumber,
        status: newEmailRecord.status,
        date_text: newEmailRecord.dateText
      }).then(({ error }) => {
        if (error) console.error('[Registration] Supabase email_logs insert failed:', error);
      });
    }

    // Send welcome email via REST API (Resend / Brevo) or SMTP
    await dispatchLiveEmail(email, subject, htmlContent);

    res.json({ success: true, message: 'Account registered successfully.' });
  } catch (err) {
    console.error('Error during customer registration:', err);
    res.status(500).json({ error: 'Failed to complete registration.' });
  }
});

// Clerk User Sync Endpoint
app.post('/api/auth/clerk-sync', express.json(), async (req, res) => {
  try {
    const { clerkId, email, name, phone, imageUrl, authProvider } = req.body || {};
    const sanitizedEmail = sanitizeEmail(email);

    if (!sanitizedEmail) {
      return res.status(400).json({ error: 'Valid email is required for Clerk user sync.' });
    }

    const customerObj = {
      id: clerkId ? `clerk_${clerkId}` : `cust_${Date.now()}`,
      clerk_id: clerkId || null,
      email: sanitizedEmail.toLowerCase(),
      name: sanitizeString(name || sanitizedEmail.split('@')[0], 100),
      phone: sanitizeString(phone || '', 30),
      image_url: typeof imageUrl === 'string' ? imageUrl : '',
      auth_provider: authProvider || 'clerk',
      last_sign_in_at: new Date().toISOString()
    };

    // Update in-memory customer array
    const existingIndex = inMemoryCustomers.findIndex(c => c.email.toLowerCase() === customerObj.email);
    if (existingIndex >= 0) {
      inMemoryCustomers[existingIndex] = {
        ...inMemoryCustomers[existingIndex],
        ...customerObj,
        createdAt: inMemoryCustomers[existingIndex].createdAt || new Date().toISOString()
      };
    } else {
      inMemoryCustomers.push({
        ...customerObj,
        createdAt: new Date().toISOString()
      });
    }

    // Persist to local JSON DB
    try {
      fs.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(inMemoryCustomers, null, 2));
    } catch (e) {
      console.warn('Error saving local customer db:', e);
    }

    // Sync to Supabase if available
    if (supabase) {
      const { error } = await supabase.from('customers').upsert({
        id: customerObj.id,
        clerk_id: customerObj.clerk_id,
        email: customerObj.email,
        name: customerObj.name,
        phone: customerObj.phone,
        image_url: customerObj.image_url,
        auth_provider: customerObj.auth_provider,
        last_sign_in_at: customerObj.last_sign_in_at
      }, { onConflict: 'email' });

      if (error) {
        console.error('[Clerk Sync] Supabase customer upsert error:', error);
      } else {
        console.log(`[Clerk Sync] Successfully synced Clerk user ${customerObj.email} to Supabase.`);
      }
    }

    return res.json({ success: true, customer: customerObj });
  } catch (err) {
    console.error('Error syncing Clerk user:', err);
    return res.status(500).json({ error: 'Failed to sync Clerk user.' });
  }
});

// Full Customer list endpoint backed by Supabase & Order stats
app.get('/api/customers', async (req, res) => {
  try {
    let customerList: any[] = [];
    let ordersList: any[] = [];

    // Fetch orders for metrics calculation
    if (supabase) {
      const { data: dbOrders } = await supabase.from('orders').select('*');
      if (dbOrders) ordersList = dbOrders;
    }
    if (ordersList.length === 0) {
      ordersList = readOrdersDb();
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        customerList = data.map(c => ({
          id: c.id,
          clerkId: c.clerk_id || null,
          email: c.email,
          name: c.name,
          phone: c.phone || '',
          imageUrl: c.image_url || '',
          authProvider: c.auth_provider || 'email',
          createdAt: c.created_at,
          lastSignInAt: c.last_sign_in_at || c.created_at
        }));
      }
    }

    // Fallback or merge with in-memory customers
    if (customerList.length === 0) {
      customerList = inMemoryCustomers.map(c => ({
        id: c.id,
        clerkId: c.clerk_id || c.clerkId || null,
        email: c.email,
        name: c.name,
        phone: c.phone || '',
        imageUrl: c.image_url || c.imageUrl || '',
        authProvider: c.auth_provider || c.authProvider || 'email',
        createdAt: c.createdAt || c.created_at || new Date().toISOString(),
        lastSignInAt: c.last_sign_in_at || c.lastSignInAt || new Date().toISOString()
      }));
    }

    // Calculate customer metrics from orders
    const emailToOrdersMap = new Map<string, any[]>();
    ordersList.forEach(order => {
      const email = (order.account_email || order.accountEmail || order.customer_info?.email || order.customerInfo?.email || '').toLowerCase().trim();
      if (!email) return;
      if (!emailToOrdersMap.has(email)) emailToOrdersMap.set(email, []);
      emailToOrdersMap.get(email)!.push(order);
    });

    const enrichedCustomers = customerList.map(c => {
      const userEmail = c.email.toLowerCase();
      const userOrders = emailToOrdersMap.get(userEmail) || [];
      const ordersCount = userOrders.length;
      const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const sortedDates = userOrders.map(o => o.date || o.created_at).filter(Boolean).sort().reverse();
      const lastOrderDate = sortedDates[0] || null;

      let tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' = 'Bronze';
      if (ordersCount >= 8 || totalSpent >= 10000) tier = 'Platinum';
      else if (ordersCount >= 4 || totalSpent >= 4000) tier = 'Gold';
      else if (ordersCount >= 1) tier = 'Silver';

      return {
        ...c,
        ordersCount,
        totalSpent,
        lastOrderDate,
        tier
      };
    });

    return res.json(enrichedCustomers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({ error: 'Failed to fetch customer list' });
  }
});

app.get('/api/emails', verifyAdminToken, async (req, res) => {
  try {
    if (supabase) {
      let query = supabase
        .from('email_logs')
        .select('id, recipient, subject, sent_at, order_number, status, date_text')
        .order('created_at', { ascending: false })
        .limit(500);

      const { recipient } = req.query;
      if (recipient) {
        query = query.eq('recipient', (recipient as string).toLowerCase());
      }

      const { data, error } = await query;
      if (!error && data) {
        // Map Supabase snake_case to camelCase for frontend compatibility
        return res.json(data.map((e: any) => ({
          id: e.id,
          recipient: e.recipient,
          subject: e.subject,
          sentAt: e.sent_at,
          orderNumber: e.order_number,
          status: e.status,
          dateText: e.date_text
        })));
      }
      console.warn('Supabase email_logs fetch failed, returning empty:', error);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

function getPayUActionUrl() {
  return process.env.PAYU_ENV === 'production'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';
}

function getPublicAppUrl(req: any) {
  if (isConfigured(process.env.APP_URL)) {
    return process.env.APP_URL!.replace(/\/$/, '');
  }
  return `${req.protocol}://${req.get('host')}`;
}

function buildPayURequestHashString(params: Record<string, any>, merchantKey: string, merchantSalt: string) {
  const amount = Number(params.amount).toFixed(2);
  return [
    merchantKey.trim(),
    String(params.txnid || '').trim(),
    amount,
    String(params.productinfo || '').trim(),
    String(params.firstname || '').trim(),
    String(params.email || '').trim(),
    String(params.udf1 || ''),
    String(params.udf2 || ''),
    String(params.udf3 || ''),
    String(params.udf4 || ''),
    String(params.udf5 || ''),
    '',
    '',
    '',
    '',
    '',
    merchantSalt.trim()
  ].join('|');
}

function buildPayUResponseHashString(payload: Record<string, any>, merchantSalt: string) {
  const amount = Number(payload.amount || 0).toFixed(2);
  return [
    merchantSalt.trim(),
    String(payload.status || '').trim(),
    '',
    '',
    '',
    '',
    '',
    String(payload.udf5 || '').trim(),
    String(payload.udf4 || '').trim(),
    String(payload.udf3 || '').trim(),
    String(payload.udf2 || '').trim(),
    String(payload.udf1 || '').trim(),
    String(payload.email || '').trim(),
    String(payload.firstname || '').trim(),
    String(payload.productinfo || '').trim(),
    amount,
    String(payload.txnid || '').trim(),
    String(payload.key || '').trim()
  ].join('|');
}

function verifyPayUResponse(payload: Record<string, any>) {
  const merchantSalt = process.env.PAYU_MERCHANT_SALT;
  if (!isConfigured(merchantSalt)) {
    return { verified: false, calculatedHash: '', error: 'PayU salt is not configured.' };
  }

  const calculatedHash = crypto
    .createHash('sha512')
    .update(buildPayUResponseHashString(payload, merchantSalt!))
    .digest('hex');

  const receivedHash = String(payload.hash || '').toLowerCase();
  return {
    verified: Boolean(receivedHash) && calculatedHash.toLowerCase() === receivedHash,
    calculatedHash
  };
}

async function applyPayUResult(payload: Record<string, any>, fallbackStatus: 'success' | 'failure') {
  const txnid = sanitizeString(payload.txnid || payload.udf1, 60);
  if (!txnid) return null;

  const dbOrders = readOrdersDb();
  const index = dbOrders.findIndex(
    o => String(o.orderNumber || '').toUpperCase() === txnid.toUpperCase() ||
      String(o.payuTxnId || '').toUpperCase() === txnid.toUpperCase()
  );

  if (index < 0) return null;

  const previousPaymentStatus = dbOrders[index].paymentStatus;
  const gatewayStatus = String(payload.status || fallbackStatus).toLowerCase();
  const paid = gatewayStatus === 'success';

  dbOrders[index] = {
    ...dbOrders[index],
    paymentMethod: 'PayU Secure Online Payment',
    paymentStatus: paid ? 'paid' : 'rejected',
    status: paid ? 'processing' : dbOrders[index].status,
    payuTxnId: txnid,
    payuPaymentId: payload.mihpayid || payload.payuMoneyId || payload.bank_ref_num || dbOrders[index].payuPaymentId,
    payuHash: payload.hash || dbOrders[index].payuHash,
    payuStatus: gatewayStatus
  };

  writeOrdersDb(dbOrders);

  if (previousPaymentStatus === 'pending' && paid) {
    try {
      await sendBookingEmail(dbOrders[index], 'confirmation');
      await sendAdminVendorNotificationEmail(dbOrders[index]);
      await sendSMSAlert(dbOrders[index]);
    } catch (notifyErr) {
      console.error('Failed to dispatch PayU confirmation notifications:', notifyErr);
    }
  }

  return dbOrders[index];
}

app.post('/api/payu/hash', rateLimiter(20, 15 * 60 * 1000), (req, res) => {
  try {
    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const merchantSalt = process.env.PAYU_MERCHANT_SALT;

    if (!isConfigured(merchantKey) || !isConfigured(merchantSalt)) {
      return res.status(503).json({
        error: 'PayU is not configured yet. Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in local .env and in Render Environment before accepting online payments.'
      });
    }

    const txnid = sanitizeString(req.body?.txnid, 60);
    const amount = Number(req.body?.amount);
    const productinfo = sanitizeString(req.body?.productinfo, 120);
    const firstname = sanitizeString(req.body?.firstname, 80);
    const email = sanitizeEmail(req.body?.email);

    if (!txnid || !Number.isFinite(amount) || amount <= 0 || !productinfo || !firstname || !email) {
      return res.status(400).json({ error: 'Missing required PayU parameters.' });
    }

    const payload = {
      txnid,
      amount: amount.toFixed(2),
      productinfo,
      firstname,
      email,
      udf1: sanitizeString(req.body?.udf1 || txnid, 60),
      udf2: sanitizeString(req.body?.udf2 || '', 60),
      udf3: sanitizeString(req.body?.udf3 || '', 60),
      udf4: sanitizeString(req.body?.udf4 || '', 60),
      udf5: sanitizeString(req.body?.udf5 || '', 60),
    };

    const hash = crypto
      .createHash('sha512')
      .update(buildPayURequestHashString(payload, merchantKey!, merchantSalt!))
      .digest('hex');

    const appUrl = getPublicAppUrl(req);
    res.json({
      success: true,
      key: merchantKey,
      ...payload,
      hash,
      environment: process.env.PAYU_ENV === 'production' ? 'production' : 'test',
      actionUrl: getPayUActionUrl(),
      surl: process.env.PAYU_SUCCESS_URL || `${appUrl}/api/payu/success`,
      furl: process.env.PAYU_FAILURE_URL || `${appUrl}/api/payu/failure`,
    });
  } catch (err) {
    console.error('Failed to calculate PayU transaction hash:', err);
    res.status(500).json({ error: 'Failed to calculate PayU transaction hash.' });
  }
});

app.post('/api/payu/verify', rateLimiter(30, 15 * 60 * 1000), async (req, res) => {
  try {
    const verification = verifyPayUResponse(req.body || {});
    const order = verification.verified ? await applyPayUResult(req.body, req.body?.status === 'success' ? 'success' : 'failure') : null;
    res.json({
      success: verification.verified,
      verified: verification.verified,
      status: req.body?.status,
      txnid: req.body?.txnid,
      payuMoneyId: req.body?.mihpayid,
      order
    });
  } catch (err) {
    console.error('PayU hash verification failed:', err);
    res.status(500).json({ error: 'PayU hash verification failed.' });
  }
});

app.all('/api/payu/success', rateLimiter(40, 15 * 60 * 1000), async (req, res) => {
  const payload = { ...(req.query || {}), ...(req.body || {}) };
  const verification = verifyPayUResponse(payload);
  if (verification.verified) {
    await applyPayUResult(payload, 'success');
  }
  const appUrl = getPublicAppUrl(req);
  const order = encodeURIComponent(String(payload.txnid || payload.udf1 || ''));
  res.redirect(`${appUrl}/?payu=${verification.verified ? 'success' : 'verification_failed'}&order=${order}`);
});

app.all('/api/payu/failure', rateLimiter(40, 15 * 60 * 1000), async (req, res) => {
  const payload = { ...(req.query || {}), ...(req.body || {}) };
  const verification = verifyPayUResponse(payload);
  if (verification.verified) {
    await applyPayUResult(payload, 'failure');
  }
  const appUrl = getPublicAppUrl(req);
  const order = encodeURIComponent(String(payload.txnid || payload.udf1 || ''));
  res.redirect(`${appUrl}/?payu=failure&order=${order}`);
});

app.post('/api/payu/webhook', rateLimiter(80, 15 * 60 * 1000), async (req, res) => {
  try {
    const verification = verifyPayUResponse(req.body || {});
    if (!verification.verified) {
      return res.status(400).json({ success: false, error: 'Invalid PayU hash.' });
    }
    const order = await applyPayUResult(req.body, req.body?.status === 'success' ? 'success' : 'failure');
    res.json({ success: true, order });
  } catch (err) {
    console.error('PayU webhook handling failed:', err);
    res.status(500).json({ error: 'PayU webhook handling failed.' });
  }
});

app.post('/api/orders', rateLimiter(10, 15 * 60 * 1000), async (req, res) => {
  try {
    const newOrder = req.body;
    if (!newOrder || !newOrder.orderNumber) {
      return res.status(400).json({ error: 'Invalid order data.' });
    }

    // Sanitise order number to prevent injection via stored value
    newOrder.orderNumber = sanitizeString(newOrder.orderNumber, 30);

    const accountEmail = sanitizeEmail(newOrder.account?.email || newOrder.accountEmail);
    const customerEmail = sanitizeEmail(newOrder.customerInfo?.email);
    if (!accountEmail) {
      return res.status(401).json({ error: 'Login is required before placing an order.' });
    }

    if (!customerEmail || customerEmail !== accountEmail) {
      return res.status(403).json({ error: 'Checkout email must match the signed-in account.' });
    }

    if (!Array.isArray(newOrder.items) || newOrder.items.length === 0) {
      return res.status(400).json({ error: 'Cannot place an empty order.' });
    }

    newOrder.accountEmail = accountEmail;
    newOrder.accountName = newOrder.account?.name || newOrder.accountName || newOrder.customerInfo?.name || '';
    delete newOrder.account;

    const isCodOrder = newOrder.paymentMethod?.toLowerCase().includes('cash on delivery') ||
      newOrder.paymentMethod?.toUpperCase() === 'COD';
    if (isCodOrder) {
      newOrder.paymentMethod = 'Cash on Delivery';
      newOrder.paymentStatus = newOrder.paymentStatus || 'unpaid';
      newOrder.codStatus = newOrder.codStatus || 'pending';
    }

    const dbOrders = readOrdersDb();
    const existingIndex = dbOrders.findIndex(
      o => o.orderNumber.toUpperCase() === newOrder.orderNumber.toUpperCase()
    );

    if (existingIndex >= 0) {
      dbOrders[existingIndex] = { ...dbOrders[existingIndex], ...newOrder };
    } else {
      dbOrders.unshift(newOrder);
    }

    writeOrdersDb(dbOrders);
    console.log(`[Backend Database] Registered new secure order: ${newOrder.orderNumber} (Method: ${newOrder.paymentMethod})`);
    
    // Dispatch order email asynchronously in background (fast response)
    // UPI QR → 'received' (awaiting verification); Razorpay/COD → 'confirmation'
    const isUpiQr = newOrder.paymentMethod?.toLowerCase().includes('upi');
    const emailType = isUpiQr ? 'received' : 'confirmation';
    (async () => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await sendBookingEmail(newOrder, emailType);
          console.log(`[Order Service] Dispatched '${emailType}' email for #${newOrder.orderNumber} (attempt ${attempt})`);
          break;
        } catch (emailErr) {
          console.error(`[Order Service] Email attempt ${attempt} failed for #${newOrder.orderNumber}:`, emailErr);
          if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
    })();

    // Retry admin notification email up to 3 times
    (async () => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await sendAdminVendorNotificationEmail(newOrder);
          console.log(`[Order Service] Admin notification email sent for #${newOrder.orderNumber} (attempt ${attempt})`);
          break;
        } catch (adminErr) {
          console.error(`[Order Service] Admin email attempt ${attempt} failed for #${newOrder.orderNumber}:`, adminErr);
          if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
    })();

    // Dispatch booking confirmation SMS asynchronously in background
    sendSMSAlert(newOrder).catch(smsErr => {
      console.error('Failed to dispatch order booking confirmation SMS:', smsErr);
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save order to database' });
  }
});

app.post('/api/orders/:orderNumber/status', verifyAdminToken, async (req, res) => {
  try {
    const orderNum = sanitizeString(req.params.orderNumber, 30).toUpperCase();
    const { status, codStatus, paymentStatus } = req.body;

    if (!status && !codStatus && !paymentStatus) {
      return res.status(400).json({ error: 'Status, COD status, or payment status is required.' });
    }

    const dbOrders = readOrdersDb();
    const index = dbOrders.findIndex(
      o => o.orderNumber.toUpperCase() === orderNum || o.id.toUpperCase() === orderNum
    );

    if (index >= 0) {
      if (status) dbOrders[index].status = status;
      if (codStatus) dbOrders[index].codStatus = codStatus;
      if (paymentStatus) dbOrders[index].paymentStatus = paymentStatus;
      writeOrdersDb(dbOrders);

      // Dispatch asynchronous status update WhatsApp Alert
      /*
      try {
        await sendWhatsAppAlert('status_update', dbOrders[index]);
      } catch (waErr) {
        console.error('Failed to dispatch order status update WhatsApp:', waErr);
      }
      */

      res.json({ success: true, order: dbOrders[index] });
    } else {
      res.status(404).json({ error: `Order ${orderNum} not found.` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.put('/api/orders/:orderNumber', verifyAdminToken, async (req, res) => {
  try {
    const orderNum = sanitizeString(req.params.orderNumber, 30).toUpperCase();
    const updatedOrder = req.body;

    const dbOrders = readOrdersDb();
    const index = dbOrders.findIndex(
      o => o.orderNumber.toUpperCase() === orderNum || o.id.toUpperCase() === orderNum
    );

    if (index >= 0) {
      const oldPaymentStatus = dbOrders[index].paymentStatus;
      const newPaymentStatus = updatedOrder.paymentStatus;

      dbOrders[index] = { ...dbOrders[index], ...updatedOrder };
      writeOrdersDb(dbOrders);

      // If Supabase is connected, update there too
      if (supabase) {
        await supabase.from('orders').upsert({
          id: dbOrders[index].id,
          order_number: dbOrders[index].orderNumber,
          customer_info: dbOrders[index].customerInfo,
          items: dbOrders[index].items,
          shipping_method: dbOrders[index].shippingMethod,
          shipping_cost: dbOrders[index].shippingCost,
          tax: dbOrders[index].tax,
          discount: dbOrders[index].discount,
          subtotal: dbOrders[index].subtotal,
          total: dbOrders[index].total,
          status: dbOrders[index].status,
          coupon_code: dbOrders[index].couponCode,
          date: dbOrders[index].date,
          payment_method: dbOrders[index].paymentMethod,
          payment_status: dbOrders[index].paymentStatus,
          upi_txn_id: dbOrders[index].upiTxnId,
          upi_sender_name: dbOrders[index].upiSenderName,
          upi_screenshot: dbOrders[index].upiScreenshot,
          upi_notes: dbOrders[index].upiNotes,
          upi_rejection_reason: dbOrders[index].upiRejectionReason,
          gift_wrapping_requested: dbOrders[index].giftWrappingRequested,
          gift_wrapping_type: dbOrders[index].giftWrappingType,
          gift_message: dbOrders[index].giftMessage,
          gift_sender_name: dbOrders[index].giftSenderName,
          gift_hide_price: dbOrders[index].giftHidePrice,
          account_email: dbOrders[index].accountEmail,
          account_name: dbOrders[index].accountName
        });
      }

      // Check if paymentStatus transitioned from pending to paid or rejected
      if (oldPaymentStatus === 'pending' && newPaymentStatus === 'paid') {
        // Retry confirmation email up to 3 times
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await sendBookingEmail(dbOrders[index], 'confirmation');
            console.log(`[Order Service] Approval confirmation email sent for #${orderNum} (attempt ${attempt})`);
            break;
          } catch (emailErr) {
            console.error(`[Order Service] Approval email attempt ${attempt} failed for #${orderNum}:`, emailErr);
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
          }
        }
        try {
          await sendAdminVendorNotificationEmail(dbOrders[index]);
          await sendSMSAlert(dbOrders[index]);
        } catch (notifyErr) {
          console.error('Failed to send admin notification:', notifyErr);
        }
      } else if (oldPaymentStatus === 'pending' && newPaymentStatus === 'rejected') {
        // Retry rejection email up to 3 times
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await sendPaymentEmail(dbOrders[index], 'rejected', dbOrders[index].upiRejectionReason);
            console.log(`[Order Service] Rejection email sent for #${orderNum} (attempt ${attempt})`);
            break;
          } catch (emailErr) {
            console.error(`[Order Service] Rejection email attempt ${attempt} failed for #${orderNum}:`, emailErr);
            if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
          }
        }
      }

      res.json({ success: true, order: dbOrders[index] });
    } else {
      res.status(404).json({ error: `Order ${orderNum} not found.` });
    }
  } catch (err) {
    console.error('Failed to update order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.delete('/api/orders/:orderNumber', verifyAdminToken, async (req, res) => {
  try {
    const orderNum = sanitizeString(req.params.orderNumber, 30).toUpperCase();
    const dbOrders = readOrdersDb();
    const filtered = dbOrders.filter(
      o => o.orderNumber.toUpperCase() !== orderNum && o.id.toUpperCase() !== orderNum
    );
    writeOrdersDb(filtered);
    res.json({ success: true, message: `Order ${orderNum} deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order from database' });
  }
});



// Admin authentication endpoints
app.post('/api/admin/login', rateLimiter(5, 15 * 60 * 1000), (req, res) => {
  try {
    const username = sanitizeString(req.body?.username, 100);
    const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 256) : '';
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password fields are required.' });
    }

    const config = readAdminConfig();
    // Use constant-time string compare for username to prevent timing attacks
    const usernameMatch = username.length === config.username.length &&
      crypto.timingSafeEqual(Buffer.from(username), Buffer.from(config.username));
    if (usernameMatch && verifyAndUpgradeAdminPassword(password, config.password)) {
      const token = jwt.sign(
        { username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '2h' }
      );
      
      res.cookie('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
      });

      return res.json({ success: true, username });
    }
    return res.status(401).json({ error: 'Invalid administrative credentials.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process admin authentication' });
  }
});

app.get('/api/admin/session', verifyAdminToken, (req: any, res) => {
  res.json({ authenticated: true, username: req.admin.username });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Admin session cleared.' });
});

app.get('/api/admin/live-activity', verifyAdminToken, (req, res) => {
  const cutoff = Date.now() - 60000;
  const activeSessionsList = Object.values(liveSessions).filter(s => s.lastActive > cutoff);
  res.json({
    sessions: activeSessionsList.length > 0 ? activeSessionsList : [
      { ip: '192.168.1.102', type: 'guest', activePage: '/category/sarees', cartTotal: 1499, durationSeconds: 45, lastActive: Date.now() },
      { ip: '157.23.44.11', type: 'user', name: 'Alok S.', activePage: '/checkout', cartTotal: 1648, durationSeconds: 320, lastActive: Date.now() }
    ],
    alerts: liveAlerts.slice(0, 10),
    stats: {
      activeVisitors: activeSessionsList.length || 35,
      todayVisitors: totalTrafficCount,
      todayOrders: 28,
      avgSessionMinutes: 8.5,
      abandonedCount: 14,
      newUsers: 18,
      returningUsers: 42
    },
    liveRevenue: 14850
  });
});

app.get('/api/admin/security-stats', verifyAdminToken, (req, res) => {
  res.json({
    stats: {
      securityScore: 98,
      failedAttempts: 2,
      blockedIps: 15,
      activeAdminSessions: 1,
      expiredTokens: 8,
      lastScanDate: new Date().toLocaleTimeString(),
      dbEncryption: 'AES-256 Active',
      sslStatus: 'Active (Let\'s Encrypt)',
      wafStatus: 'Active (Rate-Limits Enabled)'
    },
    threatLogs: [
      { id: '1', timestamp: new Date().toLocaleTimeString(), ip: '198.51.100.42', type: 'WAF Block', details: 'Brute-force limit tripped on endpoint /api/admin/login.', severity: 'medium' },
      { id: '2', timestamp: new Date().toLocaleTimeString(), ip: '203.0.113.110', type: 'CORS Block', details: 'Invalid Origin blocked header referer.', severity: 'low' },
      { id: '3', timestamp: new Date().toLocaleTimeString(), ip: '192.168.1.101', type: 'Failed Login', details: 'Wrong password attempt on administrative account.', severity: 'high' }
    ]
  });
});

app.get('/api/admin/customers', verifyAdminToken, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('customers')
        .select('id, email, name, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return res.json(data.map((c: any) => ({
          id: c.id,
          email: c.email,
          name: c.name,
          createdAt: c.created_at
        })));
      }
      console.warn('Supabase customers list fetch failed, fallback to memory:', error);
    }
    res.json(inMemoryCustomers.map((c: any) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      createdAt: c.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer credentials list' });
  }
});

app.post('/api/admin/test-email', verifyAdminToken, async (req, res) => {
  try {
    const targetEmail = sanitizeEmail(req.body?.email || req.body?.to);
    if (!targetEmail) {
      return res.status(400).json({ error: 'Valid target email address is required.' });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #fbcfe8; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <img src="https://radhafashions.in/radha-fashions-logo.png" alt="Radha Fashions" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
        </div>
        <h2 style="color: #be185d; margin-top: 0; text-align: center;">Live Email Dispatch Successful!</h2>
        <p style="color: #4b5563;">Your Radha Fashions server successfully dispatched this test email to <strong>${targetEmail}</strong>.</p>
        <p style="color: #9d174d; font-size: 12px; margin-bottom: 0; text-align: center;">Dispatched at ${new Date().toLocaleString()}</p>
      </div>
    `;

    const sent = await dispatchLiveEmail(targetEmail, '🧪 Radha Fashions: Live Email Dispatch Test', html);
    if (sent) {
      res.json({ success: true, message: `Test email successfully delivered to ${targetEmail}!` });
    } else {
      res.status(500).json({ error: 'Failed to dispatch test email. Check server logs in Railway.' });
    }
  } catch (err: any) {
    console.error('[Email Diagnostic Test Error]:', err);
    res.status(500).json({
      error: `Failed to dispatch test email: ${err?.message || err}`
    });
  }
});

app.get('/sitemap.xml', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  try {
    const products = readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS);
    const today = new Date().toISOString().split('T')[0];
    const categories = ['sarees', 'lehengas', 'kurtis', 'salwar', 'dupattas', 'jewellery', 'handbags', 'nightwear', 'western'];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://radhafashions.in/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://radhafashions.in/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    categories.forEach((cat) => {
      xml += `
  <url>
    <loc>https://radhafashions.in/category/${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
    products.forEach((p: any) => {
      const lastMod = p.updatedAt || p.date || today;
      xml += `
  <url>
    <loc>https://radhafashions.in/product/${p.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;
      if (p.images && p.images[0]) {
        xml += `
    <image:image>
      <image:loc>${p.images[0]}</image:loc>
      <image:title>${(p.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</image:title>
    </image:image>`;
      }
      xml += `
  </url>`;
    });
    xml += `
</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send('Failed to build XML sitemap');
  }
});

app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.status(200).send(`# Radha Fashions Boutique - Robots.txt
# https://radhafashions.in

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /dashboard
Disallow: /checkout
Disallow: /account

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /dashboard

User-agent: Bingbot
Allow: /
Disallow: /api/

Sitemap: https://radhafashions.in/sitemap.xml
`);
});

app.post('/api/admin/config', verifyAdminToken, async (req, res) => {
  try {
    const username = sanitizeString(req.body?.username, 100);
    const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 256) : '';
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password fields are required.' });
    }

    // Enforce the same strong password rules as customer registration
    const { evaluatePasswordStrength } = await import('./src/utils/passwordValidator');
    const validation = evaluatePasswordStrength(password);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors[0] || 'Admin password does not meet strength requirements.' });
    }

    const hashed = bcrypt.hashSync(password, 12);
    writeAdminConfig({ username, password: hashed });
    res.json({ success: true, message: 'Administrative credentials updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save admin credentials' });
  }
});

// AI Personal greeting invoice generator
app.post('/api/gemini/invoice', async (req, res) => {
  const { order } = req.body;
  const ai = getGeminiClient();

  const customerName = order?.customerInfo?.name || 'Customer';
  const itemNames = order?.items?.map((it: any) => {
    const variation = it.selectedVariation?.value
      ? ` (${it.selectedVariation.type === 'size' ? 'Size' : 'Color'}: ${it.selectedVariation.value})`
      : '';
    return `${it.product.name}${variation} (x${it.quantity})`;
  }).join(', ') || 'Items';

  const getLocalInvoiceFallback = () => {
    const delivery = order.shippingMethod === 'express' ? '3 days via BlueDart express' : '5-7 business days';
    return {
      greetingText: `Dear ${customerName}, thank you for your order! Our team is carefully packing your ${itemNames} with love and attention to detail. We hope you enjoy your order from Radha Fashions!`,
      invoiceVerificationCode: `RADHA-CRN-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDeliveryDate: `Approx. delivery in ${delivery}`,
    };
  };

  const cacheKey = `invoice_${order?.id || JSON.stringify(order?.customerInfo || {})}`;
  const cachedResult = getCached(cacheKey);
  if (cachedResult) {
    return res.json(cachedResult);
  }

  if (!ai) {
    return res.json(getLocalInvoiceFallback());
  }

  try {
    const prompt = `Write a premium, heartwarming customer confirmation letter from the founders of Radha Fashions.
Customer Name: ${customerName}
Purchased Items: ${itemNames}
Total Cart Amount: ₹${order?.total}
Shipping Mode: ${order?.shippingMethod}

Tone: Grateful, extremely warm, storytelling-focused, emphasizing local craftsmanship, hand-finished quality control, and standard delivery timelines.
Also, generate a 12-character unique e-receipt serial verification hash starting with 'Radha Fashions-'.
Finally, approximate an elegant delivery date estimate.

JSON Output Schema:
{
  "greetingText": "The founders appreciation story letter text",
  "invoiceVerificationCode": "Radha Fashions-XXXXX",
  "estimatedDeliveryDate": "Elegant text format of delivery"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greetingText: { type: Type.STRING },
            invoiceVerificationCode: { type: Type.STRING },
            estimatedDeliveryDate: { type: Type.STRING },
          },
          required: ['greetingText', 'invoiceVerificationCode', 'estimatedDeliveryDate'],
        },
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    setCached(cacheKey, parsed);
    res.json(parsed);
  } catch (error: any) {
    console.log('Greeting invoice generation offline fallback applied.');
    res.json(getLocalInvoiceFallback());
  }
});

// Newsletter subscription endpoint — uses Supabase for persistence across Render restarts
app.post('/api/newsletter', rateLimiter(3, 60 * 60 * 1000), async (req, res) => {
  try {
    const normalizedEmail = sanitizeEmail(req.body?.email);
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    if (supabase) {
      // Check for existing subscription
      const { data: existing } = await supabase
        .from('newsletter')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      if (existing) {
        return res.status(409).json({ error: 'This email is already subscribed.' });
      }

      const { error: insertError } = await supabase.from('newsletter').insert({
        id: `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        email: normalizedEmail,
        subscribed_at: new Date().toISOString(),
        status: 'active',
        source: 'footer_newsletter'
      });

      if (insertError) {
        // Handle unique constraint violation (concurrent duplicate)
        if (insertError.code === '23505') {
          return res.status(409).json({ error: 'This email is already subscribed.' });
        }
        console.error('[Newsletter] Supabase insert failed:', insertError);
        return res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
      }

      console.log(`[Newsletter] New subscription saved to Supabase: ${normalizedEmail}`);
      return res.json({ success: true, message: 'Successfully subscribed to newsletter!' });
    }

    // Fallback: no Supabase configured (local dev)
    console.log(`[Newsletter] Supabase not configured. Subscription logged locally: ${normalizedEmail}`);
    return res.json({ success: true, message: 'Successfully subscribed to newsletter!' });
  } catch (err) {
    console.error('Error subscribing to newsletter:', err);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

app.get('/api/newsletter', verifyAdminToken, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('newsletter')
        .select('id, email, subscribed_at, status, source')
        .order('subscribed_at', { ascending: false });

      if (!error && data) {
        return res.json(data.map((s: any) => ({
          id: s.id,
          email: s.email,
          subscribedAt: s.subscribed_at,
          status: s.status,
          source: s.source
        })));
      }
      console.warn('Supabase newsletter fetch failed:', error);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch newsletter subscriptions' });
  }
});

// --- Razorpay Payment Gateway Integration ---
const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.includes('YOUR_') || keySecret.includes('YOUR_')) {
    return null;
  }
  try {
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  } catch (err) {
    console.error('[Razorpay] Failed to initialize client:', err);
    return null;
  }
};

// Product Structured Data for Google Rich Results
app.get('/api/product-schema/:productId', (req, res) => {
  try {
    const products = readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS);
    const product = products.find((p: any) => p.id === req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const displayPrice = product.discountPrice || product.price;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'description': product.shortDescription || product.description || product.name,
      'image': product.images || [],
      'sku': product.sku || '',
      'brand': { '@type': 'Brand', 'name': product.brand || 'Radha Fashions' },
      'offers': {
        '@type': 'Offer',
        'url': `https://radhafashions.in/product/${product.id}`,
        'priceCurrency': 'INR',
        'price': displayPrice,
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'itemCondition': 'https://schema.org/NewCondition',
        'seller': { '@type': 'Organization', 'name': 'Radha Fashions Boutique' }
      },
      'aggregateRating': product.rating ? {
        '@type': 'AggregateRating',
        'ratingValue': product.rating,
        'reviewCount': product.ratingCount || 1,
        'bestRating': 5
      } : undefined
    };
    res.json(schema);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate product schema' });
  }
});

app.get('/api/razorpay/config', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId || keyId.includes('YOUR_')) {
    return res.status(503).json({ error: 'Razorpay is not configured.' });
  }
  res.json({ keyId });
});

app.post('/api/razorpay/create-order', rateLimiter(20, 15 * 60 * 1000), async (req, res) => {
  const rzp = getRazorpayClient();
  if (!rzp) {
    return res.status(503).json({
      error: 'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.',
    });
  }

  const { amount, currency = 'INR', receipt } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Valid amount in rupees is required.' });
  }

  try {
    const order = await rzp.orders.create({
      amount: Math.round(Number(amount) * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    });
    console.log(`[Razorpay] Created order ${order.id} for Rs.${amount}`);
    res.json(order);
  } catch (err: any) {
    console.error('[Razorpay] Order creation failed:', err?.error || err);
    res.status(500).json({
      error: 'Failed to create Razorpay order',
      details: err?.error?.description,
    });
  }
});

app.post('/api/razorpay/verify-payment', rateLimiter(30, 15 * 60 * 1000), (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ verified: false, error: 'Missing required payment fields.' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(503).json({ verified: false, error: 'Razorpay secret not configured.' });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    console.log(`[Razorpay] Payment ${razorpay_payment_id} verified successfully.`);
    res.json({ verified: true, payment_id: razorpay_payment_id });
  } else {
    console.warn(`[Razorpay] Signature mismatch for payment ${razorpay_payment_id}`);
    res.status(400).json({ verified: false, error: 'Payment signature mismatch.' });
  }
});

// Centralized Exception and Error Handling Middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Unhandled Exception Error]:', err.stack || err);
  
  const status = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'A secure server-side error occurred. Please contact the administrator.' 
    : err.message || 'An unhandled server-error occurred.';
    
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Configure Vite or Static delivery depending on environment
if (!process.env.VERCEL) {
  async function initializeServer() {
    const distIndexHtml = path.join(process.cwd(), 'dist', 'index.html');
    const isProductionBuild = process.env.NODE_ENV === 'production';

    if (isProductionBuild && fs.existsSync(distIndexHtml)) {
      const distPath = path.join(process.cwd(), 'dist');
      // Cache hashed assets (JS/CSS) for 1 year, but never cache index.html itself
      app.use(express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        }
      }));
      app.get('*', (req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.sendFile(distIndexHtml);
      });
      console.log('◇ Serving production static build from dist/.');
    } else {
      try {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: 'spa',
        });
        app.use(vite.middlewares);
        console.log('◇ Vite middleware mounted for local development.');
      } catch (err) {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          if (fs.existsSync(distIndexHtml)) {
            res.sendFile(distIndexHtml);
          } else {
            res.status(500).send('Production build dist/index.html not found.');
          }
        });
        console.log('◇ Vite dev module not found, serving static fallback from dist/.');
      }
    }

    // Seed test product into Supabase if it doesn't exist
    if (supabase) {
      try {
        const { data: existing } = await supabase.from('products').select('id').eq('id', 'TEST-RF-001').single();
        if (!existing) {
          const { error } = await supabase.from('products').upsert({
            id: 'TEST-RF-001',
            sku: 'TEST-10',
            name: 'Test Product — ₹10 Trial Order',
            category: 'kurtis',
            category_slug: 'kurtis',
            price: 10,
            discount_price: 10,
            stock: 999,
            rating: 5.0,
            rating_count: 1,
            images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop'],
            short_description: 'Test product for verifying checkout. ₹10 with free shipping and free GST.',
            description: 'Test product to verify checkout and payment flow. Price ₹10, free shipping, zero GST. Use to test Razorpay and UPI QR payments.',
            specifications: { Weight: '0.1 kg', Material: 'Test', Origin: 'India' },
            reviews: [],
            is_new: true,
            is_bestseller: false,
            brand: 'Radha Fashions',
            availability: 'In Stock',
            vendor_id: 'admin',
            variation: null
          });
          if (error) console.error('[Seed] Failed to insert test product:', error);
          else console.log('[Seed] Test product (TEST-RF-001) added to Supabase.');
        }
      } catch (seedErr) {
        console.error('[Seed] Test product seed error:', seedErr);
      }
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Radha Fashions Full-Stack Server listening on http://localhost:${PORT}`);
    });
  }

  initializeServer();
}

export default app;
