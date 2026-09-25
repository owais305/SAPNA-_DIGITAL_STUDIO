const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const PaymentSchema = new mongoose.Schema(
  {
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    type: { type: String, default: 'deposit' }, // deposit | full | balance
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    method: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

PaymentSchema.plugin(idPlugin);

module.exports = mongoose.model('Payment', PaymentSchema);
