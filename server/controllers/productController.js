const Product = require('../models/Product');
const Category = require('../models/Category');

// Helper to generate slug
const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
};

// @desc    Get all products with filters, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    // Keyword search
    if (req.query.keyword) {
      const keywordRegex = new RegExp(req.query.keyword.trim(), 'i');
      query.$or = [
        { name: keywordRegex },
        { description: keywordRegex },
        { brand: keywordRegex },
        { categoryName: keywordRegex }
      ];
    }

    // Category filter
    if (req.query.category) {
      // Check if it's an ObjectId or slug/name
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = req.query.category;
      } else {
        const foundCategory = await Category.findOne({
          $or: [{ slug: req.query.category.toLowerCase() }, { name: new RegExp(`^${req.query.category}$`, 'i') }]
        });
        if (foundCategory) {
          query.category = foundCategory._id;
        } else {
          // If category name doesn't match a document, match against categoryName field
          query.categoryName = new RegExp(req.query.category, 'i');
        }
      }
    }

    // Brand filter
    if (req.query.brand) {
      const brands = req.query.brand.split(',').map((b) => b.trim());
      query.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.discountPrice = {};
      if (req.query.minPrice) query.discountPrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.discountPrice.$lte = Number(req.query.maxPrice);
    }

    // Rating filter (e.g. 4 for 4 stars and above)
    if (req.query.rating) {
      query.rating = { $gte: Number(req.query.rating) };
    }

    // In stock filter
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
          sortOptions = { discountPrice: 1 };
          break;
        case 'price-desc':
          sortOptions = { discountPrice: -1 };
          break;
        case 'rating-desc':
          sortOptions = { rating: -1, numReviews: -1 };
          break;
        case 'popular':
          sortOptions = { numReviews: -1, rating: -1 };
          break;
        case 'discount-desc':
          sortOptions = { discountPercentage: -1 };
          break;
        case 'newest':
        default:
          sortOptions = { createdAt: -1 };
          break;
      }
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get available brands for filtering
    const availableBrands = await Product.distinct('brand', query.category ? { category: query.category } : {});

    res.json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit) || 1,
      currentPage: page,
      limit,
      availableBrands,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const featured = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .limit(10);
    res.json({ success: true, count: featured.length, products: featured });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick search suggestions
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ success: true, suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const suggestions = await Product.find({
      $or: [{ name: regex }, { brand: regex }, { categoryName: regex }]
    })
      .select('_id name brand discountPrice price images categoryName rating')
      .limit(6);

    res.json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch related products from same category
    const relatedProducts = await Product.find({
      category: product.category._id || product.category,
      _id: { $ne: product._id }
    })
      .limit(4)
      .select('name price discountPrice discountPercentage images rating numReviews brand');

    res.json({ success: true, product, relatedProducts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      brand,
      stock,
      images,
      specifications,
      isFeatured,
      isShopKartAssured
    } = req.body;

    // Check category
    const catDoc = await Category.findById(category);
    if (!catDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category specified' });
    }

    // Process images
    let productImages = [];
    if (req.files && req.files.length > 0) {
      productImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (images) {
      if (Array.isArray(images)) {
        productImages = images;
      } else if (typeof images === 'string') {
        productImages = images.split(',').map((img) => img.trim());
      }
    }

    if (productImages.length === 0) {
      productImages = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];
    }

    // Process specifications if provided as JSON string
    let parsedSpecs = [];
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (err) {
        parsedSpecs = [];
      }
    }

    const slug = createSlug(name);
    const sku = `SK-${Date.now().toString().slice(-6)}`;

    const product = new Product({
      name,
      slug,
      description,
      price: Number(price),
      discountPrice: Number(discountPrice || price),
      images: productImages,
      category: catDoc._id,
      categoryName: catDoc.name,
      brand: brand || 'ShopKart Basic',
      stock: Number(stock !== undefined ? stock : 10),
      sku,
      specifications: parsedSpecs,
      isFeatured: isFeatured === true || isFeatured === 'true',
      isShopKartAssured: isShopKartAssured !== undefined ? isShopKartAssured === true || isShopKartAssured === 'true' : true
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, message: 'Product created successfully', product: createdProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      brand,
      stock,
      images,
      specifications,
      isFeatured,
      isShopKartAssured
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = Number(stock);
    if (isFeatured !== undefined) product.isFeatured = isFeatured === true || isFeatured === 'true';
    if (isShopKartAssured !== undefined) product.isShopKartAssured = isShopKartAssured === true || isShopKartAssured === 'true';

    if (category) {
      const catDoc = await Category.findById(category);
      if (catDoc) {
        product.category = catDoc._id;
        product.categoryName = catDoc.name;
      }
    }

    // Process new uploaded images or updated image list
    if (req.files && req.files.length > 0) {
      const newImgs = req.files.map((file) => `/uploads/${file.filename}`);
      product.images = [...newImgs, ...(product.images || [])];
    } else if (images) {
      if (Array.isArray(images)) {
        product.images = images;
      } else if (typeof images === 'string') {
        product.images = images.split(',').map((img) => img.trim());
      }
    }

    if (specifications) {
      try {
        product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (err) {
        // preserve old
      }
    }

    const updatedProduct = await product.save();
    res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
