const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    reviews: [reviewSchema],
    avgRating: { type: Number, default: 0 },
    // tracked for "people also bought" style recommendations
    purchaseCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.methods.recalculateRating = function () {
  if (!this.reviews.length) {
    this.avgRating = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.avgRating = Math.round((total / this.reviews.length) * 10) / 10;
};

module.exports = mongoose.model('Product', productSchema);
