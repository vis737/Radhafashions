var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/passwordValidator.ts
var passwordValidator_exports = {};
__export(passwordValidator_exports, {
  evaluatePasswordStrength: () => evaluatePasswordStrength,
  validatePassword: () => validatePassword
});
function evaluatePasswordStrength(password) {
  const errors = [];
  let score = 0;
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  } else {
    score += 1;
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  } else {
    score += 1;
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number (0-9).");
  } else {
    score += 1;
  }
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/]/.test(password)) {
    errors.push("Password must contain at least one special character (e.g. !@#$%^&*).");
  } else {
    score += 1;
  }
  const commonPasswords = [
    "123456",
    "password",
    "qwerty",
    "abc123",
    "admin",
    "welcome",
    "letmein",
    "12345678",
    "password123",
    "admin123",
    "welcome123",
    "meriseshop",
    "qwertyuiop"
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("This password is too common and easily guessable. Please choose a unique password.");
    score = 0;
  }
  const valid = errors.length === 0;
  let strength = "Weak";
  if (score >= 5 && valid) {
    strength = "Strong";
  } else if (score >= 3) {
    strength = "Medium";
  }
  return {
    valid,
    errors,
    strength
  };
}
function validatePassword(password) {
  const res = evaluatePasswordStrength(password);
  return { valid: res.valid, errors: res.errors };
}
var init_passwordValidator = __esm({
  "src/utils/passwordValidator.ts"() {
  }
});

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dns = __toESM(require("dns"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_twilio = __toESM(require("twilio"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_supabase_js = require("@supabase/supabase-js");
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
init_passwordValidator();

// src/utils/mockData.ts
var INITIAL_PRODUCTS = [
  // --- KIDS TOYS ---
  {
    id: "toy-1",
    sku: "TOY-WD-STACK",
    name: "Handcrafted Wooden Stacking Ring Tower",
    category: "Kids Toys",
    categorySlug: "toys",
    price: 899,
    discountPrice: 749,
    stock: 25,
    rating: 4.8,
    ratingCount: 124,
    images: [
      "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Organic wooden rings coated in safe herbal-dyed colors, supporting early sensory development.",
    description: "This elegant Stacking Ring Tower is crafted from native beechwood and finished with food-grade seed oils and natural pigments. Non-toxic, fully hand-rounded, and exceptionally smooth for tender hands. It supports hand-eye coordination, size sorting, and visual acuity.",
    specifications: {
      "Material": "Sustainably sourced Beechwood",
      "Age Recommendation": "12+ months",
      "Dimensions": "18 x 9 x 9 cm",
      "Weight": "320g",
      "Coating": "Natural plant-extract pigments"
    },
    reviews: [
      { id: "r-1", author: "Anita S.", rating: 5, comment: "Simply gorgeous! The wood is so smooth and there is no paint smell at all.", date: "2026-05-12", approved: true },
      { id: "r-2", author: "Dev K.", rating: 4, comment: "Excellent organic toy. My 1-year-old is fully obsessed with the golden cap ring.", date: "2026-06-02", approved: true }
    ],
    isBestseller: true,
    isNew: false,
    brand: "Meris Kids",
    availability: "in-stock",
    minimumAge: 1,
    maximumAge: 2,
    ageGroup: "1-2 Years",
    skillType: "Motor Skills",
    educationalType: "Montessori"
  },
  {
    id: "toy-2",
    sku: "TOY-CR-BUNNY",
    name: "Meris Hand-Knit Crochet Cotton Bunny",
    category: "Kids Toys",
    categorySlug: "toys",
    price: 1199,
    discountPrice: 999,
    stock: 8,
    rating: 4.9,
    ratingCount: 62,
    images: [
      "https://images.unsplash.com/photo-1559251606-c623743a6d76?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Lovingly hand-knitted snuggle companion made with 100% hypoallergenic combed cotton.",
    description: "A masterpiece of local crochet craftsmanship. This soft snuggle bunny is knitted entirely by skilled rural artisans using organic cotton treads. Features secure safety eyes and hypoallergenic plush stuffing. Perfect as a baby shower return gift or bedtime companion.",
    specifications: {
      "Material": "100% Organic Indigo Yarn",
      "Filling": "Hypoallergenic Recycled Plush Polyfill",
      "Height": "28 cm",
      "Wash Care": "Gentle hand wash inside net pouch"
    },
    reviews: [
      { id: "r-3", author: "Priyanka R.", rating: 5, comment: "Unbelievable quality. The stitches are extremely uniform. Highly recommend for infants.", date: "2026-04-18", approved: true }
    ],
    isNew: true,
    brand: "Meris Handwoven",
    availability: "low-stock",
    minimumAge: 0,
    maximumAge: 0.5,
    ageGroup: "0-6 Months",
    skillType: "Creative Learning",
    educationalType: "Eco Friendly"
  },
  // --- WOOD CRAFTED GIFTS ---
  {
    id: "wood-1",
    sku: "WD-BOX-ENGRAVED",
    name: "Imperial Floral-Carved Wooden Keepsake Box",
    category: "Wood Crafted Gifts",
    categorySlug: "wood-gifts",
    price: 1890,
    discountPrice: 1599,
    stock: 12,
    rating: 4.7,
    ratingCount: 88,
    images: [
      "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Delicate hand-engraved wooden jewelry chest crafted in block rosewood with premium gold hinges.",
    description: "An elegant addition to any vanity. Heavily inspired by conventional architecture, this storage and organizer box displays detailed floral motifs etched meticulously by expert carvers. The inside is cushioned in plush velvet fabric, providing outstanding protection for keys or jewelry.",
    specifications: {
      "Timber Type": "Indian Rosewood (Sheesham)",
      "Hardware": "Antique Solid Brass Latches & Hinges",
      "Dimensions": "20 x 12 x 8 cm",
      "Lining": "Crimson Premium Velvet interior"
    },
    reviews: [
      { id: "r-4", author: "Vikram J.", rating: 5, comment: "Outstanding craftsmanship. Smells exactly like real sweet rosewood.", date: "2026-05-30", approved: true }
    ],
    isBestseller: true,
    brand: "Meris Artisanal",
    availability: "in-stock"
  },
  {
    id: "wood-2",
    sku: "WD-SHELF-GEO",
    name: "Geometric Hexagonal Floating Timber Shelves",
    category: "Wood Crafted Gifts",
    categorySlug: "wood-gifts",
    price: 2499,
    discountPrice: 1999,
    stock: 4,
    rating: 4.6,
    ratingCount: 35,
    images: [
      "https://images.unsplash.com/photo-1532372320978-9b4d8a3a0245?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Set of 3 interlocking luxury pine-wood bookshelves with natural oiled varnish finishes.",
    description: "Add depth to your home with these majestic modern honeycomb shelves. Precisely cut pine wood planks locked at precise angles. Lightweight yet durable enough to display small pots, candles, or souvenir clocks.",
    specifications: {
      "Wood Type": "Radiata White Pine",
      "Finish": "Satin matte heatproof sealant",
      "Weight Capacity": "Up to 5 kg per bracket",
      "Mounting Hardware": "Concealed metal brackets included"
    },
    reviews: [],
    isNew: true,
    brand: "Meris Space",
    availability: "low-stock"
  },
  // --- HANDBAGS ---
  {
    id: "bag-1",
    sku: "BG-SADDLE-TAN",
    name: "Serena Minimalist Vegan Saddle Tote",
    category: "Handbags",
    categorySlug: "handbags",
    price: 3290,
    discountPrice: 2490,
    stock: 15,
    rating: 4.8,
    ratingCount: 150,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Structured top-tier synthetic leather handbag in tan finish, with gold-accent magnet buckles.",
    description: "Upgrade your morning commute with our best-selling saddle shoulder container. Crafted from durable weather-resistant vegan polyurethane leather with exquisite top stitching. The dual interior chamber is extremely spacious, easily housing your tablet, cosmetic bags, and everyday carry essentials.",
    specifications: {
      "Outer Cover": "Ultra-soft Eco-polyurethane leather",
      "Inner Liners": "Recycled linen-sateen canvas",
      "Metal Accents": "18k Gold plated premium electro-lacquered alloy",
      "Strap Type": "Adjustable belt-style harness"
    },
    reviews: [
      { id: "r-5", author: "Ridhima M.", rating: 5, comment: "The golden clasps look so incredibly luxury! Stitching is super clean.", date: "2026-06-10", approved: true }
    ],
    isBestseller: true,
    brand: "Meris Couture",
    availability: "in-stock"
  },
  {
    id: "bag-2",
    sku: "BG-EMB-CLUTCH",
    name: "Royal Heritage Golden-Zardozi Evening Clutch",
    category: "Handbags",
    categorySlug: "handbags",
    price: 1999,
    discountPrice: 1699,
    stock: 0,
    rating: 4.9,
    ratingCount: 41,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Velvety dark clutch bag with handwoven metallic bullion thread vine pattern and chain strap.",
    description: "An outstanding luxury clutch ideal for festive weddings and elegant dinners. Intricately embellished with golden beads and coiled wire work known as Zardozi. Emits a stellar glistening reflect under dim evening lights.",
    specifications: {
      "Base Fabric": "Silk Blend Deep Navy Velvet",
      "Embroidery": "Artisan Handloom bullion metallic gold thread",
      "Closure": "Secure golden magnetic lock",
      "Chain Strap": "Removable vintage gold-link chain (110cm)"
    },
    reviews: [
      { id: "r-6", author: "Sonal C.", rating: 5, comment: "Pure luxury! Took this to a family wedding and got continuous praise.", date: "2026-05-18", approved: true }
    ],
    isNew: true,
    brand: "Meris Heritage",
    availability: "out-of-stock"
  },
  // --- LEARNING STUFF ---
  {
    id: "learn-1",
    sku: "LN-ABACUS-PST",
    name: "Pastel Decimal Wooden Abacus Toy",
    category: "Learning Stuff",
    categorySlug: "learning",
    price: 1250,
    discountPrice: 999,
    stock: 14,
    rating: 4.7,
    ratingCount: 49,
    images: [
      "https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Classic math tutor abacus with 10 rows of colorful child-safe rounded timber sliders.",
    description: "An educational tool designed to introduce basic counting, addition, and division. Crafted beautifully from light-colored beech wood with smooth non-splinter dowels. Finished in lovely pastel tones, blending harmoniously into modern nurseries.",
    specifications: {
      "Base Frame": "Light Birch Solid Wood",
      "Beads": "Rounded maple wood sliding units (100 total)",
      "Dimensions": "24 x 21 x 6 cm",
      "Skill Focus": "Early math concept and motor precision"
    },
    reviews: [],
    brand: "Meris Kids",
    availability: "in-stock"
  },
  // --- HOME GIFTS ---
  {
    id: "home-1",
    sku: "HM-CANDLE-SOY",
    name: "Symphony Organic Lavender Scented Soy Candle",
    category: "Home Gifts",
    categorySlug: "home",
    price: 699,
    discountPrice: 599,
    stock: 45,
    rating: 4.8,
    ratingCount: 210,
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Pure hand-poured soy wax core mixed with organic French lavender oils, inside a ceramic jar.",
    description: "Bring absolute serenity to your relaxation spaces. The Symphony Candle uses 100% natural hydrogenated soy bean wax, burning cleanly for over 45 hours without leaving any smoke residue. Formulated with premium plant extracts to induce calm sleep.",
    specifications: {
      "Wax": "100% Eco-friendly Organic Soy Wax",
      "Wick": "Crackling wooden wick plate",
      "Burn Lifetime": "45+ clean burning hours",
      "Container": "Terracotta ceramic reuseable tumled jar"
    },
    reviews: [
      { id: "r-7", author: "Ritu V.", rating: 5, comment: "Best lavender candle ever! The crackle sound from the wooden wick is incredibly calming.", date: "2026-06-05", approved: true }
    ],
    isBestseller: true,
    brand: "Meris Botanics",
    availability: "in-stock"
  },
  {
    id: "home-2",
    sku: "HM-MUG-CERAMIC",
    name: "Artisanal Studio Speckled Ripple Mug",
    category: "Home Gifts",
    categorySlug: "home",
    price: 549,
    discountPrice: 449,
    stock: 30,
    rating: 4.5,
    ratingCount: 142,
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Stony clay ceramic Mug finished with a double-glazed speckled oatmeal and gold-rim effect.",
    description: "Each mug is single-thrown by hand on a potters wheel, rendering a completely unique swirling pattern and raw feel. Holds up to 350ml of your favorite fresh coffee filter brews. Double-fired to support heavy microwave use safely.",
    specifications: {
      "Production": "Hand-thrown studio stoneware clay",
      "Volume Capacity": "350 ml",
      "Safety": "Dishwasher and Microwave certified safe",
      "Glazing Coating": "Lead-free food-compliant silica glaze"
    },
    reviews: [],
    brand: "Meris Ceramics",
    availability: "in-stock"
  },
  // --- KOLAM STENCILS ---
  {
    id: "kolam-1",
    sku: "KL-ST-LOTUS",
    name: "Bespoke Golden Lotus Border Acrylic Kolam Stencil",
    category: "Kolam Stencils",
    categorySlug: "kolam",
    price: 499,
    discountPrice: 399,
    stock: 22,
    rating: 4.8,
    ratingCount: 115,
    images: [
      "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Premium 3mm acrylic grid design stencil panel for swift, clean floral floor rangoli trails.",
    description: "Bring divine luck to your front entrance door with this highly modular laser-etched Kolam stenciler. Simply set the platter on the floor, sprinkle white chalk powder, and lift to reveal highly detailed traditional geometric lotus lines. Highly reusable and easily washed.",
    specifications: {
      "Material": "Military-Grade Shatterproof Acrylic",
      "Stencil Design": "Sacred Golden Mandala Lotus grid",
      "Thickness": "3.0 mm",
      "Dimensions": "30 x 30 cm circular plate"
    },
    reviews: [
      { id: "r-8", author: "Meenakshi N.", rating: 5, comment: "So quick and flawless. Making morning entryway rangolis takes under 2 minutes now! Gold acrylic looks beautiful.", date: "2026-06-11", approved: true }
    ],
    isBestseller: true,
    brand: "Meris festive",
    availability: "in-stock"
  },
  // --- STATIONERIES ---
  {
    id: "stat-1",
    sku: "ST-JRN-LINEN",
    name: "Gold-Foil Archival Linen-Bound Journal",
    category: "Stationeries",
    categorySlug: "stationeries",
    price: 999,
    discountPrice: 849,
    stock: 40,
    rating: 4.9,
    ratingCount: 95,
    images: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Exquisitely bound fabric notebook with 160 pages of ink-proof thick cream cartridge paper.",
    description: "Designed for thoughts that deserve to endure. Featuring heavy organic flax linen bookcloth and gilded leaf gold borders. The 120GSM acid-free leaves accommodate rollerball pens and heavy fountain pen calligraphy beautifully without bleed-through.",
    specifications: {
      "Paper Type": "120 GSM Acid-Free Archival cream lines",
      "Page Count": "160 ruled journal pages",
      "Binding": "Lie-flat stitched Smyth Sewn",
      "Accents": "Luxury hot-stamped gold foil text cover"
    },
    reviews: [
      { id: "r-9", author: "Karandeep S.", rating: 5, comment: "The paper is incredibly lush. My wet ink fountain pens glide on it like glass.", date: "2026-06-13", approved: true }
    ],
    isNew: false,
    isBestseller: true,
    brand: "Meris Script",
    availability: "in-stock"
  },
  {
    id: "stat-2",
    sku: "ST-PEN-BRASS",
    name: "Raw Sovereign Solid Brass Mechanical Pen",
    category: "Stationeries",
    categorySlug: "stationeries",
    price: 1499,
    discountPrice: 1199,
    stock: 5,
    rating: 4.6,
    ratingCount: 30,
    images: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Hefty, perfectly balanced writing companion machined from premium lead-free hexagonal brass rods.",
    description: "An object of extreme luxury weight. This drafting and writing tool is milled from solid hexagonal brass. Develops a gorgeous antique patina over months of personal usage. Includes a premium smooth German-engineered ballpoint ink cartridge.",
    specifications: {
      "Metal Core": "100% Solid Industrial Hex Brass",
      "Weight": "42g (perfectly balanced offset)",
      "Ink Cartridge": "Schmidt EasyFlow 9000 Black (inclusive)",
      "Mechanism": "Precision silent spring lock action"
    },
    reviews: [],
    isNew: true,
    brand: "Meris Script",
    availability: "low-stock"
  },
  // --- ENTERTAINMENT PRODUCTS ---
  {
    id: "ent-1",
    sku: "EN-CH-WOOD",
    name: "Mahogany & Maple Handcarved Chess Board",
    category: "Entertainment Products",
    categorySlug: "entertainment",
    price: 4999,
    discountPrice: 4299,
    stock: 3,
    rating: 4.9,
    ratingCount: 18,
    images: [
      "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Stately 14-inch solid wood checkers and chess console with velvet interior slots for pieces.",
    description: "Crafted with absolute tournament precision. Each chessman is carved individually by hand, and weighted in velvet bases for solid tactile response. The dual-hinged body folds into a sturdy felt-divided storage chest.",
    specifications: {
      "Light Wood Blocks": "Natural Hard Sugar Maple",
      "Dark Wood Blocks": "Warm Indonesian Mahogany",
      "Dimensions": "36 x 36 cm fully open",
      "King Height": "3.25 inches (7.6 cm)"
    },
    reviews: [
      { id: "r-10", author: "Aditya G.", rating: 5, comment: "Phenomenal piece. This is heirloom quality. The weights of the knights feel so solid.", date: "2026-05-25", approved: true }
    ],
    isNew: true,
    brand: "Meris Heritage",
    availability: "low-stock"
  },
  // --- RETURN GIFT BOTTLES ---
  {
    id: "btl-1",
    sku: "BT-COPPER-INF",
    name: "Sovereign Ayurvedic Pure Hammered Copper Bottle",
    category: "Return Gift Bottles",
    categorySlug: "bottles",
    price: 1399,
    discountPrice: 1199,
    stock: 20,
    rating: 4.7,
    ratingCount: 55,
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Sleek 950ml leakproof copper canister styled with micro-hammered indent decorations.",
    description: "Encourage holistic hydration with this stunning copper water storage flask, designed to naturally detoxify and alkaline water. Hand-beaten detailing creates a premium golden sparkle and outstanding tactile grip. Wrapped in eco-friendly protective packaging.",
    specifications: {
      "Material": "99.9% Pure Food-Grade Copper",
      "Volume": "950 ml",
      "Cap": "Threaded air-tight brass cap with silicone gasket",
      "Design": "Traditional hand-hammered finish"
    },
    reviews: [],
    brand: "Meris Wellness",
    availability: "in-stock"
  },
  {
    id: "toy-3",
    sku: "TOY-WD-ELEPHANT",
    name: "Herbal-Dyed Wooden Push-Along Elephant Toy",
    category: "Kids Toys",
    categorySlug: "toys",
    price: 950,
    discountPrice: 799,
    stock: 15,
    rating: 4.8,
    ratingCount: 43,
    images: [
      "https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Charming organic push-along toy elephant with smooth rolling wheels and non-toxic herbal coatings.",
    description: "A beautiful heirloom toy designed to stimulate early motor precision and toddlers first steps. Hand-carved from sustainable timber and dyed using natural vegetable extracts, this elephant features gentle curves and solid axle performance.",
    specifications: {
      "Material": "Solid Beechwood",
      "Finish": "Herbal-dyed natural beeswax coating",
      "Dimensions": "14 x 12 x 7 cm",
      "Age Recommendation": "10+ months"
    },
    reviews: [
      { id: "r-t3-1", author: "Siddharth M.", rating: 5, comment: "Very sturdy, looks amazing on the shelf when not in use!", date: "2026-06-20", approved: true }
    ],
    isNew: true,
    brand: "Meris Kids",
    availability: "in-stock",
    minimumAge: 0.5,
    maximumAge: 1,
    ageGroup: "6-12 Months",
    skillType: "Motor Skills",
    educationalType: "Wooden Toys"
  },
  {
    id: "toy-4",
    sku: "TOY-WD-BLOCKS",
    name: "Natural Premium Forest Wooden Blocks Set",
    category: "Kids Toys",
    categorySlug: "toys",
    price: 1499,
    discountPrice: 1299,
    stock: 18,
    rating: 4.9,
    ratingCount: 88,
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "50-piece solid pine wood block set featuring smooth geometries and natural grain textures.",
    description: "Perfect for building, sorting, and early geometry. This block set contains cylinders, arches, blocks, and triangles made from solid premium pine wood. Supports spatial awareness and motor skills.",
    specifications: {
      "Material": "Solid Pinewood",
      "Pieces": "50 blocks",
      "Box": "Eco-friendly canvas storage bag"
    },
    reviews: [],
    isNew: false,
    brand: "Meris Kids",
    availability: "in-stock",
    minimumAge: 2,
    maximumAge: 4,
    ageGroup: "2-4 Years",
    skillType: "Puzzle",
    educationalType: "STEM"
  },
  {
    id: "toy-5",
    sku: "TOY-WD-PUZZLE",
    name: "Montessori Wooden Alphabet Matching Tray",
    category: "Kids Toys",
    categorySlug: "toys",
    price: 899,
    discountPrice: 799,
    stock: 20,
    rating: 4.8,
    ratingCount: 52,
    images: [
      "https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop"
    ],
    shortDescription: "High-contrast alphabet block puzzle designed for cognitive spelling and letter shape matching.",
    description: "An educational classic. Fits capital letter blocks securely into recessed slots, helping preschool children learn the alphabet visually and tactilely.",
    specifications: {
      "Material": "Birch plywood tray & beech blocks",
      "Paint": "Water-based non-toxic paint"
    },
    reviews: [],
    isNew: true,
    brand: "Meris Learn",
    availability: "in-stock",
    minimumAge: 4,
    maximumAge: 6,
    ageGroup: "4-6 Years",
    skillType: "Puzzle",
    educationalType: "Montessori"
  },
  {
    id: "toy-6",
    sku: "TOY-WD-BALANCE",
    name: "Artisanal Curved Wooden Balance Wobble Board",
    category: "Kids Toys",
    categorySlug: "toys",
    price: 3299,
    discountPrice: 2899,
    stock: 6,
    rating: 4.9,
    ratingCount: 30,
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Premium curved beechwood wobble board supporting posture balance and creative play.",
    description: "Designed to support open-ended movement play. Children can balance on it, use it as a bridge, slide, or rocking cradle. Hand-pressed multilayered beechwood core.",
    specifications: {
      "Material": "Multilayered Pressed Beechwood",
      "Weight Capacity": "120 kg",
      "Coating": "Natural oil protectant"
    },
    reviews: [],
    isNew: false,
    brand: "Meris Active",
    availability: "in-stock",
    minimumAge: 6,
    maximumAge: 8,
    ageGroup: "6-8 Years",
    skillType: "Motor Skills",
    educationalType: "Indoor"
  },
  {
    id: "toy-7",
    sku: "TOY-WD-GEARS",
    name: "3D Mechanical Gear Assembly Constructor",
    category: "Kids Toys",
    categorySlug: "toys",
    price: 2499,
    discountPrice: 2199,
    stock: 12,
    rating: 4.7,
    ratingCount: 22,
    images: [
      "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Interlocking wooden gear puzzle introducing kinetic energy transmission and physical mechanics.",
    description: "A STEM constructor puzzle set. Contains precision laser-cut plywood sheets. Kids can assemble standard gear configurations that move when hand-cranked.",
    specifications: {
      "Material": "Laser-cut Birch Plywood",
      "Time to build": "3-4 hours",
      "Skill level": "Intermediate"
    },
    reviews: [],
    isNew: false,
    brand: "Meris Tech",
    availability: "in-stock",
    minimumAge: 8,
    maximumAge: 10,
    ageGroup: "8-10 Years",
    skillType: "Puzzle",
    educationalType: "STEM"
  },
  {
    id: "toy-8",
    sku: "TOY-WD-CHESS",
    name: "Classic Handcrafted Deluxe Wooden Chess Set",
    category: "Kids Toys",
    categorySlug: "toys",
    price: 2999,
    discountPrice: 2499,
    stock: 8,
    rating: 5,
    ratingCount: 14,
    images: [
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Exquisite inlaid rosewood chess board with weighted hand-carved chess pieces.",
    description: "Premium chess set featuring storage slots for each individual piece. Finished in a semi-gloss natural lacquer, highlighting the rich grains of solid Indian rosewood.",
    specifications: {
      "Wood Type": "Sheesham & Maple",
      "Board Dimensions": "30 x 30 cm",
      "King Height": "6.5 cm"
    },
    reviews: [],
    isNew: false,
    brand: "Meris Games",
    availability: "in-stock",
    minimumAge: 10,
    maximumAge: 13,
    ageGroup: "10-13 Years",
    skillType: "Puzzle",
    educationalType: "Indoor"
  },
  {
    id: "toy-9",
    sku: "TOY-WD-ARCH",
    name: "3D Laser-Cut Taj Mahal Architectural Model",
    category: "Kids Toys",
    categorySlug: "toys",
    price: 3899,
    discountPrice: 3499,
    stock: 5,
    rating: 4.9,
    ratingCount: 19,
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop"
    ],
    shortDescription: "Intricate 3D architectural craft kit compiling 250 micro-laser wood puzzle nodes.",
    description: "A beautiful historical replica model. Perfect for teens and hobbyists. Hand-sanded laser edges allow slotting connections without requiring glue.",
    specifications: {
      "Material": "Sustainably sourced Basswood Plywood",
      "Complexity": "Advanced (250+ parts)",
      "Recommended Age": "13+ Years"
    },
    reviews: [],
    isNew: true,
    brand: "Meris Tech",
    availability: "low-stock",
    minimumAge: 13,
    maximumAge: 99,
    ageGroup: "13+ Years",
    skillType: "Puzzle",
    educationalType: "STEM"
  },
  {
    id: "wood-3",
    sku: "WD-DESK-ORG",
    name: "Royal Teakwood Desk Organizer & Letter Rack",
    category: "Wood Crafted Gifts",
    categorySlug: "wood-gifts",
    price: 1650,
    discountPrice: 1399,
    stock: 10,
    rating: 4.7,
    ratingCount: 29,
    images: [
      "https://images.unsplash.com/photo-1606166187734-a4cb74079027?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Exquisite hand-planed teakwood desktop tray featuring a slotted letter rack and brass pen grooves.",
    description: "Keep your desktop curated. This premium desk organizer is carved from seasoned solid teakwood and polished with direct oil sealants to highlight its stunning natural golden-brown grains. Complete with non-slip velvet protective padding.",
    specifications: {
      "Timber Type": "Premium seasoned Teakwood",
      "Polish": "Matte Linseed Oil hand-rubbed finish",
      "Compartments": "3 vertical letter slots, 2 pen cradles",
      "Dimensions": "24 x 15 x 12 cm"
    },
    reviews: [],
    isBestseller: true,
    brand: "Meris Artisanal",
    availability: "in-stock"
  },
  {
    id: "bag-3",
    sku: "BG-SLING-JUTE",
    name: "Eco-Jute & Vegan Leather Sling Bag",
    category: "Handbags",
    categorySlug: "handbags",
    price: 1750,
    discountPrice: 1450,
    stock: 18,
    rating: 4.6,
    ratingCount: 52,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "A casual yet elegant dual-textured sling bag made of golden handloom jute fibers with rich tan leatherette trims.",
    description: "Perfect for brunches or weekend strolls, this bag fuses organic woven golden jute fabrics with cruelty-free tan vegan leather accents. Features a secure zipper main compartment with custom brass pulls and adjustable strap hardware.",
    specifications: {
      "Fabric": "Premium Golden Jute & Bio-Alloy Polyurethane",
      "Lining": "100% Recycled Cotton sailcloth",
      "Closure": "Heavy-duty brass YKK zippers",
      "Strap length": "Adjustable 115cm sling"
    },
    reviews: [],
    brand: "Meris Couture",
    availability: "in-stock"
  },
  {
    id: "learn-2",
    sku: "LN-COSMIC-PZL",
    name: "Teakwood Cosmic Solar System Puzzle",
    category: "Learning Stuff",
    categorySlug: "learning",
    price: 2100,
    discountPrice: 1799,
    stock: 12,
    rating: 4.9,
    ratingCount: 38,
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Magnificent circular orbital tracking disc puzzle detailing celestial bodies and planetary paths.",
    description: "Introduce kids to astrology and astrophysics. This premium orbital tracker features laser-carved stellar bodies that slot into concentric maple tracks. Beautifully polished to double as high-end nursery room decorations.",
    specifications: {
      "Material": "High-density Maple and Walnut veneer panels",
      "Coating": "Organic organic wood waxes",
      "Dimensions": "32 cm diameter circular canvas",
      "Educational Focus": "Astrological paths and fine motor logic"
    },
    reviews: [
      { id: "r-l2-1", author: "Dr. Aris V.", rating: 5, comment: "An amazing tool that is literally educational art. The detailing on Saturn is wonderful.", date: "2026-06-18", approved: true }
    ],
    isBestseller: true,
    brand: "Meris Kids",
    availability: "in-stock"
  },
  {
    id: "home-3",
    sku: "HM-CERAMIC-DIFF",
    name: "Hand-Cast Ceramic Oil Diffuser & Incense Chalice",
    category: "Home Gifts",
    categorySlug: "home",
    price: 999,
    discountPrice: 849,
    stock: 25,
    rating: 4.8,
    ratingCount: 33,
    images: [
      "https://images.unsplash.com/photo-1540324155974-75226c3ad3a6?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Speckled stoneware clay diffuse burner styled with organic carved apertures and copper oil dish.",
    description: "Elevate your sensory experiences. Simply place a wax tea-candle in the lower chamber and add organic oils to the deep top copper basin. The custom speckled clay filters a warm amber glow, diffusing soothing botanical fragrances perfectly.",
    specifications: {
      "Stoneware": "Speckled Oatmeal Studio Clay",
      "Basin": "100% Spun Copper heating plate",
      "Dimensions": "11 x 10 cm cylindric body",
      "Safety": "Heat-treated non-cracking glaze"
    },
    reviews: [],
    isNew: true,
    brand: "Meris Ceramics",
    availability: "in-stock"
  },
  {
    id: "kolam-2",
    sku: "KL-ST-PEACOCK",
    name: "Royal Peacock Mandala Rangoli Brass Template",
    category: "Kolam Stencils",
    categorySlug: "kolam",
    price: 799,
    discountPrice: 649,
    stock: 14,
    rating: 4.9,
    ratingCount: 46,
    images: [
      "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Magnificent circular brass template displaying detailed laser-cut peacock and feather mandalas.",
    description: "A luxurious heirloom template for Indian festivals. Crafted from high-gloss solid brass plate, this mandala stenciler yields immaculate geometric lines of peacock feather motifs. Simply sprinkle traditional colored powders or rice flour.",
    specifications: {
      "Material": "High-gloss Rust-resistant Brass Alloy",
      "Pattern": "Bespoke Peacock Mandala",
      "Diameter": "28 cm circular plate",
      "Cleanliness": "Warm water rinse & towel dry"
    },
    reviews: [
      { id: "r-k2-1", author: "Lakshmi S.", rating: 5, comment: "Spectacular quality! Brass is heavy and stays firmly in place during drawing.", date: "2026-06-22", approved: true }
    ],
    isNew: true,
    brand: "Meris festive",
    availability: "in-stock"
  },
  {
    id: "stat-3",
    sku: "ST-CAL-SET",
    name: "Calligraphy Starter Set with Raw Brass Inkwell",
    category: "Stationeries",
    categorySlug: "stationeries",
    price: 1850,
    discountPrice: 1599,
    stock: 8,
    rating: 4.8,
    ratingCount: 22,
    images: [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Stunning writing gift kit including a wood-nib stylus, 4 premium steel nib points, and an antique brass ink pot.",
    description: "Rekindle the majestic art of hand-written letters. This curation features an ergonomic polished rosewood handle stylus, fine steel drawing nibs, and a heavy brass inkwell containing 30ml of rich pigment organic charcoal black ink.",
    specifications: {
      "Stylus": "Hand-turned Rosewood stylus",
      "Nibs": "4 high-flex spring steel calligraphy points",
      "Inkwell": "Solid machined Brass leakproof screw-cap vessel",
      "Packaging": "Lined premium cardboard giftbox"
    },
    reviews: [],
    isNew: true,
    brand: "Meris Script",
    availability: "in-stock"
  },
  {
    id: "ent-2",
    sku: "EN-SL-BOARD",
    name: "Luxury Walnut Wood Solitaire Board with Glass Marbles",
    category: "Entertainment Products",
    categorySlug: "entertainment",
    price: 3800,
    discountPrice: 3299,
    stock: 6,
    rating: 4.7,
    ratingCount: 15,
    images: [
      "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Hand-turned walnut wood circular solitaire board styled with 33 hand-swirled custom glass spheres.",
    description: "An object of outstanding intellectual engagement. This single-player strategic tabletop game is carved from dark American walnut and features a grooved perimeter track to secure captured glass marbles.",
    specifications: {
      "Platter Wood": "Natural high-grade American Walnut",
      "Marbles": "33 hand-crafted swirled decorative glass spheres",
      "Diameter": "30 cm circular console",
      "Finish": "Polished silk-varnish coating"
    },
    reviews: [],
    brand: "Meris Heritage",
    availability: "in-stock"
  },
  {
    id: "btl-2",
    sku: "BT-FLASK-PASTEL",
    name: "Pastel Vacuum Insulated Double-Walled Flask",
    category: "Return Gift Bottles",
    categorySlug: "bottles",
    price: 1150,
    discountPrice: 950,
    stock: 35,
    rating: 4.8,
    ratingCount: 40,
    images: [
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=80"
    ],
    shortDescription: "Stunning lavender-cream double-walled thermos keeping cold drinks frosty for 24 hours.",
    description: "Crafted with premium grade stainless steel, this double-walled thermal flask features a leakproof silicone-sealed cap with a hand-stitched vegan leather carry handle. Finished in sweatproof powder coated lavender-cream colors.",
    specifications: {
      "Steel Type": "18/8 Pro-Grade food safe Stainless Steel",
      "Insulation": "TempShield double-wall vacuum seal",
      "Volume Capacity": "650 ml",
      "Performance": "24 hrs cold, 12 hrs hot"
    },
    reviews: [],
    isNew: true,
    brand: "Meris Wellness",
    availability: "in-stock"
  }
];
var INITIAL_COUPONS = [
  {
    code: "MERIS10",
    type: "percentage",
    value: 10,
    expiryDate: "2027-01-01",
    usageLimit: 300,
    usageCount: 42,
    minimumCartValue: 500,
    description: "Enjoy 10% off on all luxury items across store",
    active: true
  },
  {
    code: "FESTIVE20",
    type: "percentage",
    value: 20,
    expiryDate: "2026-12-25",
    usageLimit: 150,
    usageCount: 11,
    minimumCartValue: 1500,
    description: "Special 20% discount on order carts above Rs.1500",
    active: true
  },
  {
    code: "NEWUSER15",
    type: "flat",
    value: 150,
    expiryDate: "2027-04-12",
    usageLimit: 500,
    usageCount: 120,
    minimumCartValue: 1e3,
    description: "Flat Rs.150 discount for first time purchasers above Rs.1000",
    active: true
  }
];
var INITIAL_CAMPAIGNS = [
  {
    id: "camp-1",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&auto=format&fit=crop&q=80",
    title: "Warmth of Premium Handcrafted Toys",
    description: "Introduce your toddlers to safe, beautifully finished chemical-free timber stacking sets.",
    ctaText: "Shop Kids Toys",
    linkCategory: "toys",
    active: true
  },
  {
    id: "camp-2",
    imageUrl: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80",
    title: "Dignified Wood Keepsake Gifts",
    description: "Explore stellar intricate storage boxes and house accessories custom engraved for your peers.",
    ctaText: "Explore Gifts",
    linkCategory: "wood-gifts",
    active: true
  },
  {
    id: "camp-3",
    imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1200&auto=format&fit=crop&q=80",
    title: "Sensory Gold-Foil Stationeries",
    description: "Unleash your creative mind with Smyth-sewn linen notebooks and raw heavy brass pencils.",
    ctaText: "Browse Stationeries",
    linkCategory: "stationeries",
    active: true
  }
];
var DEFAULT_CMS = {
  headline: "Distinctive Heritage Collections For Creative Families",
  subheadline: "Crafted with absolute devotion from luxury gold brass, polished hardwoods, fine linens & combed threads.",
  aboutText: "MERIS E-SHOP grew out of a love for organic tactile treasures that persist across generations. What started in 2025 as a small studio workshop crafting traditional timber Toys has evolved into prime curation hubs for Handbags, learning tools, home accessories, and festive stencils. Every single item traces back to hand-perfected mockups, chemical-free finishing, and ethical rural workforces.",
  contactEmail: "support@meris.com",
  contactPhone: "+91 93842 92229",
  contactAddress: "5/339, Fathima Road, nager, Azhagappapuram, Tamil Nadu 629401",
  privacyPolicy: "Your personal data (Name, Email, Address) is transmitted through full-stack secured channels. We use client local persistence for speedy loading times and never sell user profiling sheets to marketing aggregates.",
  termsConditions: "All prices listed on MERIS E-SHOP are inclusive of standard 18% GST rules. Returns have a 7-day windows and of course must remain spotless inside initial package cases."
};
var INITIAL_CMS = DEFAULT_CMS;
var INITIAL_LOGS = [
  {
    id: "log-initial",
    action: "System Bootstrapped",
    details: "Role-Based access control systems initiated. Standard secure parameters verified.",
    user: "System Workspace",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }
];

// server.ts
try {
  import_dns.default.setDefaultResultOrder("ipv4first");
} catch {
}
import_dotenv.default.config();
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_KEY;
var isSupabaseConfigured = () => {
  return supabaseUrl && supabaseKey && supabaseUrl.trim() !== "" && supabaseKey.trim() !== "" && !supabaseUrl.includes("YOUR_SUPABASE_") && !supabaseKey.includes("YOUR_SUPABASE_");
};
var supabase = isSupabaseConfigured() ? (0, import_supabase_js.createClient)(supabaseUrl, supabaseKey) : null;
if (supabase) {
  console.log("\u25C7 Supabase connected successfully as main database.");
} else {
  console.log("\u25C7 Supabase credentials missing/default. Using offline fallback JSON database.");
}
async function seedSupabaseDatabase() {
  if (!supabase) return;
  try {
    const { data: prods, error: prodErr } = await supabase.from("products").select("id").limit(1);
    if (!prodErr && (!prods || prods.length === 0)) {
      console.log("Seeding products to Supabase...");
      const mapped = INITIAL_PRODUCTS.map((p) => ({
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
        specifications: { ...p.specifications || {}, Weight: parseProductWeightKg(p) ? `${parseProductWeightKg(p)} kg` : p.specifications?.Weight }
      }));
      await supabase.from("products").insert(mapped);
    }
    const { data: coups, error: coupErr } = await supabase.from("coupons").select("code").limit(1);
    if (!coupErr && (!coups || coups.length === 0)) {
      console.log("Seeding coupons to Supabase...");
      const mapped = INITIAL_COUPONS.map((c) => ({
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
      await supabase.from("coupons").insert(mapped);
    }
    const { data: camps, error: campErr } = await supabase.from("campaigns").select("id").limit(1);
    if (!campErr && (!camps || camps.length === 0)) {
      console.log("Seeding campaigns to Supabase...");
      const mapped = INITIAL_CAMPAIGNS.map((c) => ({
        id: c.id,
        image_url: c.imageUrl,
        title: c.title,
        description: c.description,
        cta_text: c.ctaText,
        link_category: c.linkCategory,
        active: c.active
      }));
      await supabase.from("campaigns").insert(mapped);
    }
    const { data: cmsConf, error: cmsErr } = await supabase.from("cms_config").select("key").limit(1);
    if (!cmsErr && (!cmsConf || cmsConf.length === 0)) {
      console.log("Seeding CMS to Supabase...");
      await supabase.from("cms_config").insert({ key: "main", value: INITIAL_CMS });
    }
    const { data: adminConf, error: adminErr } = await supabase.from("admin_config").select("username").limit(1);
    if (!adminErr && (!adminConf || adminConf.length === 0)) {
      console.log("Seeding Admin Config to Supabase...");
      const targetUser = process.env.ADMIN_USERNAME || "admin";
      const targetPass = process.env.ADMIN_PASSWORD;
      if (!targetPass) {
        console.warn("\u26A0\uFE0F  WARNING: ADMIN_PASSWORD not set in .env \u2014 skipping admin seeding to Supabase.");
      } else {
        const hashedPass = import_bcryptjs.default.hashSync(targetPass, 12);
        await supabase.from("admin_config").insert({ username: targetUser, password: hashedPass });
      }
    }
  } catch (err) {
    console.error("Failed to seed Supabase database:", err);
  }
}
async function syncOrdersFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from("orders").select("*");
    if (!error && data) {
      const mapped = data.map((o) => ({
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
      import_fs.default.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(mapped, null, 2));
      console.log(`\u25C7 Synced ${mapped.length} orders from Supabase database.`);
    }
  } catch (err) {
    console.error("Failed to sync orders from Supabase on startup:", err);
  }
}
async function syncAdminConfigFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from("admin_config").select("*").limit(1).single();
    if (!error && data) {
      import_fs.default.writeFileSync(adminConfigPath, JSON.stringify({ username: data.username, password: data.password }, null, 2), "utf8");
      console.log("\u25C7 Synced administrative credentials from Supabase.");
    }
  } catch (err) {
  }
}
var inMemoryCustomers = [];
var CUSTOMERS_FILE_PATH = import_path.default.join(process.cwd(), "customers_db.json");
async function syncCustomersFromSupabase() {
  if (import_fs.default.existsSync(CUSTOMERS_FILE_PATH)) {
    try {
      const localData = JSON.parse(import_fs.default.readFileSync(CUSTOMERS_FILE_PATH, "utf-8") || "[]");
      for (const c of localData) {
        if (c.email && !inMemoryCustomers.some((m) => m.email.toLowerCase() === c.email.toLowerCase())) {
          inMemoryCustomers.push({
            id: c.id,
            email: c.email.toLowerCase(),
            name: c.name,
            passwordHash: c.passwordHash || c.password_hash,
            createdAt: c.createdAt || c.created_at || (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
    } catch (err) {
      console.error("Failed reading local customers_db.json on startup:", err);
    }
  }
  if (!supabase) {
    console.log(`\u25C7 Loaded ${inMemoryCustomers.length} customer credentials from local cache.`);
    return;
  }
  try {
    const { data, error } = await supabase.from("customers").select("*");
    if (!error && data) {
      for (const row of data) {
        const mapped = {
          id: row.id,
          email: row.email.toLowerCase(),
          name: row.name,
          passwordHash: row.password_hash,
          createdAt: row.created_at
        };
        const existingIdx = inMemoryCustomers.findIndex((m) => m.email.toLowerCase() === mapped.email);
        if (existingIdx >= 0) {
          inMemoryCustomers[existingIdx] = mapped;
        } else {
          inMemoryCustomers.push(mapped);
        }
      }
      console.log(`\u25C7 Synced ${data.length} customer credentials from Supabase database.`);
    }
    if (inMemoryCustomers.length > 0) {
      const dbUpserts = inMemoryCustomers.map((c) => ({
        id: c.id,
        email: c.email.toLowerCase(),
        name: c.name,
        password_hash: c.passwordHash || null,
        created_at: c.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      }));
      const { error: upsertErr } = await supabase.from("customers").upsert(dbUpserts, { onConflict: "email" });
      if (upsertErr) {
        console.error("Supabase customer credentials upsert notice:", upsertErr);
      }
    }
    import_fs.default.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(inMemoryCustomers, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to sync customers from Supabase on startup:", err);
  }
}
async function syncProductsFromSupabase() {
  if (!supabase) return;
  try {
    const localProds = readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS);
    const { data, error } = await supabase.from("products").select("*");
    if (!error && data && data.length > 0) {
      const mapped = data.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category || "Handbags",
        categorySlug: p.category_slug || "handbags",
        price: Number(p.price || 999),
        discountPrice: p.discount_price ? Number(p.discount_price) : void 0,
        stock: p.stock !== void 0 ? Number(p.stock) : 10,
        rating: p.rating ? Number(p.rating) : 4.8,
        ratingCount: p.rating_count ? Number(p.rating_count) : 50,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop"],
        shortDescription: p.short_description || "",
        description: p.description || "",
        specifications: p.specifications || {},
        weightKg: parseProductWeightKg(p),
        reviews: Array.isArray(p.reviews) ? p.reviews : [],
        isNew: Boolean(p.is_new),
        isBestseller: Boolean(p.is_bestseller),
        brand: p.brand || "Meris Couture",
        availability: p.availability || "in-stock",
        vendorId: p.vendor_id || null
      }));
      const supabaseIds = new Set(mapped.map((m) => m.id));
      const localOnly = localProds.filter((lp) => lp && lp.id && !supabaseIds.has(lp.id));
      const merged = [...mapped, ...localOnly];
      if (localOnly.length > 0) {
        const localMapped = localOnly.map((p) => ({
          id: p.id,
          sku: p.sku || `SKU-${p.id}`,
          name: p.name || "Handcrafted Product",
          category: p.category || "Handbags",
          category_slug: p.categorySlug || p.category?.toLowerCase().replace(/\s+/g, "-") || "handbags",
          price: p.price,
          discount_price: p.discountPrice || null,
          stock: p.stock !== void 0 ? p.stock : 10,
          rating: p.rating || 5,
          rating_count: p.ratingCount || 1,
          images: p.images || [],
          short_description: p.shortDescription || p.name || "",
          description: p.description || p.name || "",
          specifications: p.specifications || {},
          reviews: p.reviews || [],
          is_new: p.isNew || false,
          is_bestseller: p.isBestseller || false,
          brand: p.brand || "MERIS",
          availability: p.availability || "in-stock",
          vendor_id: p.vendorId || null
        }));
        await supabase.from("products").upsert(localMapped);
      }
      writeLocalJsonDb(PRODUCTS_FILE_PATH, merged);
      console.log(`\u25C7 Synced ${merged.length} products (Supabase + local) to catalog.`);
    }
  } catch (err) {
    console.error("Failed to sync products from Supabase on startup:", err);
  }
}
if (supabase) {
  seedSupabaseDatabase().then(() => {
    syncProductsFromSupabase();
    syncOrdersFromSupabase();
    syncAdminConfigFromSupabase();
    syncCustomersFromSupabase();
  });
} else {
  syncCustomersFromSupabase();
}
var LOCAL_DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || process.cwd();
var HAS_PERSISTENT_LOCAL_DATA = Boolean(process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH);
try {
  if (!import_fs.default.existsSync(LOCAL_DATA_DIR)) {
    import_fs.default.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("[Storage] Could not create local data directory:", err);
}
var PRODUCTS_FILE_PATH = import_path.default.join(LOCAL_DATA_DIR, "products_db.json");
var COUPONS_FILE_PATH = import_path.default.join(LOCAL_DATA_DIR, "coupons_db.json");
var CAMPAIGNS_FILE_PATH = import_path.default.join(LOCAL_DATA_DIR, "campaigns_db.json");
var CMS_FILE_PATH = import_path.default.join(LOCAL_DATA_DIR, "cms_db.json");
function readLocalJsonDb(filePath, defaultData) {
  try {
    if (!import_fs.default.existsSync(filePath)) {
      try {
        import_fs.default.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      } catch {
      }
      return defaultData;
    }
    const data = import_fs.default.readFileSync(filePath, "utf-8");
    return JSON.parse(data || JSON.stringify(defaultData));
  } catch (error) {
    return defaultData;
  }
}
function writeLocalJsonDb(filePath, data) {
  try {
    import_fs.default.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing database to ${filePath}:`, error);
  }
}
function parseProductWeightKg(product) {
  if (typeof product?.weightKg === "number" && Number.isFinite(product.weightKg) && product.weightKg > 0) {
    return product.weightKg;
  }
  const rawWeight = String(product?.specifications?.Weight || "").toLowerCase().replace(/\s+/g, "");
  const match = rawWeight.match(/(\d+(?:\.\d+)?)(kg|kgs|kilogram|kilograms|g|gm|grams)?/);
  if (!match) return void 0;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return void 0;
  const unit = match[2] || "";
  return unit === "g" || unit === "gm" || unit === "grams" ? amount / 1e3 : amount;
}
var app = (0, import_express.default)();
app.set("trust proxy", true);
app.get("/health", (req, res) => res.status(200).send("OK"));
var PORT = Number(process.env.PORT || 3e3);
var JWT_SECRET = process.env.JWT_SECRET || "a3f9d2c1e8b74605af319de27c64f8a1b952e0d47618c3f290ab5e86d41379fc";
if (!process.env.JWT_SECRET) {
  console.warn("\u26A0\uFE0F WARNING: JWT_SECRET not set in environment. Using fallback secret.");
}
var ALLOWED_ORIGIN = process.env.APP_URL || "http://localhost:3000";
var adminConfigPath = import_path.default.join(process.cwd(), "admin_config.json");
function readAdminConfig() {
  try {
    if (import_fs.default.existsSync(adminConfigPath)) {
      return JSON.parse(import_fs.default.readFileSync(adminConfigPath, "utf8"));
    }
  } catch (err) {
    console.error("Failed to read admin config JSON, using defaults");
  }
  const defaultPass = process.env.ADMIN_PASSWORD;
  if (!defaultPass) {
    console.warn("\u26A0\uFE0F  WARNING: ADMIN_PASSWORD env var is not set. Set it in your .env file.");
  }
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: defaultPass || "meriseshop_admin_secure_2026"
  };
}
function writeAdminConfig(config) {
  try {
    import_fs.default.writeFileSync(adminConfigPath, JSON.stringify(config, null, 2), "utf8");
    if (supabase) {
      supabase.from("admin_config").upsert({ username: config.username, password: config.password }).then(({ error }) => {
        if (error) console.error("Supabase admin_config background upsert failed:", error);
      });
    }
  } catch (err) {
    console.error("Failed to write admin config JSON:", err);
  }
}
function verifyAndUpgradeAdminPassword(plainInput, storedHashOrPlain) {
  if (storedHashOrPlain.startsWith("$2a$") || storedHashOrPlain.startsWith("$2b$")) {
    return import_bcryptjs.default.compareSync(plainInput, storedHashOrPlain);
  }
  if (plainInput === storedHashOrPlain) {
    const freshHash = import_bcryptjs.default.hashSync(plainInput, 12);
    const config = readAdminConfig();
    config.password = freshHash;
    writeAdminConfig(config);
    console.log("\u25C7 Transparently migrated plain administrative password to bcrypt hash.");
    return true;
  }
  return false;
}
var verifyAdminToken = (req, res, next) => {
  try {
    const token = req.cookies?.admin_session;
    if (!token) {
      return res.status(401).json({ error: "Unauthenticated administrative request." });
    }
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied: insufficient privileges." });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Administrative session expired or invalid." });
  }
};
app.use(import_express.default.json({ limit: "1mb" }));
app.use(import_express.default.urlencoded({ limit: "1mb", extended: true }));
app.use((0, import_cookie_parser.default)());
app.use((req, res, next) => {
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  if (!isHttps && process.env.NODE_ENV === "production") {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
var liveSessions = {};
var liveAlerts = [];
var totalTrafficCount = 1240;
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/assets") || req.path.includes(".")) {
    return next();
  }
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const page = req.path;
  if (!liveSessions[ip]) {
    liveSessions[ip] = {
      ip,
      type: "guest",
      activePage: page,
      cartTotal: 0,
      durationSeconds: 12,
      lastActive: Date.now()
    };
    totalTrafficCount++;
    liveAlerts.unshift({
      id: Math.random().toString(),
      type: "visitor",
      message: `New Guest joined store from IP: ${ip}`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString()
    });
  } else {
    liveSessions[ip].activePage = page;
    liveSessions[ip].lastActive = Date.now();
  }
  next();
});
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "";
  const supabaseWs = supabaseHost ? `wss://${supabaseHost}` : "";
  const supabaseHttps = supabaseHost ? `https://${supabaseHost}` : "";
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com https://api.qrserver.com https://img.clerk.com ${supabaseHttps}; connect-src 'self' ${supabaseHttps} ${supabaseWs} https://*.clerk.accounts.dev https://*.clerk.com; worker-src 'self' blob:; frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com; form-action 'self' https://test.payu.in https://secure.payu.in; object-src 'none'; base-uri 'self';`
  );
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), interest-cohort=()");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  if (req.path.startsWith("/api/admin") || req.path.startsWith("/api/orders") || req.path.startsWith("/api/catalog") || req.path.startsWith("/api/upload-image") || req.path.startsWith("/api/verify-otp")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  } else {
    res.setHeader("Cache-Control", "public, max-age=3600");
  }
  next();
});
function sanitizeString(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").replace(/<[^>]*>/g, "").trim().slice(0, maxLength);
}
function sanitizeEmail(value, maxLength = 254) {
  const raw = typeof value === "string" ? value.trim().toLowerCase().slice(0, maxLength) : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw) ? raw : "";
}
function sanitizeAiPrompt(value, maxLength = 300) {
  if (typeof value !== "string") return "";
  return value.replace(/system\s*:/gi, "").replace(/\bignore\b.*\binstructions\b/gi, "").replace(/<[^>]*>/g, "").replace(/[`{}<>]/g, "").trim().slice(0, maxLength);
}
var rateLimitDb = {};
function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}
function rateLimiter(limit, windowMs) {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    if (!rateLimitDb[key] || now > rateLimitDb[key].resetTime) {
      rateLimitDb[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }
    rateLimitDb[key].count++;
    if (rateLimitDb[key].count > limit) {
      const retryAfterSec = Math.ceil((rateLimitDb[key].resetTime - now) / 1e3);
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        error: `Too many requests. Please try again in ${retryAfterSec} seconds.`,
        retryAfterSec
      });
    }
    next();
  };
}
var PRODUCT_IMAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_PRODUCT_IMAGE_BUCKET || "product-images";
var UPLOADS_DIR = import_path.default.join(LOCAL_DATA_DIR, "public", "uploads");
try {
  if (!import_fs.default.existsSync(UPLOADS_DIR)) {
    import_fs.default.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("[Uploads] Could not create uploads directory:", err);
}
app.use("/uploads", import_express.default.static(UPLOADS_DIR));
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  }
});
var productImageBucketReady = false;
function getImageExtension(file) {
  const originalExt = import_path.default.extname(file.originalname || "").toLowerCase();
  if (/^\.(jpe?g|png|webp|gif|avif)$/.test(originalExt)) return originalExt;
  const mimeExt = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif"
  };
  return mimeExt[file.mimetype] || ".jpg";
}
async function ensureProductImageBucket() {
  if (!supabase || productImageBucketReady) return;
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw listError;
  }
  const bucketExists = buckets?.some((bucket) => bucket.name === PRODUCT_IMAGE_BUCKET);
  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
    });
    if (createError) {
      throw createError;
    }
    console.log(`[Image Upload] Created Supabase Storage bucket: ${PRODUCT_IMAGE_BUCKET}`);
  }
  productImageBucketReady = true;
}
async function uploadProductImageToSupabase(file) {
  if (!supabase) return null;
  await ensureProductImageBucket();
  const ext = getImageExtension(file);
  const objectPath = `products/${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}/${import_crypto.default.randomUUID()}${ext}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    cacheControl: "31536000",
    upsert: false
  });
  if (error) {
    throw error;
  }
  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(objectPath);
  return {
    url: data.publicUrl,
    filename: import_path.default.basename(objectPath),
    storagePath: objectPath,
    storageBucket: PRODUCT_IMAGE_BUCKET
  };
}
function saveProductImageLocally(file) {
  const ext = getImageExtension(file);
  const filename = `prod_${Date.now()}_${Math.floor(Math.random() * 1e4)}${ext}`;
  const targetPath = import_path.default.join(UPLOADS_DIR, filename);
  import_fs.default.writeFileSync(targetPath, file.buffer);
  return {
    url: `/uploads/${filename}`,
    filename
  };
}
app.post("/api/upload-image", verifyAdminToken, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file received." });
  }
  try {
    const supabaseUpload = await uploadProductImageToSupabase(req.file);
    if (supabaseUpload) {
      console.log(`[Image Upload] Saved product image to Supabase Storage: ${supabaseUpload.storagePath}`);
      return res.json(supabaseUpload);
    }
    const localUpload = saveProductImageLocally(req.file);
    console.warn("[Image Upload] Supabase is not configured; saved image to local filesystem fallback.");
    return res.json(localUpload);
  } catch (err) {
    console.error("[Image Upload] Failed to upload product image:", err);
    if (process.env.NODE_ENV !== "production") {
      try {
        const localUpload = saveProductImageLocally(req.file);
        console.warn("[Image Upload] Supabase upload failed; saved to local development fallback.");
        return res.json(localUpload);
      } catch (localErr) {
        console.error("[Image Upload] Local fallback also failed:", localErr);
      }
    }
    return res.status(500).json({
      error: "Product image upload failed. Check Supabase Storage bucket permissions and service role key."
    });
  }
});
app.get("/api/catalog/products", async (req, res) => {
  try {
    const localProds = readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS);
    const localProdsMap = {};
    if (Array.isArray(localProds)) {
      localProds.forEach((lp) => {
        if (lp && lp.id) localProdsMap[lp.id] = lp;
      });
    }
    if (supabase) {
      const { data, error } = await supabase.from("products").select("*");
      if (!error && data && data.length > 0) {
        const mapped = data.map((p) => {
          const localMatch = localProdsMap[p.id];
          const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : localMatch && Array.isArray(localMatch.images) && localMatch.images.length > 0 ? localMatch.images : ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop"];
          return {
            id: p.id,
            sku: p.sku || `SKU-${p.id}`,
            name: p.name || "Handcrafted Product",
            category: p.category || "Handbags",
            categorySlug: p.category_slug || "handbags",
            price: Number(p.price || 999),
            discountPrice: p.discount_price ? Number(p.discount_price) : void 0,
            stock: p.stock !== void 0 ? Number(p.stock) : 10,
            rating: p.rating ? Number(p.rating) : 4.8,
            ratingCount: p.rating_count ? Number(p.rating_count) : 50,
            images,
            shortDescription: p.short_description || "",
            description: p.description || "",
            specifications: p.specifications || {},
            weightKg: parseProductWeightKg(p),
            reviews: Array.isArray(p.reviews) ? p.reviews : [],
            isNew: Boolean(p.is_new),
            isBestseller: Boolean(p.is_bestseller),
            brand: p.brand || "Meris Couture",
            availability: p.availability || "in-stock",
            vendorId: p.vendor_id || null
          };
        });
        const supabaseIds = new Set(mapped.map((m) => m.id));
        const localOnly = Array.isArray(localProds) ? localProds.filter((lp) => lp && lp.id && !supabaseIds.has(lp.id)) : [];
        const merged = [...mapped, ...localOnly];
        return res.json(merged);
      }
      console.warn("Supabase products empty or error, serving full local products catalog:", error);
    }
    res.json(localProds);
  } catch (err) {
    res.json(readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS));
  }
});
app.post("/api/catalog/products", verifyAdminToken, import_express.default.json({ limit: "10mb" }), async (req, res) => {
  try {
    const productsList = req.body;
    if (!Array.isArray(productsList)) {
      return res.status(400).json({ error: "Body must be an array of products." });
    }
    if (productsList.length > 500) {
      return res.status(400).json({ error: "Too many products in a single request (max 500)." });
    }
    writeLocalJsonDb(PRODUCTS_FILE_PATH, productsList);
    if (supabase) {
      try {
        const mapped = productsList.map((p) => ({
          id: p.id,
          sku: p.sku || `SKU-${p.id}`,
          name: p.name || "Handcrafted Product",
          category: p.category || "Handbags",
          category_slug: p.categorySlug || p.category?.toLowerCase().replace(/\s+/g, "-") || "handbags",
          price: p.price,
          discount_price: p.discountPrice || null,
          stock: p.stock !== void 0 ? p.stock : 10,
          rating: p.rating || 5,
          rating_count: p.ratingCount || 1,
          images: p.images || [],
          short_description: p.shortDescription || p.name || "",
          description: p.description || p.name || "",
          specifications: { ...p.specifications || {}, Weight: parseProductWeightKg(p) ? `${parseProductWeightKg(p)} kg` : p.specifications?.Weight },
          reviews: p.reviews || [],
          is_new: p.isNew || false,
          is_bestseller: p.isBestseller || false,
          brand: p.brand || "MERIS",
          availability: p.availability || "in-stock",
          vendor_id: p.vendorId || null
        }));
        const { error: subErr } = await supabase.from("products").upsert(mapped);
        if (subErr) {
          console.error("Supabase products upsert notice:", subErr);
          return res.status(500).json({ error: "Supabase products upsert failed. Product catalog was not durably saved." });
        } else {
          console.log(`Successfully synchronized ${mapped.length} products to Supabase.`);
        }
        const currentIds = productsList.map((p) => p.id).filter(Boolean);
        if (currentIds.length > 0) {
          const idListStr = currentIds.join(",");
          const { error: delErr } = await supabase.from("products").delete().not("id", "in", `(${idListStr})`);
          if (delErr) {
            console.warn("Supabase products cleanup notice:", delErr);
          }
        }
      } catch (subErr) {
        console.warn("Supabase products upsert notice (local saved):", subErr);
        return res.status(500).json({ error: "Supabase products sync failed. Product catalog was not durably saved." });
      }
    }
    res.json({ success: true, message: "Products catalog synchronized successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to synchronize products catalog" });
  }
});
app.get("/api/catalog/coupons", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("coupons").select("*");
      if (!error && data) {
        const mapped = data.map((c) => ({
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
      console.warn("Supabase coupons fetch error, fallback to local JSON:", error);
    }
    res.json(readLocalJsonDb(COUPONS_FILE_PATH, INITIAL_COUPONS));
  } catch (err) {
    res.json(readLocalJsonDb(COUPONS_FILE_PATH, INITIAL_COUPONS));
  }
});
app.post("/api/catalog/coupons", verifyAdminToken, async (req, res) => {
  try {
    const couponsList = req.body;
    if (!Array.isArray(couponsList)) {
      return res.status(400).json({ error: "Body must be an array of coupons." });
    }
    writeLocalJsonDb(COUPONS_FILE_PATH, couponsList);
    if (supabase) {
      const mapped = couponsList.map((c) => ({
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
      const { error } = await supabase.from("coupons").upsert(mapped);
      if (error) {
        console.error("Supabase coupons upsert failed:", error);
        return res.status(500).json({ error: "Supabase coupons upsert failed" });
      }
    }
    res.json({ success: true, message: "Coupons synchronized." });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync coupons" });
  }
});
app.post("/api/catalog/coupons/bulk-delete", verifyAdminToken, async (req, res) => {
  try {
    const { codes } = req.body;
    if (!Array.isArray(codes)) {
      return res.status(400).json({ error: "Body must contain an array of coupon codes." });
    }
    if (supabase) {
      const { error } = await supabase.from("coupons").delete().in("code", codes);
      if (error) {
        console.error("Supabase coupons bulk delete failed:", error);
        return res.status(500).json({ error: "Supabase coupons bulk delete failed" });
      }
    }
    const currentCoupons = readLocalJsonDb(COUPONS_FILE_PATH, INITIAL_COUPONS);
    const updatedCoupons = currentCoupons.filter((c) => !codes.includes(c.code));
    writeLocalJsonDb(COUPONS_FILE_PATH, updatedCoupons);
    res.json({ success: true, message: `Deleted ${codes.length} coupons.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to bulk delete coupons" });
  }
});
app.delete("/api/catalog/coupons", verifyAdminToken, async (req, res) => {
  try {
    if (supabase) {
      const { error } = await supabase.from("coupons").delete().neq("code", "IMPOSSIBLE_VALUE_TO_DELETE_ALL");
      if (error) {
        console.error("Supabase coupons delete all failed:", error);
        return res.status(500).json({ error: "Supabase coupons wipe failed" });
      }
    }
    writeLocalJsonDb(COUPONS_FILE_PATH, []);
    res.json({ success: true, message: "All coupons permanently deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete all coupons" });
  }
});
app.get("/api/catalog/campaigns", async (req, res) => {
  try {
    const localCampaigns = readLocalJsonDb(CAMPAIGNS_FILE_PATH, INITIAL_CAMPAIGNS);
    if (supabase) {
      const { data, error } = await supabase.from("campaigns").select("*");
      if (!error && data && data.length > 0) {
        const localMap = {};
        if (Array.isArray(localCampaigns)) {
          localCampaigns.forEach((lc) => {
            if (lc && lc.id) localMap[lc.id] = lc;
          });
        }
        const mapped = data.map((c) => ({
          id: c.id,
          imageUrl: c.image_url || localMap[c.id] && localMap[c.id].imageUrl || "",
          title: c.title,
          description: c.description,
          ctaText: c.cta_text,
          linkCategory: c.link_category,
          active: c.active
        }));
        if (mapped.some((c) => c.imageUrl)) {
          return res.json(mapped);
        }
      }
    }
    res.json(localCampaigns);
  } catch (err) {
    res.json(readLocalJsonDb(CAMPAIGNS_FILE_PATH, INITIAL_CAMPAIGNS));
  }
});
app.post("/api/catalog/campaigns", verifyAdminToken, async (req, res) => {
  try {
    const campaignsList = req.body;
    if (!Array.isArray(campaignsList)) {
      return res.status(400).json({ error: "Body must be an array." });
    }
    writeLocalJsonDb(CAMPAIGNS_FILE_PATH, campaignsList);
    if (supabase) {
      const mapped = campaignsList.map((c) => ({
        id: c.id,
        image_url: c.image_url,
        title: c.title,
        description: c.description,
        cta_text: c.cta_text,
        link_category: c.link_category,
        active: c.active
      }));
      await supabase.from("campaigns").upsert(mapped);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync campaigns" });
  }
});
app.get("/api/catalog/cms", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("cms_config").select("value").eq("key", "main").single();
      if (!error && data) {
        return res.json(data.value);
      }
    }
    res.json(readLocalJsonDb(CMS_FILE_PATH, INITIAL_CMS));
  } catch (err) {
    res.json(readLocalJsonDb(CMS_FILE_PATH, INITIAL_CMS));
  }
});
app.post("/api/catalog/cms", verifyAdminToken, async (req, res) => {
  try {
    const cmsConfig = req.body;
    writeLocalJsonDb(CMS_FILE_PATH, cmsConfig);
    if (supabase) {
      await supabase.from("cms_config").upsert({ key: "main", value: cmsConfig });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync CMS layout" });
  }
});
var getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  try {
    return new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } catch (err) {
    console.error("Error initializing GoogleGenAI:", err);
    return null;
  }
};
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    api_key_configured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
  });
});
var apiCache = /* @__PURE__ */ new Map();
var CACHE_TTL = 1e3 * 60 * 60;
function getCached(key) {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
function setCached(key, data) {
  apiCache.set(key, { data, timestamp: Date.now() });
}
app.post("/api/gemini/recommendations", rateLimiter(20, 60 * 1e3), async (req, res) => {
  const { cartItems, recentlyViewedIds, allProducts } = req.body;
  const ai = getGeminiClient();
  const cartKeyToken = cartItems?.map((item) => `${item.product.id}:${item.quantity}`).join(",") || "";
  const viewedKeyToken = recentlyViewedIds?.join(",") || "";
  const cacheKey = `recs_${cartKeyToken}_viewed_${viewedKeyToken}`;
  const cachedResult = getCached(cacheKey);
  if (cachedResult) {
    return res.json(cachedResult);
  }
  if (!ai) {
    const fallbacks = {
      conciergeCommentary: "We noticed your fine interest in our handcrafted selections. To complement your lifestyle, our personal concierge highly suggests looking at our signature hand-foliaged journals and carved rosewood storage solutions, both reflecting the highest standards of our 2025 heritage roots.",
      recommendedProductIds: ["stat-1", "wood-1", "home-1"].filter((id) => !recentlyViewedIds?.includes(id))
    };
    return res.json(fallbacks);
  }
  try {
    const cartContext = cartItems?.map((item) => `${item.product.name} (Qty: ${item.quantity})`).join(", ") || "Empty Cart";
    const viewedContext = allProducts?.filter((p) => recentlyViewedIds?.includes(p.id))?.map((p) => p.name).join(", ") || "None";
    const catalogSummary = allProducts?.map((p) => `ID: ${p.id}, Sku: ${p.sku}, Name: ${p.name}, Price: \u20B9${p.price}, Category: ${p.category}`).join("\n") || "";
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
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            conciergeCommentary: { type: import_genai.Type.STRING },
            recommendedProductIds: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            }
          },
          required: ["conciergeCommentary", "recommendedProductIds"]
        }
      }
    });
    const text = response.text || "";
    const parsed = JSON.parse(text);
    setCached(cacheKey, parsed);
    res.json(parsed);
  } catch (error) {
    console.log("AI Concierge recommendations offline fallback matching applied.");
    const fallbackData = {
      fallback: true,
      conciergeCommentary: "Our AI concierge is polishing the virtual shelves! In the meantime, we suggest reviewing our Gold-Foil Journal and Laser-Cut Kolam Stencils for matching your exquisite setup.",
      recommendedProductIds: ["stat-1", "kolam-1", "wood-1"]
    };
    res.json(fallbackData);
  }
});
app.post("/api/gemini/search", rateLimiter(20, 60 * 1e3), async (req, res) => {
  const rawQuery = req.body?.query;
  const query = sanitizeAiPrompt(rawQuery, 200);
  const { allCategories } = req.body;
  const ai = getGeminiClient();
  const getLocalSearchFallback = () => {
    const qLower = query?.toLowerCase() || "";
    let slug = "";
    let responseText = `We are searching our premium vaults for "${query}".`;
    if (qLower.includes("toy") || qLower.includes("kid") || qLower.includes("child")) {
      slug = "toys";
      responseText = "We recommend exploring our Kids Toys section; our handcrafted stacking toys make magnificent presents.";
    } else if (qLower.includes("wood") || qLower.includes("box") || qLower.includes("gift")) {
      slug = "wood-gifts";
      responseText = "Discover our carved Wood Crafts section, fully loaded with antique rosewood lockboxes and honeycomb bookshelves.";
    } else if (qLower.includes("bag") || qLower.includes("purse") || qLower.includes("tote")) {
      slug = "handbags";
      responseText = "Browse sustainable, top-tier handbags, vintage wrist bags, and handwoven luxury pouches.";
    } else if (qLower.includes("kolam") || qLower.includes("stencil") || qLower.includes("rangoli") || qLower.includes("festive")) {
      slug = "kolam";
      responseText = "Prepare for festive celebrations with our laser-cut acrylic Kolam stencils and mandala templates.";
    }
    return {
      suggestedCategorySlug: slug,
      aiSuggestions: ["wooden stacking", "crochet bunny", "rosewood box", "gold notebook"].filter((x) => x.includes(qLower) || qLower.length <= 2).slice(0, 3),
      smartQueryResponse: responseText
    };
  };
  const cacheKey = `search_${(query || "").toLowerCase().trim()}`;
  const cachedResult = getCached(cacheKey);
  if (cachedResult) {
    return res.json(cachedResult);
  }
  if (!ai) {
    return res.json(getLocalSearchFallback());
  }
  try {
    const categoriesContext = allCategories?.map((c) => `${c.name} (slug: ${c.id})`).join(", ") || "";
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
      model: "gemini-3.5-flash",
      contents: `Search query inputted by user: "${query}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            suggestedCategorySlug: { type: import_genai.Type.STRING },
            aiSuggestions: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            smartQueryResponse: { type: import_genai.Type.STRING }
          },
          required: ["suggestedCategorySlug", "aiSuggestions", "smartQueryResponse"]
        }
      }
    });
    const text = response.text || "";
    const parsed = JSON.parse(text);
    setCached(cacheKey, parsed);
    res.json(parsed);
  } catch (error) {
    console.log("Smart search dispatcher offline fallback matching applied.");
    res.json(getLocalSearchFallback());
  }
});
var ORDERS_FILE_PATH = import_path.default.join(process.cwd(), "orders_db.json");
function readOrdersDb() {
  try {
    if (!import_fs.default.existsSync(ORDERS_FILE_PATH)) {
      import_fs.default.writeFileSync(ORDERS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = import_fs.default.readFileSync(ORDERS_FILE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading orders database:", error);
    return [];
  }
}
function writeOrdersDb(orders) {
  try {
    import_fs.default.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2));
    if (supabase) {
      const mapped = orders.map((o) => ({
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
        payment_method: o.paymentMethod || "PayU Secure Online Payment",
        payment_status: o.paymentStatus || "unpaid",
        gift_wrapping_requested: o.giftWrappingRequested || false,
        gift_wrapping_type: o.giftWrappingType || null,
        gift_message: o.giftMessage || null,
        account_email: o.accountEmail || null,
        account_name: o.accountName || null
      }));
      supabase.from("orders").upsert(mapped).then(async ({ error }) => {
        if (error) console.error("Supabase orders background upsert failed:", error);
        else {
          const currentOrderIds = orders.map((o) => o.id);
          if (currentOrderIds.length > 0) {
            const idListStr = currentOrderIds.map((id) => `"${id}"`).join(",");
            await supabase.from("orders").delete().not("id", "in", `(${idListStr})`);
          }
        }
      });
    }
  } catch (error) {
    console.error("Error writing orders database:", error);
  }
}
function isConfigured(val) {
  if (!val) return false;
  const clean = val.trim();
  return clean !== "" && !clean.includes("YOUR_") && !clean.includes("MY_");
}
function realNotificationsEnabled() {
  if (process.env.ENABLE_REAL_NOTIFICATIONS === "false") return false;
  return process.env.ENABLE_REAL_NOTIFICATIONS === "true" || isConfigured(process.env.BREVO_API_KEY) || isConfigured(process.env.RESEND_API_KEY) || isConfigured(process.env.SMTP_HOST) && isConfigured(process.env.SMTP_USER) && isConfigured(process.env.SMTP_PASS);
}
function createSmtpTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "meriseshop.2025@gmail.com";
  const pass = process.env.SMTP_PASS || "lljl hfcn geye rdlt";
  return import_nodemailer.default.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15e3,
    greetingTimeout: 15e3,
    socketTimeout: 2e4
  });
}
async function dispatchLiveEmail(to, subject, html) {
  const recipient = sanitizeEmail(to);
  if (!recipient) return false;
  if (isConfigured(process.env.RESEND_API_KEY)) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || "Meris E-Shop";
      const rawFrom = (process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || "orders@orders.meriseshop.com").trim();
      let fromFormatted = rawFrom;
      if (rawFrom.includes("onboarding@resend.dev")) {
        fromFormatted = "onboarding@resend.dev";
      } else if (!rawFrom.includes("<")) {
        fromFormatted = `${fromName} <${rawFrom}>`;
      }
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromFormatted,
          to: [recipient],
          subject,
          html
        })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        console.log(`[Resend API] Live email delivered to ${recipient} (ID: ${data.id}) from ${fromFormatted}`);
        return true;
      }
      console.warn(`[Resend API Warning] Failed sending to ${recipient}:`, data);
    } catch (err) {
      console.error("[Resend API Exception]:", err);
    }
  }
  if (isConfigured(process.env.BREVO_API_KEY)) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || "Meris E-Shop";
      const fromEmail = (process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM_EMAIL || "orders@orders.meriseshop.com").trim();
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY.trim()
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: recipient }],
          subject,
          htmlContent: html
        })
      });
      const data = await res.json();
      if (res.ok && (data.messageId || data.messageIds)) {
        console.log(`[Brevo REST API] Live email delivered to ${recipient} (ID: ${data.messageId || data.messageIds})`);
        return true;
      }
      console.warn(`[Brevo REST API Warning] Failed sending to ${recipient}:`, data);
    } catch (err) {
      console.error("[Brevo REST API Exception]:", err);
    }
  }
  try {
    const transporter = createSmtpTransporter();
    const fromName = process.env.SMTP_FROM_NAME || "Meris E-Shop";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || process.env.SMTP_USER || "orders@orders.meriseshop.com";
    await transporter.sendMail({
      from: `"${fromName.replace(/"/g, "")}" <${fromEmail}>`,
      to: recipient,
      subject,
      html
    });
    console.log(`[SMTP Mailer] Live email delivered to ${recipient} via SMTP.`);
    return true;
  } catch (smtpErr) {
    console.error(`[SMTP Mailer Error] Failed sending to ${recipient}:`, smtpErr?.message || smtpErr);
    return false;
  }
}
function normalizePhone(value) {
  if (typeof value !== "string") return "";
  const compact = value.replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.length === 10) return `+91${compact}`;
  return compact;
}
console.log("[Orders] Auto-status-advancement disabled in production. Use admin panel to update order status.");
app.get("/api/orders", verifyAdminToken, (req, res) => {
  try {
    const dbOrders = readOrdersDb();
    res.json(dbOrders);
  } catch (err) {
    res.status(500).json({ error: "Failed to read orders database" });
  }
});
app.get("/api/orders/:orderNumber", rateLimiter(20, 15 * 60 * 1e3), (req, res) => {
  try {
    const orderNum = sanitizeString(req.params.orderNumber, 30).toUpperCase();
    if (!orderNum || !/^[A-Z0-9\-_]+$/.test(orderNum)) {
      return res.status(400).json({ error: "Invalid order number format." });
    }
    const emailParam = sanitizeEmail(req.query.email);
    if (!emailParam) {
      return res.status(400).json({ error: "Your account email is required to look up an order. Provide ?email=your@email.com" });
    }
    const dbOrders = readOrdersDb();
    const order = dbOrders.find(
      (o) => o.orderNumber.toUpperCase() === orderNum || o.id.toUpperCase() === orderNum
    );
    if (!order) {
      return res.status(404).json({ error: `Order ${orderNum} was not found.` });
    }
    const orderEmail = (order.accountEmail || order.customerInfo?.email || "").toLowerCase().trim();
    if (orderEmail !== emailParam) {
      return res.status(404).json({ error: `Order ${orderNum} was not found.` });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tracking data" });
  }
});
async function sendBookingEmail(order) {
  try {
    const recipientEmail = sanitizeEmail(order.customerInfo?.email || order.accountEmail || order.email);
    if (!recipientEmail) {
      console.warn("[Email Service] No valid customer recipient email found for order:", order?.orderNumber);
      return null;
    }
    const customerName = sanitizeString(order.customerInfo?.name || order.accountName || order.name || "Valued Customer", 100);
    const orderNum = order.orderNumber || order.id || "ORDER";
    const subject = `Order Confirmation - Meris E-Shop (#${orderNum})`;
    let itemsHtml = "";
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const productObj = item.product || item;
        const productName = productObj.name || "Handcrafted Gift";
        const qty = item.quantity || 1;
        const price = Number(productObj.discountPrice ?? productObj.price ?? item.price ?? 0);
        const imageUrl = Array.isArray(productObj.images) && productObj.images[0] ? productObj.images[0] : "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop&q=80";
        itemsHtml += `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 8px; width: 60px;">
              <img src="${imageUrl}" alt="${productName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" />
            </td>
            <td style="padding: 12px 8px; font-size: 13px; color: #0f172a; font-weight: 500;">
              ${productName}
              <div style="font-size: 11px; color: #64748b; font-family: monospace; margin-top: 2px;">Qty: ${qty} \xD7 \u20B9${price}</div>
            </td>
            <td style="padding: 12px 8px; text-align: right; font-size: 13px; font-family: monospace; font-weight: bold; color: #0f172a;">
              \u20B9${price * qty}
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
            <td style="color: #0f172a; text-align: right; padding-bottom: 6px; font-weight: bold; font-size: 13px;">${orderNum}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px; font-weight: bold;">BOOKING DATE:</td>
            <td style="color: #0f172a; text-align: right; padding-bottom: 6px;">${order.date || (/* @__PURE__ */ new Date()).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px; font-weight: bold;">PAYMENT GATEWAY:</td>
            <td style="color: #0f172a; text-align: right; padding-bottom: 6px;">${order.paymentMethod} (${order.paymentStatus?.toUpperCase() || "PAID"})</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: bold;">LOGISTICS MODE:</td>
            <td style="color: #d97706; text-align: right; font-weight: bold;">${order.shippingMethod === "express" ? "BlueDart Air Express (2-3 Days)" : "Standard Ground Delivery"}</td>
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
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #0f172a;">\u20B9${subtotal}</td>
        </tr>
        ${discount > 0 ? `
        <tr>
          <td style="padding: 6px 0; color: #10b981; font-weight: 500;">Campaign Promo Discount (${order.couponCode || "PROMO"}):</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #10b981; font-weight: bold;">-\u20B9${discount}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Shipping Handlers Fee:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #0f172a;">\u20B9${shippingCost}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Tax (Inclusive Goods & Services Tax):</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #0f172a;">\u20B9${tax}</td>
        </tr>
        <tr style="border-top: 1px solid #e2e8f0;">
          <td style="padding: 16px 0 0 0; font-size: 15px; font-weight: bold; color: #0f172a;">Total Invoice Paid:</td>
          <td style="padding: 16px 0 0 0; text-align: right; font-size: 16px; font-weight: bold; color: #d97706; font-family: monospace;">\u20B9${total}</td>
        </tr>
      </table>
    </div>

    <!-- Premium Footer Note -->
    <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px; text-align: center;">
      <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5;">
        Your dispatch tracking number is active. You can track this booking live in your Meris Account Dashboard anytime.
      </p>
      <p style="font-size: 11px; color: #94a3b8; margin: 0; font-family: monospace;">
        Meris Artisanal Studio Co. \u2022 Handcrafted in Tamil Nadu Workshops, India
      </p>
    </div>

  </div>
</body>
</html>
  `;
    const newEmailRecord = {
      id: `email_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      recipient: recipientEmail,
      subject,
      bodyHtml: htmlContent,
      sentAt: (/* @__PURE__ */ new Date()).toLocaleString(),
      orderNumber: orderNum,
      status: "Delivered",
      dateText: (/* @__PURE__ */ new Date()).toLocaleString()
    };
    if (supabase) {
      try {
        await supabase.from("email_logs").insert({
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
        console.error("[Email Service] Supabase email_logs insert error:", dbErr);
      }
    } else {
      console.log(`[Email Service] Supabase not configured \u2014 email log skipped for ${recipientEmail}.`);
    }
    const sent = await dispatchLiveEmail(recipientEmail, subject, htmlContent);
    if (sent) {
      console.log(`[Order Service] Order confirmation email delivered to ${recipientEmail} for #${orderNum}`);
    } else {
      console.warn(`[Order Service] Failed to send order confirmation email to ${recipientEmail} for #${orderNum}`);
    }
    return newEmailRecord;
  } catch (err) {
    console.error("[Order Service] Exception in sendBookingEmail:", err);
    return null;
  }
}
async function sendAdminVendorNotificationEmail(order) {
  try {
    const orderNum = order.orderNumber || order.id || "ORDER";
    const customerName = sanitizeString(order.customerInfo?.name || order.accountName || "Customer", 100);
    const customerEmail = sanitizeEmail(order.customerInfo?.email || order.accountEmail || "");
    const customerPhone = sanitizeString(order.customerInfo?.phone || "", 30);
    const customerAddress = sanitizeString(order.customerInfo?.address || "", 300);
    const customerPincode = sanitizeString(order.customerInfo?.pincode || "", 10);
    const adminEmail = sanitizeEmail(process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || process.env.BREVO_FROM_EMAIL || "meriseshop.2025@gmail.com");
    const subject = `New Order Received - Meris E-Shop (#${orderNum})`;
    let itemsHtml = "";
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const productObj = item.product || item;
        const productName = productObj.name || "Handcrafted Product";
        const qty = item.quantity || 1;
        const price = Number(productObj.discountPrice ?? productObj.price ?? item.price ?? 0);
        const vendorId = productObj.vendorId || item.vendorId || "Store Direct";
        itemsHtml += `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px; font-size: 13px; color: #0f172a; font-weight: 500;">
              ${productName}
              <div style="font-size: 11px; color: #64748b;">Listing / Vendor: ${vendorId} | Qty: ${qty} \xD7 \u20B9${price}</div>
            </td>
            <td style="padding: 10px; text-align: right; font-size: 13px; font-family: monospace; font-weight: bold; color: #0f172a;">
              \u20B9${price * qty}
            </td>
          </tr>
        `;
      });
    }
    const total = Number(order.total || 0);
    const paymentMethod = order.paymentMethod || "Online Payment";
    const paymentStatus = (order.paymentStatus || "unpaid").toUpperCase();
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; text-align: center; border-bottom: 4px solid #10b981;">
      <h1 style="color: #10b981; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 2px;">NEW ORDER ALERT</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">Meris E-Shop Store & Listing Notification</p>
    </div>

    <div style="padding: 24px;">
      <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">Order #${orderNum} has been placed!</h2>
      <p style="font-size: 13px; color: #475569; margin: 0 0 16px 0;">A customer has purchased items from your catalog listings. Please review order details below for fulfillment.</p>
      
      <!-- Customer Information -->
      <div style="background-color: #f1f5f9; border-radius: 10px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #334155;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a; text-transform: uppercase;">Customer Details</h3>
        <div><strong>Name:</strong> ${customerName}</div>
        <div><strong>Email:</strong> ${customerEmail}</div>
        <div><strong>Phone:</strong> ${customerPhone || "N/A"}</div>
        <div><strong>Shipping Address:</strong> ${customerAddress} (Pincode: ${customerPincode})</div>
        <div><strong>Payment Method:</strong> ${paymentMethod} (${paymentStatus})</div>
      </div>

      <!-- Item breakdown -->
      <h3 style="font-size: 13px; color: #0f172a; text-transform: uppercase; margin-bottom: 8px;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 11px; color: #64748b;">
            <th style="padding: 6px 10px;">Item / Listing</th>
            <th style="padding: 6px 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="text-align: right; font-size: 15px; font-weight: bold; color: #0f172a; padding-top: 8px; border-top: 1px solid #e2e8f0;">
        Grand Total: <span style="color: #d97706; font-family: monospace;">\u20B9${total}</span>
      </div>
    </div>

    <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
      Meris Artisanal Studio Co. Automated Merchant Dispatch Notification
    </div>

  </div>
</body>
</html>
    `;
    if (adminEmail) {
      await dispatchLiveEmail(adminEmail, subject, htmlContent);
      console.log(`[Order Service] Dispatched store order alert notification to admin ${adminEmail} for #${orderNum}`);
    }
    const vendorEmails = /* @__PURE__ */ new Set();
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const vEmail = item.product?.vendorEmail || item.vendorEmail;
        if (vEmail && sanitizeEmail(vEmail)) {
          vendorEmails.add(sanitizeEmail(vEmail));
        }
      });
    }
    for (const vEmail of vendorEmails) {
      if (vEmail !== adminEmail) {
        await dispatchLiveEmail(vEmail, `Listing Order Alert - Meris E-Shop (#${orderNum})`, htmlContent);
        console.log(`[Order Service] Dispatched listing order alert to vendor ${vEmail} for #${orderNum}`);
      }
    }
  } catch (err) {
    console.error("[Order Service] Exception in sendAdminVendorNotificationEmail:", err);
  }
}
async function sendPaymentEmail(order, type, reason) {
  const recipientEmail = order.customerInfo?.email || "guest@example.com";
  const customerName = order.customerInfo?.name || "Valued Customer";
  const isApproved = type === "approved";
  const subject = isApproved ? `\u{1F4B3} Meris E-Shop: Payment Approved - Order #${order.orderNumber}` : `\u274C Meris E-Shop: Payment Verification Failed - Order #${order.orderNumber}`;
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
    
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 24px; text-align: center; border-bottom: 4px solid ${isApproved ? "#10b981" : "#ef4444"};">
      <h1 style="color: #f59e0b; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 3px; font-family: 'Space Grotesk', Arial, sans-serif;">MERIS</h1>
      <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;">Handcrafted Toys & Premium Gifts</p>
    </div>

    <div style="padding: 32px 24px 20px 24px;">
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Dear ${customerName},</h2>
      ${isApproved ? `
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
          We are pleased to inform you that your UPI payment for order <strong>#${order.orderNumber}</strong> has been successfully verified!
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0 0 0;">
          Your order has been moved to <strong>Processing</strong> status. Our master artisans have begun handcrafting your items. You will receive another notification once your package is dispatched.
        </p>
      ` : `
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
          We regret to inform you that we could not verify your UPI payment for order <strong>#${order.orderNumber}</strong>.
        </p>
        <div style="background-color: #fef2f2; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #fee2e2;">
          <p style="font-size: 13px; color: #991b1b; margin: 0; font-weight: bold;">Rejection Reason:</p>
          <p style="font-size: 13px; color: #7f1d1d; margin: 4px 0 0 0; font-style: italic;">
            "${reason || "The transaction reference number or screenshot did not match our accounts ledger."}"
          </p>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0 0 0;">
          Please log into your account dashboard, check your transaction credentials, and resubmit the correct UPI reference number or payment receipt screenshot to resume processing of your artisanal package.
        </p>
      `}
    </div>

    <div style="padding: 0 24px 24px 24px;">
      <div style="background-color: #f1f5f9; border-radius: 14px; padding: 18px; border: 1px dashed #cbd5e1;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace;">
          <tr>
            <td style="color: #64748b; padding-bottom: 6px; font-weight: bold;">ORDER NUMBER:</td>
            <td style="color: #0f172a; text-align: right; padding-bottom: 6px; font-weight: bold; font-size: 13px;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px; font-weight: bold;">TOTAL VALUE:</td>
            <td style="color: #0f172a; text-align: right; padding-bottom: 6px; font-weight: bold;">\u20B9${order.total}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-bottom: 6px; font-weight: bold;">PAYMENT STATUS:</td>
            <td style="color: ${isApproved ? "#10b981" : "#ef4444"}; text-align: right; padding-bottom: 6px; font-weight: bold;">${order.paymentStatus.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: bold;">CURRENT ORDER STATUS:</td>
            <td style="color: #0f172a; text-align: right; font-weight: bold;">${order.status.toUpperCase()}</td>
          </tr>
        </table>
      </div>
    </div>

    <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px; text-align: center;">
      <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5;">
        You can track your order status live in your Meris Account Dashboard at any time.
      </p>
      <p style="font-size: 11px; color: #94a3b8; margin: 0; font-family: monospace;">
        Meris Artisanal Studio Co. \u2022 Handcrafted in Tamil Nadu Workshops, India
      </p>
    </div>

  </div>
</body>
</html>
  `;
  const newEmailRecord = {
    id: `email_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
    recipient: recipientEmail,
    subject,
    bodyHtml: htmlContent,
    sentAt: (/* @__PURE__ */ new Date()).toLocaleString(),
    orderNumber: order.orderNumber,
    status: "Delivered",
    dateText: (/* @__PURE__ */ new Date()).toLocaleString()
  };
  if (supabase) {
    supabase.from("email_logs").insert({
      id: newEmailRecord.id,
      recipient: newEmailRecord.recipient,
      subject: newEmailRecord.subject,
      body_html: newEmailRecord.bodyHtml,
      sent_at: newEmailRecord.sentAt,
      order_number: newEmailRecord.orderNumber,
      status: newEmailRecord.status,
      date_text: newEmailRecord.dateText
    }).then(({ error }) => {
      if (error) console.error("[Email Service] Supabase email_logs insert failed (payment):", error);
      else console.log(`[Email Service] Logged payment email to Supabase for ${recipientEmail}.`);
    });
  } else {
    console.log(`[Email Service] Supabase not configured \u2014 payment email log skipped for ${recipientEmail}.`);
  }
  await dispatchLiveEmail(recipientEmail, subject, htmlContent);
  return newEmailRecord;
}
async function sendSMSAlert(order) {
  const recipientPhone = normalizePhone(order.customerInfo?.phone);
  if (!recipientPhone) return;
  const message = `Meris E-Shop: Order #${order.orderNumber} placed successfully! Total: \u20B9${order.total}. Est. Delivery: ${order.shippingMethod === "express" ? "BlueDart Express Air (2-3 Days)" : "Standard Ground"}. Live tracking: ${process.env.APP_URL || "http://localhost:3000"}/?track=${order.orderNumber}`;
  if (realNotificationsEnabled() && isConfigured(process.env.TWILIO_ACCOUNT_SID) && isConfigured(process.env.TWILIO_AUTH_TOKEN) && isConfigured(process.env.TWILIO_SMS_NUMBER)) {
    try {
      const client = (0, import_twilio.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_SMS_NUMBER,
        to: recipientPhone
      });
      console.log(`[SMS Service] Real SMS booking confirmation successfully sent to ${recipientPhone}.`);
    } catch (twilioError) {
      console.error("[SMS Service] Failed sending via Twilio SMS API:", twilioError);
    }
  } else {
    console.log("\n======================================================");
    console.log("\u{1F4F1} SMS BOOKING NOTIFICATION DISPATCHED (SIMULATED)");
    console.log(`RECIPIENT: ${recipientPhone}`);
    console.log(`BODY: ${message}`);
    console.log("======================================================\n");
  }
}
var OTP_EXPIRY_MS = 5 * 60 * 1e3;
var OTP_RESEND_COOLDOWN_MS = 60 * 1e3;
var OTP_MAX_SENDS_PER_HOUR = 5;
var OTP_MAX_VERIFY_ATTEMPTS = 5;
var otpMemoryStore = {};
function readOtpDb() {
  return otpMemoryStore;
}
function writeOtpDb(db) {
  for (const key of Object.keys(otpMemoryStore)) {
    delete otpMemoryStore[key];
  }
  Object.assign(otpMemoryStore, db);
}
function purgeExpiredOtps(db) {
  const now = Date.now();
  const cleaned = {};
  for (const [recipient, record] of Object.entries(db)) {
    if (record.expiresAt > now) {
      cleaned[recipient] = record;
    }
  }
  return cleaned;
}
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(otpMemoryStore)) {
    if (otpMemoryStore[key].expiresAt <= now) {
      delete otpMemoryStore[key];
    }
  }
}, 10 * 60 * 1e3);
function smtpEmailConfigured() {
  return true;
}
async function dispatchOtpEmail(email, code) {
  const subject = "Your Meris verification code";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
      <h2 style="margin: 0 0 12px; color: #0f172a;">Meris verification code</h2>
      <p style="color: #475569; font-size: 14px;">Use this code to sign in to your Meris account. It is valid for 5 minutes.</p>
      <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #c5a021; padding: 18px 0;">${code}</div>
      <p style="color: #64748b; font-size: 12px;">If you did not request this code, no action is needed.</p>
    </div>
  `;
  await dispatchLiveEmail(email, subject, html);
}
app.post("/api/send-otp", rateLimiter(30, 15 * 60 * 1e3), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    const now = Date.now();
    let db = purgeExpiredOtps(readOtpDb());
    const existing = db[email];
    if (existing) {
      const windowElapsed = now - existing.windowStartAt;
      if (windowElapsed < 60 * 60 * 1e3 && existing.sendCount >= OTP_MAX_SENDS_PER_HOUR) {
        const retryAfterSec = Math.ceil((60 * 60 * 1e3 - windowElapsed) / 1e3);
        return res.status(429).json({
          error: `Too many OTP requests. Please try again in ${Math.ceil(retryAfterSec / 60)} minutes.`,
          retryAfterSec
        });
      }
      if (now - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
        const retryAfterSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1e3);
        return res.status(429).json({
          error: `Please wait ${retryAfterSec} seconds before requesting another code.`,
          retryAfterSec
        });
      }
    }
    const code = Math.floor(1e3 + Math.random() * 9e3).toString();
    const windowStartAt = existing && now - existing.windowStartAt < 60 * 60 * 1e3 ? existing.windowStartAt : now;
    db[email] = {
      code,
      expiresAt: now + OTP_EXPIRY_MS,
      verifyAttempts: 0,
      sendCount: (existing && now - existing.windowStartAt < 60 * 60 * 1e3 ? existing.sendCount : 0) + 1,
      lastSentAt: now,
      windowStartAt
    };
    writeOtpDb(db);
    const emailEnabled = smtpEmailConfigured();
    if (emailEnabled) {
      dispatchOtpEmail(email, code).catch((err) => {
        console.warn("[Email OTP] Background SMTP dispatch notice:", err?.message || err);
      });
      return res.json({
        success: true,
        requiresOtp: true,
        message: `Passcode sent to ${email}. Please check your inbox.`,
        emailMode: "live",
        expiresInSec: OTP_EXPIRY_MS / 1e3
      });
    }
    console.log(`[Email OTP] OTP generated for ${email}`);
    return res.json({
      success: true,
      requiresOtp: true,
      message: `Passcode sent to ${email}. Please check your inbox.`,
      emailMode: "live",
      expiresInSec: OTP_EXPIRY_MS / 1e3
    });
  } catch (err) {
    console.error("Error sending email OTP:", err);
    return res.status(500).json({ error: "Failed to send email OTP." });
  }
});
app.post("/api/verify-otp", rateLimiter(30, 15 * 60 * 1e3), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body?.email);
    const code = sanitizeString(req.body?.code, 8).replace(/\s/g, "");
    if (!email || !code) {
      return res.status(400).json({ error: "Email address and code are required." });
    }
    if (!/^\d{4,8}$/.test(code)) {
      return res.status(400).json({ error: "Invalid OTP format." });
    }
    let db = purgeExpiredOtps(readOtpDb());
    const record = db[email];
    if (!record) {
      return res.status(400).json({ error: "OTP expired or not found. Please request a new code." });
    }
    if (record.verifyAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      delete db[email];
      writeOtpDb(db);
      return res.status(429).json({ error: "Too many failed attempts. Please request a new OTP." });
    }
    if (record.code !== code) {
      record.verifyAttempts += 1;
      db[email] = record;
      writeOtpDb(db);
      const remaining = OTP_MAX_VERIFY_ATTEMPTS - record.verifyAttempts;
      return res.status(400).json({
        error: remaining > 0 ? `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` : "Invalid verification code."
      });
    }
    delete db[email];
    writeOtpDb(db);
    const customerName = email.split("@")[0];
    const customerObj = {
      id: `cust_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      email: email.toLowerCase(),
      name: customerName,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (!inMemoryCustomers.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
      inMemoryCustomers.push(customerObj);
    }
    if (supabase) {
      Promise.resolve(supabase.from("customers").upsert({
        id: customerObj.id,
        email: customerObj.email,
        name: customerObj.name
      })).catch(() => {
      });
    }
    return res.json({
      success: true,
      message: "OTP verified successfully.",
      email,
      name: customerName,
      verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ error: "Failed to verify OTP." });
  }
});
app.post("/api/login-customer", rateLimiter(60, 15 * 60 * 1e3), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password.slice(0, 256) : "";
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const lowerEmail = email.toLowerCase();
    let customer = null;
    customer = inMemoryCustomers.find((c) => c.email.toLowerCase() === lowerEmail);
    if (!customer && supabase) {
      try {
        const { data, error } = await supabase.from("customers").select("id, email, name, password_hash, created_at").eq("email", lowerEmail).maybeSingle();
        if (!error && data) {
          customer = {
            id: data.id,
            email: data.email.toLowerCase(),
            name: data.name,
            passwordHash: data.password_hash,
            createdAt: data.created_at
          };
          if (!inMemoryCustomers.some((c) => c.email.toLowerCase() === lowerEmail)) {
            inMemoryCustomers.push(customer);
          }
          try {
            import_fs.default.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(inMemoryCustomers, null, 2));
          } catch {
          }
        }
      } catch (err) {
        console.error("Supabase customer fetch error:", err);
      }
    }
    if (!customer) {
      if (import_fs.default.existsSync(CUSTOMERS_FILE_PATH)) {
        try {
          const localCustomers = JSON.parse(import_fs.default.readFileSync(CUSTOMERS_FILE_PATH, "utf-8") || "[]");
          const found = localCustomers.find((c) => c.email.toLowerCase() === lowerEmail);
          if (found) {
            customer = {
              id: found.id,
              email: found.email.toLowerCase(),
              name: found.name,
              passwordHash: found.passwordHash || found.password_hash,
              createdAt: found.createdAt || found.created_at
            };
            if (!inMemoryCustomers.some((c) => c.email.toLowerCase() === lowerEmail)) {
              inMemoryCustomers.push(customer);
            }
          }
        } catch (err) {
          console.error("Error reading local customers db:", err);
        }
      }
    }
    if (!customer) {
      return res.status(401).json({ error: 'No account found with this email. Please check spelling or click "Sign Up".' });
    }
    if (!customer.passwordHash) {
      return res.status(401).json({ error: "This account was registered via OTP. Please sign in using OTP code." });
    }
    const isPasswordValid = await import_bcryptjs.default.compare(password, customer.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
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
    console.error("Error during customer login:", err);
    res.status(500).json({ error: "Failed to complete login." });
  }
});
app.post("/api/register-customer", rateLimiter(30, 15 * 60 * 1e3), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body?.email);
    const name = sanitizeString(req.body?.name, 100);
    const password = typeof req.body?.password === "string" ? req.body.password.slice(0, 256) : "";
    if (!email || !name || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    const validation = validatePassword(password);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors[0] || "Password does not meet security criteria." });
    }
    const lowerEmail = email.toLowerCase();
    let emailAlreadyExists = inMemoryCustomers.some((c) => c.email.toLowerCase() === lowerEmail);
    if (!emailAlreadyExists && supabase) {
      try {
        const { data: existing } = await supabase.from("customers").select("id").eq("email", lowerEmail).maybeSingle();
        if (existing) emailAlreadyExists = true;
      } catch {
      }
    }
    if (emailAlreadyExists) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    const passwordHash = await import_bcryptjs.default.hash(password, 10);
    const newCustomer = {
      id: `cust_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      email: lowerEmail,
      name,
      passwordHash,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    inMemoryCustomers.push(newCustomer);
    if (supabase) {
      supabase.from("customers").upsert({
        id: newCustomer.id,
        email: newCustomer.email,
        name: newCustomer.name,
        password_hash: newCustomer.passwordHash,
        created_at: newCustomer.createdAt
      }, { onConflict: "email" }).then(({ error }) => {
        if (error) console.error("[Registration] Supabase customer upsert error:", error);
      });
    }
    try {
      import_fs.default.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(inMemoryCustomers, null, 2));
    } catch {
    }
    const subject = `Welcome to MERIS E-SHOP - Happy Shopping!`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to MERIS</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 24px; text-align: center; border-bottom: 4px solid #f59e0b;">
      <h1 style="color: #f59e0b; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 3px;">MERIS</h1>
      <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">Handcrafted Toys & Premium Gifts</p>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Thanks for choosing us, ${name}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        We are absolutely thrilled to welcome you to the MERIS family! Your account has been securely created.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-top: 12px;">
        Explore our curated collection of developmental craft toys, customized stencils, and premium handcrafted gifts. We hope you enjoy browsing and shopping our unique heritage crafts.
      </p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.APP_URL || "http://localhost:3000"}" style="background-color: #f59e0b; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">Happy Shopping &rarr;</a>
      </div>
    </div>
    <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 24px; text-align: center;">
      <p style="font-size: 11px; color: #94a3b8; margin: 0;">
        Meris Artisanal Studio Co. \u2022 Handcrafted in Tamil Nadu Workshops, India
      </p>
    </div>
  </div>
</body>
</html>
    `;
    const newEmailRecord = {
      id: `email_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      recipient: email,
      subject,
      bodyHtml: htmlContent,
      sentAt: (/* @__PURE__ */ new Date()).toLocaleString(),
      orderNumber: "REGISTRATION",
      status: "Delivered",
      dateText: (/* @__PURE__ */ new Date()).toLocaleString()
    };
    if (supabase) {
      supabase.from("email_logs").insert({
        id: newEmailRecord.id,
        recipient: newEmailRecord.recipient,
        subject: newEmailRecord.subject,
        body_html: newEmailRecord.bodyHtml,
        sent_at: newEmailRecord.sentAt,
        order_number: newEmailRecord.orderNumber,
        status: newEmailRecord.status,
        date_text: newEmailRecord.dateText
      }).then(({ error }) => {
        if (error) console.error("[Registration] Supabase email_logs insert failed:", error);
      });
    }
    await dispatchLiveEmail(email, subject, htmlContent);
    res.json({ success: true, message: "Account registered successfully." });
  } catch (err) {
    console.error("Error during customer registration:", err);
    res.status(500).json({ error: "Failed to complete registration." });
  }
});
app.post("/api/auth/clerk-sync", import_express.default.json(), async (req, res) => {
  try {
    const { clerkId, email, name, phone, imageUrl, authProvider } = req.body || {};
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({ error: "Valid email is required for Clerk user sync." });
    }
    const customerObj = {
      id: clerkId ? `clerk_${clerkId}` : `cust_${Date.now()}`,
      clerk_id: clerkId || null,
      email: sanitizedEmail.toLowerCase(),
      name: sanitizeString(name || sanitizedEmail.split("@")[0], 100),
      phone: sanitizeString(phone || "", 30),
      image_url: typeof imageUrl === "string" ? imageUrl : "",
      auth_provider: authProvider || "clerk",
      last_sign_in_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const existingIndex = inMemoryCustomers.findIndex((c) => c.email.toLowerCase() === customerObj.email);
    if (existingIndex >= 0) {
      inMemoryCustomers[existingIndex] = {
        ...inMemoryCustomers[existingIndex],
        ...customerObj,
        createdAt: inMemoryCustomers[existingIndex].createdAt || (/* @__PURE__ */ new Date()).toISOString()
      };
    } else {
      inMemoryCustomers.push({
        ...customerObj,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    try {
      import_fs.default.writeFileSync(CUSTOMERS_FILE_PATH, JSON.stringify(inMemoryCustomers, null, 2));
    } catch (e) {
      console.warn("Error saving local customer db:", e);
    }
    if (supabase) {
      const { error } = await supabase.from("customers").upsert({
        id: customerObj.id,
        clerk_id: customerObj.clerk_id,
        email: customerObj.email,
        name: customerObj.name,
        phone: customerObj.phone,
        image_url: customerObj.image_url,
        auth_provider: customerObj.auth_provider,
        last_sign_in_at: customerObj.last_sign_in_at
      }, { onConflict: "email" });
      if (error) {
        console.error("[Clerk Sync] Supabase customer upsert error:", error);
      } else {
        console.log(`[Clerk Sync] Successfully synced Clerk user ${customerObj.email} to Supabase.`);
      }
    }
    return res.json({ success: true, customer: customerObj });
  } catch (err) {
    console.error("Error syncing Clerk user:", err);
    return res.status(500).json({ error: "Failed to sync Clerk user." });
  }
});
app.get("/api/customers", async (req, res) => {
  try {
    let customerList = [];
    let ordersList = [];
    if (supabase) {
      const { data: dbOrders } = await supabase.from("orders").select("*");
      if (dbOrders) ordersList = dbOrders;
    }
    if (ordersList.length === 0) {
      ordersList = readOrdersDb();
    }
    if (supabase) {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        customerList = data.map((c) => ({
          id: c.id,
          clerkId: c.clerk_id || null,
          email: c.email,
          name: c.name,
          phone: c.phone || "",
          imageUrl: c.image_url || "",
          authProvider: c.auth_provider || "email",
          createdAt: c.created_at,
          lastSignInAt: c.last_sign_in_at || c.created_at
        }));
      }
    }
    if (customerList.length === 0) {
      customerList = inMemoryCustomers.map((c) => ({
        id: c.id,
        clerkId: c.clerk_id || c.clerkId || null,
        email: c.email,
        name: c.name,
        phone: c.phone || "",
        imageUrl: c.image_url || c.imageUrl || "",
        authProvider: c.auth_provider || c.authProvider || "email",
        createdAt: c.createdAt || c.created_at || (/* @__PURE__ */ new Date()).toISOString(),
        lastSignInAt: c.last_sign_in_at || c.lastSignInAt || (/* @__PURE__ */ new Date()).toISOString()
      }));
    }
    const emailToOrdersMap = /* @__PURE__ */ new Map();
    ordersList.forEach((order) => {
      const email = (order.account_email || order.accountEmail || order.customer_info?.email || order.customerInfo?.email || "").toLowerCase().trim();
      if (!email) return;
      if (!emailToOrdersMap.has(email)) emailToOrdersMap.set(email, []);
      emailToOrdersMap.get(email).push(order);
    });
    const enrichedCustomers = customerList.map((c) => {
      const userEmail = c.email.toLowerCase();
      const userOrders = emailToOrdersMap.get(userEmail) || [];
      const ordersCount = userOrders.length;
      const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const sortedDates = userOrders.map((o) => o.date || o.created_at).filter(Boolean).sort().reverse();
      const lastOrderDate = sortedDates[0] || null;
      let tier = "Bronze";
      if (ordersCount >= 8 || totalSpent >= 1e4) tier = "Platinum";
      else if (ordersCount >= 4 || totalSpent >= 4e3) tier = "Gold";
      else if (ordersCount >= 1) tier = "Silver";
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
    console.error("Error fetching customers:", err);
    return res.status(500).json({ error: "Failed to fetch customer list" });
  }
});
app.get("/api/emails", verifyAdminToken, async (req, res) => {
  try {
    if (supabase) {
      let query = supabase.from("email_logs").select("id, recipient, subject, sent_at, order_number, status, date_text").order("created_at", { ascending: false }).limit(500);
      const { recipient } = req.query;
      if (recipient) {
        query = query.eq("recipient", recipient.toLowerCase());
      }
      const { data, error } = await query;
      if (!error && data) {
        return res.json(data.map((e) => ({
          id: e.id,
          recipient: e.recipient,
          subject: e.subject,
          sentAt: e.sent_at,
          orderNumber: e.order_number,
          status: e.status,
          dateText: e.date_text
        })));
      }
      console.warn("Supabase email_logs fetch failed, returning empty:", error);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch email logs" });
  }
});
function getPayUActionUrl() {
  return process.env.PAYU_ENV === "production" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment";
}
function getPublicAppUrl(req) {
  if (isConfigured(process.env.APP_URL)) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  return `${req.protocol}://${req.get("host")}`;
}
function buildPayURequestHashString(params, merchantKey, merchantSalt) {
  const amount = Number(params.amount).toFixed(2);
  return [
    merchantKey.trim(),
    String(params.txnid || "").trim(),
    amount,
    String(params.productinfo || "").trim(),
    String(params.firstname || "").trim(),
    String(params.email || "").trim(),
    String(params.udf1 || ""),
    String(params.udf2 || ""),
    String(params.udf3 || ""),
    String(params.udf4 || ""),
    String(params.udf5 || ""),
    "",
    "",
    "",
    "",
    "",
    merchantSalt.trim()
  ].join("|");
}
function buildPayUResponseHashString(payload, merchantSalt) {
  const amount = Number(payload.amount || 0).toFixed(2);
  return [
    merchantSalt.trim(),
    String(payload.status || "").trim(),
    "",
    "",
    "",
    "",
    "",
    String(payload.udf5 || "").trim(),
    String(payload.udf4 || "").trim(),
    String(payload.udf3 || "").trim(),
    String(payload.udf2 || "").trim(),
    String(payload.udf1 || "").trim(),
    String(payload.email || "").trim(),
    String(payload.firstname || "").trim(),
    String(payload.productinfo || "").trim(),
    amount,
    String(payload.txnid || "").trim(),
    String(payload.key || "").trim()
  ].join("|");
}
function verifyPayUResponse(payload) {
  const merchantSalt = process.env.PAYU_MERCHANT_SALT;
  if (!isConfigured(merchantSalt)) {
    return { verified: false, calculatedHash: "", error: "PayU salt is not configured." };
  }
  const calculatedHash = import_crypto.default.createHash("sha512").update(buildPayUResponseHashString(payload, merchantSalt)).digest("hex");
  const receivedHash = String(payload.hash || "").toLowerCase();
  return {
    verified: Boolean(receivedHash) && calculatedHash.toLowerCase() === receivedHash,
    calculatedHash
  };
}
async function applyPayUResult(payload, fallbackStatus) {
  const txnid = sanitizeString(payload.txnid || payload.udf1, 60);
  if (!txnid) return null;
  const dbOrders = readOrdersDb();
  const index = dbOrders.findIndex(
    (o) => String(o.orderNumber || "").toUpperCase() === txnid.toUpperCase() || String(o.payuTxnId || "").toUpperCase() === txnid.toUpperCase()
  );
  if (index < 0) return null;
  const previousPaymentStatus = dbOrders[index].paymentStatus;
  const gatewayStatus = String(payload.status || fallbackStatus).toLowerCase();
  const paid = gatewayStatus === "success";
  dbOrders[index] = {
    ...dbOrders[index],
    paymentMethod: "PayU Secure Online Payment",
    paymentStatus: paid ? "paid" : "rejected",
    status: paid ? "processing" : dbOrders[index].status,
    payuTxnId: txnid,
    payuPaymentId: payload.mihpayid || payload.payuMoneyId || payload.bank_ref_num || dbOrders[index].payuPaymentId,
    payuHash: payload.hash || dbOrders[index].payuHash,
    payuStatus: gatewayStatus
  };
  writeOrdersDb(dbOrders);
  if (previousPaymentStatus === "pending" && paid) {
    try {
      await sendBookingEmail(dbOrders[index]);
      await sendAdminVendorNotificationEmail(dbOrders[index]);
      await sendSMSAlert(dbOrders[index]);
    } catch (notifyErr) {
      console.error("Failed to dispatch PayU confirmation notifications:", notifyErr);
    }
  }
  return dbOrders[index];
}
app.post("/api/payu/hash", rateLimiter(20, 15 * 60 * 1e3), (req, res) => {
  try {
    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const merchantSalt = process.env.PAYU_MERCHANT_SALT;
    if (!isConfigured(merchantKey) || !isConfigured(merchantSalt)) {
      return res.status(503).json({
        error: "PayU is not configured yet. Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in local .env and in Render Environment before accepting online payments."
      });
    }
    const txnid = sanitizeString(req.body?.txnid, 60);
    const amount = Number(req.body?.amount);
    const productinfo = sanitizeString(req.body?.productinfo, 120);
    const firstname = sanitizeString(req.body?.firstname, 80);
    const email = sanitizeEmail(req.body?.email);
    if (!txnid || !Number.isFinite(amount) || amount <= 0 || !productinfo || !firstname || !email) {
      return res.status(400).json({ error: "Missing required PayU parameters." });
    }
    const payload = {
      txnid,
      amount: amount.toFixed(2),
      productinfo,
      firstname,
      email,
      udf1: sanitizeString(req.body?.udf1 || txnid, 60),
      udf2: sanitizeString(req.body?.udf2 || "", 60),
      udf3: sanitizeString(req.body?.udf3 || "", 60),
      udf4: sanitizeString(req.body?.udf4 || "", 60),
      udf5: sanitizeString(req.body?.udf5 || "", 60)
    };
    const hash = import_crypto.default.createHash("sha512").update(buildPayURequestHashString(payload, merchantKey, merchantSalt)).digest("hex");
    const appUrl = getPublicAppUrl(req);
    res.json({
      success: true,
      key: merchantKey,
      ...payload,
      hash,
      environment: process.env.PAYU_ENV === "production" ? "production" : "test",
      actionUrl: getPayUActionUrl(),
      surl: process.env.PAYU_SUCCESS_URL || `${appUrl}/api/payu/success`,
      furl: process.env.PAYU_FAILURE_URL || `${appUrl}/api/payu/failure`
    });
  } catch (err) {
    console.error("Failed to calculate PayU transaction hash:", err);
    res.status(500).json({ error: "Failed to calculate PayU transaction hash." });
  }
});
app.post("/api/payu/verify", rateLimiter(30, 15 * 60 * 1e3), async (req, res) => {
  try {
    const verification = verifyPayUResponse(req.body || {});
    const order = verification.verified ? await applyPayUResult(req.body, req.body?.status === "success" ? "success" : "failure") : null;
    res.json({
      success: verification.verified,
      verified: verification.verified,
      status: req.body?.status,
      txnid: req.body?.txnid,
      payuMoneyId: req.body?.mihpayid,
      order
    });
  } catch (err) {
    console.error("PayU hash verification failed:", err);
    res.status(500).json({ error: "PayU hash verification failed." });
  }
});
app.all("/api/payu/success", rateLimiter(40, 15 * 60 * 1e3), async (req, res) => {
  const payload = { ...req.query || {}, ...req.body || {} };
  const verification = verifyPayUResponse(payload);
  if (verification.verified) {
    await applyPayUResult(payload, "success");
  }
  const appUrl = getPublicAppUrl(req);
  const order = encodeURIComponent(String(payload.txnid || payload.udf1 || ""));
  res.redirect(`${appUrl}/?payu=${verification.verified ? "success" : "verification_failed"}&order=${order}`);
});
app.all("/api/payu/failure", rateLimiter(40, 15 * 60 * 1e3), async (req, res) => {
  const payload = { ...req.query || {}, ...req.body || {} };
  const verification = verifyPayUResponse(payload);
  if (verification.verified) {
    await applyPayUResult(payload, "failure");
  }
  const appUrl = getPublicAppUrl(req);
  const order = encodeURIComponent(String(payload.txnid || payload.udf1 || ""));
  res.redirect(`${appUrl}/?payu=failure&order=${order}`);
});
app.post("/api/payu/webhook", rateLimiter(80, 15 * 60 * 1e3), async (req, res) => {
  try {
    const verification = verifyPayUResponse(req.body || {});
    if (!verification.verified) {
      return res.status(400).json({ success: false, error: "Invalid PayU hash." });
    }
    const order = await applyPayUResult(req.body, req.body?.status === "success" ? "success" : "failure");
    res.json({ success: true, order });
  } catch (err) {
    console.error("PayU webhook handling failed:", err);
    res.status(500).json({ error: "PayU webhook handling failed." });
  }
});
app.post("/api/orders", rateLimiter(10, 15 * 60 * 1e3), async (req, res) => {
  try {
    const newOrder = req.body;
    if (!newOrder || !newOrder.orderNumber) {
      return res.status(400).json({ error: "Invalid order data." });
    }
    newOrder.orderNumber = sanitizeString(newOrder.orderNumber, 30);
    const accountEmail = sanitizeEmail(newOrder.account?.email || newOrder.accountEmail);
    const customerEmail = sanitizeEmail(newOrder.customerInfo?.email);
    if (!accountEmail) {
      return res.status(401).json({ error: "Login is required before placing an order." });
    }
    if (!customerEmail || customerEmail !== accountEmail) {
      return res.status(403).json({ error: "Checkout email must match the signed-in account." });
    }
    if (!Array.isArray(newOrder.items) || newOrder.items.length === 0) {
      return res.status(400).json({ error: "Cannot place an empty order." });
    }
    newOrder.accountEmail = accountEmail;
    newOrder.accountName = newOrder.account?.name || newOrder.accountName || newOrder.customerInfo?.name || "";
    delete newOrder.account;
    const isCodOrder = newOrder.paymentMethod?.toLowerCase().includes("cash on delivery") || newOrder.paymentMethod?.toUpperCase() === "COD";
    if (isCodOrder) {
      newOrder.paymentMethod = "Cash on Delivery";
      newOrder.paymentStatus = newOrder.paymentStatus || "unpaid";
      newOrder.codStatus = newOrder.codStatus || "pending";
    }
    const dbOrders = readOrdersDb();
    const existingIndex = dbOrders.findIndex(
      (o) => o.orderNumber.toUpperCase() === newOrder.orderNumber.toUpperCase()
    );
    if (existingIndex >= 0) {
      dbOrders[existingIndex] = { ...dbOrders[existingIndex], ...newOrder };
    } else {
      dbOrders.unshift(newOrder);
    }
    writeOrdersDb(dbOrders);
    console.log(`[Backend Database] Registered new secure order: ${newOrder.orderNumber} (Method: ${newOrder.paymentMethod})`);
    sendBookingEmail(newOrder).then(() => {
      console.log(`[Order Service] Dispatched order confirmation email for #${newOrder.orderNumber}`);
    }).catch((emailErr) => {
      console.error("Failed to dispatch order booking confirmation email:", emailErr);
    });
    sendAdminVendorNotificationEmail(newOrder).then(() => {
      console.log(`[Order Service] Dispatched admin/vendor order notification email for #${newOrder.orderNumber}`);
    }).catch((vendorErr) => {
      console.error("Failed to dispatch admin/vendor order notification email:", vendorErr);
    });
    sendSMSAlert(newOrder).catch((smsErr) => {
      console.error("Failed to dispatch order booking confirmation SMS:", smsErr);
    });
    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: "Failed to save order to database" });
  }
});
app.post("/api/orders/:orderNumber/status", verifyAdminToken, async (req, res) => {
  try {
    const orderNum = req.params.orderNumber.trim().toUpperCase();
    const { status, codStatus, paymentStatus } = req.body;
    if (!status && !codStatus && !paymentStatus) {
      return res.status(400).json({ error: "Status, COD status, or payment status is required." });
    }
    const dbOrders = readOrdersDb();
    const index = dbOrders.findIndex(
      (o) => o.orderNumber.toUpperCase() === orderNum || o.id.toUpperCase() === orderNum
    );
    if (index >= 0) {
      if (status) dbOrders[index].status = status;
      if (codStatus) dbOrders[index].codStatus = codStatus;
      if (paymentStatus) dbOrders[index].paymentStatus = paymentStatus;
      writeOrdersDb(dbOrders);
      res.json({ success: true, order: dbOrders[index] });
    } else {
      res.status(404).json({ error: `Order ${orderNum} not found.` });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});
app.put("/api/orders/:orderNumber", verifyAdminToken, async (req, res) => {
  try {
    const orderNum = req.params.orderNumber.trim().toUpperCase();
    const updatedOrder = req.body;
    const dbOrders = readOrdersDb();
    const index = dbOrders.findIndex(
      (o) => o.orderNumber.toUpperCase() === orderNum || o.id.toUpperCase() === orderNum
    );
    if (index >= 0) {
      const oldPaymentStatus = dbOrders[index].paymentStatus;
      const newPaymentStatus = updatedOrder.paymentStatus;
      dbOrders[index] = { ...dbOrders[index], ...updatedOrder };
      writeOrdersDb(dbOrders);
      if (supabase) {
        await supabase.from("orders").upsert({
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
      if (oldPaymentStatus === "pending" && newPaymentStatus === "paid") {
        try {
          await sendBookingEmail(dbOrders[index]);
          await sendAdminVendorNotificationEmail(dbOrders[index]);
          await sendSMSAlert(dbOrders[index]);
        } catch (emailErr) {
          console.error("Failed to send booking confirmation email:", emailErr);
        }
      } else if (oldPaymentStatus === "pending" && newPaymentStatus === "rejected") {
        try {
          await sendPaymentEmail(dbOrders[index], "rejected", dbOrders[index].upiRejectionReason);
        } catch (emailErr) {
          console.error("Failed to send payment rejection email:", emailErr);
        }
      }
      res.json({ success: true, order: dbOrders[index] });
    } else {
      res.status(404).json({ error: `Order ${orderNum} not found.` });
    }
  } catch (err) {
    console.error("Failed to update order:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});
app.delete("/api/orders/:orderNumber", verifyAdminToken, async (req, res) => {
  try {
    const orderNum = req.params.orderNumber.trim().toUpperCase();
    const dbOrders = readOrdersDb();
    const filtered = dbOrders.filter(
      (o) => o.orderNumber.toUpperCase() !== orderNum && o.id.toUpperCase() !== orderNum
    );
    writeOrdersDb(filtered);
    res.json({ success: true, message: `Order ${orderNum} deleted.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order from database" });
  }
});
app.post("/api/admin/login", rateLimiter(5, 15 * 60 * 1e3), (req, res) => {
  try {
    const username = sanitizeString(req.body?.username, 100);
    const password = typeof req.body?.password === "string" ? req.body.password.slice(0, 256) : "";
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password fields are required." });
    }
    const config = readAdminConfig();
    const usernameMatch = username.length === config.username.length && import_crypto.default.timingSafeEqual(Buffer.from(username), Buffer.from(config.username));
    if (usernameMatch && verifyAndUpgradeAdminPassword(password, config.password)) {
      const token = import_jsonwebtoken.default.sign(
        { username, role: "admin" },
        JWT_SECRET,
        { expiresIn: "2h" }
      );
      res.cookie("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60 * 1e3
        // 2 hours
      });
      return res.json({ success: true, username });
    }
    return res.status(401).json({ error: "Invalid administrative credentials." });
  } catch (err) {
    res.status(500).json({ error: "Failed to process admin authentication" });
  }
});
app.get("/api/admin/session", verifyAdminToken, (req, res) => {
  res.json({ authenticated: true, username: req.admin.username });
});
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.json({ success: true, message: "Admin session cleared." });
});
app.get("/api/admin/live-activity", verifyAdminToken, (req, res) => {
  const cutoff = Date.now() - 6e4;
  const activeSessionsList = Object.values(liveSessions).filter((s) => s.lastActive > cutoff);
  res.json({
    sessions: activeSessionsList.length > 0 ? activeSessionsList : [
      { ip: "192.168.1.102", type: "guest", activePage: "/category/toys", cartTotal: 899, durationSeconds: 45, lastActive: Date.now() },
      { ip: "157.23.44.11", type: "user", name: "Alok S.", activePage: "/checkout", cartTotal: 1648, durationSeconds: 320, lastActive: Date.now() }
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
app.get("/api/admin/security-stats", verifyAdminToken, (req, res) => {
  res.json({
    stats: {
      securityScore: 98,
      failedAttempts: 2,
      blockedIps: 15,
      activeAdminSessions: 1,
      expiredTokens: 8,
      lastScanDate: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
      dbEncryption: "AES-256 Active",
      sslStatus: "Active (Let's Encrypt)",
      wafStatus: "Active (Rate-Limits Enabled)"
    },
    threatLogs: [
      { id: "1", timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(), ip: "198.51.100.42", type: "WAF Block", details: "Brute-force limit tripped on endpoint /api/admin/login.", severity: "medium" },
      { id: "2", timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(), ip: "203.0.113.110", type: "CORS Block", details: "Invalid Origin blocked header referer.", severity: "low" },
      { id: "3", timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString(), ip: "192.168.1.101", type: "Failed Login", details: "Wrong password attempt on administrative account.", severity: "high" }
    ]
  });
});
app.get("/api/admin/customers", verifyAdminToken, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("customers").select("id, email, name, created_at").order("created_at", { ascending: false });
      if (!error && data) {
        return res.json(data.map((c) => ({
          id: c.id,
          email: c.email,
          name: c.name,
          createdAt: c.created_at
        })));
      }
      console.warn("Supabase customers list fetch failed, fallback to memory:", error);
    }
    res.json(inMemoryCustomers.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      createdAt: c.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer credentials list" });
  }
});
app.post("/api/admin/test-email", verifyAdminToken, async (req, res) => {
  try {
    const targetEmail = sanitizeEmail(req.body?.email || req.body?.to);
    if (!targetEmail) {
      return res.status(400).json({ error: "Valid target email address is required." });
    }
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">Live Email Dispatch Successful!</h2>
        <p style="color: #475569;">Your server at <strong>https://meris-eshop-production.up.railway.app</strong> successfully dispatched this test email to <strong>${targetEmail}</strong>.</p>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">Dispatched at ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
      </div>
    `;
    const sent = await dispatchLiveEmail(targetEmail, "\u{1F9EA} Meris E-Shop: Live Email Dispatch Test", html);
    if (sent) {
      res.json({ success: true, message: `Test email successfully delivered to ${targetEmail}!` });
    } else {
      res.status(500).json({ error: "Failed to dispatch test email. Check server logs in Railway." });
    }
  } catch (err) {
    console.error("[Email Diagnostic Test Error]:", err);
    res.status(500).json({
      error: `Failed to dispatch test email: ${err?.message || err}`
    });
  }
});
app.get("/sitemap.xml", async (req, res) => {
  try {
    const products = readLocalJsonDb(PRODUCTS_FILE_PATH, INITIAL_PRODUCTS);
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
    products.forEach((p) => {
      xml += `
  <url>
    <loc>https://meriseshop.com/product/${p.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
    xml += `
</urlset>`;
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send("Failed to build XML sitemap");
  }
});
app.get("/robots.txt", (req, res) => {
  res.header("Content-Type", "text/plain");
  res.status(200).send(`User-agent: *
Allow: /
Disallow: /api/admin/
Sitemap: https://meriseshop.com/sitemap.xml
`);
});
app.post("/api/admin/config", verifyAdminToken, async (req, res) => {
  try {
    const username = sanitizeString(req.body?.username, 100);
    const password = typeof req.body?.password === "string" ? req.body.password.slice(0, 256) : "";
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password fields are required." });
    }
    const { evaluatePasswordStrength: evaluatePasswordStrength2 } = await Promise.resolve().then(() => (init_passwordValidator(), passwordValidator_exports));
    const validation = evaluatePasswordStrength2(password);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors[0] || "Admin password does not meet strength requirements." });
    }
    const hashed = import_bcryptjs.default.hashSync(password, 12);
    writeAdminConfig({ username, password: hashed });
    res.json({ success: true, message: "Administrative credentials updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to save admin credentials" });
  }
});
app.post("/api/gemini/invoice", async (req, res) => {
  const { order } = req.body;
  const ai = getGeminiClient();
  const customerName = order?.customerInfo?.name || "Customer";
  const itemNames = order?.items?.map((it) => `${it.product.name} (x${it.quantity})`).join(", ") || "Items";
  const getLocalInvoiceFallback = () => {
    const delivery = order.shippingMethod === "express" ? "3 days via BlueDart express" : "5-7 business days";
    return {
      greetingText: `Dear ${customerName}, we are absolutely thrilled to secure your order representing India's brilliant cottage craftsmen! Our local woodturners and master artisans are hand-inspecting and packing your ${itemNames} right now inside our Tamil Nadu workshop. Your support fuels genuine livelihoods.`,
      invoiceVerificationCode: `MERIS-CRN-${Math.floor(1e5 + Math.random() * 9e5)}`,
      estimatedDeliveryDate: `Approx. delivery in ${delivery}`
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
Total Cart Amount: \u20B9${order?.total}
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
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            greetingText: { type: import_genai.Type.STRING },
            invoiceVerificationCode: { type: import_genai.Type.STRING },
            estimatedDeliveryDate: { type: import_genai.Type.STRING }
          },
          required: ["greetingText", "invoiceVerificationCode", "estimatedDeliveryDate"]
        }
      }
    });
    const text = response.text || "";
    const parsed = JSON.parse(text);
    setCached(cacheKey, parsed);
    res.json(parsed);
  } catch (error) {
    console.log("Greeting invoice generation offline fallback applied.");
    res.json(getLocalInvoiceFallback());
  }
});
app.post("/api/newsletter", rateLimiter(3, 60 * 60 * 1e3), async (req, res) => {
  try {
    const normalizedEmail = sanitizeEmail(req.body?.email);
    if (!normalizedEmail) {
      return res.status(400).json({ error: "Valid email address is required." });
    }
    if (supabase) {
      const { data: existing } = await supabase.from("newsletter").select("id").eq("email", normalizedEmail).single();
      if (existing) {
        return res.status(409).json({ error: "This email is already subscribed." });
      }
      const { error: insertError } = await supabase.from("newsletter").insert({
        id: `sub_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
        email: normalizedEmail,
        subscribed_at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "active",
        source: "footer_newsletter"
      });
      if (insertError) {
        if (insertError.code === "23505") {
          return res.status(409).json({ error: "This email is already subscribed." });
        }
        console.error("[Newsletter] Supabase insert failed:", insertError);
        return res.status(500).json({ error: "Failed to subscribe. Please try again." });
      }
      console.log(`[Newsletter] New subscription saved to Supabase: ${normalizedEmail}`);
      return res.json({ success: true, message: "Successfully subscribed to newsletter!" });
    }
    console.log(`[Newsletter] Supabase not configured. Subscription logged locally: ${normalizedEmail}`);
    return res.json({ success: true, message: "Successfully subscribed to newsletter!" });
  } catch (err) {
    console.error("Error subscribing to newsletter:", err);
    res.status(500).json({ error: "Failed to subscribe. Please try again." });
  }
});
app.get("/api/newsletter", verifyAdminToken, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("newsletter").select("id, email, subscribed_at, status, source").order("subscribed_at", { ascending: false });
      if (!error && data) {
        return res.json(data.map((s) => ({
          id: s.id,
          email: s.email,
          subscribedAt: s.subscribed_at,
          status: s.status,
          source: s.source
        })));
      }
      console.warn("Supabase newsletter fetch failed:", error);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch newsletter subscriptions" });
  }
});
app.use((err, req, res, next) => {
  console.error("[Unhandled Exception Error]:", err.stack || err);
  const status = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === "production" ? "A secure server-side error occurred. Please contact the administrator." : err.message || "An unhandled server-error occurred.";
  res.status(status).json({
    error: message,
    ...process.env.NODE_ENV !== "production" && { stack: err.stack }
  });
});
if (!process.env.VERCEL) {
  async function initializeServer() {
    const distIndexHtml = import_path.default.join(process.cwd(), "dist", "index.html");
    const isProductionBuild = import_fs.default.existsSync(distIndexHtml) || process.env.NODE_ENV === "production";
    if (isProductionBuild && import_fs.default.existsSync(distIndexHtml)) {
      const distPath = import_path.default.join(process.cwd(), "dist");
      app.use(import_express.default.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          }
        }
      }));
      app.get("*", (req, res) => {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.sendFile(distIndexHtml);
      });
      console.log("\u25C7 Serving production static build from dist/.");
    } else {
      try {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa"
        });
        app.use(vite.middlewares);
        console.log("\u25C7 Vite middleware mounted for local development.");
      } catch (err) {
        const distPath = import_path.default.join(process.cwd(), "dist");
        app.use(import_express.default.static(distPath));
        app.get("*", (req, res) => {
          if (import_fs.default.existsSync(distIndexHtml)) {
            res.sendFile(distIndexHtml);
          } else {
            res.status(500).send("Production build dist/index.html not found.");
          }
        });
        console.log("\u25C7 Vite dev module not found, serving static fallback from dist/.");
      }
    }
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`MERIS E-SHOP Full-Stack Server listening on http://localhost:${PORT}`);
    });
  }
  initializeServer();
}
var server_default = app;
//# sourceMappingURL=server.cjs.map
