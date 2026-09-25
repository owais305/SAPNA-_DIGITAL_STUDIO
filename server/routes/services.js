const express = require('express');
const Service = require('../models/Service');
const { requireAuth } = require('../middleware/auth');
const { isValidId } = require('../utils/isValidId');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const rows = await Service.find().sort({ sort_order: 1, _id: 1 });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Service not found' });
    const row = await Service.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Service not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, price, thumbnail, active, sort_order } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title is required' });
    const row = await Service.create({
      title,
      description: description || '',
      price: price || 0,
      thumbnail: thumbnail || '',
      active: active === undefined ? true : Boolean(active),
      sort_order: sort_order || 0,
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Service not found' });
    const row = await Service.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Service not found' });

    const { title, description, price, thumbnail, active, sort_order } = req.body || {};
    if (title !== undefined) row.title = title;
    if (description !== undefined) row.description = description;
    if (price !== undefined) row.price = price;
    if (thumbnail !== undefined) row.thumbnail = thumbnail;
    if (active !== undefined) row.active = Boolean(active);
    if (sort_order !== undefined) row.sort_order = sort_order;

    await row.save();
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Service not found' });
    const row = await Service.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ error: 'Service not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
