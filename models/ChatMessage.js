const { Schema, model } = require('mongoose');

const chatMessageSchema = new Schema({
     userId: { type: String, required: true },
    message: { type: String, required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  timestamp: { type: Date, default: Date.now },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
});

module.exports = model('ChatMessage', chatMessageSchema);