const express = require('express');
const multer = require('multer');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const User = require('../models/User');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Update Profile Photo (Base64 stored in DB)
router.post('/update-photo', verifyToken, upload.single('photo'), async (req, res) => {
  const uid = req.uid;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { photoURL: base64Image },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'Photo updated successfully', user });
  } catch (err) {
    console.error('Photo update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update Display Name
router.post('/update-name', verifyToken, async (req, res) => {
  const { displayName } = req.body;
  const uid = req.uid;
  if (!uid || !displayName) {
    return res.status(400).json({ error: 'Missing uid or displayName' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { displayName },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'Name updated', user });
  } catch (err) {
    console.error('Name update error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
