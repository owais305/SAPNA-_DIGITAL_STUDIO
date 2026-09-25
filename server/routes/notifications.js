const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');
const { isValidId } = require('../utils/isValidId');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const [data, unread] = await Promise.all([
      Notification.find().sort({ created_at: -1 }).limit(50),
      Notification.countDocuments({ is_read: false }),
    ]);
    res.json({ data, unread });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    if (isValidId(req.params.id)) {
      await Notification.findByIdAndUpdate(req.params.id, { is_read: true });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ is_read: false }, { is_read: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
