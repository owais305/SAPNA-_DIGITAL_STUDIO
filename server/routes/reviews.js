const express = require('express');
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');
const { isValidId } = require('../utils/isValidId');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { approved } = req.query;
    const query = approved !== undefined ? { approved: approved === '1' || approved === 'true' } : {};
    res.json(await Review.find(query).sort({ created_at: -1 }));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Review not found' });
    const row = await Review.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Review not found' });
    row.approved = Boolean(req.body?.approved);
    await row.save();
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Review not found' });
    const row = await Review.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
