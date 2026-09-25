const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const GallerySchema = new mongoose.Schema(
  {
    image_url: { type: String, required: true },
    category: { type: String, default: 'General' },
    alt: { type: String, default: '' },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

GallerySchema.plugin(idPlugin);

module.exports = mongoose.model('Gallery', GallerySchema);
