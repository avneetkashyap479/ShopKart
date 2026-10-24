const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    price: {
      type: Number,
      required: [true, 'Please add standard MRP / original price'],
      min: [0, 'Price must be positive']
    },
    discountPrice: {
      type: Number,
      required: [true, 'Please add selling / discounted price'],
      min: [0, 'Discount price must be positive']
    },
    discountPercentage: {
      type: Number,
      default: 0
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one product image']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
      index: true
    },
    categoryName: {
      type: String,
      index: true
    },
    brand: {
      type: String,
      required: [true, 'Please add a brand'],
      trim: true,
      index: true
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock count'],
      default: 10,
      min: [0, 'Stock cannot be negative']
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    specifications: [specificationSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isShopKartAssured: {
      type: Boolean,
      default: true
    },
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Calculate discount percentage before saving
productSchema.pre('save', function (next) {
  if (this.price && this.discountPrice) {
    if (this.price > this.discountPrice) {
      this.discountPercentage = Math.round(((this.price - this.discountPrice) / this.price) * 100);
    } else {
      this.discountPercentage = 0;
    }
  }
  next();
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
