const express = require('express');
const Booking = require('../models/Booking');
const BlockedDate = require('../models/BlockedDate');
const { requireAuth } = require('../middleware/auth');
const { isValidId } = require('../utils/isValidId');

const router = express.Router();
router.use(requireAuth);

// GET /api/calendar?month=YYYY-MM  -> bookings + blocked dates for that month
router.get('/', async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const from = `${month}-01`;
    const to = `${month}-31`;

    const bookings = await Booking.find({ date: { $gte: from, $lte: to }, status: { $ne: 'cancelled' } }).sort({ date: 1, time: 1 });
    const blocked = await BlockedDate.find({ date: { $gte: from, $lte: to } }).sort({ date: 1 });

    res.json({ bookings, blocked });
  } catch (err) {
    next(err);
  }
});

router.get('/blocked-dates', async (req, res, next) => {
  try {
    res.json(await BlockedDate.find().sort({ date: 1 }));
  } catch (err) {
    next(err);
  }
});

router.post('/blocked-dates', async (req, res, next) => {
  try {
    const { date, reason } = req.body || {};
    if (!date) return res.status(400).json({ error: 'date is required' });
    const existing = await BlockedDate.findOne({ date });
    if (existing) return res.status(409).json({ error: 'This date is already blocked' });
    const row = await BlockedDate.create({ date, reason: reason || '' });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/blocked-dates/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Not found' });
    const row = await BlockedDate.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
