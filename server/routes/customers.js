const express = require('express');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const { requireAuth } = require('../middleware/auth');
const { isValidId } = require('../utils/isValidId');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query = { $or: [{ name: re }, { email: re }, { phone: re }] };
    }
    const rows = await Customer.find(query).sort({ created_at: -1 });

    const withCounts = await Promise.all(
      rows.map(async (c) => {
        const bookingCount = await Booking.countDocuments({ customer_id: c.id });
        return { ...c.toJSON(), bookingCount };
      })
    );

    res.json(withCounts);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Customer not found' });
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const bookings = await Booking.find({ customer_id: customer.id }).sort({ date: -1 });
    res.json({ ...customer.toJSON(), bookings });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Customer not found' });
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const { name, email, phone, notes } = req.body || {};
    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (notes !== undefined) customer.notes = notes;

    await customer.save();
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Customer not found' });
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
