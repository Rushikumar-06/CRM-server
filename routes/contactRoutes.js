const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);

// 🔒 Only return contacts belonging to the current user
router.get('/', async (req, res) => {
  const contacts = await Contact.find({ userId: req.user.uid });
  res.json(contacts);
});

// 🔒 Only return the contact if it belongs to the current user
router.get('/:id', async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, userId: req.user.uid });
  if (!contact) return res.status(404).json({ error: 'Not found' });
  res.json(contact);
});

// 🔒 Save the new contact under the current user
router.post('/', async (req, res) => {
  const contact = new Contact({ ...req.body, userId: req.user.uid });
  await contact.save();
  res.status(201).json(contact);
});

// 🔒 Only allow update if the contact belongs to the current user
router.put('/:id', async (req, res) => {
  const updated = await Contact.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.uid },
    req.body,
    { new: true }
  );
  res.json(updated);
});

// 🔒 Only delete contact if it belongs to the current user
router.delete('/:id', async (req, res) => {
  await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
  res.status(204).end();
});

// 🔒 Import CSV and assign all contacts to the current user
router.post('/import', upload.single('file'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push({ ...data, userId: req.user.uid }))
    .on('end', async () => {
      await Contact.insertMany(results);
      fs.unlinkSync(req.file.path);
      res.status(201).json({ message: 'Imported' });
    });
});

module.exports = router;