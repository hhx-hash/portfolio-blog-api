require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./config/db');
const app = require('./app');

const port = process.env.PORT || 3000;

async function start() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 ||
        !process.env.CLIENT_ORIGIN) {
      throw new Error('Check the JWT secret and client origin.');
    }
    await db.connectDB();
    // 0.0.0.0 makes the port reachable from outside the container, which is how
    // the hosting service forwards the public HTTPS requests to this process.
    const server = app.listen(port, '0.0.0.0', function () {
      console.log('API ready on port ' + port);
    });
    // Stop accepting new requests, then close the database connection so the
    // platform can replace the instance without leaving sockets behind.
    function shutdown() {
      server.close(async function () {
        await mongoose.disconnect();
      });
    }
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Startup failed. Check private settings and Atlas access.');
    process.exit(1);
  }
}

start();
