const mongoose = require('mongoose');
const User = require('../models/User');

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  // Wait until the unique username and email indexes are ready.
  await User.init();
  console.log('Connected to portfolio_blog');
}

module.exports = { connectDB: connectDB };
