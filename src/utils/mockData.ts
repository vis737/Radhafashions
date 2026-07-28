import { Product, Coupon, BannerCampaign, CMSConfig, Order, ActivityLog } from '../types';

export const CATEGORIES = [
  { id: 'toys', name: 'Kids Toys', description: 'Cute rotating pandas, dancing cacti, wind-up octopuses, projection flashlights & toys.', imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80' },
  { id: 'wood-gifts', name: 'Wood Crafted Gifts', description: 'Traditional handcrafted wooden miniature instruments (Veenas, drums) & art pieces.', imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80' },
  { id: 'handbags', name: 'Handbags & Clutches', description: 'Handwoven plastic wire basket bags, jute gift bags & embroidered peacock clutches.', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80' },
  { id: 'learning', name: 'Learning Stuff', description: 'Wooden alphabet block puzzles, shape sorting trays & Montessori learning boards.', imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80' },
  { id: 'home', name: 'Home Organizers', description: 'Stick-figure wall shelves, utility adhesive hooks & phone charging wall holders.', imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80' },
  { id: 'kolam', name: 'Kolam Stencils', description: 'Round red felt stencils for tracing traditional white geometric & mandala patterns.', imageUrl: 'https://images.unsplash.com/photo-1608976451610-ad2ee3c37b0f?w=800&auto=format&fit=crop&q=80' },
  { id: 'stationeries', name: 'Novelty Stationeries', description: 'Camera pencil sharpeners, spiro scales, cartoon erasers & ice cream highlighters.', imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80' },
  { id: 'entertainment', name: 'Entertainment & Novelties', description: 'Laser key rings, novelty stethoscope toys, shock chewing gums & car bird decor.', imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80' },
  { id: 'bottles', name: 'Return Gift Bottles', description: 'Pastel rabbit vacuum flasks, penguin bottles & stainless steel jar tumblers.', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80' },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- KIDS TOYS ---
  {
    id: 'toy-1',
    sku: 'TOY-WD-STACK',
    name: 'Handcrafted Wooden Stacking Ring Tower',
    category: 'Kids Toys',
    categorySlug: 'toys',
    price: 899,
    discountPrice: 749,
    stock: 25,
    rating: 4.8,
    ratingCount: 124,
    images: [
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Organic wooden rings coated in safe herbal-dyed colors, supporting early sensory development.',
    description: 'This elegant Stacking Ring Tower is crafted from native beechwood and finished with food-grade seed oils and natural pigments. Non-toxic, fully hand-rounded, and exceptionally smooth for tender hands. It supports hand-eye coordination, size sorting, and visual acuity.',
    specifications: {
      'Material': 'Sustainably sourced Beechwood',
      'Age Recommendation': '12+ months',
      'Dimensions': '18 x 9 x 9 cm',
      'Weight': '320g',
      'Coating': 'Natural plant-extract pigments'
    },
    reviews: [
      { id: 'r-1', author: 'Anita S.', rating: 5, comment: 'Simply gorgeous! The wood is so smooth and there is no paint smell at all.', date: '2026-05-12', approved: true },
      { id: 'r-2', author: 'Dev K.', rating: 4, comment: 'Excellent organic toy. My 1-year-old is fully obsessed with the golden cap ring.', date: '2026-06-02', approved: true }
    ],
    isBestseller: true,
    isNew: false,
    brand: 'Meris Kids',
    availability: 'in-stock',
    minimumAge: 1,
    maximumAge: 2,
    ageGroup: '1-2 Years',
    skillType: 'Motor Skills',
    educationalType: 'Montessori'
  },
  {
    id: 'toy-2',
    sku: 'TOY-CR-BUNNY',
    name: 'Meris Hand-Knit Crochet Cotton Bunny',
    category: 'Kids Toys',
    categorySlug: 'toys',
    price: 1199,
    discountPrice: 999,
    stock: 8,
    rating: 4.9,
    ratingCount: 62,
    images: [
      'https://images.unsplash.com/photo-1559251606-c623743a6d76?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Lovingly hand-knitted snuggle companion made with 100% hypoallergenic combed cotton.',
    description: 'A masterpiece of local crochet craftsmanship. This soft snuggle bunny is knitted entirely by skilled rural artisans using organic cotton treads. Features secure safety eyes and hypoallergenic plush stuffing. Perfect as a baby shower return gift or bedtime companion.',
    specifications: {
      'Material': '100% Organic Indigo Yarn',
      'Filling': 'Hypoallergenic Recycled Plush Polyfill',
      'Height': '28 cm',
      'Wash Care': 'Gentle hand wash inside net pouch'
    },
    reviews: [
      { id: 'r-3', author: 'Priyanka R.', rating: 5, comment: 'Unbelievable quality. The stitches are extremely uniform. Highly recommend for infants.', date: '2026-04-18', approved: true }
    ],
    isNew: true,
    brand: 'Meris Handwoven',
    availability: 'low-stock',
    minimumAge: 0,
    maximumAge: 0.5,
    ageGroup: '0-6 Months',
    skillType: 'Creative Learning',
    educationalType: 'Eco Friendly'
  },

  // --- WOOD CRAFTED GIFTS ---
  {
    id: 'wood-1',
    sku: 'WD-BOX-ENGRAVED',
    name: 'Imperial Floral-Carved Wooden Keepsake Box',
    category: 'Wood Crafted Gifts',
    categorySlug: 'wood-gifts',
    price: 1890,
    discountPrice: 1599,
    stock: 12,
    rating: 4.7,
    ratingCount: 88,
    images: [
      'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Delicate hand-engraved wooden jewelry chest crafted in block rosewood with premium gold hinges.',
    description: 'An elegant addition to any vanity. Heavily inspired by conventional architecture, this storage and organizer box displays detailed floral motifs etched meticulously by expert carvers. The inside is cushioned in plush velvet fabric, providing outstanding protection for keys or jewelry.',
    specifications: {
      'Timber Type': 'Indian Rosewood (Sheesham)',
      'Hardware': 'Antique Solid Brass Latches & Hinges',
      'Dimensions': '20 x 12 x 8 cm',
      'Lining': 'Crimson Premium Velvet interior'
    },
    reviews: [
      { id: 'r-4', author: 'Vikram J.', rating: 5, comment: 'Outstanding craftsmanship. Smells exactly like real sweet rosewood.', date: '2026-05-30', approved: true }
    ],
    isBestseller: true,
    brand: 'Meris Artisanal',
    availability: 'in-stock'
  },
  {
    id: 'wood-2',
    sku: 'WD-SHELF-GEO',
    name: 'Geometric Hexagonal Floating Timber Shelves',
    category: 'Wood Crafted Gifts',
    categorySlug: 'wood-gifts',
    price: 2499,
    discountPrice: 1999,
    stock: 4,
    rating: 4.6,
    ratingCount: 35,
    images: [
      'https://images.unsplash.com/photo-1532372320978-9b4d8a3a0245?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Set of 3 interlocking luxury pine-wood bookshelves with natural oiled varnish finishes.',
    description: 'Add depth to your home with these majestic modern honeycomb shelves. Precisely cut pine wood planks locked at precise angles. Lightweight yet durable enough to display small pots, candles, or souvenir clocks.',
    specifications: {
      'Wood Type': 'Radiata White Pine',
      'Finish': 'Satin matte heatproof sealant',
      'Weight Capacity': 'Up to 5 kg per bracket',
      'Mounting Hardware': 'Concealed metal brackets included'
    },
    reviews: [],
    isNew: true,
    brand: 'Meris Space',
    availability: 'low-stock'
  },

  // --- HANDBAGS ---
  {
    id: 'bag-1',
    sku: 'BG-SADDLE-TAN',
    name: 'Serena Minimalist Vegan Saddle Tote',
    category: 'Handbags',
    categorySlug: 'handbags',
    price: 3290,
    discountPrice: 2490,
    stock: 15,
    rating: 4.8,
    ratingCount: 150,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Structured top-tier synthetic leather handbag in tan finish, with gold-accent magnet buckles.',
    description: 'Upgrade your morning commute with our best-selling saddle shoulder container. Crafted from durable weather-resistant vegan polyurethane leather with exquisite top stitching. The dual interior chamber is extremely spacious, easily housing your tablet, cosmetic bags, and everyday carry essentials.',
    specifications: {
      'Outer Cover': 'Ultra-soft Eco-polyurethane leather',
      'Inner Liners': 'Recycled linen-sateen canvas',
      'Metal Accents': '18k Gold plated premium electro-lacquered alloy',
      'Strap Type': 'Adjustable belt-style harness'
    },
    reviews: [
      { id: 'r-5', author: 'Ridhima M.', rating: 5, comment: 'The golden clasps look so incredibly luxury! Stitching is super clean.', date: '2026-06-10', approved: true }
    ],
    isBestseller: true,
    brand: 'Meris Couture',
    availability: 'in-stock'
  },
  {
    id: 'bag-2',
    sku: 'BG-EMB-CLUTCH',
    name: 'Royal Heritage Golden-Zardozi Evening Clutch',
    category: 'Handbags',
    categorySlug: 'handbags',
    price: 1999,
    discountPrice: 1699,
    stock: 0,
    rating: 4.9,
    ratingCount: 41,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Velvety dark clutch bag with handwoven metallic bullion thread vine pattern and chain strap.',
    description: 'An outstanding luxury clutch ideal for festive weddings and elegant dinners. Intricately embellished with golden beads and coiled wire work known as Zardozi. Emits a stellar glistening reflect under dim evening lights.',
    specifications: {
      'Base Fabric': 'Silk Blend Deep Navy Velvet',
      'Embroidery': 'Artisan Handloom bullion metallic gold thread',
      'Closure': 'Secure golden magnetic lock',
      'Chain Strap': 'Removable vintage gold-link chain (110cm)'
    },
    reviews: [
      { id: 'r-6', author: 'Sonal C.', rating: 5, comment: 'Pure luxury! Took this to a family wedding and got continuous praise.', date: '2026-05-18', approved: true }
    ],
    isNew: true,
    brand: 'Meris Heritage',
    availability: 'out-of-stock'
  },

  // --- LEARNING STUFF ---
  {
    id: 'learn-1',
    sku: 'LN-ABACUS-PST',
    name: 'Pastel Decimal Wooden Abacus Toy',
    category: 'Learning Stuff',
    categorySlug: 'learning',
    price: 1250,
    discountPrice: 999,
    stock: 14,
    rating: 4.7,
    ratingCount: 49,
    images: [
      'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Classic math tutor abacus with 10 rows of colorful child-safe rounded timber sliders.',
    description: 'An educational tool designed to introduce basic counting, addition, and division. Crafted beautifully from light-colored beech wood with smooth non-splinter dowels. Finished in lovely pastel tones, blending harmoniously into modern nurseries.',
    specifications: {
      'Base Frame': 'Light Birch Solid Wood',
      'Beads': 'Rounded maple wood sliding units (100 total)',
      'Dimensions': '24 x 21 x 6 cm',
      'Skill Focus': 'Early math concept and motor precision'
    },
    reviews: [],
    brand: 'Meris Kids',
    availability: 'in-stock'
  },

  // --- HOME GIFTS ---
  {
    id: 'home-1',
    sku: 'HM-CANDLE-SOY',
    name: 'Symphony Organic Lavender Scented Soy Candle',
    category: 'Home Gifts',
    categorySlug: 'home',
    price: 699,
    discountPrice: 599,
    stock: 45,
    rating: 4.8,
    ratingCount: 210,
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Pure hand-poured soy wax core mixed with organic French lavender oils, inside a ceramic jar.',
    description: 'Bring absolute serenity to your relaxation spaces. The Symphony Candle uses 100% natural hydrogenated soy bean wax, burning cleanly for over 45 hours without leaving any smoke residue. Formulated with premium plant extracts to induce calm sleep.',
    specifications: {
      'Wax': '100% Eco-friendly Organic Soy Wax',
      'Wick': 'Crackling wooden wick plate',
      'Burn Lifetime': '45+ clean burning hours',
      'Container': 'Terracotta ceramic reuseable tumled jar'
    },
    reviews: [
      { id: 'r-7', author: 'Ritu V.', rating: 5, comment: 'Best lavender candle ever! The crackle sound from the wooden wick is incredibly calming.', date: '2026-06-05', approved: true }
    ],
    isBestseller: true,
    brand: 'Meris Botanics',
    availability: 'in-stock'
  },
  {
    id: 'home-2',
    sku: 'HM-MUG-CERAMIC',
    name: 'Artisanal Studio Speckled Ripple Mug',
    category: 'Home Gifts',
    categorySlug: 'home',
    price: 549,
    discountPrice: 449,
    stock: 30,
    rating: 4.5,
    ratingCount: 142,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Stony clay ceramic Mug finished with a double-glazed speckled oatmeal and gold-rim effect.',
    description: 'Each mug is single-thrown by hand on a potters wheel, rendering a completely unique swirling pattern and raw feel. Holds up to 350ml of your favorite fresh coffee filter brews. Double-fired to support heavy microwave use safely.',
    specifications: {
      'Production': 'Hand-thrown studio stoneware clay',
      'Volume Capacity': '350 ml',
      'Safety': 'Dishwasher and Microwave certified safe',
      'Glazing Coating': 'Lead-free food-compliant silica glaze'
    },
    reviews: [],
    brand: 'Meris Ceramics',
    availability: 'in-stock'
  },

  // --- KOLAM STENCILS ---
  {
    id: 'kolam-1',
    sku: 'KL-ST-LOTUS',
    name: 'Bespoke Golden Lotus Border Acrylic Kolam Stencil',
    category: 'Kolam Stencils',
    categorySlug: 'kolam',
    price: 499,
    discountPrice: 399,
    stock: 22,
    rating: 4.8,
    ratingCount: 115,
    images: [
      'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Premium 3mm acrylic grid design stencil panel for swift, clean floral floor rangoli trails.',
    description: 'Bring divine luck to your front entrance door with this highly modular laser-etched Kolam stenciler. Simply set the platter on the floor, sprinkle white chalk powder, and lift to reveal highly detailed traditional geometric lotus lines. Highly reusable and easily washed.',
    specifications: {
      'Material': 'Military-Grade Shatterproof Acrylic',
      'Stencil Design': 'Sacred Golden Mandala Lotus grid',
      'Thickness': '3.0 mm',
      'Dimensions': '30 x 30 cm circular plate'
    },
    reviews: [
      { id: 'r-8', author: 'Meenakshi N.', rating: 5, comment: 'So quick and flawless. Making morning entryway rangolis takes under 2 minutes now! Gold acrylic looks beautiful.', date: '2026-06-11', approved: true }
    ],
    isBestseller: true,
    brand: 'Meris festive',
    availability: 'in-stock'
  },

  // --- STATIONERIES ---
  {
    id: 'stat-1',
    sku: 'ST-JRN-LINEN',
    name: 'Gold-Foil Archival Linen-Bound Journal',
    category: 'Stationeries',
    categorySlug: 'stationeries',
    price: 999,
    discountPrice: 849,
    stock: 40,
    rating: 4.9,
    ratingCount: 95,
    images: [
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Exquisitely bound fabric notebook with 160 pages of ink-proof thick cream cartridge paper.',
    description: 'Designed for thoughts that deserve to endure. Featuring heavy organic flax linen bookcloth and gilded leaf gold borders. The 120GSM acid-free leaves accommodate rollerball pens and heavy fountain pen calligraphy beautifully without bleed-through.',
    specifications: {
      'Paper Type': '120 GSM Acid-Free Archival cream lines',
      'Page Count': '160 ruled journal pages',
      'Binding': 'Lie-flat stitched Smyth Sewn',
      'Accents': 'Luxury hot-stamped gold foil text cover'
    },
    reviews: [
      { id: 'r-9', author: 'Karandeep S.', rating: 5, comment: 'The paper is incredibly lush. My wet ink fountain pens glide on it like glass.', date: '2026-06-13', approved: true }
    ],
    isNew: false,
    isBestseller: true,
    brand: 'Meris Script',
    availability: 'in-stock'
  },
  {
    id: 'stat-2',
    sku: 'ST-PEN-BRASS',
    name: 'Raw Sovereign Solid Brass Mechanical Pen',
    category: 'Stationeries',
    categorySlug: 'stationeries',
    price: 1499,
    discountPrice: 1199,
    stock: 5,
    rating: 4.6,
    ratingCount: 30,
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Hefty, perfectly balanced writing companion machined from premium lead-free hexagonal brass rods.',
    description: 'An object of extreme luxury weight. This drafting and writing tool is milled from solid hexagonal brass. Develops a gorgeous antique patina over months of personal usage. Includes a premium smooth German-engineered ballpoint ink cartridge.',
    specifications: {
      'Metal Core': '100% Solid Industrial Hex Brass',
      'Weight': '42g (perfectly balanced offset)',
      'Ink Cartridge': 'Schmidt EasyFlow 9000 Black (inclusive)',
      'Mechanism': 'Precision silent spring lock action'
    },
    reviews: [],
    isNew: true,
    brand: 'Meris Script',
    availability: 'low-stock'
  },

  // --- ENTERTAINMENT PRODUCTS ---
  {
    id: 'ent-1',
    sku: 'EN-CH-WOOD',
    name: 'Mahogany & Maple Handcarved Chess Board',
    category: 'Entertainment Products',
    categorySlug: 'entertainment',
    price: 4999,
    discountPrice: 4299,
    stock: 3,
    rating: 4.9,
    ratingCount: 18,
    images: [
      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Stately 14-inch solid wood checkers and chess console with velvet interior slots for pieces.',
    description: 'Crafted with absolute tournament precision. Each chessman is carved individually by hand, and weighted in velvet bases for solid tactile response. The dual-hinged body folds into a sturdy felt-divided storage chest.',
    specifications: {
      'Light Wood Blocks': 'Natural Hard Sugar Maple',
      'Dark Wood Blocks': 'Warm Indonesian Mahogany',
      'Dimensions': '36 x 36 cm fully open',
      'King Height': '3.25 inches (7.6 cm)'
    },
    reviews: [
      { id: 'r-10', author: 'Aditya G.', rating: 5, comment: 'Phenomenal piece. This is heirloom quality. The weights of the knights feel so solid.', date: '2026-05-25', approved: true }
    ],
    isNew: true,
    brand: 'Meris Heritage',
    availability: 'low-stock'
  },

  // --- RETURN GIFT BOTTLES ---
  {
    id: 'btl-1',
    sku: 'BT-COPPER-INF',
    name: 'Sovereign Ayurvedic Pure Hammered Copper Bottle',
    category: 'Return Gift Bottles',
    categorySlug: 'bottles',
    price: 1399,
    discountPrice: 1199,
    stock: 20,
    rating: 4.7,
    ratingCount: 55,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Sleek 950ml leakproof copper canister styled with micro-hammered indent decorations.',
    description: 'Encourage holistic hydration with this stunning copper water storage flask, designed to naturally detoxify and alkaline water. Hand-beaten detailing creates a premium golden sparkle and outstanding tactile grip. Wrapped in eco-friendly protective packaging.',
    specifications: {
      'Material': '99.9% Pure Food-Grade Copper',
      'Volume': '950 ml',
      'Cap': 'Threaded air-tight brass cap with silicone gasket',
      'Design': 'Traditional hand-hammered finish'
    },
    reviews: [],
    brand: 'Meris Wellness',
    availability: 'in-stock'
  },
  {
    id: 'toy-3',
    sku: 'TOY-WD-ELEPHANT',
    name: 'Herbal-Dyed Wooden Push-Along Elephant Toy',
    category: 'Kids Toys',
    categorySlug: 'toys',
    price: 950,
    discountPrice: 799,
    stock: 15,
    rating: 4.8,
    ratingCount: 43,
    images: [
      'https://images.unsplash.com/photo-1532330393533-443990a51d10?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Charming organic push-along toy elephant with smooth rolling wheels and non-toxic herbal coatings.',
    description: 'A beautiful heirloom toy designed to stimulate early motor precision and toddlers first steps. Hand-carved from sustainable timber and dyed using natural vegetable extracts, this elephant features gentle curves and solid axle performance.',
    specifications: {
      'Material': 'Solid Beechwood',
      'Finish': 'Herbal-dyed natural beeswax coating',
      'Dimensions': '14 x 12 x 7 cm',
      'Age Recommendation': '10+ months'
    },
    reviews: [
      { id: 'r-t3-1', author: 'Siddharth M.', rating: 5, comment: 'Very sturdy, looks amazing on the shelf when not in use!', date: '2026-06-20', approved: true }
    ],
    isNew: true,
    brand: 'Meris Kids',
    availability: 'in-stock',
    minimumAge: 0.5,
    maximumAge: 1,
    ageGroup: '6-12 Months',
    skillType: 'Motor Skills',
    educationalType: 'Wooden Toys'
  },
  {
    id: 'toy-4',
    sku: 'TOY-WD-BLOCKS',
    name: 'Natural Premium Forest Wooden Blocks Set',
    category: 'Kids Toys',
    categorySlug: 'toys',
    price: 1499,
    discountPrice: 1299,
    stock: 18,
    rating: 4.9,
    ratingCount: 88,
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: '50-piece solid pine wood block set featuring smooth geometries and natural grain textures.',
    description: 'Perfect for building, sorting, and early geometry. This block set contains cylinders, arches, blocks, and triangles made from solid premium pine wood. Supports spatial awareness and motor skills.',
    specifications: {
      'Material': 'Solid Pinewood',
      'Pieces': '50 blocks',
      'Box': 'Eco-friendly canvas storage bag'
    },
    reviews: [],
    isNew: false,
    brand: 'Meris Kids',
    availability: 'in-stock',
    minimumAge: 2,
    maximumAge: 4,
    ageGroup: '2-4 Years',
    skillType: 'Puzzle',
    educationalType: 'STEM'
  },
  {
    id: 'toy-5',
    sku: 'TOY-WD-PUZZLE',
    name: 'Montessori Wooden Alphabet Matching Tray',
    category: 'Kids Toys',
    categorySlug: 'toys',
    price: 899,
    discountPrice: 799,
    stock: 20,
    rating: 4.8,
    ratingCount: 52,
    images: [
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'High-contrast alphabet block puzzle designed for cognitive spelling and letter shape matching.',
    description: 'An educational classic. Fits capital letter blocks securely into recessed slots, helping preschool children learn the alphabet visually and tactilely.',
    specifications: {
      'Material': 'Birch plywood tray & beech blocks',
      'Paint': 'Water-based non-toxic paint'
    },
    reviews: [],
    isNew: true,
    brand: 'Meris Learn',
    availability: 'in-stock',
    minimumAge: 4,
    maximumAge: 6,
    ageGroup: '4-6 Years',
    skillType: 'Puzzle',
    educationalType: 'Montessori'
  },
  {
    id: 'toy-6',
    sku: 'TOY-WD-BALANCE',
    name: 'Artisanal Curved Wooden Balance Wobble Board',
    category: 'Kids Toys',
    categorySlug: 'toys',
    price: 3299,
    discountPrice: 2899,
    stock: 6,
    rating: 4.9,
    ratingCount: 30,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Premium curved beechwood wobble board supporting posture balance and creative play.',
    description: 'Designed to support open-ended movement play. Children can balance on it, use it as a bridge, slide, or rocking cradle. Hand-pressed multilayered beechwood core.',
    specifications: {
      'Material': 'Multilayered Pressed Beechwood',
      'Weight Capacity': '120 kg',
      'Coating': 'Natural oil protectant'
    },
    reviews: [],
    isNew: false,
    brand: 'Meris Active',
    availability: 'in-stock',
    minimumAge: 6,
    maximumAge: 8,
    ageGroup: '6-8 Years',
    skillType: 'Motor Skills',
    educationalType: 'Indoor'
  },
  {
    id: 'toy-7',
    sku: 'TOY-WD-GEARS',
    name: '3D Mechanical Gear Assembly Constructor',
    category: 'Kids Toys',
    categorySlug: 'toys',
    price: 2499,
    discountPrice: 2199,
    stock: 12,
    rating: 4.7,
    ratingCount: 22,
    images: [
      'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Interlocking wooden gear puzzle introducing kinetic energy transmission and physical mechanics.',
    description: 'A STEM constructor puzzle set. Contains precision laser-cut plywood sheets. Kids can assemble standard gear configurations that move when hand-cranked.',
    specifications: {
      'Material': 'Laser-cut Birch Plywood',
      'Time to build': '3-4 hours',
      'Skill level': 'Intermediate'
    },
    reviews: [],
    isNew: false,
    brand: 'Meris Tech',
    availability: 'in-stock',
    minimumAge: 8,
    maximumAge: 10,
    ageGroup: '8-10 Years',
    skillType: 'Puzzle',
    educationalType: 'STEM'
  },
  {
    id: 'toy-8',
    sku: 'TOY-WD-CHESS',
    name: 'Classic Handcrafted Deluxe Wooden Chess Set',
    category: 'Kids Toys',
    categorySlug: 'toys',
    price: 2999,
    discountPrice: 2499,
    stock: 8,
    rating: 5.0,
    ratingCount: 14,
    images: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Exquisite inlaid rosewood chess board with weighted hand-carved chess pieces.',
    description: 'Premium chess set featuring storage slots for each individual piece. Finished in a semi-gloss natural lacquer, highlighting the rich grains of solid Indian rosewood.',
    specifications: {
      'Wood Type': 'Sheesham & Maple',
      'Board Dimensions': '30 x 30 cm',
      'King Height': '6.5 cm'
    },
    reviews: [],
    isNew: false,
    brand: 'Meris Games',
    availability: 'in-stock',
    minimumAge: 10,
    maximumAge: 13,
    ageGroup: '10-13 Years',
    skillType: 'Puzzle',
    educationalType: 'Indoor'
  },
  {
    id: 'toy-9',
    sku: 'TOY-WD-ARCH',
    name: '3D Laser-Cut Taj Mahal Architectural Model',
    category: 'Kids Toys',
    categorySlug: 'toys',
    price: 3899,
    discountPrice: 3499,
    stock: 5,
    rating: 4.9,
    ratingCount: 19,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop'
    ],
    shortDescription: 'Intricate 3D architectural craft kit compiling 250 micro-laser wood puzzle nodes.',
    description: 'A beautiful historical replica model. Perfect for teens and hobbyists. Hand-sanded laser edges allow slotting connections without requiring glue.',
    specifications: {
      'Material': 'Sustainably sourced Basswood Plywood',
      'Complexity': 'Advanced (250+ parts)',
      'Recommended Age': '13+ Years'
    },
    reviews: [],
    isNew: true,
    brand: 'Meris Tech',
    availability: 'low-stock',
    minimumAge: 13,
    maximumAge: 99,
    ageGroup: '13+ Years',
    skillType: 'Puzzle',
    educationalType: 'STEM'
  },
  {
    id: 'wood-3',
    sku: 'WD-DESK-ORG',
    name: 'Royal Teakwood Desk Organizer & Letter Rack',
    category: 'Wood Crafted Gifts',
    categorySlug: 'wood-gifts',
    price: 1650,
    discountPrice: 1399,
    stock: 10,
    rating: 4.7,
    ratingCount: 29,
    images: [
      'https://images.unsplash.com/photo-1606166187734-a4cb74079027?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Exquisite hand-planed teakwood desktop tray featuring a slotted letter rack and brass pen grooves.',
    description: 'Keep your desktop curated. This premium desk organizer is carved from seasoned solid teakwood and polished with direct oil sealants to highlight its stunning natural golden-brown grains. Complete with non-slip velvet protective padding.',
    specifications: {
      'Timber Type': 'Premium seasoned Teakwood',
      'Polish': 'Matte Linseed Oil hand-rubbed finish',
      'Compartments': '3 vertical letter slots, 2 pen cradles',
      'Dimensions': '24 x 15 x 12 cm'
    },
    reviews: [],
    isBestseller: true,
    brand: 'Meris Artisanal',
    availability: 'in-stock'
  },
  {
    id: 'bag-3',
    sku: 'BG-SLING-JUTE',
    name: 'Eco-Jute & Vegan Leather Sling Bag',
    category: 'Handbags',
    categorySlug: 'handbags',
    price: 1750,
    discountPrice: 1450,
    stock: 18,
    rating: 4.6,
    ratingCount: 52,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'A casual yet elegant dual-textured sling bag made of golden handloom jute fibers with rich tan leatherette trims.',
    description: 'Perfect for brunches or weekend strolls, this bag fuses organic woven golden jute fabrics with cruelty-free tan vegan leather accents. Features a secure zipper main compartment with custom brass pulls and adjustable strap hardware.',
    specifications: {
      'Fabric': 'Premium Golden Jute & Bio-Alloy Polyurethane',
      'Lining': '100% Recycled Cotton sailcloth',
      'Closure': 'Heavy-duty brass YKK zippers',
      'Strap length': 'Adjustable 115cm sling'
    },
    reviews: [],
    brand: 'Meris Couture',
    availability: 'in-stock'
  },
  {
    id: 'learn-2',
    sku: 'LN-COSMIC-PZL',
    name: 'Teakwood Cosmic Solar System Puzzle',
    category: 'Learning Stuff',
    categorySlug: 'learning',
    price: 2100,
    discountPrice: 1799,
    stock: 12,
    rating: 4.9,
    ratingCount: 38,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Magnificent circular orbital tracking disc puzzle detailing celestial bodies and planetary paths.',
    description: 'Introduce kids to astrology and astrophysics. This premium orbital tracker features laser-carved stellar bodies that slot into concentric maple tracks. Beautifully polished to double as high-end nursery room decorations.',
    specifications: {
      'Material': 'High-density Maple and Walnut veneer panels',
      'Coating': 'Organic organic wood waxes',
      'Dimensions': '32 cm diameter circular canvas',
      'Educational Focus': 'Astrological paths and fine motor logic'
    },
    reviews: [
      { id: 'r-l2-1', author: 'Dr. Aris V.', rating: 5, comment: 'An amazing tool that is literally educational art. The detailing on Saturn is wonderful.', date: '2026-06-18', approved: true }
    ],
    isBestseller: true,
    brand: 'Meris Kids',
    availability: 'in-stock'
  },
  {
    id: 'home-3',
    sku: 'HM-CERAMIC-DIFF',
    name: 'Hand-Cast Ceramic Oil Diffuser & Incense Chalice',
    category: 'Home Gifts',
    categorySlug: 'home',
    price: 999,
    discountPrice: 849,
    stock: 25,
    rating: 4.8,
    ratingCount: 33,
    images: [
      'https://images.unsplash.com/photo-1540324155974-75226c3ad3a6?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Speckled stoneware clay diffuse burner styled with organic carved apertures and copper oil dish.',
    description: 'Elevate your sensory experiences. Simply place a wax tea-candle in the lower chamber and add organic oils to the deep top copper basin. The custom speckled clay filters a warm amber glow, diffusing soothing botanical fragrances perfectly.',
    specifications: {
      'Stoneware': 'Speckled Oatmeal Studio Clay',
      'Basin': '100% Spun Copper heating plate',
      'Dimensions': '11 x 10 cm cylindric body',
      'Safety': 'Heat-treated non-cracking glaze'
    },
    reviews: [],
    isNew: true,
    brand: 'Meris Ceramics',
    availability: 'in-stock'
  },
  {
    id: 'kolam-2',
    sku: 'KL-ST-PEACOCK',
    name: 'Royal Peacock Mandala Rangoli Brass Template',
    category: 'Kolam Stencils',
    categorySlug: 'kolam',
    price: 799,
    discountPrice: 649,
    stock: 14,
    rating: 4.9,
    ratingCount: 46,
    images: [
      'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Magnificent circular brass template displaying detailed laser-cut peacock and feather mandalas.',
    description: 'A luxurious heirloom template for Indian festivals. Crafted from high-gloss solid brass plate, this mandala stenciler yields immaculate geometric lines of peacock feather motifs. Simply sprinkle traditional colored powders or rice flour.',
    specifications: {
      'Material': 'High-gloss Rust-resistant Brass Alloy',
      'Pattern': 'Bespoke Peacock Mandala',
      'Diameter': '28 cm circular plate',
      'Cleanliness': 'Warm water rinse & towel dry'
    },
    reviews: [
      { id: 'r-k2-1', author: 'Lakshmi S.', rating: 5, comment: 'Spectacular quality! Brass is heavy and stays firmly in place during drawing.', date: '2026-06-22', approved: true }
    ],
    isNew: true,
    brand: 'Meris festive',
    availability: 'in-stock'
  },
  {
    id: 'stat-3',
    sku: 'ST-CAL-SET',
    name: 'Calligraphy Starter Set with Raw Brass Inkwell',
    category: 'Stationeries',
    categorySlug: 'stationeries',
    price: 1850,
    discountPrice: 1599,
    stock: 8,
    rating: 4.8,
    ratingCount: 22,
    images: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Stunning writing gift kit including a wood-nib stylus, 4 premium steel nib points, and an antique brass ink pot.',
    description: 'Rekindle the majestic art of hand-written letters. This curation features an ergonomic polished rosewood handle stylus, fine steel drawing nibs, and a heavy brass inkwell containing 30ml of rich pigment organic charcoal black ink.',
    specifications: {
      'Stylus': 'Hand-turned Rosewood stylus',
      'Nibs': '4 high-flex spring steel calligraphy points',
      'Inkwell': 'Solid machined Brass leakproof screw-cap vessel',
      'Packaging': 'Lined premium cardboard giftbox'
    },
    reviews: [],
    isNew: true,
    brand: 'Meris Script',
    availability: 'in-stock'
  },
  {
    id: 'ent-2',
    sku: 'EN-SL-BOARD',
    name: 'Luxury Walnut Wood Solitaire Board with Glass Marbles',
    category: 'Entertainment Products',
    categorySlug: 'entertainment',
    price: 3800,
    discountPrice: 3299,
    stock: 6,
    rating: 4.7,
    ratingCount: 15,
    images: [
      'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Hand-turned walnut wood circular solitaire board styled with 33 hand-swirled custom glass spheres.',
    description: 'An object of outstanding intellectual engagement. This single-player strategic tabletop game is carved from dark American walnut and features a grooved perimeter track to secure captured glass marbles.',
    specifications: {
      'Platter Wood': 'Natural high-grade American Walnut',
      'Marbles': '33 hand-crafted swirled decorative glass spheres',
      'Diameter': '30 cm circular console',
      'Finish': 'Polished silk-varnish coating'
    },
    reviews: [],
    brand: 'Meris Heritage',
    availability: 'in-stock'
  },
  {
    id: 'btl-2',
    sku: 'BT-FLASK-PASTEL',
    name: 'Pastel Vacuum Insulated Double-Walled Flask',
    category: 'Return Gift Bottles',
    categorySlug: 'bottles',
    price: 1150,
    discountPrice: 950,
    stock: 35,
    rating: 4.8,
    ratingCount: 40,
    images: [
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=80'
    ],
    shortDescription: 'Stunning lavender-cream double-walled thermos keeping cold drinks frosty for 24 hours.',
    description: 'Crafted with premium grade stainless steel, this double-walled thermal flask features a leakproof silicone-sealed cap with a hand-stitched vegan leather carry handle. Finished in sweatproof powder coated lavender-cream colors.',
    specifications: {
      'Steel Type': '18/8 Pro-Grade food safe Stainless Steel',
      'Insulation': 'TempShield double-wall vacuum seal',
      'Volume Capacity': '650 ml',
      'Performance': '24 hrs cold, 12 hrs hot'
    },
    reviews: [],
    isNew: true,
    brand: 'Meris Wellness',
    availability: 'in-stock'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'MERIS10',
    type: 'percentage',
    value: 10,
    expiryDate: '2027-01-01',
    usageLimit: 300,
    usageCount: 42,
    minimumCartValue: 500,
    description: 'Enjoy 10% off on all luxury items across store',
    active: true
  },
  {
    code: 'FESTIVE20',
    type: 'percentage',
    value: 20,
    expiryDate: '2026-12-25',
    usageLimit: 150,
    usageCount: 11,
    minimumCartValue: 1500,
    description: 'Special 20% discount on order carts above Rs.1500',
    active: true
  },
  {
    code: 'NEWUSER15',
    type: 'flat',
    value: 150,
    expiryDate: '2027-04-12',
    usageLimit: 500,
    usageCount: 120,
    minimumCartValue: 1000,
    description: 'Flat Rs.150 discount for first time purchasers above Rs.1000',
    active: true
  }
];

export const INITIAL_CAMPAIGNS: BannerCampaign[] = [
  {
    id: 'camp-1',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&auto=format&fit=crop&q=80',
    title: 'Warmth of Premium Handcrafted Toys',
    description: 'Introduce your toddlers to safe, beautifully finished chemical-free timber stacking sets.',
    ctaText: 'Shop Kids Toys',
    linkCategory: 'toys',
    active: true
  },
  {
    id: 'camp-2',
    imageUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    title: 'Dignified Wood Keepsake Gifts',
    description: 'Explore stellar intricate storage boxes and house accessories custom engraved for your peers.',
    ctaText: 'Explore Gifts',
    linkCategory: 'wood-gifts',
    active: true
  },
  {
    id: 'camp-3',
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1200&auto=format&fit=crop&q=80',
    title: 'Sensory Gold-Foil Stationeries',
    description: 'Unleash your creative mind with Smyth-sewn linen notebooks and raw heavy brass pencils.',
    ctaText: 'Browse Stationeries',
    linkCategory: 'stationeries',
    active: true
  }
];

export const DEFAULT_CMS: CMSConfig = {
  headline: 'Distinctive Heritage Collections For Creative Families',
  subheadline: 'Crafted with absolute devotion from luxury gold brass, polished hardwoods, fine linens & combed threads.',
  aboutText: 'MERIS E-SHOP grew out of a love for organic tactile treasures that persist across generations. What started in 2025 as a small studio workshop crafting traditional timber Toys has evolved into prime curation hubs for Handbags, learning tools, home accessories, and festive stencils. Every single item traces back to hand-perfected mockups, chemical-free finishing, and ethical rural workforces.',
  contactEmail: 'support@meris.com',
  contactPhone: '+91 93842 92229',
  contactAddress: '5/339, Fathima Road, nager, Azhagappapuram, Tamil Nadu 629401',
  privacyPolicy: 'Your personal data (Name, Email, Address) is transmitted through full-stack secured channels. We use client local persistence for speedy loading times and never sell user profiling sheets to marketing aggregates.',
  termsConditions: 'All prices listed on MERIS E-SHOP are inclusive of standard 18% GST rules. Returns have a 7-day windows and of course must remain spotless inside initial package cases.'
};

export function sanitizeProduct(p: any): Product {
  const safeImages = Array.isArray(p?.images) && p.images.length > 0 
    ? p.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0)
    : typeof p?.images === 'string' && p.images.trim().length > 0 
      ? [p.images.trim()] 
      : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop'];

  const defaultImg = safeImages.length > 0 ? safeImages : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop'];

  return {
    id: String(p?.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
    sku: String(p?.sku || `SKU-${Date.now()}`),
    name: String(p?.name || 'Untitled Product'),
    category: String(p?.category || 'Luxury Goods'),
    categorySlug: String(p?.categorySlug || p?.category_slug || p?.category?.toLowerCase().replace(/\s+/g, '-') || 'luxury-goods'),
    price: typeof p?.price === 'number' && !isNaN(p.price) ? p.price : Number(p?.price) || 999,
    discountPrice: p?.discountPrice || p?.discount_price ? (typeof (p.discountPrice || p.discount_price) === 'number' ? (p.discountPrice || p.discount_price) : Number(p.discountPrice || p.discount_price) || null) : null,
    stock: typeof p?.stock === 'number' && !isNaN(p.stock) ? p.stock : Number(p?.stock) || 10,
    rating: typeof p?.rating === 'number' && !isNaN(p.rating) ? p.rating : Number(p?.rating) || 5,
    ratingCount: typeof p?.ratingCount === 'number' && !isNaN(p.ratingCount) ? p.ratingCount : Number(p?.ratingCount) || 1,
    images: defaultImg,
    shortDescription: String(p?.shortDescription || p?.short_description || p?.name || ''),
    description: String(p?.description || p?.name || ''),
    specifications: typeof p?.specifications === 'object' && p?.specifications !== null ? p.specifications : {},
    reviews: Array.isArray(p?.reviews) ? p.reviews : [],
    isNew: Boolean(p?.isNew || p?.is_new),
    isBestseller: Boolean(p?.isBestseller || p?.is_bestseller),
    brand: String(p?.brand || 'MERIS'),
    availability: p?.availability || 'in-stock'
  };
}

// Database local storage management
export const getStoredDb = () => {
  if (typeof window === 'undefined') return { products: INITIAL_PRODUCTS.map(sanitizeProduct), coupons: INITIAL_COUPONS, campaigns: INITIAL_CAMPAIGNS, cms: DEFAULT_CMS };
  try {
    const productsJson = localStorage.getItem('meris_products');
    const couponsJson = localStorage.getItem('meris_coupons');
    const campaignsJson = localStorage.getItem('meris_campaigns');
    const cmsJson = localStorage.getItem('meris_cms');

    let mergedProducts = INITIAL_PRODUCTS.map(sanitizeProduct);
    if (productsJson) {
      try {
        const storedProducts: any[] = JSON.parse(productsJson);
        if (Array.isArray(storedProducts) && storedProducts.length > 0) {
          const storedMap = new Map(storedProducts.map(p => [String(p.id), p]));
          
          mergedProducts = INITIAL_PRODUCTS.map(initialProduct => {
            const storedProduct = storedMap.get(String(initialProduct.id));
            if (storedProduct) {
              return sanitizeProduct({ ...initialProduct, ...storedProduct });
            }
            return sanitizeProduct(initialProduct);
          });

          // Preserve custom products added via Admin Panel
          const initialIds = new Set(INITIAL_PRODUCTS.map(p => String(p.id)));
          const customProducts = storedProducts.filter(p => !initialIds.has(String(p.id))).map(sanitizeProduct);
          mergedProducts = [...mergedProducts, ...customProducts];
        }
      } catch (parseErr) {
        console.error('Error parsing stored products, falling back to INITIAL_PRODUCTS', parseErr);
      }
    }

    return {
      products: mergedProducts,
      coupons: couponsJson ? JSON.parse(couponsJson) : INITIAL_COUPONS,
      campaigns: campaignsJson ? JSON.parse(campaignsJson) : INITIAL_CAMPAIGNS,
      cms: cmsJson ? JSON.parse(cmsJson) : DEFAULT_CMS
    };
  } catch (e) {
    console.error('Error reading localStorage DB, fallback to defaults', e);
    return { products: INITIAL_PRODUCTS.map(sanitizeProduct), coupons: INITIAL_COUPONS, campaigns: INITIAL_CAMPAIGNS, cms: DEFAULT_CMS };
  }
};

export const saveStoredDb = (db: { products?: Product[]; coupons?: Coupon[]; campaigns?: BannerCampaign[]; cms?: CMSConfig }) => {
  if (typeof window === 'undefined') return;
  try {
    if (db.products && Array.isArray(db.products)) {
      // Preserve product images safely without corrupting string data
      const safeProducts = db.products.map(p => ({
        ...p,
        images: (p.images || []).map(img => {
          if (typeof img === 'string' && img.length > 500000 && img.startsWith('data:')) {
            return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop';
          }
          return img;
        })
      }));
      localStorage.setItem('meris_products', JSON.stringify(safeProducts));
    }
    if (db.coupons) localStorage.setItem('meris_coupons', JSON.stringify(db.coupons));
    if (db.campaigns) localStorage.setItem('meris_campaigns', JSON.stringify(db.campaigns));
    if (db.cms) localStorage.setItem('meris_cms', JSON.stringify(db.cms));
  } catch (e) {
    console.error('Failed writing storage DB (quota exceeded), continuing safely', e);
  }
};

export const INITIAL_CMS = DEFAULT_CMS;

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-initial',
    action: 'System Bootstrapped',
    details: 'Role-Based access control systems initiated. Standard secure parameters verified.',
    user: 'System Workspace',
    timestamp: new Date().toISOString()
  }
];

export const loadInitialState = () => {
  if (typeof window === 'undefined') {
    return { cart: [], wishlist: [], orders: [], recentlyViewed: [], currentUser: null };
  }
  try {
    const cartJson = localStorage.getItem('meris_cart');
    const wishlistJson = localStorage.getItem('meris_wishlist');
    const ordersJson = localStorage.getItem('meris_orders');
    const recentlyViewedJson = localStorage.getItem('meris_recently_viewed');
    const userJson = localStorage.getItem('meris_current_user');

    const parsedCart = cartJson ? JSON.parse(cartJson) : [];
    const safeCart = Array.isArray(parsedCart)
      ? parsedCart
          .map((item: any) => {
            if (!item || !item.product) return null;
            return {
              ...item,
              product: sanitizeProduct(item.product)
            };
          })
          .filter(Boolean)
      : [];

    const parsedWishlist = wishlistJson ? JSON.parse(wishlistJson) : [];
    const safeWishlist = Array.isArray(parsedWishlist) ? parsedWishlist.filter((id: any) => typeof id === 'string' && id.trim().length > 0) : [];

    const parsedOrders = ordersJson ? JSON.parse(ordersJson) : [];
    const safeOrders = Array.isArray(parsedOrders) ? parsedOrders : [];

    const parsedRecentlyViewed = recentlyViewedJson ? JSON.parse(recentlyViewedJson) : [];
    const safeRecentlyViewed = Array.isArray(parsedRecentlyViewed) ? parsedRecentlyViewed.filter((id: any) => typeof id === 'string' && id.trim().length > 0) : [];

    return {
      cart: safeCart,
      wishlist: safeWishlist,
      orders: safeOrders,
      recentlyViewed: safeRecentlyViewed,
      currentUser: userJson ? JSON.parse(userJson) : null
    };
  } catch (err) {
    console.error('Failure recovering stored states:', err);
    return { cart: [], wishlist: [], orders: [], recentlyViewed: [], currentUser: null };
  }
};

export const saveToStorage = (state: { cart: any[]; wishlist: string[]; orders: any[]; recentlyViewed: string[]; currentUser: any }) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('meris_cart', JSON.stringify(state.cart));
    localStorage.setItem('meris_wishlist', JSON.stringify(state.wishlist));
    localStorage.setItem('meris_orders', JSON.stringify(state.orders));
    localStorage.setItem('meris_recently_viewed', JSON.stringify(state.recentlyViewed));
    if (state.currentUser) {
      localStorage.setItem('meris_current_user', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('meris_current_user');
    }
  } catch (err) {
    console.error('Error writing state indexes:', err);
  }
};


