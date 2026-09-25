const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const ReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: '' },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    message: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

ReviewSchema.plugin(idPlugin);

module.exports = mongoose.model('Review', ReviewSchema);
