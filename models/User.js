const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  displayName: String,
  email: { type: String, required: true, unique: true },
  photoURL: String || "",
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
