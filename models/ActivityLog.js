const mongoose = require('mongoose');
const { Schema } = mongoose;

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: [
      'contact_created',
      'contact_updated',
      'contact_deleted',
      'bulk_import',
      'bulk_delete',
      'user_login'
    ],
    required: true,
  },
  entityType: String,
  entityId: Schema.Types.ObjectId,
  entityName: String,
  metadata: Object,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActivityLog', activitySchema);