const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    email: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

AdminSchema.plugin(idPlugin);

module.exports = mongoose.model('Admin', AdminSchema);
