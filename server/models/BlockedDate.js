const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const BlockedDateSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    reason: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

BlockedDateSchema.plugin(idPlugin);

module.exports = mongoose.model('BlockedDate', BlockedDateSchema);
