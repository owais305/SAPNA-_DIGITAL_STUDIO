const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

CustomerSchema.plugin(idPlugin);

module.exports = mongoose.model('Customer', CustomerSchema);
