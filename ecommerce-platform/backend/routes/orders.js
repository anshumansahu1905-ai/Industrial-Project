const express = require('express');
const Stripe = require('stripe');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/orders/checkout - creates an order (pending) + a Stripe PaymentIntent
router.post('/checkout', protect, async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // recompute totals server-side - never trust prices sent from the client
    let subtotal = 0;
    const orderItems = cart.items.map(({ product, quantity }) => {
      subtotal += product.price * quantity;
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      };
    });

    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      tax,
      total,
      status: 'pending',
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe expects the smallest currency unit
      currency: 'usd',
      metadata: { orderId: order._id.toString() },
    });

    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/webhook - Stripe calls this when payment status changes.
// NOTE: this route must receive the raw body (see server.js), not JSON-parsed.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const order = await Order.findOne({ stripePaymentIntentId: intent.id });

    if (order && order.status === 'pending') {
      order.status = 'paid';
      order.paidAt = new Date();
      await order.save();

      // decrement stock and bump purchase counts for the recommender
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity, purchaseCount: item.quantity },
        });
      }

      await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
    }
  }

  res.json({ received: true });
});

// GET /api/orders - order history for the logged-in user
router.get('/', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
