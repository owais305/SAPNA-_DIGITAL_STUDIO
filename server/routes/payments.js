const express = require('express');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { requireAuth } = require('../middleware/auth');
const { isValidId } = require('../utils/isValidId');

const router = express.Router();
router.use(requireAuth);

function shape(p) {
  const obj = p.toJSON ? p.toJSON() : p;
  const booking = obj.booking_id && typeof obj.booking_id === 'object' ? obj.booking_id : null;
  return {
    ...obj,
    booking_id: booking ? booking.id : obj.booking_id,
    customer_name: booking ? booking.name : null,
    service_name: booking ? booking.service_name : null,
    booking_date: booking ? booking.date : null,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const { status, booking_id } = req.query;
    const query = {};
    if (status) query.status = status;
    if (booking_id) query.booking_id = booking_id;

    const rows = await Payment.find(query)
      .populate('booking_id', 'name service_name date')
      .sort({ created_at: -1 });

    res.json(rows.map(shape));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { booking_id, amount, type, status, method, note } = req.body || {};
    if (!booking_id || !amount) return res.status(400).json({ error: 'booking_id and amount are required' });
    if (!isValidId(booking_id)) return res.status(404).json({ error: 'Booking not found' });
    const booking = await Booking.findById(booking_id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const row = await Payment.create({
      booking_id,
      amount,
      type: type || 'deposit',
      status: status || 'pending',
      method: method || '',
      note: note || '',
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Payment not found' });
    const row = await Payment.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Payment not found' });

    const { amount, type, status, method, note } = req.body || {};
    if (amount !== undefined) row.amount = amount;
    if (type !== undefined) row.type = type;
    if (status !== undefined) row.status = status;
    if (method !== undefined) row.method = method;
    if (note !== undefined) row.note = note;

    await row.save();
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Payment not found' });
    const row = await Payment.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ error: 'Payment not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
