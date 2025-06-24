const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/update-photo', verifyToken, async (req, res) => {
  const { photoURL } = req.body;
  const uid = req.uid;

  if (!photoURL) return res.status(400).json({ error: 'Missing photoURL' });

  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.photoURL = photoURL;
    await user.save(); // ✅ Make sure it is committed to DB

    return res.status(200).json({ message: 'Photo updated successfully', user });
  } catch (err) {
    console.error('Error updating photo:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post('/update-name', verifyToken, async (req, res) => {
  const {  displayName } = req.body;
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
