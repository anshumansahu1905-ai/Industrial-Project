// Populates the database with a handful of products and an admin account
// so you have something to click through right after setup.
// Run with: npm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 179.99,
    category: 'Electronics',
    tags: ['audio', 'wireless', 'travel'],
    images: [],
    stock: 25,
    sku: 'ELEC-001',
  },
  {
    name: 'Mechanical Keyboard - Brown Switches',
    description: 'Tactile mechanical keyboard with per-key RGB and a detachable USB-C cable.',
    price: 89.5,
    category: 'Electronics',
    tags: ['keyboard', 'peripherals', 'rgb'],
    images: [],
    stock: 40,
    sku: 'ELEC-002',
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    description: 'Hand-glazed ceramic dripper and matching mug, holds up to 2 cups.',
    price: 34.0,
    category: 'Home & Kitchen',
    tags: ['coffee', 'ceramic', 'gift'],
    images: [],
    stock: 60,
    sku: 'HOME-001',
  },
  {
    name: 'Merino Wool Crew Socks (3-Pack)',
    description: 'Breathable merino wool blend, cushioned sole, unisex sizing.',
    price: 24.99,
    category: 'Apparel',
    tags: ['wool', 'socks', 'everyday'],
    images: [],
    stock: 100,
    sku: 'APP-001',
  },
  {
    name: 'Stainless Steel Pour Kettle',
    description: 'Gooseneck kettle for precision pouring, 1L capacity, stovetop safe.',
    price: 42.0,
    category: 'Home & Kitchen',
    tags: ['coffee', 'kitchen', 'steel'],
    images: [],
    stock: 30,
    sku: 'HOME-002',
  },
  {
    name: 'Trail Running Shoes',
    description: 'Lightweight trail runners with aggressive lug pattern for wet terrain.',
    price: 129.0,
    category: 'Apparel',
    tags: ['shoes', 'running', 'outdoor'],
    images: [],
    stock: 18,
    sku: 'APP-002',
  },
  {
    name: '65W USB-C GaN Charger',
    description: 'Compact three-port fast charger, enough to power a laptop and two phones.',
    price: 39.99,
    category: 'Electronics',
    tags: ['charger', 'travel', 'usb-c'],
    images: [],
    stock: 75,
    sku: 'ELEC-003',
  },
  {
    name: 'Linen Throw Blanket',
    description: 'Pre-washed linen blanket, breathable for year-round use.',
    price: 58.0,
    category: 'Home & Kitchen',
    tags: ['linen', 'blanket', 'gift'],
    images: [],
    stock: 22,
    sku: 'HOME-003',
  },
];

async function seed() {
  await connectDB();

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Inserted ${products.length} products`);

  const adminExists = await User.findOne({ email: 'admin@example.com' });
  if (!adminExists) {
    await User.create({
      name: 'Store Admin',
      email: 'admin@example.com',
      password: 'admin1234',
      role: 'admin',
    });
    console.log('Created admin user: admin@example.com / admin1234');
  }

  console.log('Seed complete');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
