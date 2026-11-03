const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, trim: true,
    minlength: 3, maxlength: 30, match: /^[A-Za-z0-9_]+$/
  },
  email: {
    type: String, required: true, unique: true, trim: true,
    lowercase: true, maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['author', 'admin'], default: 'author' }
}, { timestamps: true, collection: 'users' });

module.exports = mongoose.model('User', userSchema);
