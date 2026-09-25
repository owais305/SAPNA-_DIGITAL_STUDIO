const express = require('express');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const { requireAuth } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');
const { isValidId } = require('../utils/isValidId');

const router = express.Router();
const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

router.use(requireAuth);

// GET /api/bookings?status=&search=&date=&from=&to=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { status, search, date, from, to, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && VALID_STATUSES.includes(status)) query.status = status;
    if (date) query.date = date;
    if (from && to) query.date = { $gte: from, $lte: to };
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: re }, { email: re }, { phone: re }, { service_name: re }];
    }

    const total = await Booking.countDocuments(query);
    const skip = (Number(page) - 1) * Number(limit);
    const rows = await Booking.find(query)
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Booking not found' });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const payments = await Payment.find({ booking_id: booking.id }).sort({ created_at: -1 });
    res.json({ ...booking.toJSON(), payments });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, service_id, service_name, date, time, status, notes } = req.body || {};
    if (!name || !date || !time) {
      return res.status(400).json({ error: 'name, date and time are required' });
    }

    let customer = email ? await Customer.findOne({ email }) : null;
    if (!customer) {
      customer = await Customer.create({ name, email: email || '', phone: phone || '' });
    }

    const booking = await Booking.create({
      customer_id: customer.id,
      name,
      email: email || '',
      phone: phone || '',
      service_id: service_id || null,
      service_name: service_name || '',
      date,
      time,
      status: status || 'pending',
      notes: notes || '',
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Booking not found' });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const { status, date, time, notes, service_name, name, email, phone } = req.body || {};
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` });
    }

    const isReschedule = date !== undefined && date !== booking.date;
    const isStatusChange = status !== undefined && status !== booking.status;

    if (status !== undefined) booking.status = status;
    if (date !== undefined) booking.date = date;
    if (time !== undefined) booking.time = time;
    if (notes !== undefined) booking.notes = notes;
    if (service_name !== undefined) booking.service_name = service_name;
    if (name !== undefined) booking.name = name;
    if (email !== undefined) booking.email = email;
    if (phone !== undefined) booking.phone = phone;

    await booking.save();

    if ((isReschedule || isStatusChange) && booking.email) {
      const subject = isReschedule ? 'Your booking has been rescheduled' : `Your booking is now ${booking.status}`;
      sendMail({
        to: booking.email,
        subject: `Sapna Digital Studio - ${subject}`,
        html: `<p>Hi ${booking.name},</p><p>${subject}. New details: <b>${booking.service_name || ''}</b> on <b>${booking.date}</b> at <b>${booking.time}</b>. Status: <b>${booking.status}</b>.</p><p>Thank you for choosing Sapna Digital Studio.</p>`,
      }).catch(() => {});
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Booking not found' });
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
