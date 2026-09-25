const mongoose = require('mongoose');
const idPlugin = require('./plugin');

const BookingSchema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null },
    service_name: { type: String, default: '' },
    date: { type: String, required: true }, // stored as YYYY-MM-DD for easy string range queries
    time: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    notes: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

BookingSchema.plugin(idPlugin);

module.exports = mongoose.model('Booking', BookingSchema);
