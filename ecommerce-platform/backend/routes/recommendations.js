const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, attachUserIfPresent } = require('../middleware/auth');

const router = express.Router();

/*
 * Recommendation strategy
 * -----------------------
 * We combine two cheap, no-external-dependency signals instead of calling
 * out to a separate ML service:
 *
 * 1. Content similarity - products that share category/tags with a given
 *    product (or with what the user has recently viewed), scored by overlap.
 * 2. Co-purchase - "customers who bought X also bought Y", derived from
 *    past orders at request time. Good enough at our scale; if the catalog
 *    grows a lot this should move to a precomputed job.
 *
 * Both are blended into a single ranked list. This keeps things fast and
 * explainable without needing a training pipeline.
 */

async function scoreByContent(product, excludeId, limit) {
  return Product.find({
    _id: { $ne: excludeId },
    $or: [{ category: product.category }, { tags: { $in: product.tags } }],
  })
    .limit(limit * 2)
    .then((candidates) =>
      candidates
        .map((c) => {
          let score = 0;
          if (c.category === product.category) score += 2;
          const sharedTags = c.tags.filter((t) => product.tags.includes(t)).length;
          score += sharedTags;
          return { product: c, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    );
}

async function scoreByCoPurchase(productId, limit) {
  const ordersWithProduct = await Order.find({
    'items.product': productId,
    status: { $ne: 'cancelled' },
  }).select('items');

  const counts = {};
  for (const order of ordersWithProduct) {
    for (const item of order.items) {
      const id = item.product.toString();
      if (id === productId.toString()) continue;
      counts[id] = (counts[id] || 0) + 1;
    }
  }

  const topIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  return Product.find({ _id: { $in: topIds } });
}

// GET /api/recommendations/product/:id - "similar / frequently bought together"
router.get('/product/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const [similar, coPurchased] = await Promise.all([
      scoreByContent(product, product._id, 6),
      scoreByCoPurchase(product._id, 6),
    ]);

    // merge, de-duped, co-purchase signal weighted slightly higher
    const merged = new Map();
    coPurchased.forEach((p) => merged.set(p._id.toString(), { product: p, score: 3 }));
    similar.forEach(({ product: p, score }) => {
      const key = p._id.toString();
      const existing = merged.get(key);
      merged.set(key, { product: p, score: (existing?.score || 0) + score });
    });

    const results = [...merged.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.product);

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/recommendations/for-you - personalized feed based on view history
router.get('/for-you', protect, async (req, res, next) => {
  try {
    const user = await req.user.populate('viewedProducts');
    const recentlyViewed = user.viewedProducts.slice(-5);

    if (recentlyViewed.length === 0) {
      // cold start: no history yet, fall back to best sellers
      const popular = await Product.find().sort({ purchaseCount: -1 }).limit(8);
      return res.json(popular);
    }

    const suggestionLists = await Promise.all(
      recentlyViewed.map((p) => scoreByContent(p, p._id, 4))
    );

    const merged = new Map();
    suggestionLists.flat().forEach(({ product, score }) => {
      const key = product._id.toString();
      const existing = merged.get(key);
      merged.set(key, { product, score: (existing?.score || 0) + score });
    });

    const viewedIds = new Set(recentlyViewed.map((p) => p._id.toString()));
    const results = [...merged.values()]
      .filter(({ product }) => !viewedIds.has(product._id.toString()))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.product);

    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
