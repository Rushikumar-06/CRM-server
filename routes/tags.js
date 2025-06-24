const express = require('express');
const Tag = require('../models/Tag');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();
router.use(verifyToken);

router.get('/', async (req, res) => {
  const tags = await Tag.find({ createdBy: req.user._id }).sort({ usageCount: -1 });
  res.json(tags);
});

router.post('/', async (req, res) => {
  const { name, color } = req.body;

  try {
    const newTag = await Tag.create({
      name,
      color,
      createdBy: req.user._id,
      userId : req.user.uid
    });
    res.status(201).json(newTag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const tag = await Tag.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    req.body,
    { new: true }
  );
  res.json(tag);
});

router.delete('/:id', async (req, res) => {
  const tag = await Tag.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!tag) return res.status(404).json({ error: 'Tag not found' });

  await tag.deleteOne();
  res.status(204).end();
});

module.exports = router;
