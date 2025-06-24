const express = require('express');
const router = express.Router();
const admin = require('../firebase/firebase');
const User = require('../models/User');
const axios = require('axios');
const verifyToken = require('../middleware/authMiddleware');
const { saveUser } = require('../controllers/authController');
const logActivity = require('../utils/logActivity');
const { getProfile } = require('../controllers/authController');


router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName });
    const user = await User.create({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL || '',
    });
    await logActivity({
  userId: user.uid,
  action: 'user_login',
  entityType: 'user',
  entityId: user._id,
  entityName: user.displayName || user.email
});

    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken, localId: uid } = response.data;

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ error: 'User not found in DB' });

    await logActivity({
      userId: user.uid,
      action: 'user_login',
      entityType: 'user',
      entityId: user._id,
      entityName: user.displayName || user.email,
    });

    res.status(200).json({ token: idToken, user });
  } catch (err) {
    const code = err.response?.data?.error?.message;
    if (code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/save-user', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;
  try {
    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({ uid, email, displayName, photoURL });
    }

    await logActivity({
      userId: user.uid,
      action: 'user_login',
      entityType: 'user',
      entityId: user._id,
      entityName: user.displayName || user.email
    });

    res.status(200).json({ message: 'User saved successfully', user });
  } catch (err) {
    console.error('Error saving Google user:', err);
    res.status(500).json({ error: 'Error saving user' });
  }
});

router.get('/me', verifyToken, getProfile);


module.exports = router;
