const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');

router.get('/', verifyToken, async (req, res) => {
  const convos = await Conversation.find({ userId: req.user.uid }).sort('-createdAt');
  res.json(convos);
});

router.post('/', verifyToken, async (req, res) => {
  const convo = await Conversation.create({ userId: req.user.uid, title: req.body.title, createdAt: new Date() });
  res.status(201).json(convo);
});

module.exports = router;
