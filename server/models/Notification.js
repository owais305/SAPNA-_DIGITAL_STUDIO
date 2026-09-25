const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const NotificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    meta: { type: String, default: '' },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

NotificationSchema.plugin(idPlugin);

module.exports = mongoose.model('Notification', NotificationSchema);
