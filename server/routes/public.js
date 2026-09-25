const express = require('express');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const BlockedDate = require('../models/BlockedDate');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { sendMail } = require('../utils/mailer');
const { isValidId } = require('../utils/isValidId');

const router = express.Router();

router.get('/services', async (req, res, next) => {
  try {
    const rows = await Service.find({ active: true }).sort({ sort_order: 1, _id: 1 });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/gallery', async (req, res, next) => {
  try {
    const rows = await Gallery.find().sort({ sort_order: 1, _id: 1 });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/reviews', async (req, res, next) => {
  try {
    const rows = await Review.find({ approved: true })
      .select('name rating message created_at')
      .sort({ created_at: -1 })
      .limit(20);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/reviews', async (req, res, next) => {
  try {
    const { name, email, rating, message } = req.body || {};
    if (!name || !message) return res.status(400).json({ error: 'name and message are required' });
    await Review.create({
      name,
      email: email || '',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      message,
      approved: false,
    });
    res.status(201).json({ success: true, message: 'Thank you! Your review will appear after approval.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/public/availability?month=YYYY-MM
router.get('/availability', async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const from = `${month}-01`;
    const to = `${month}-31`;
    const [booked, blocked] = await Promise.all([
      Booking.find({ date: { $gte: from, $lte: to }, status: { $ne: 'cancelled' } }).select('date time'),
      BlockedDate.find({ date: { $gte: from, $lte: to } }).select('date reason'),
    ]);
    res.json({ booked, blocked });
  } catch (err) {
    next(err);
  }
});

router.post('/bookings', async (req, res, next) => {
  try {
    const { name, email, phone, service, date, time } = req.body || {};
    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ error: 'name, email, phone, date and time are required' });
    }

    const blocked = await BlockedDate.findOne({ date });
    if (blocked) {
      return res.status(409).json({ error: 'Sorry, this date is not available. Please choose another date.' });
    }

    const clash = await Booking.findOne({ date, time, status: { $ne: 'cancelled' } });
    if (clash) {
      return res.status(409).json({ error: 'This time slot is already booked. Please choose another time.' });
    }

    const matchedService = await Service.findOne({ title: service });

    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = await Customer.create({ name, email, phone });
    } else {
      customer.name = name;
      customer.phone = phone;
      await customer.save();
    }

    const booking = await Booking.create({
      customer_id: customer.id,
      name,
      email,
      phone,
      service_id: matchedService ? matchedService.id : null,
      service_name: service || '',
      date,
      time,
      status: 'pending',
    });

    const notifyMessage = `New booking from ${name} for ${service || 'a session'} on ${date} at ${time}.`;
    await Notification.create({
      type: 'new_booking',
      message: notifyMessage,
      meta: JSON.stringify({ bookingId: booking.id }),
    });

    // notify studio admin
    sendMail({
      to: process.env.STUDIO_NOTIFY_EMAIL,
      subject: 'New booking request - Sapna Digital Studio',
      html: `<p>${notifyMessage}</p><p>Contact: ${email} / ${phone}</p>`,
    }).catch(() => {});

    // confirm to client
    sendMail({
      to: email,
      subject: 'We received your booking request - Sapna Digital Studio',
      html: `<p>Hi ${name},</p><p>Thanks for booking <b>${service || 'a session'}</b> on <b>${date}</b> at <b>${time}</b>. We will confirm shortly.</p>`,
    }).catch(() => {});

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});


// ---- Customer self-service: look up / reschedule / cancel a booking ----

function normalizePhone(p) {
  return String(p || '').replace(/\D/g, '');
}

async function findOwnedBooking(id, email, phone) {
  if (!isValidId(id)) return { error: 'not_found' };
  const booking = await Booking.findById(id);
  if (!booking) return { error: 'not_found' };
  const emailMatches = booking.email && booking.email.toLowerCase() === String(email || '').toLowerCase();
  const phoneMatches = normalizePhone(booking.phone) === normalizePhone(phone);
  if (!emailMatches || !phoneMatches) return { error: 'mismatch' };
  return { booking };
}

// POST /api/public/bookings/find  { email, phone }
router.post('/bookings/find', async (req, res, next) => {
  try {
    const { email, phone } = req.body || {};
    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }
    const bookings = await Booking.find({
      email: new RegExp(`^${String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    }).sort({ date: -1, time: -1 });

    const matched = bookings.filter((b) => normalizePhone(b.phone) === normalizePhone(phone));

    if (matched.length === 0) {
      return res.status(404).json({ error: 'No bookings found for that email and phone number.' });
    }
    res.json(matched);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/public/bookings/:id/reschedule  { email, phone, date, time }
router.patch('/bookings/:id/reschedule', async (req, res, next) => {
  try {
    const { email, phone, date, time } = req.body || {};
    if (!email || !phone || !date || !time) {
      return res.status(400).json({ error: 'email, phone, date and time are required' });
    }

    const { booking, error } = await findOwnedBooking(req.params.id, email, phone);
    if (error === 'not_found') return res.status(404).json({ error: 'Booking not found' });
    if (error === 'mismatch') return res.status(403).json({ error: 'Those details do not match this booking' });

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ error: `This booking is already ${booking.status} and can no longer be edited.` });
    }

    if (date !== booking.date || time !== booking.time) {
      const blocked = await BlockedDate.findOne({ date });
      if (blocked) {
        return res.status(409).json({ error: 'Sorry, this date is not available. Please choose another date.' });
      }
      const clash = await Booking.findOne({
        _id: { $ne: booking.id },
        date,
        time,
        status: { $ne: 'cancelled' },
      });
      if (clash) {
        return res.status(409).json({ error: 'This time slot is already booked. Please choose another time.' });
      }
    }

    booking.date = date;
    booking.time = time;
    booking.status = 'pending'; // needs re-confirmation by the studio after a customer-initiated change
    await booking.save();

    await Notification.create({
      type: 'booking_rescheduled',
      message: `${booking.name} rescheduled their booking to ${date} at ${time}.`,
      meta: JSON.stringify({ bookingId: booking.id }),
    });

    sendMail({
      to: booking.email,
      subject: 'Your booking has been updated - Sapna Digital Studio',
      html: `<p>Hi ${booking.name},</p><p>Your booking is now set for <b>${date}</b> at <b>${time}</b>, pending our confirmation.</p>`,
    }).catch(() => {});

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/public/bookings/:id/cancel  { email, phone }
router.patch('/bookings/:id/cancel', async (req, res, next) => {
  try {
    const { email, phone } = req.body || {};
    if (!email || !phone) {
      return res.status(400).json({ error: 'email and phone are required' });
    }

    const { booking, error } = await findOwnedBooking(req.params.id, email, phone);
    if (error === 'not_found') return res.status(404).json({ error: 'Booking not found' });
    if (error === 'mismatch') return res.status(403).json({ error: 'Those details do not match this booking' });

    if (booking.status === 'cancelled') {
      return res.json(booking); // already cancelled, nothing to do
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'This session is already completed and cannot be cancelled.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await Notification.create({
      type: 'booking_cancelled',
      message: `${booking.name} cancelled their booking for ${booking.date} at ${booking.time}.`,
      meta: JSON.stringify({ bookingId: booking.id }),
    });

    sendMail({
      to: booking.email,
      subject: 'Your booking has been cancelled - Sapna Digital Studio',
      html: `<p>Hi ${booking.name},</p><p>Your booking for <b>${booking.date}</b> at <b>${booking.time}</b> has been cancelled as requested.</p>`,
    }).catch(() => {});

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
