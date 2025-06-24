const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/authMiddleware');
const logActivity = require('../utils/logActivity');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const contacts = await Contact.find({ userId: req.user.uid });
  res.json(contacts);
});

router.get('/:id', async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.uid });
  if (!contact) return res.status(404).json({ error: 'Not found' });
  res.json(contact);
});

router.post('/', async (req, res) => {
  const contact = new Contact({ ...req.body, userId: req.user.uid });
  await contact.save();

  await logActivity({
    userId: req.user.uid,
    action: 'contact_created',
    entityType: 'contact',
    entityId: contact._id,
    entityName: contact.name
  });

  res.status(201).json(contact);
});

router.put('/:id', async (req, res) => {
  const updated = await Contact.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.uid },
    req.body,
    { new: true }
  );

  await logActivity({
    userId: req.user.uid,
    action: 'contact_updated',
    entityType: 'contact',
    entityId: updated._id,
    entityName: updated.name,
    metadata: { updatedFields: Object.keys(req.body) }
  });

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
  if (deleted) {
    await logActivity({
      userId: req.user.uid,
      action: 'contact_deleted',
      entityType: 'contact',
      entityId: deleted._id,
      entityName: deleted.name
    });
  }
  res.status(204).end();
});

router.post('/import', upload.single('file'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push({ ...data, userId: req.user.uid }))
    .on('end', async () => {
      await Contact.insertMany(results);
      fs.unlinkSync(req.file.path);

      await logActivity({
        userId: req.user.uid,
        action: 'bulk_import',
        entityType: 'contact',
        entityName: 'Bulk Import',
        metadata: { count: results.length }
      });

      res.status(201).json({ message: 'Imported' });
    });
});

router.post('/bulk-delete', async (req, res) => {
  const { ids } = req.body; 

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No contact IDs provided for deletion.' });
  }

  try {
    const userId = req.user.uid;

    await Contact.deleteMany({ _id: { $in: ids }, userId });

    await logActivity({
      userId,
      action: 'bulk_delete',
      entityType: 'contact',
      entityName: 'Bulk Delete',
      metadata: { count: ids.length }
    });

    res.status(200).json({ message: 'Contacts deleted', deletedCount: ids.length });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ error: 'Failed to delete contacts' });
  }
});


module.exports = router;
