const express = require('express');
const Product = require('../models/Product');
const { protect, attachUserIfPresent } = require('../middleware/auth');

const router = express.Router();

// GET /api/products?q=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      newest: { createdAt: -1 },
      rating: { avgRating: -1 },
    };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalResults: total,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/categories - distinct list for building filter UI
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', attachUserIfPresent, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // track view for logged-in users so the recommender has something to work with
    if (req.user) {
      await req.user.updateOne({ $addToSet: { viewedProducts: product._id } });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    product.reviews.push({ user: req.user._id, rating, comment });
    product.recalculateRating();
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
