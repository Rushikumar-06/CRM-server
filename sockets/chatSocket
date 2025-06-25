const ChatMessage = require('../models/ChatMessage');
const { processWithAI } = require('../services/aiService');

const chatSocketHandler = (io, socket) => {
  socket.on('join-chat', async ({ userId, conversationId }) => {
    socket.join(`chat-${conversationId}`);
    const messages = await ChatMessage.find({ userId, conversationId }).sort({ timestamp: 1 });
    socket.emit('chat-history', messages);
  });

  socket.on('send-message', async ({ userId, message, conversationId }) => {
    try {
      const userMsg = await ChatMessage.create({ userId, message, sender: 'user', conversationId, timestamp: new Date() });
      io.to(`chat-${conversationId}`).emit('new-message', userMsg);

      io.to(`chat-${conversationId}`).emit('ai-typing', true);

      const aiReply = await processWithAI(message, userId);

      const aiMsg = await ChatMessage.create({ userId, message: aiReply, sender: 'ai', conversationId, timestamp: new Date() });
      io.to(`chat-${conversationId}`).emit('new-message', aiMsg);
      io.to(`chat-${conversationId}`).emit('ai-typing', false);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => console.log('Socket disconnected'));
};

module.exports = chatSocketHandler;
