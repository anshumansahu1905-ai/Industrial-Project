const Redis = require('ioredis');

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Two clients: a client sitting in subscribe mode can't issue other commands,
// so publishing and subscribing need separate connections.
const publisher = new Redis(url);
const subscriber = new Redis(url);

publisher.on('error', (err) => console.error('Redis publisher error:', err.message));
subscriber.on('error', (err) => console.error('Redis subscriber error:', err.message));

module.exports = { publisher, subscriber };
