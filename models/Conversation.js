const { Schema, model } = require('mongoose');

const conversationSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, default: 'Untitled Conversation' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model('Conversation', conversationSchema);
