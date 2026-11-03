const mongoose = require('mongoose');

// A link may be blank. A supplied link must start with https://.
function checkLink(value) {
  if (value === '') {
    return true;
  }
  return value.startsWith('https://');
}

const projectSchema = new mongoose.Schema({
  title: {
    type: String, required: true, trim: true, minlength: 3, maxlength: 120
  },
  description: {
    type: String, required: true, trim: true, maxlength: 2000
  },
  imageUrl: { type: String, default: '', maxlength: 500, validate: checkLink },
  repoUrl: { type: String, default: '', maxlength: 500, validate: checkLink },
  liveUrl: { type: String, default: '', maxlength: 500, validate: checkLink },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, collection: 'projects' });

module.exports = mongoose.model('Project', projectSchema);
