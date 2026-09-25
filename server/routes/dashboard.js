const express = require('express');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trendCutoff = sixMonthsAgo.toISOString().slice(0, 10);

    const [
      todayBookings,
      weekBookings,
      pending,
      confirmed,
      completed,
      cancelled,
      totalBookings,
      totalCustomers,
      monthRevenueAgg,
      totalRevenueAgg,
      pendingPaymentsAgg,
      upcoming,
      pendingReviews,
      trendAgg,
    ] = await Promise.all([
      Booking.countDocuments({ date: today }),
      Booking.countDocuments({ date: { $gte: today, $lte: weekAhead } }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({}),
      Customer.countDocuments({}),
      Payment.aggregate([
        { $match: { status: 'paid', created_at: { $gte: monthStartDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Booking.find({ date: { $gte: today }, status: { $ne: 'cancelled' } })
        .sort({ date: 1, time: 1 })
        .limit(6),
      Review.countDocuments({ approved: false }),
      Booking.aggregate([
        { $match: { date: { $gte: trendCutoff } } },
        { $group: { _id: { $substrCP: ['$date', 0, 7] }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const monthRevenue = monthRevenueAgg[0]?.total || 0;
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const pendingPayments = pendingPaymentsAgg[0]?.total || 0;
    const trend = trendAgg.map((t) => ({ month: t._id, count: t.count }));

    res.json({
      todayBookings,
      weekBookings,
      pending,
      confirmed,
      completed,
      cancelled,
      totalBookings,
      totalCustomers,
      monthRevenue,
      totalRevenue,
      pendingPayments,
      upcoming,
      pendingReviews,
      trend,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
