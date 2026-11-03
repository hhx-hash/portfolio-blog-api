const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: {
    type: String, required: true, trim: true, lowercase: true, maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  message: { type: String, required: true, trim: true, maxlength: 2000 }
}, { timestamps: true, collection: 'messages' });

module.exports = mongoose.model('Message', messageSchema);
