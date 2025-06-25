const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const ChatMessage = require('../models/ChatMessage');
const { processWithAI } = require('../services/aiService');

router.post('/query', verifyToken, async (req, res) => {
  const { userId, message, conversationId } = req.body;
  const io = req.app.get('io');

  if (!userId || !message || !conversationId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const userMsg = await ChatMessage.create({ userId, message, sender: 'user', conversationId, timestamp: new Date() });
    io.to(`chat-${conversationId}`).emit('new-message', userMsg);

    io.to(`chat-${conversationId}`).emit('ai-typing', true);
    const aiReply = await processWithAI(message, userId);
    const aiMsg = await ChatMessage.create({ userId, message: aiReply, sender: 'ai', conversationId, timestamp: new Date() });

    io.to(`chat-${conversationId}`).emit('new-message', aiMsg);
    io.to(`chat-${conversationId}`).emit('ai-typing', false);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
