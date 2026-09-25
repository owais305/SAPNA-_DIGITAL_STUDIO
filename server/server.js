const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const connectDB = require('./db');
const seed = require('./seed');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn(`⚠️  No .env file found at ${envPath}`);
  console.warn('   Copy .env.example to .env and fill in your MONGODB_URI, then restart.');
} else if (!process.env.MONGODB_URI) {
  console.warn(`⚠️  .env was found but MONGODB_URI is empty/missing inside it.`);
  console.warn('   Falling back to mongodb://127.0.0.1:27017/sapna_digital_studio');
} else {
  const masked = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`Using MongoDB URI from .env -> ${masked}`);
}

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const bookingsRoutes = require('./routes/bookings');
const servicesRoutes = require('./routes/services');
const galleryRoutes = require('./routes/gallery');
const calendarRoutes = require('./routes/calendar');
const customersRoutes = require('./routes/customers');
const paymentsRoutes = require('./routes/payments');
const reviewsRoutes = require('./routes/reviews');
const notificationsRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const publicRoutes = require('./routes/public');

const app = express();

const allowedOrigins = [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Sapna Digital Studio API' }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'CastError') {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5050;

(async () => {
  await connectDB();
  await seed();
  app.listen(PORT, () => {
    console.log(`Sapna Digital Studio API running on http://localhost:${PORT}`);
  });
})();
