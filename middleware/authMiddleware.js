const admin = require('../firebase/firebase');
const User = require('../models/User'); 

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);


    const user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      return res.status(401).json({ error: 'User not found in database' });
    }

    req.user = user;        
    req.uid = decoded.uid;  
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = verifyToken;
