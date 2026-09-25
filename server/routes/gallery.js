const express = require('express');
const Gallery = require('../models/Gallery');
const { requireAuth } = require('../middleware/auth');
const { isValidId } = require('../utils/isValidId');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const rows = await Gallery.find(query).sort({ sort_order: 1, _id: 1 });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { image_url, category, alt, sort_order } = req.body || {};
    if (!image_url) return res.status(400).json({ error: 'image_url is required' });
    let order = sort_order;
    if (order === undefined) {
      const last = await Gallery.findOne().sort({ sort_order: -1 });
      order = last ? last.sort_order + 1 : 0;
    }
    const row = await Gallery.create({ image_url, category: category || 'General', alt: alt || '', sort_order: order });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Photo not found' });
    const row = await Gallery.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Photo not found' });

    const { image_url, category, alt, sort_order } = req.body || {};
    if (image_url !== undefined) row.image_url = image_url;
    if (category !== undefined) row.category = category;
    if (alt !== undefined) row.alt = alt;
    if (sort_order !== undefined) row.sort_order = sort_order;

    await row.save();
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/gallery/reorder  { order: [id1, id2, id3, ...] }
router.patch('/reorder', async (req, res, next) => {
  try {
    const { order } = req.body || {};
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array of ids' });
    await Promise.all(order.map((id, index) => Gallery.findByIdAndUpdate(id, { sort_order: index })));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Photo not found' });
    const row = await Gallery.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ error: 'Photo not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
