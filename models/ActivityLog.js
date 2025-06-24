const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['contact_created', 'contact_updated', 'contact_deleted', 'bulk_import', 'bulk_delete', 'user_login'],
    required: true
  },
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  entityName: String,
  metadata: Object,
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('ActivityLog', activitySchema);
