const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(protect, requireAdmin); // everything below requires an admin

// GET /api/admin/stats - quick numbers for the dashboard landing page
router.get('/stats', async (req, res, next) => {
  try {
    const [productCount, orderCount, userCount, revenue] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments({ status: { $ne: 'pending' } }),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const lowStock = await Product.find({ stock: { $lte: 5 } }).select('name stock');

    res.json({
      productCount,
      orderCount,
      userCount,
      totalRevenue: revenue[0]?.total || 0,
      lowStock,
    });
  } catch (err) {
    next(err);
  }
});

// Product CRUD
router.post('/products', async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/products/:id/stock { stock }
router.patch('/products/:id/stock', async (req, res, next) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Orders
router.get('/orders', async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
