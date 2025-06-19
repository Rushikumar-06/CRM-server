const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  tags: [String],
  notes: String,
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  lastInteraction: Date,
});

contactSchema.index({ name: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Contact', contactSchema);
