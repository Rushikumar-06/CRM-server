const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, action, entityType, entityId, entityName, metadata = {} }) => {
  await ActivityLog.create({
    userId,
    action,
    entityType,
    entityId,
    entityName,
    metadata,
  });
};

module.exports = logActivity;
