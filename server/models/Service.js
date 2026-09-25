const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
    thumbnail: { type: String, default: '' },
    active: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

ServiceSchema.plugin(idPlugin);

module.exports = mongoose.model('Service', ServiceSchema);
