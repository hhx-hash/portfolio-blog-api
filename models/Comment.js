const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  body: { type: String, required: true, trim: true, maxlength: 1000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }
}, { timestamps: true, collection: 'comments' });

module.exports = mongoose.model('Comment', commentSchema);
