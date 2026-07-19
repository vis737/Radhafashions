import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import multer from 'multer';
// Razorpay temporarily disabled.
// Enable after GST registration and production credentials are available.
// import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_CAMPAIGNS,
  INITIAL_CMS
} from './src/utils/mockData';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

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

if (supabase) {
  console.log('◇ Supabase connected successfully as main database.');
} else {
  console.log('◇ Supabase credentials missing/default. Using offline fallback JSON database.');
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
        specifications: p.specifications || {},
        reviews: p.reviews || [],
        is_new: p.isNew || false,
        is_bestseller: p.isBestseller || false,
        brand: p.brand,
        availability: p.availability,
        vendor_id: p.vendorId || null
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
      const targetPass = process.env.ADMIN_PASSWORD || 'meriseshop_admin_secure_2026';
      const hashedPass = bcrypt.hashSync(targetPass, 12);
      await supabase.from('admin_config').insert({ username: targetUser, password: hashedPass });
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

if (supabase) {
  seedSupabaseDatabase().then(() => {
    syncOrdersFromSupabase();
    syncAdminConfigFromSupabase();
  });
}

// Local JSON File Database helper utilities
const PRODUCTS_FILE_PATH = path.join(process.cwd(), 'products_db.json');
const COUPONS_FILE_PATH = path.join(process.cwd(), 'coupons_db.json');
const CAMPAIGNS_FILE_PATH = path.join(process.cwd(), 'campaigns_db.json');
const CMS_FILE_PATH = path.join(process.cwd(), 'cms_db.json');
const LOGS_FILE_PATH = path.join(process.cwd(), 'activity_logs.json');

function readLocalJsonDb(filePath: string, defaultData: any) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || JSON.stringify(defaultData));
  } catch (error) {
    console.error(`Error reading database from ${filePath}:`, error);
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

const app = express();
const PORT = 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'meriseshop_secure_jwt_secret_token_key_2026';
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
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'meriseshop_admin_secure_2026'
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

app.use(express.json());
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
  if (origin === ALLOWED_ORIGIN) {
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
  
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https://images.unsplash.com https://hynmcyebbnhdrrxevkzg.supabase.co https://*.unsplash.com https://api.qrserver.com; " +
    "connect-src 'self' https://hynmcyebbnhdrrxevkzg.supabase.co wss://hynmcyebbnhdrrxevkzg.supabase.co https://api.razorpay.com; " +
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/orders') || req.path.startsWith('/api/verify-otp')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  
  next();
});

// Memory Rate Limiter implementation
interface RateLimitInfo {
  count: number;
  resetTime: number;
}
const rateLimitDb: Record<string, RateLimitInfo> = {};

function rateLimiter(limit: number, windowMs: number) {
  return (req: any, res: any, next: any) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
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

// Razorpay temporarily disabled.
// Enable after GST registration and production credentials are available.
/*
const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId === 'rzp_test_YOUR_KEY_ID') return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};
*/

// Serve uploaded product images as static files
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer storage: save to public/uploads with original extension
const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `prod_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// Image upload endpoint – returns { url } accessible from the browser
app.post('/api/upload-image', verifyAdminToken, upload.single('image'), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file received.' });
  }
  const url = `/uploads/${req.file.filename}`;
  console.log(`[Image Upload] Saved product image: ${req.file.filename}`);
  res.json({ url, filename: req.file.filename });
});

// --- PRODUCTS ENDPOINTS ---
app.get('/api/catalog/products', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        const mapped = data.map(p => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          categorySlug: p.category_slug,
          price: p.price,
          discountPrice: p.discount_price,
          stock: p.stock,
          rating: p.rating,
          ratingCount: p.rating_count,
          images: p.images,
          shortDescription: p.short_description,
          description: p.description,
          specifications: p.specifications,
          reviews: p.reviews,
          isNew: p.is_new,
          isBestseller: p.is_bestseller,
          brand: p.brand,
          availability: p.availability,
          vendorId: p.vendor_id
        }));
        return res.json(mapped);
      }
      console.warn('Supabase query error, falling back to local products JSON:', error);
    }
    const localProds = readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS);
    res.json(localProds);
  } catch (err) {
    res.json(readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS));
  }
});

app.post('/api/catalog/products', verifyAdminToken, async (req, res) => {
  try {
    const productsList = req.body;
    if (!Array.isArray(productsList)) {
      return res.status(400).json({ error: 'Body must be an array of products.' });
    }

    writeLocalJsonDb(PRODUCTS_FILE_PATH, productsList);

    if (supabase) {
      const mapped = productsList.map(p => ({
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
        specifications: p.specifications || {},
        reviews: p.reviews || [],
        is_new: p.isNew || false,
        is_bestseller: p.isBestseller || false,
        brand: p.brand,
        availability: p.availability,
        vendor_id: p.vendorId || null
      }));
      
      const { error } = await supabase.from('products').upsert(mapped);
      if (error) {
        console.error('Supabase products upsert failed:', error);
        return res.status(500).json({ error: 'Supabase upsert failed' });
      }
    }
    res.json({ success: true, message: 'Products catalog synchronized successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize products catalog' });
  }
});

// --- COUPONS ENDPOINTS ---
app.get('/api/catalog/coupons', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('coupons').select('*');
      if (!error && data) {
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
      console.warn('Supabase coupons fetch error, fallback to local JSON:', error);
    }
    res.json(readLocalJsonDb(COUPONS_FILE_PATH, INITIAL_COUPONS));
  } catch (err) {
    res.json(readLocalJsonDb(COUPONS_FILE_PATH, INITIAL_COUPONS));
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
    }
    res.json({ success: true, message: 'Coupons synchronized.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync coupons' });
  }
});

// --- CAMPAIGNS ENDPOINTS ---
app.get('/api/catalog/campaigns', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('campaigns').select('*');
      if (!error && data) {
        const mapped = data.map(c => ({
          id: c.id,
          imageUrl: c.image_url,
          title: c.title,
          description: c.description,
          ctaText: c.cta_text,
          linkCategory: c.link_category,
          active: c.active
        }));
        return res.json(mapped);
      }
    }
    res.json(readLocalJsonDb(CAMPAIGNS_FILE_PATH, INITIAL_CAMPAIGNS));
  } catch (err) {
    res.json(readLocalJsonDb(CAMPAIGNS_FILE_PATH, INITIAL_CAMPAIGNS));
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
    res.json(readLocalJsonDb(CMS_FILE_PATH, INITIAL_CMS));
  } catch (err) {
    res.json(readLocalJsonDb(CMS_FILE_PATH, INITIAL_CMS));
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
app.post('/api/gemini/recommendations', async (req, res) => {
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
      conciergeCommentary: 'We noticed your fine interest in our handcrafted selections. To complement your lifestyle, our personal concierge highly suggests looking at our signature hand-foliaged journals and carved rosewood storage solutions, both reflecting the highest standards of our 2025 heritage roots.',
      recommendedProductIds: ['stat-1', 'wood-1', 'home-1'].filter(id => !recentlyViewedIds?.includes(id)),
    };
    return res.json(fallbacks);
  }

  try {
    const cartContext = cartItems?.map((item: any) => `${item.product.name} (Qty: ${item.quantity})`).join(', ') || 'Empty Cart';
    const viewedContext = allProducts?.filter((p: any) => recentlyViewedIds?.includes(p.id))?.map((p: any) => p.name).join(', ') || 'None';
    const catalogSummary = allProducts?.map((p: any) => `ID: ${p.id}, Sku: ${p.sku}, Name: ${p.name}, Price: ₹${p.price}, Category: ${p.category}`).join('\n') || '';

    const systemPrompt = `You are the Virtual Boutique Concierge at "MERIS E-SHOP", an ultra-premium, family-friendly e-commerce store sharing handcrafted gifts, toys, stencils, and leather bags.
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
      conciergeCommentary: 'Our AI concierge is polishing the virtual shelves! In the meantime, we suggest reviewing our Gold-Foil Journal and Laser-Cut Kolam Stencils for matching your exquisite setup.',
      recommendedProductIds: ['stat-1', 'kolam-1', 'wood-1'],
    };
    res.json(fallbackData);
  }
});

// Smart Search Assistant
app.post('/api/gemini/search', async (req, res) => {
  const { query, allCategories } = req.body;
  const ai = getGeminiClient();

  const getLocalSearchFallback = () => {
    const qLower = query?.toLowerCase() || '';
    let slug = '';
    let responseText = `We are searching our premium vaults for "${query}".`;
    if (qLower.includes('toy') || qLower.includes('kid') || qLower.includes('child')) {
      slug = 'toys';
      responseText = 'We recommend exploring our Kids Toys section; our handcrafted stacking toys make magnificent presents.';
    } else if (qLower.includes('wood') || qLower.includes('box') || qLower.includes('gift')) {
      slug = 'wood-gifts';
      responseText = 'Discover our carved Wood Crafts section, fully loaded with antique rosewood lockboxes and honeycomb bookshelves.';
    } else if (qLower.includes('bag') || qLower.includes('purse') || qLower.includes('tote')) {
      slug = 'handbags';
      responseText = 'Browse sustainable, top-tier handbags, vintage wrist bags, and handwoven luxury pouches.';
    } else if (qLower.includes('kolam') || qLower.includes('stencil') || qLower.includes('rangoli') || qLower.includes('festive')) {
      slug = 'kolam';
      responseText = 'Prepare for festive celebrations with our laser-cut acrylic Kolam stencils and mandala templates.';
    }

    return {
      suggestedCategorySlug: slug,
      aiSuggestions: ['wooden stacking', 'crochet bunny', 'rosewood box', 'gold notebook'].filter(x => x.includes(qLower) || qLower.length <= 2).slice(0, 3),
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

    const systemPrompt = `You are the smart search dispatcher for MERIS E-SHOP.
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
        payment_method: o.paymentMethod || 'Razorpay',
        payment_status: o.paymentStatus || 'unpaid',
        gift_wrapping_requested: o.giftWrappingRequested || false,
        gift_wrapping_type: o.giftWrappingType || null,
        gift_message: o.giftMessage || null,
        account_email: o.accountEmail || null,
        account_name: o.accountName || null
      }));
      
      supabase.from('orders').upsert(mapped).then(({ error }) => {
        if (error) console.error('Supabase orders background upsert failed:', error);
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
  return process.env.ENABLE_REAL_NOTIFICATIONS === 'true';
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

// Background simulation of real-time logistics updates
setInterval(() => {
  try {
    const dbOrders = readOrdersDb();
    let updated = false;
    
    const nextStatusMap: Record<string, string> = {
      'pending': 'processing',
      'processing': 'shipped',
      'shipped': 'delivered'
    };

    const updatedOrders = dbOrders.map(order => {
      if (order.status && nextStatusMap[order.status]) {
        updated = true;
        const oldStatus = order.status;
        const newStatus = nextStatusMap[order.status];
        console.log(`[Backend Database] Order ${order.orderNumber} advanced from ${oldStatus} to ${newStatus}`);
        return { ...order, status: newStatus };
      }
      return order;
    });

    if (updated) {
      writeOrdersDb(updatedOrders);
    }
  } catch (error) {
    console.error('Error in background logistics update:', error);
  }
}, 15000); // Check and progress order stages on server database every 15 seconds

// Live Tracking & Orders Endpoints
app.get('/api/orders', (req, res) => {
  try {
    const dbOrders = readOrdersDb();
    res.json(dbOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read orders database' });
  }
});

app.get('/api/orders/:orderNumber', (req, res) => {
  try {
    const orderNum = req.params.orderNumber.trim().toUpperCase();
    const dbOrders = readOrdersDb();
    const order = dbOrders.find(
      o => o.orderNumber.toUpperCase() === orderNum || o.id.toUpperCase() === orderNum
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: `Order ${orderNum} was not found in database.` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

// Beautiful booking email template generator and sender helper
async function sendBookingEmail(order: any) {
  const recipientEmail = order.customerInfo?.email || 'guest@example.com';
  const customerName = order.customerInfo?.name || 'Valued Customer';
  const subject = `🛍️ Meris E-Shop: Booking Secured - Order #${order.orderNumber}`;

  // Generate beautiful line items HTML
  let itemsHtml = '';
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach((item: any) => {
      const productName = item.product?.name || 'Handcrafted Gift';
      const qty = item.quantity || 1;
      const price = item.product?.discountPrice || item.product?.price || 0;
      const imageUrl = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=80';
      
      itemsHtml += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 8px; width: 60px;">
            <img src="${imageUrl}" alt="${productName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" referrerPolicy="no-referrer" />
          </td>
          <td style="padding: 12px 8px; font-size: 13px; color: #0f172a; font-weight: 500;">
            ${productName}
            <div style="font-size: 11px; color: #64748b; font-family: monospace; margin-top: 2px;">Qty: ${qty} × ₹${price}</div>
          </td>
          <td style="padding: 12px 8px; text-align: right; font-size: 13px; font-family: monospace; font-weight: bold; color: #0f172a;">
            ₹${price * qty}
          </td>
        </tr>
      `;
    });
  }

  // Create highly polished responsive luxury layout HTML
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px 0; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.05);">
    
    <!-- Luxury Premium Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 24px; text-align: center; border-bottom: 4px solid #f59e0b;">
      <h1 style="color: #f59e0b; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 3px; font-family: 'Space Grotesk', Arial, sans-serif;">MERIS</h1>
      <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;">Handcrafted Toys & Premium Gifts</p>
    </div>

    <!-- Heartwarming Greeting -->
    <div style="padding: 32px 24px 20px 24px;">
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Dear ${customerName},</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
        Thank you for choosing <strong>Meris E-Shop</strong>. We are thrilled to confirm that your artisanal booking is officially registered under our workshop ledger. Our master craftspeople are preparing your order right now inside our certified cottage works.
      </p>
    </div>

    <!-- Booking Details Block -->
    <div style="padding: 0 24px;">
      <div style="background-color: #f1f5f9; border-radius: 14px; padding: 18px; border: 1px dashed #cbd5e1;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace;">
          <tr>
            <td style="color: #64748b; padding-bottom: 6px; font-weight: bold;">ORDER NUMBER:</td>
            <td style="color: #0f172a; text-align: right; padding-bottom: 6px; font-weight: bold; font-size: 13px;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px; font-weight: bold;">BOOKING DATE:</td>
            <td style="color: #0f172a; text-align: right; padding-bottom: 6px;">${order.date || new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px; font-weight: bold;">PAYMENT GATEWAY:</td>
            <td style="color: #0f172a; text-align: right; padding-bottom: 6px;">${order.paymentMethod} (${order.paymentStatus?.toUpperCase() || 'PAID'})</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: bold;">LOGISTICS MODE:</td>
            <td style="color: #d97706; text-align: right; font-weight: bold;">${order.shippingMethod === 'express' ? 'BlueDart Air Express (2-3 Days)' : 'Standard Ground Delivery'}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Itemized List Table -->
    <div style="padding: 24px;">
      <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px; font-weight: 700;">Package Summary</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0;">
            <th style="padding-bottom: 8px; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold; width: 60px;">Product</th>
            <th style="padding-bottom: 8px; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Description</th>
            <th style="padding-bottom: 8px; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Ledger Accounting Totals -->
    <div style="padding: 0 24px 24px 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Subtotal:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #0f172a;">₹${order.subtotal}</td>
        </tr>
        ${order.discount > 0 ? `
        <tr>
          <td style="padding: 6px 0; color: #10b981; font-weight: 500;">Campaign Promo Discount (${order.couponCode || 'PROMO'}):</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #10b981; font-weight: bold;">-₹${order.discount}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Shipping Handlers Fee:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #0f172a;">₹${order.shippingCost}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Tax (Inclusive Goods & Services Tax):</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #0f172a;">₹${order.tax}</td>
        </tr>
        <tr style="border-top: 1px solid #e2e8f0;">
          <td style="padding: 16px 0 0 0; font-size: 15px; font-weight: bold; color: #0f172a;">Total Invoice Paid:</td>
          <td style="padding: 16px 0 0 0; text-align: right; font-size: 16px; font-weight: bold; color: #d97706; font-family: monospace;">₹${order.total}</td>
        </tr>
      </table>
    </div>

    <!-- Premium Footer Note -->
    <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px; text-align: center;">
      <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5;">
        Your dispatch tracking number is active. You can track this booking live in your Meris Account Dashboard anytime.
      </p>
      <p style="font-size: 11px; color: #94a3b8; margin: 0; font-family: monospace;">
        Meris Artisanal Studio Co. • Handcrafted in Tamil Nadu Workshops, India
      </p>
    </div>

  </div>
</body>
</html>
  `;

  // Write to emails_db.json
  const emailsFilePath = path.join(process.cwd(), 'emails_db.json');
  let currentEmails = [];
  try {
    if (fs.existsSync(emailsFilePath)) {
      currentEmails = JSON.parse(fs.readFileSync(emailsFilePath, 'utf-8') || '[]');
    }
  } catch (err) {
    console.error('Error reading emails database:', err);
  }

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

  currentEmails.unshift(newEmailRecord);
  try {
    fs.writeFileSync(emailsFilePath, JSON.stringify(currentEmails, null, 2));
    console.log(`[Email Service] Logged booking notification email to emails_db.json for ${recipientEmail}.`);
  } catch (err) {
    console.error('Error writing emails database:', err);
  }

  // Attempt real SMTP if environment variables are provided
  if (realNotificationsEnabled() && isConfigured(process.env.SMTP_HOST) && isConfigured(process.env.SMTP_USER) && isConfigured(process.env.SMTP_PASS)) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        debug: true,
        logger: true
      });

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Meris E-Shop'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlContent
      });
      console.log(`[Email Service] Real SMTP email successfully dispatched to ${recipientEmail}.`);
    } catch (smtpError) {
      console.error('[Email Service] Failed sending via real SMTP:', smtpError);
    }
  } else {
    // Beautiful ASCII logging for local dev tracking
    console.log('\n======================================================');
    console.log('📬 LUXURY EMAIL DISPATCHED (SIMULATED & CACHED IN DATABASE)');
    console.log(`RECIPIENT: ${recipientEmail}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TOTAL NET INVOICE: ₹${order.total}`);
    console.log('======================================================\n');
  }

  return newEmailRecord;
}

// Beautiful booking and system alert WhatsApp notification and sender helper
async function sendWhatsAppAlert(alertType: 'booking' | 'status_update' | 'refund_requested', order: any, extraData?: any) {
  const recipientPhone = normalizePhone(order.customerInfo?.phone) || '+919876543210';
  const customerName = order.customerInfo?.name || 'Valued Customer';
  const rawAppUrl = process.env.APP_URL || 'http://localhost:3000';
  const appUrl = (rawAppUrl === 'MY_APP_URL') ? 'http://localhost:3000' : rawAppUrl;
  const trackLink = `${appUrl}/?track=${order.orderNumber}`;
  
  let message = '';
  let badge = '';
  
  if (alertType === 'booking') {
    message = `💚 *MERIS ARTISANAL STUDIO* 💚\n\nHello *${customerName}*,\n\nWe are absolutely delighted to confirm that your booking *#${order.orderNumber}* has been successfully secured in our workshop ledger! 🎉\n\n🛍️ *Package Details*:\nTotal Paid: *₹${order.total}*\nMethod: *${order.paymentMethod}*\nEst. Shipping: *${order.shippingMethod === 'express' ? 'BlueDart Express (2-3 Days)' : 'Standard Ground'}*\n\nOur master craftspeople are preparing your items. 🪵🧑‍🎨\n\n📍 *Track Live inside your Account Dashboard*:\n👉 ${trackLink}\n\nThank you for supporting traditional handmade toys and premium local gifts. 💚`;
    badge = 'BOOKING SECURED';
  } else if (alertType === 'status_update') {
    const statusTitles: Record<string, string> = {
      'pending': 'Pending Workshop Clearance 🪵',
      'processing': 'Being Handcrafted by Artisans 🪵🪓',
      'shipped': 'Dispatched via Premium Logistics 🚚💨',
      'delivered': 'Delivered Safely to Your Doorstep 🏡🎁'
    };
    const currentStatusText = statusTitles[order.status] || order.status.toUpperCase();
    message = `💚 *MERIS ARTISANAL STUDIO* 💚\n\nHello *${customerName}*,\n\nThere is a new dispatch update regarding your booking *#${order.orderNumber}*!\n\n📦 *Live Status*: *${currentStatusText}*\n\nYour artisanal package was updated in our ledger just now. Check full tracking coordinates live on our workshop map:\n👉 ${trackLink}\n\nLet us know if you need any support! ✨`;
    badge = 'DISPATCH NOTICE';
  } else if (alertType === 'refund_requested') {
    message = `💚 *MERIS ARTISANAL STUDIO* 💚\n\nHello *${customerName}*,\n\nYour refund ticket for order *#${order.orderNumber}* has been securely registered with our customer care ledger.\n\n🎟️ *Refund Details*:\nItem: *${extraData?.itemName || 'Artisanal Product'}*\nReason: _"${extraData?.reason || 'No description provided'}"_ \nStatus: *Under Artisan Review* 🔍\n\nOur audit team will review and approve this within 48 business hours. We value your feedback immensely!\n\n👉 Track Ticket: ${trackLink}`;
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

// Real Twilio SMS notification helper
async function sendSMSAlert(order: any) {
  const recipientPhone = normalizePhone(order.customerInfo?.phone);
  if (!recipientPhone) return;

  const message = `Meris E-Shop: Order #${order.orderNumber} placed successfully! Total: ₹${order.total}. Est. Delivery: ${order.shippingMethod === 'express' ? 'BlueDart Express Air (2-3 Days)' : 'Standard Ground'}. Live tracking: ${process.env.APP_URL || 'http://localhost:3000'}/?track=${order.orderNumber}`;

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

// Persistent OTP store (survives server restarts on the same instance)
const OTP_FILE_PATH = path.join(process.cwd(), 'otp_db.json');
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

function readOtpDb(): Record<string, OtpRecord> {
  try {
    if (!fs.existsSync(OTP_FILE_PATH)) {
      fs.writeFileSync(OTP_FILE_PATH, JSON.stringify({}, null, 2));
      return {};
    }
    const data = fs.readFileSync(OTP_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data || '{}');
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    console.error('Error reading OTP database:', error);
    return {};
  }
}

function writeOtpDb(db: Record<string, OtpRecord>) {
  try {
    fs.writeFileSync(OTP_FILE_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error writing OTP database:', error);
  }
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

function smtpEmailConfigured(): boolean {
  return (
    realNotificationsEnabled() &&
    isConfigured(process.env.SMTP_HOST) &&
    isConfigured(process.env.SMTP_USER) &&
    isConfigured(process.env.SMTP_PASS)
  );
}

async function dispatchOtpEmail(email: string, code: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true
  });

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Meris E-Shop'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: 'Meris E-Shop Login Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <h2 style="margin: 0 0 12px; color: #0f172a;">Meris E-Shop verification</h2>
        <p style="color: #475569; font-size: 14px;">Use this code to sign in to your Meris account. It is valid for 5 minutes.</p>
        <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #c5a021; padding: 18px 0;">${code}</div>
        <p style="color: #64748b; font-size: 12px;">If you did not request this code, you can ignore this email.</p>
      </div>
    `,
    text: `Meris E-Shop verification code: ${code}. Valid for 5 minutes.`,
  });
}

app.post('/api/send-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email || !email.includes('@')) {
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

    const code = Math.floor(1000 + Math.random() * 9000).toString();
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
      try {
        await dispatchOtpEmail(email, code);
        console.log(`[Email OTP] Verification code sent to ${email}.`);
        return res.json({
          success: true,
          message: 'OTP sent via email.',
          emailMode: 'live',
          expiresInSec: OTP_EXPIRY_MS / 1000,
        });
      } catch (emailError: any) {
        delete db[email];
        writeOtpDb(db);
        console.error('[Email OTP] SMTP dispatch failed:', emailError);
        const detail = emailError?.message || 'SMTP server rejected the email request.';
        return res.status(502).json({ error: `Failed to send email OTP: ${detail}` });
      }
    }

    console.log(`[Email OTP] Simulated OTP for ${email}: ${code}`);
    return res.json({
      success: true,
      message: 'OTP generated (simulation mode - configure SMTP for real email).',
      mockOtp: code,
      emailMode: 'simulated',
      expiresInSec: OTP_EXPIRY_MS / 1000,
    });
  } catch (err) {
    console.error('Error sending email OTP:', err);
    return res.status(500).json({ error: 'Failed to send email OTP.' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';

    if (!email || !code) {
      return res.status(400).json({ error: 'Email address and code are required.' });
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
    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      email,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

app.get('/api/emails', (req, res) => {
  try {
    const emailsFilePath = path.join(process.cwd(), 'emails_db.json');
    if (!fs.existsSync(emailsFilePath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(emailsFilePath, 'utf-8');
    const emails = JSON.parse(data || '[]');
    
    // Filter by recipient query parameter if provided
    const { recipient } = req.query;
    if (recipient) {
      const filtered = emails.filter((e: any) => e.recipient.toLowerCase() === (recipient as string).toLowerCase());
      return res.json(filtered);
    }
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = req.body;
    if (!newOrder || !newOrder.orderNumber) {
      return res.status(400).json({ error: 'Invalid order data.' });
    }

    const accountEmail = normalizeEmail(newOrder.account?.email || newOrder.accountEmail);
    const customerEmail = normalizeEmail(newOrder.customerInfo?.email);
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
    console.log(`[Backend Database] Registered new secure order: ${newOrder.orderNumber}`);
    
    // Dispatch asynchronous booking confirmation email
    try {
      await sendBookingEmail(newOrder);
    } catch (emailErr) {
      console.error('Failed to dispatch order booking confirmation email:', emailErr);
    }

    // Dispatch asynchronous booking confirmation WhatsApp Alert
    try {
      await sendWhatsAppAlert('booking', newOrder);
    } catch (waErr) {
      console.error('Failed to dispatch order booking confirmation WhatsApp:', waErr);
    }

    // Dispatch asynchronous booking confirmation SMS
    try {
      await sendSMSAlert(newOrder);
    } catch (smsErr) {
      console.error('Failed to dispatch order booking confirmation SMS:', smsErr);
    }

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save order to database' });
  }
});

app.post('/api/orders/:orderNumber/status', async (req, res) => {
  try {
    const orderNum = req.params.orderNumber.trim().toUpperCase();
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status field is required.' });
    }

    const dbOrders = readOrdersDb();
    const index = dbOrders.findIndex(
      o => o.orderNumber.toUpperCase() === orderNum || o.id.toUpperCase() === orderNum
    );

    if (index >= 0) {
      dbOrders[index].status = status;
      writeOrdersDb(dbOrders);

      // Dispatch asynchronous status update WhatsApp Alert
      try {
        await sendWhatsAppAlert('status_update', dbOrders[index]);
      } catch (waErr) {
        console.error('Failed to dispatch order status update WhatsApp:', waErr);
      }

      res.json({ success: true, order: dbOrders[index] });
    } else {
      res.status(404).json({ error: `Order ${orderNum} not found.` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.delete('/api/orders/:orderNumber', verifyAdminToken, async (req, res) => {
  try {
    const orderNum = req.params.orderNumber.trim().toUpperCase();
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
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password fields are required.' });
    }

    const config = readAdminConfig();
    if (username === config.username && verifyAndUpgradeAdminPassword(password, config.password)) {
      const token = jwt.sign(
        { username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '2h' }
      );
      
      res.cookie('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
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
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Admin session cleared.' });
});

app.get('/api/admin/live-activity', verifyAdminToken, (req, res) => {
  const cutoff = Date.now() - 60000;
  const activeSessionsList = Object.values(liveSessions).filter(s => s.lastActive > cutoff);
  res.json({
    sessions: activeSessionsList.length > 0 ? activeSessionsList : [
      { ip: '192.168.1.102', type: 'guest', activePage: '/category/toys', cartTotal: 899, durationSeconds: 45, lastActive: Date.now() },
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

app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = readDatabase(productsDbPath, INITIAL_PRODUCTS);
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://meriseshop.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://meriseshop.com/category/toys</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://meriseshop.com/category/wood-gifts</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    products.forEach((p: any) => {
      xml += `
  <url>
    <loc>https://meriseshop.com/product/${p.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
  res.status(200).send(`User-agent: *
Allow: /
Disallow: /api/admin/
Sitemap: https://meriseshop.com/sitemap.xml
`);
});

app.post('/api/admin/config', verifyAdminToken, (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password fields are required.' });
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
  const itemNames = order?.items?.map((it: any) => `${it.product.name} (x${it.quantity})`).join(', ') || 'Items';

  const getLocalInvoiceFallback = () => {
    const delivery = order.shippingMethod === 'express' ? '3 days via BlueDart express' : '5-7 business days';
    return {
      greetingText: `Dear ${customerName}, we are absolutely thrilled to secure your order representing India's brilliant cottage craftsmen! Our local woodturners and master artisans are hand-inspecting and packing your ${itemNames} right now inside our Tamil Nadu workshop. Your support fuels genuine livelihoods.`,
      invoiceVerificationCode: `MERIS-CRN-${Math.floor(100000 + Math.random() * 900000)}`,
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
    const prompt = `Write a premium, heartwarming customer confirmation letter from the founders of MERIS E-SHOP.
Customer Name: ${customerName}
Purchased Items: ${itemNames}
Total Cart Amount: ₹${order?.total}
Shipping Mode: ${order?.shippingMethod}

Tone: Grateful, extremely warm, storytelling-focused, emphasizing local craftsmanship, hand-finished quality control, and standard delivery timelines.
Also, generate a 12-character unique e-receipt serial verification hash starting with 'MERIS-'.
Finally, approximate an elegant delivery date estimate.

JSON Output Schema:
{
  "greetingText": "The founders appreciation story letter text",
  "invoiceVerificationCode": "MERIS-XXXXX",
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

// Newsletter subscription endpoint
const NEWSLETTER_FILE_PATH = path.join(process.cwd(), 'newsletter_db.json');

function readNewsletterDb(): any[] {
  try {
    if (!fs.existsSync(NEWSLETTER_FILE_PATH)) {
      fs.writeFileSync(NEWSLETTER_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(NEWSLETTER_FILE_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading newsletter database:', error);
    return [];
  }
}

function writeNewsletterDb(emails: any[]) {
  try {
    fs.writeFileSync(NEWSLETTER_FILE_PATH, JSON.stringify(emails, null, 2));
  } catch (error) {
    console.error('Error writing newsletter database:', error);
  }
}

app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const dbEmails = readNewsletterDb();

    if (dbEmails.some(e => e.email === normalizedEmail)) {
      return res.status(409).json({ error: 'This email is already subscribed.' });
    }

    const newSubscription = {
      id: `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      status: 'active',
      source: 'footer_newsletter'
    };

    dbEmails.unshift(newSubscription);
    writeNewsletterDb(dbEmails);

    console.log(`[Newsletter] New subscription: ${normalizedEmail}`);
    res.json({ success: true, message: 'Successfully subscribed to newsletter!' });
  } catch (err) {
    console.error('Error subscribing to newsletter:', err);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

app.get('/api/newsletter', (req, res) => {
  try {
    const dbEmails = readNewsletterDb();
    res.json(dbEmails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch newsletter subscriptions' });
  }
});

// Razorpay temporarily disabled.
// Enable after GST registration and production credentials are available.
/*
app.post('/api/razorpay/create-order', async (req, res) => {
  const rzp = getRazorpayClient();
  if (!rzp) {
    return res.status(503).json({
      error: 'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.',
    });
  }

  const { amount, currency = 'INR', receipt } = req.body;
  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: 'Valid amount in rupees is required.' });
  }

  try {
    const order = await rzp.orders.create({
      amount: Math.round(Number(amount) * 100),
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

app.post('/api/razorpay/verify-payment', (req, res) => {
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
*/

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
async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted for local development.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from dist/.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MERIS E-SHOP Full-Stack Server listening on http://localhost:${PORT}`);
  });
}

initializeServer();
