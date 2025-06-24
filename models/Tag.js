const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: '#888888' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  usageCount: { type: Number, default: 0 },
  userId: { type: String, required: true },
});

module.exports = mongoose.model('Tag', tagSchema);
