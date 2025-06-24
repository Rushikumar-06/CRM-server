const express = require('express');
const Contact = require('../models/Contact');
const Activity = require('../models/ActivityLog');
const Tag = require('../models/Tag');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();
router.use(verifyToken);

router.get('/summary', async (req, res) => {
  try {
    const uid = req.user.uid;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalContacts, newThisWeek, totalActivities, activeTags] = await Promise.all([
      Contact.countDocuments({ userId: uid }),
      Contact.countDocuments({ userId: uid, createdAt: { $gte: weekAgo } }),
      Activity.countDocuments({ userId: uid }),
      Tag.countDocuments({ userId: uid }),
    ]);

    res.json({ totalContacts, newThisWeek, totalActivities, activeTags });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary stats' });
  }
});

router.get('/contacts-by-company', async (req, res) => {
  try {
    const uid = req.user.uid;
    const data = await Contact.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    res.json(data);
  } catch (error) {
    console.error('Contacts by company error:', error);
    res.status(500).json({ error: 'Failed to fetch company chart' });
  }
});

router.get('/activities-timeline', async (req, res) => {
  try {
    const uid = req.user.uid;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    const data = await Activity.aggregate([
      { $match: { userId: uid, timestamp: { $gte: fromDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(data);
  } catch (error) {
    console.error('Activity timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch activity timeline' });
  }
});

router.get('/tag-distribution', async (req, res) => {
  try {
    const uid = req.user.uid;
    const data = await Contact.aggregate([
      { $match: { userId: uid } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (error) {
    console.error('Tag distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch tag distribution' });
  }
});

module.exports = router;
