const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', async (req, res) => {
  const { page = 0, limit = 10, action, start, end } = req.query;
  const query = { userId: req.user.uid };

  if (action) query.action = action;
  if (start || end) {
    query.timestamp = {};
    if (start) query.timestamp.$gte = new Date(start);
    if (end) query.timestamp.$lte = new Date(end);
  }

  const activities = await ActivityLog.find(query)
    .sort({ timestamp: -1 })
    .skip(page * limit)
    .limit(parseInt(limit));

  const total = await ActivityLog.countDocuments(query);

  res.json({
    activities,
    hasMore: (page + 1) * limit < total,
    nextPage: parseInt(page) + 1,
  });
});

module.exports = router;
