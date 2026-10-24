const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Wishlist = require('./models/Wishlist');

const categoriesData = [
  {
    name: 'Mobiles and Tablets',
    slug: 'mobiles-tablets',
    description: 'Latest smartphones, 5G devices, iPads, and Android tablets',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    icon: 'bi-phone'
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smart TVs, audio systems, wireless headphones, and cameras',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    icon: 'bi-headphones'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Men and women clothing, footwear, luxury watches, and accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
    icon: 'bi-bag'
  },
  {
    name: 'Home and Kitchen',
    slug: 'home-kitchen',
    description: 'Modern cookware, air fryers, blenders, home decor, and bedding',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    icon: 'bi-house-door'
  },
  {
    name: 'Beauty and Personal Care',
    slug: 'beauty-personal-care',
    description: 'Skincare, grooming kits, hair care, cosmetics, and perfumes',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    icon: 'bi-stars'
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Bestselling self-help, business, literature, and educational books',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80',
    icon: 'bi-book'
  },
  {
    name: 'Grocery',
    slug: 'grocery',
    description: 'Fresh staples, gourmet coffee, organic snacks, and household essentials',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    icon: 'bi-basket'
  },
  {
    name: 'Sports and Fitness',
    slug: 'sports-fitness',
    description: 'Gym equipment, sports gear, yoga mats, and resistance bands',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    icon: 'bi-activity'
  },
  {
    name: 'Computers and Accessories',
    slug: 'computers-accessories',
    description: 'High-performance laptops, monitors, gaming mice, keyboards, and SSDs',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    icon: 'bi-laptop'
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Review.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Wishlist.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'ShopKart Admin',
      email: 'admin@shopkart.com',
      password: 'Admin@12345',
      phone: '+91 9876543210',
      role: 'admin',
      addresses: [
        {
          fullName: 'ShopKart Headquarter',
          phone: '+91 9876543210',
          addressLine: 'Cyber Gateway, HITEC City, Phase 2',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          addressType: 'Work',
          isDefault: true
        }
      ]
    });

    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@shopkart.com',
      password: 'Customer@12345',
      phone: '+91 9812345678',
      role: 'customer',
      addresses: [
        {
          fullName: 'Rahul Sharma',
          phone: '+91 9812345678',
          addressLine: 'Flat 402, Sunshine Heights, Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          addressType: 'Home',
          isDefault: true
        },
        {
          fullName: 'Rahul Sharma (Office)',
          phone: '+91 9812345678',
          addressLine: 'Tower B, Tech Park, Whitefield',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560066',
          addressType: 'Work',
          isDefault: false
        }
      ]
    });

    const reviewerUser = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'Customer@12345',
      phone: '+91 9723456789',
      role: 'customer',
      addresses: []
    });

    console.log('[Seed] Created default admin and customer accounts');

    // 2. Create Categories
    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });
    console.log(`[Seed] Inserted ${createdCategories.length} categories`);

    // 3. Create 36 Realistic Products (4 per category for all 9 categories)
    const productsData = [
      // Category: Mobiles and Tablets
      {
        name: 'Apple iPhone 15 Pro (128 GB) - Natural Titanium',
        slug: 'apple-iphone-15-pro-128gb',
        description: 'iPhone 15 Pro features a strong and light aerospace-grade titanium design with textured matte-glass back. It also features a Ceramic Shield front that is tougher than any smartphone glass. Super Retina XDR display with ProMotion up to 120Hz.',
        price: 134900,
        discountPrice: 124900,
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Mobiles and Tablets'],
        categoryName: 'Mobiles and Tablets',
        brand: 'Apple',
        stock: 18,
        sku: 'SK-IPHONE15P',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.8,
        numReviews: 240,
        specifications: [
          { key: 'Display', value: '6.1-inch Super Retina XDR OLED' },
          { key: 'Processor', value: 'A17 Pro Chip' },
          { key: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto' },
          { key: 'Battery', value: 'Up to 23 hours video playback' },
          { key: 'Connector', value: 'USB-C with USB 3 speeds' }
        ]
      },
      {
        name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256GB)',
        slug: 'samsung-galaxy-s24-ultra-5g',
        description: 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Built-in Galaxy AI brings live call translation, Circle to Search with Google, and Note Assist.',
        price: 129999,
        discountPrice: 119999,
        images: [
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Mobiles and Tablets'],
        categoryName: 'Mobiles and Tablets',
        brand: 'Samsung',
        stock: 22,
        sku: 'SK-S24ULTRA',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 185,
        specifications: [
          { key: 'Display', value: '6.8-inch Dynamic AMOLED 2X 120Hz' },
          { key: 'Processor', value: 'Snapdragon 8 Gen 3 for Galaxy' },
          { key: 'Camera', value: '200MP Quad Camera with 100x Space Zoom' },
          { key: 'S-Pen', value: 'Embedded Stylus Pen Included' },
          { key: 'Battery', value: '5000 mAh with 45W Fast Charging' }
        ]
      },
      {
        name: 'OnePlus 12 5G (Silky Black, 16GB RAM, 512GB)',
        slug: 'oneplus-12-5g-silky-black',
        description: 'OnePlus 12 represents the culmination of OnePlus flagship excellence. Powered by Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera for Mobile, and revolutionary 100W SUPERVOOC fast charging.',
        price: 69999,
        discountPrice: 64999,
        images: [
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Mobiles and Tablets'],
        categoryName: 'Mobiles and Tablets',
        brand: 'OnePlus',
        stock: 14,
        sku: 'SK-OP12-512',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.6,
        numReviews: 92,
        specifications: [
          { key: 'Display', value: '6.82-inch 2K 120Hz ProXDR Display' },
          { key: 'RAM & Storage', value: '16GB LPDDR5X + 512GB UFS 4.0' },
          { key: 'Charging', value: '100W Wired + 50W Wireless' },
          { key: 'Hasselblad', value: 'Sony LYT-808 with OIS' }
        ]
      },
      {
        name: 'Apple iPad Air 11-inch (M2 Chip, Wi-Fi, 128GB - Starlight)',
        slug: 'apple-ipad-air-11-m2',
        description: 'The redesigned iPad Air 11-inch is supercharged by the astonishingly fast Apple M2 chip. Features a Liquid Retina display, landscape 12MP front camera with Center Stage, and Wi-Fi 6E.',
        price: 59900,
        discountPrice: 54900,
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Mobiles and Tablets'],
        categoryName: 'Mobiles and Tablets',
        brand: 'Apple',
        stock: 25,
        sku: 'SK-IPADAIRM2',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.9,
        numReviews: 110,
        specifications: [
          { key: 'Display', value: '11-inch Liquid Retina with True Tone' },
          { key: 'Processor', value: 'Apple M2 Chip with 8-core CPU' },
          { key: 'Support', value: 'Apple Pencil Pro and Magic Keyboard' },
          { key: 'Security', value: 'Touch ID top button' }
        ]
      },

      // Category: Electronics
      {
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        slug: 'sony-wh-1000xm5-headphones',
        description: 'Industry-leading noise cancellation optimized to your environment. Crystal-clear hands-free calling with 4 beamforming microphones. Up to 30 hours battery life with quick charging (3 min for 3 hours of playback).',
        price: 34990,
        discountPrice: 28990,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Electronics'],
        categoryName: 'Electronics',
        brand: 'Sony',
        stock: 30,
        sku: 'SK-SONYXM5',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.8,
        numReviews: 312,
        specifications: [
          { key: 'Type', value: 'Over-Ear Wireless' },
          { key: 'Noise Cancellation', value: 'Dual Processor V1 + HD QN1' },
          { key: 'Battery Life', value: '30 Hours' },
          { key: 'Multipoint', value: 'Connects to two devices simultaneously' }
        ]
      },
      {
        name: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum',
        slug: 'apple-watch-series-9-45mm',
        description: 'Smarter, brighter, and mightier. The powerful S9 SiP enables a super-bright display and a magical new way to quickly and easily interact with your Apple Watch without touching the screen using Double Tap.',
        price: 44900,
        discountPrice: 38990,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Electronics'],
        categoryName: 'Electronics',
        brand: 'Apple',
        stock: 12,
        sku: 'SK-AWS9-45',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 145,
        specifications: [
          { key: 'Case Size', value: '45mm Aluminum' },
          { key: 'Display', value: 'Always-On Retina up to 2000 nits' },
          { key: 'Sensors', value: 'Blood Oxygen, ECG, Temperature sensing' },
          { key: 'Water Resistance', value: '50 meters swimproof' }
        ]
      },
      {
        name: 'Bose SoundLink Flex Bluetooth Portable Speaker (Stone Blue)',
        slug: 'bose-soundlink-flex-speaker',
        description: 'State-of-the-art design delivers clear, deep sound and powerful bass whether upright or flat. PositionIQ technology automatically optimizes sound orientation. Waterproof and dustproof (IP67).',
        price: 15900,
        discountPrice: 12499,
        images: [
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Electronics'],
        categoryName: 'Electronics',
        brand: 'Bose',
        stock: 20,
        sku: 'SK-BOSESL',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.6,
        numReviews: 88,
        specifications: [
          { key: 'Battery Life', value: 'Up to 12 hours' },
          { key: 'Durability', value: 'IP67 Waterproof & Rugged silicone' },
          { key: 'Wireless Range', value: 'Up to 9 meters (30 ft)' }
        ]
      },
      {
        name: 'Canon EOS R50 Mirrorless Camera with RF-S 18-45mm Lens',
        slug: 'canon-eos-r50-mirrorless',
        description: 'Compact, lightweight RF-mount mirrorless camera for content creators and photography enthusiasts. 24.2 MP APS-C sensor, 4K uncropped video up to 30p, Dual Pixel CMOS AF II.',
        price: 64995,
        discountPrice: 56990,
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Electronics'],
        categoryName: 'Electronics',
        brand: 'Canon',
        stock: 8,
        sku: 'SK-CANONR50',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 42,
        specifications: [
          { key: 'Resolution', value: '24.2 Megapixels APS-C' },
          { key: 'Video', value: '4K 30p oversampled from 6K' },
          { key: 'Screen', value: 'Vari-angle Touchscreen LCD' }
        ]
      },

      // Category: Fashion
      {
        name: "Levi's Men's 511 Slim Fit Stretchable Denim Jeans",
        slug: 'levis-mens-511-slim-fit-jeans',
        description: "A modern slim with room to move. The 511 Slim Fit Jeans are a classic since right now. These jeans sit below the waist with a slim leg from hip to ankle. Crafted from premium stretch cotton.",
        price: 3999,
        discountPrice: 2199,
        images: [
          'https://images.unsplash.com/photo-1542272604-780c96856465?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Fashion'],
        categoryName: 'Fashion',
        brand: "Levi's",
        stock: 45,
        sku: 'SK-LEVIS511',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.4,
        numReviews: 410,
        specifications: [
          { key: 'Fit', value: 'Slim Fit' },
          { key: 'Fabric', value: '99% Cotton, 1% Elastane' },
          { key: 'Closure', value: 'Zip fly with button closure' },
          { key: 'Wash Care', value: 'Machine wash cold' }
        ]
      },
      {
        name: 'Nike Air Max 270 Men Running & Lifestyle Sneakers',
        slug: 'nike-air-max-270-sneakers',
        description: "Nike's first lifestyle Air Max brings you style, comfort, and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons, showcasing Nike's greatest innovation with its large window and fresh array of colors.",
        price: 13995,
        discountPrice: 9995,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Fashion'],
        categoryName: 'Fashion',
        brand: 'Nike',
        stock: 18,
        sku: 'SK-NIKE270',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.8,
        numReviews: 290,
        specifications: [
          { key: 'Upper', value: 'Engineered mesh with synthetic overlays' },
          { key: 'Sole', value: 'Rubber waffle outsole with Max Air 270 unit' },
          { key: 'Ideal For', value: 'Running, Gym, Everyday Casual' }
        ]
      },
      {
        name: 'Fossil Grant Chronograph Dark Brown Leather Watch',
        slug: 'fossil-grant-chronograph-watch',
        description: 'Modeled after vintage clocks, Roman numeral markers are uniquely designed to provide artistic balance to the dial. Stainless steel case paired with supple rich brown genuine leather strap.',
        price: 12495,
        discountPrice: 7495,
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Fashion'],
        categoryName: 'Fashion',
        brand: 'Fossil',
        stock: 25,
        sku: 'SK-FOSSILG',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.5,
        numReviews: 120,
        specifications: [
          { key: 'Movement', value: 'Quartz Chronograph' },
          { key: 'Case Size', value: '44mm' },
          { key: 'Band Material', value: '100% Genuine Leather' },
          { key: 'Water Resistance', value: '5 ATM' }
        ]
      },
      {
        name: 'Ray-Ban Classic Polarized Aviator Sunglasses (Gold/Green)',
        slug: 'rayban-classic-aviator-polarized',
        description: 'Currently one of the most iconic sunglass models in the world. Ray-Ban Aviator Classic sunglasses were originally designed for U.S. aviators in 1937. Timeless style meets high quality polarized protection.',
        price: 9990,
        discountPrice: 7990,
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Fashion'],
        categoryName: 'Fashion',
        brand: 'Ray-Ban',
        stock: 30,
        sku: 'SK-RAYBAN-AV',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 165,
        specifications: [
          { key: 'Frame', value: 'Polished Metal Gold' },
          { key: 'Lenses', value: 'G-15 Green Polarized' },
          { key: 'UV Protection', value: '100% UV400' }
        ]
      },

      // Category: Home and Kitchen
      {
        name: 'Philips Digital Air Fryer HD9252 (4.1L, Rapid Air Tech)',
        slug: 'philips-digital-air-fryer-hd9252',
        description: 'Healthy frying with Rapid Air technology. Fry with up to 90% less fat. Touch screen with 7 presets including frozen snacks, fresh fries, meat, fish, chicken drumsticks, cake, and grilled vegetables.',
        price: 11995,
        discountPrice: 7999,
        images: [
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Home and Kitchen'],
        categoryName: 'Home and Kitchen',
        brand: 'Philips',
        stock: 35,
        sku: 'SK-PHILIPSAF',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.6,
        numReviews: 215,
        specifications: [
          { key: 'Capacity', value: '4.1 Litres / 0.8kg' },
          { key: 'Power', value: '1400 Watts' },
          { key: 'Programs', value: '7 Preset Touch Menus + Keep Warm' },
          { key: 'Cleaning', value: 'Dishwasher safe QuickClean basket' }
        ]
      },
      {
        name: 'Prestige Iris Plus 750W Mixer Grinder with 4 Jars',
        slug: 'prestige-iris-plus-750w-mixer-grinder',
        description: 'Heavy duty 750 Watt motor designed for Indian kitchens. Comes with 3 stainless steel jars for wet grinding, dry grinding, and chutneys, plus a transparent transparent juicer jar with blade extractor.',
        price: 6295,
        discountPrice: 3299,
        images: [
          'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Home and Kitchen'],
        categoryName: 'Home and Kitchen',
        brand: 'Prestige',
        stock: 40,
        sku: 'SK-PRESTIGE-MG',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.3,
        numReviews: 540,
        specifications: [
          { key: 'Motor', value: '750 Watts Pure Copper Motor' },
          { key: 'Jars', value: '4 Jars (1.5L Wet, 1L Dry, 300ml Chutney, 1.5L Juicer)' },
          { key: 'Speed Settings', value: '3 Speed control with Whip function' }
        ]
      },
      {
        name: 'Dyson V8 Absolute Cordless Vacuum Cleaner',
        slug: 'dyson-v8-absolute-vacuum',
        description: 'Engineered for homes with pets. Up to 40 minutes of fade-free suction power. Quickly transforms to a handheld vacuum. Advanced whole-machine filtration captures 99.99% of microscopic particles.',
        price: 39900,
        discountPrice: 29900,
        images: [
          'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Home and Kitchen'],
        categoryName: 'Home and Kitchen',
        brand: 'Dyson',
        stock: 10,
        sku: 'SK-DYSONV8',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.8,
        numReviews: 95,
        specifications: [
          { key: 'Suction Power', value: '115 Air Watts' },
          { key: 'Run Time', value: 'Up to 40 minutes' },
          { key: 'Weight', value: '2.61 kg' },
          { key: 'Attachments', value: 'Fluffy cleaner head, Motorbar, Crevice tool' }
        ]
      },
      {
        name: 'Bombay Dyeing 100% Pure Cotton King Size Bedsheet with 2 Pillow Covers',
        slug: 'bombay-dyeing-cotton-bedsheet-king',
        description: 'Crafted with 100% breathable pure cotton and 300 thread count sateen weave. Luxurious ultra-soft touch, fade-resistant reactive dyes, and tailored elegance for standard king size mattresses.',
        price: 2499,
        discountPrice: 1299,
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Home and Kitchen'],
        categoryName: 'Home and Kitchen',
        brand: 'Bombay Dyeing',
        stock: 50,
        sku: 'SK-BOMBAYD-BS',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.5,
        numReviews: 180,
        specifications: [
          { key: 'Size', value: 'King Size (108 x 108 inches)' },
          { key: 'Material', value: '100% Combed Cotton' },
          { key: 'Thread Count', value: '300 TC' }
        ]
      },

      // Category: Beauty and Personal Care
      {
        name: 'Philips Series 3000 Beard & Stubble Trimmer (BT3231/15)',
        slug: 'philips-series-3000-beard-trimmer',
        description: 'Lift & Trim system cuts 30% faster. Titanium coated self-sharpening blades stay sharp as day one. 20 lock-in length settings (0.5 to 10mm). 60 minutes cordless use with 1-hour fast charge.',
        price: 2495,
        discountPrice: 1699,
        images: [
          'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Beauty and Personal Care'],
        categoryName: 'Beauty and Personal Care',
        brand: 'Philips',
        stock: 60,
        sku: 'SK-PHILIPSTRM',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.6,
        numReviews: 870,
        specifications: [
          { key: 'Blades', value: 'Skin-friendly Titanium coated blades' },
          { key: 'Battery', value: '60 minutes run time on 1-hour charge' },
          { key: 'Precision', value: '0.5mm step increments' }
        ]
      },
      {
        name: 'Minimalist 10% Niacinamide Face Serum with Zinc (30ml)',
        slug: 'minimalist-10-niacinamide-serum',
        description: 'An active, concentrated daily serum that balances oil production, reduces acne marks, blemishes, and strengthens skin barrier. Enriched with pure Vitamin B3 and Zinc PCA.',
        price: 599,
        discountPrice: 539,
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Beauty and Personal Care'],
        categoryName: 'Beauty and Personal Care',
        brand: 'Minimalist',
        stock: 80,
        sku: 'SK-MINIMALIST-NIA',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 620,
        specifications: [
          { key: 'Key Ingredients', value: 'Niacinamide 10% + Zinc PCA 1%' },
          { key: 'Skin Type', value: 'Oily, Combination, Acne-prone' },
          { key: 'Volume', value: '30 ml' }
        ]
      },
      {
        name: 'Versace Dylan Blue Eau De Toilette Luxury Perfume for Men (100ml)',
        slug: 'versace-dylan-blue-edt-100ml',
        description: 'An enigmatic, Mediterranean fragrance with fresh aquatic notes, calabrian bergamot, grapefruit and fig leaves, enriched with deep violet leaves and black pepper. Unmistakably masculine and sensual.',
        price: 8500,
        discountPrice: 6800,
        images: [
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Beauty and Personal Care'],
        categoryName: 'Beauty and Personal Care',
        brand: 'Versace',
        stock: 15,
        sku: 'SK-VERSACEDB',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.8,
        numReviews: 135,
        specifications: [
          { key: 'Type', value: 'Eau De Toilette (EDT)' },
          { key: 'Volume', value: '100 ml' },
          { key: 'Fragrance Family', value: 'Aromatic Fougere Woody' }
        ]
      },
      {
        name: "L'Oreal Paris Extraordinary Oil Hair Serum (100ml)",
        slug: 'loreal-extraordinary-oil-hair-serum',
        description: 'Infused with a blend of 6 rare precious floral oils. Provides intense nourishment, eliminates frizz, and adds brilliant radiant shine without greasiness. Use before shampoo, before styling, or as a finishing touch.',
        price: 649,
        discountPrice: 479,
        images: [
          'https://images.unsplash.com/photo-1608248597359-00994f31cce1?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Beauty and Personal Care'],
        categoryName: 'Beauty and Personal Care',
        brand: "L'Oreal Paris",
        stock: 55,
        sku: 'SK-LOREALSRM',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.5,
        numReviews: 440,
        specifications: [
          { key: 'Volume', value: '100 ml' },
          { key: 'Hair Type', value: 'All Hair Types (Dry & Frizzy)' },
          { key: 'Benefit', value: 'Shine, Smoothness & Heat Protection' }
        ]
      },

      // Category: Books
      {
        name: 'Atomic Habits: An Easy & Proven Way to Build Good Habits by James Clear',
        slug: 'atomic-habits-james-clear',
        description: 'World #1 bestseller with over 15 million copies sold. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
        price: 799,
        discountPrice: 449,
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Books'],
        categoryName: 'Books',
        brand: 'Random House Business',
        stock: 120,
        sku: 'SK-BOOK-ATOMICH',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.9,
        numReviews: 1250,
        specifications: [
          { key: 'Author', value: 'James Clear' },
          { key: 'Format', value: 'Hardcover' },
          { key: 'Pages', value: '320 pages' },
          { key: 'Language', value: 'English' }
        ]
      },
      {
        name: 'The Psychology of Money by Morgan Housel',
        slug: 'psychology-of-money-morgan-housel',
        description: 'Timeless lessons on wealth, greed, and happiness. Doing well with money isn’t necessarily about what you know. It’s about how you behave. And behavior is hard to teach, even to really smart people.',
        price: 499,
        discountPrice: 299,
        images: [
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Books'],
        categoryName: 'Books',
        brand: 'Jaico Publishing',
        stock: 90,
        sku: 'SK-BOOK-PSYCHM',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.8,
        numReviews: 920,
        specifications: [
          { key: 'Author', value: 'Morgan Housel' },
          { key: 'Format', value: 'Paperback' },
          { key: 'Pages', value: '256 pages' }
        ]
      },
      {
        name: 'Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin',
        slug: 'clean-code-robert-martin',
        description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Master software craftsman Robert C. Martin presents a revolutionary paradigm with Clean Code.',
        price: 1899,
        discountPrice: 1450,
        images: [
          'https://images.unsplash.com/photo-1532012164546-f432f2e3edd9?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Books'],
        categoryName: 'Books',
        brand: 'Pearson',
        stock: 35,
        sku: 'SK-BOOK-CLEANCODE',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 310,
        specifications: [
          { key: 'Author', value: 'Robert C. Martin (Uncle Bob)' },
          { key: 'Format', value: 'Paperback' },
          { key: 'Pages', value: '464 pages' }
        ]
      },
      {
        name: 'Ikigai: The Japanese Secret to a Long and Happy Life',
        slug: 'ikigai-japanese-secret-long-life',
        description: 'According to the Japanese, everyone has an ikigai - a reason for being. This beautiful international bestseller brings you the secrets of the world longest-living people in Okinawa, Japan.',
        price: 550,
        discountPrice: 325,
        images: [
          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Books'],
        categoryName: 'Books',
        brand: 'Penguin Life',
        stock: 75,
        sku: 'SK-BOOK-IKIGAI',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.6,
        numReviews: 780,
        specifications: [
          { key: 'Authors', value: 'Hector Garcia and Francesc Miralles' },
          { key: 'Format', value: 'Hardcover' },
          { key: 'Pages', value: '208 pages' }
        ]
      },

      // Category: Grocery
      {
        name: 'Nescafe Gold Blend Premium Freeze Dried Soluble Coffee (200g)',
        slug: 'nescafe-gold-blend-coffee-200g',
        description: 'Expertly crafted blend of Arabica and Robusta coffee beans roasted to golden perfection. Freeze-dried to lock in rich, smooth aroma and balanced roasted taste in every single cup.',
        price: 995,
        discountPrice: 799,
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Grocery'],
        categoryName: 'Grocery',
        brand: 'Nescafe',
        stock: 50,
        sku: 'SK-NESCAFEGOLD',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 320,
        specifications: [
          { key: 'Weight', value: '200 Grams' },
          { key: 'Roast Level', value: 'Medium Roast' },
          { key: 'Type', value: '100% Pure Freeze Dried Coffee' }
        ]
      },
      {
        name: 'Tata Sampann Unpolished Organic Toor Dal (1kg)',
        slug: 'tata-sampann-organic-toor-dal-1kg',
        description: 'Tata Sampann Toor Dal is unpolished, meaning it does not undergo any artificial polishing with water, oil or leather, thereby retaining its natural goodness, authentic taste, and wholesome protein content.',
        price: 245,
        discountPrice: 199,
        images: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Grocery'],
        categoryName: 'Grocery',
        brand: 'Tata Sampann',
        stock: 100,
        sku: 'SK-TATATOOR',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.6,
        numReviews: 450,
        specifications: [
          { key: 'Net Quantity', value: '1 kg' },
          { key: 'Form', value: 'Unpolished Pulses' },
          { key: 'Nutrition', value: 'High Protein, Rich in Fiber' }
        ]
      },
      {
        name: 'Nutella Hazelnut Spread with Cocoa (750g Family Pack)',
        slug: 'nutella-hazelnut-spread-750g',
        description: 'The unmistakable creamy taste of Nutella Hazelnut spread with cocoa. Made with 7 quality, carefully chosen ingredients including delicious selected hazelnuts and rich cocoa.',
        price: 699,
        discountPrice: 549,
        images: [
          'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Grocery'],
        categoryName: 'Grocery',
        brand: 'Nutella',
        stock: 45,
        sku: 'SK-NUTELLA750',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.9,
        numReviews: 610,
        specifications: [
          { key: 'Weight', value: '750 Grams' },
          { key: 'Storage', value: 'Store in cool and dry place' },
          { key: 'Vegetarian', value: '100% Vegetarian' }
        ]
      },
      {
        name: 'Fortune Sunlite Refined Sunflower Oil (5L Jar)',
        slug: 'fortune-sunlite-sunflower-oil-5l',
        description: 'Light, healthy and easy to digest refined sunflower oil. Enriched with Vitamin A and Vitamin D. Perfect for all daily Indian cooking, deep frying, and sauteing.',
        price: 890,
        discountPrice: 720,
        images: [
          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Grocery'],
        categoryName: 'Grocery',
        brand: 'Fortune',
        stock: 60,
        sku: 'SK-FORTUNEOIL-5L',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.5,
        numReviews: 290,
        specifications: [
          { key: 'Volume', value: '5 Litres' },
          { key: 'Container', value: 'Food Grade Easy Pour Can' },
          { key: 'Fortified', value: 'Vitamins A & D' }
        ]
      },

      // Category: Sports and Fitness
      {
        name: 'Yonex Astrox 88D Play Carbon Badminton Racket with Full Cover',
        slug: 'yonex-astrox-88d-play-racket',
        description: 'Engineered for aggressive backcourt attack and steep smashing. Features Rotational Generator System with counterbalanced weight distribution for maximum control and rapid transition between shots.',
        price: 3490,
        discountPrice: 2499,
        images: [
          'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Sports and Fitness'],
        categoryName: 'Sports and Fitness',
        brand: 'Yonex',
        stock: 25,
        sku: 'SK-YONEX88D',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 180,
        specifications: [
          { key: 'Frame', value: 'Graphite / Slim Shaft' },
          { key: 'Weight & Grip', value: '4U (Avg. 83g) G5' },
          { key: 'Tension', value: 'String tension up to 28 lbs' }
        ]
      },
      {
        name: 'Strauss Anti-Skid Dual Color TPE Yoga Mat with Carrying Strap (6mm)',
        slug: 'strauss-tpe-yoga-mat-6mm',
        description: 'Eco-friendly premium TPE material with double-sided textured non-slip grip. 6mm optimal thickness cushions knees, joints, and spine on hard floors while providing excellent balance and stability.',
        price: 1899,
        discountPrice: 999,
        images: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Sports and Fitness'],
        categoryName: 'Sports and Fitness',
        brand: 'Strauss',
        stock: 40,
        sku: 'SK-STRAUSSMAT',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.5,
        numReviews: 320,
        specifications: [
          { key: 'Material', value: 'TPE (Thermoplastic Elastomer)' },
          { key: 'Thickness', value: '6 mm High Density' },
          { key: 'Size', value: '72 x 24 inches' }
        ]
      },
      {
        name: 'Boldfit Heavy Duty Resistance Bands Set of 5 with Handles & Door Anchor',
        slug: 'boldfit-resistance-bands-set-5',
        description: 'Complete portable home gym workout kit. 5 stackable tube bands offering up to 150 lbs total resistance. Comes with 2 foam cushioned handles, 2 ankle straps, door anchor, and travel pouch.',
        price: 2499,
        discountPrice: 1199,
        images: [
          'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Sports and Fitness'],
        categoryName: 'Sports and Fitness',
        brand: 'Boldfit',
        stock: 55,
        sku: 'SK-BOLDFITBANDS',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.6,
        numReviews: 240,
        specifications: [
          { key: 'Resistance Levels', value: '10 lbs, 20 lbs, 30 lbs, 40 lbs, 50 lbs' },
          { key: 'Material', value: '100% Natural Latex' },
          { key: 'Includes', value: '5 Bands + 2 Handles + 2 Ankle Straps + Door Anchor' }
        ]
      },
      {
        name: 'Nivia Storm Rubber Moulded Football (Size 5)',
        slug: 'nivia-storm-football-size-5',
        description: 'FIFA quality standard rubber moulded construction with 32 panels. Excellent air retention, water resistance, and high shape stability on rough outdoor grounds, grass, and turf.',
        price: 920,
        discountPrice: 599,
        images: [
          'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Sports and Fitness'],
        categoryName: 'Sports and Fitness',
        brand: 'Nivia',
        stock: 35,
        sku: 'SK-NIVIASTORM',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.4,
        numReviews: 190,
        specifications: [
          { key: 'Size', value: 'Size 5 Standard Match Ball' },
          { key: 'Material', value: 'Abrasion resistant rubber outer' },
          { key: 'Bladder', value: 'Reinforced butyl bladder' }
        ]
      },

      // Category: Computers and Accessories
      {
        name: 'Apple MacBook Air 13.6-inch (M3 Chip, 16GB Unified Memory, 512GB SSD - Midnight)',
        slug: 'apple-macbook-air-m3-16gb',
        description: 'Supercharged by Apple M3 chip with an 8-core CPU and 10-core GPU. Strikingly thin design with up to 18 hours of battery life. Liquid Retina display supports 1 billion colors. Dual external display support.',
        price: 134900,
        discountPrice: 124900,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Computers and Accessories'],
        categoryName: 'Computers and Accessories',
        brand: 'Apple',
        stock: 16,
        sku: 'SK-MACBAIR-M3',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.9,
        numReviews: 210,
        specifications: [
          { key: 'Display', value: '13.6-inch Liquid Retina with True Tone' },
          { key: 'Chip', value: 'Apple M3 with 8-core CPU and 10-core GPU' },
          { key: 'RAM', value: '16GB Unified Memory' },
          { key: 'Storage', value: '512GB Fast NVMe SSD' },
          { key: 'Battery', value: 'Up to 18 hours battery life' }
        ]
      },
      {
        name: 'Dell XPS 13 9340 (Intel Core Ultra 7 155H, 16GB, 1TB SSD, FHD+ 120Hz)',
        slug: 'dell-xps-13-ultra-7',
        description: 'Iconic modern design crafted with CNC machined aluminum and Gorilla Glass 3. Seamless glass touchpad, touch function row, and edge-to-edge zero-lattice keyboard. Windows 11 with built-in Copilot AI key.',
        price: 149990,
        discountPrice: 138990,
        images: [
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Computers and Accessories'],
        categoryName: 'Computers and Accessories',
        brand: 'Dell',
        stock: 10,
        sku: 'SK-DELLXPS13',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 85,
        specifications: [
          { key: 'Processor', value: 'Intel Core Ultra 7 155H with NPU' },
          { key: 'Display', value: '13.4-inch FHD+ 120Hz InfinityEdge' },
          { key: 'Storage', value: '1TB PCIe Gen4 NVMe' },
          { key: 'Weight', value: '1.19 kg' }
        ]
      },
      {
        name: 'Logitech MX Master 3S Wireless Performance Ergonomic Mouse (Pale Grey)',
        slug: 'logitech-mx-master-3s-mouse',
        description: 'Quiet clicks technology delivers 90% less click noise. 8K DPI any-surface tracking, including on glass. MagSpeed electromagnetic scrolling is 90% faster and 87% more precise. Ergonomic silhouette crafted for palm comfort.',
        price: 10995,
        discountPrice: 8495,
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Computers and Accessories'],
        categoryName: 'Computers and Accessories',
        brand: 'Logitech',
        stock: 30,
        sku: 'SK-LOGIMX3S',
        isFeatured: true,
        isShopKartAssured: true,
        rating: 4.8,
        numReviews: 380,
        specifications: [
          { key: 'Sensor', value: 'Darkfield 8000 DPI' },
          { key: 'Battery', value: 'Rechargeable Li-Po (500 mAh) up to 70 days' },
          { key: 'Connectivity', value: 'Bluetooth Low Energy & Logi Bolt USB' }
        ]
      },
      {
        name: 'SanDisk 1TB Extreme Portable External SSD (Up to 1050MB/s, USB-C)',
        slug: 'sandisk-1tb-extreme-portable-ssd',
        description: 'Get fast NVMe solid state performance featuring 1050MB/s read and 1000MB/s write speeds in a portable, high-capacity drive. Up to 3-meter drop protection and IP65 water and dust resistance.',
        price: 14500,
        discountPrice: 8999,
        images: [
          'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['Computers and Accessories'],
        categoryName: 'Computers and Accessories',
        brand: 'SanDisk',
        stock: 40,
        sku: 'SK-SANDISK1TB',
        isFeatured: false,
        isShopKartAssured: true,
        rating: 4.7,
        numReviews: 290,
        specifications: [
          { key: 'Capacity', value: '1 Terabyte' },
          { key: 'Speed', value: 'Read: 1050 MB/s, Write: 1000 MB/s' },
          { key: 'Durability', value: 'IP65 Water and Dust resistant' }
        ]
      }
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`[Seed] Inserted ${createdProducts.length} realistic products across all 9 categories`);

    // 4. Create Coupons
    const oneMonthAhead = new Date();
    oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 3);

    const couponsData = [
      {
        code: 'WELCOME100',
        description: 'Flat ₹100 OFF on orders above ₹499 for new users',
        discountType: 'fixed',
        discountValue: 100,
        minOrderAmount: 499,
        maxDiscountAmount: 100,
        expiryDate: oneMonthAhead,
        usageLimit: 1000,
        isActive: true
      },
      {
        code: 'FIRST50',
        description: '50% Mega Savings up to ₹500 on minimum purchase of ₹299',
        discountType: 'percentage',
        discountValue: 50,
        minOrderAmount: 299,
        maxDiscountAmount: 500,
        expiryDate: oneMonthAhead,
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'SHOPKART10',
        description: '10% Instant Discount on orders above ₹999 (Max ₹1000)',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 999,
        maxDiscountAmount: 1000,
        expiryDate: oneMonthAhead,
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'SUPER50',
        description: 'Flat ₹50 OFF on orders above ₹399',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 399,
        maxDiscountAmount: 50,
        expiryDate: oneMonthAhead,
        usageLimit: 500,
        isActive: true
      }
    ];

    await Coupon.insertMany(couponsData);
    console.log(`[Seed] Inserted ${couponsData.length} discount coupons`);

    // 5. Create Sample Reviews
    const sampleReviews = [
      {
        user: reviewerUser._id,
        userName: reviewerUser.name,
        product: createdProducts[0]._id, // iPhone 15 Pro
        rating: 5,
        title: 'Exceptional build quality and camera!',
        comment: 'The natural titanium finish feels much lighter in hand than previous Pro models. The 5x camera and battery endurance have been outstanding. Genuine ShopKart Assured delivery in 1 day!',
        isVerifiedPurchase: true
      },
      {
        user: customerUser._id,
        userName: customerUser.name,
        product: createdProducts[0]._id, // iPhone 15 Pro
        rating: 5,
        title: 'Smooth 120Hz display & USB-C finally!',
        comment: 'Transferring large ProRes videos over USB-C is blazingly fast. Extremely happy with the purchase.',
        isVerifiedPurchase: true
      },
      {
        user: customerUser._id,
        userName: customerUser.name,
        product: createdProducts[4]._id, // Sony WH-1000XM5
        rating: 5,
        title: 'Best Noise Cancellation in the business',
        comment: 'Cuts out all airplane and office noise completely. Very comfortable for long 8+ hour work sessions.',
        isVerifiedPurchase: true
      },
      {
        user: reviewerUser._id,
        userName: reviewerUser.name,
        product: createdProducts[16]._id, // Atomic Habits
        rating: 5,
        title: 'Life changing book',
        comment: 'Very practical advice. Small 1% improvements make a massive compound difference over time. Must read!',
        isVerifiedPurchase: true
      }
    ];

    await Review.insertMany(sampleReviews);
    console.log(`[Seed] Inserted sample verified customer reviews`);

    // 6. Create a sample initial order for Rahul Sharma (Customer) so Order History is instantly visible
    const sampleOrder = new Order({
      user: customerUser._id,
      orderItems: [
        {
          product: createdProducts[4]._id,
          name: createdProducts[4].name,
          image: createdProducts[4].images[0],
          price: createdProducts[4].price,
          discountPrice: createdProducts[4].discountPrice,
          quantity: 1,
          subtotal: createdProducts[4].discountPrice
        }
      ],
      shippingAddress: customerUser.addresses[0],
      paymentMethod: 'MOCK_ONLINE',
      itemsPrice: createdProducts[4].price,
      sellingPrice: createdProducts[4].discountPrice,
      discountAmount: createdProducts[4].price - createdProducts[4].discountPrice,
      couponCode: 'WELCOME100',
      couponDiscount: 100,
      shippingPrice: 0,
      totalPrice: createdProducts[4].discountPrice - 100,
      isPaid: true,
      paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      orderStatus: 'Shipped',
      statusHistory: [
        {
          status: 'Placed',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          note: 'Order placed and paid online'
        },
        {
          status: 'Processing',
          timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
          note: 'Item picked and packed at warehouse'
        },
        {
          status: 'Shipped',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          note: 'Dispatched via BlueDart Express Air'
        }
      ],
      trackingNumber: 'SKTRK' + Date.now().toString().slice(-8)
    });
    await sampleOrder.save();
    console.log('[Seed] Created sample customer order with tracking timeline');

    console.log('\n======================================================');
    console.log('✅ ShopKart Database Seeded Successfully!');
    console.log('------------------------------------------------------');
    console.log('👑 Admin Account:');
    console.log('   Email:    admin@shopkart.com');
    console.log('   Password: Admin@12345');
    console.log('');
    console.log('👤 Customer Account:');
    console.log('   Email:    customer@shopkart.com');
    console.log('   Password: Customer@12345');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
