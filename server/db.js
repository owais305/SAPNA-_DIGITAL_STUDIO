const mongoose = require('mongoose');

async function connectDB() {
  const raw = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sapna_digital_studio';
  const uri = raw.trim();

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000, // fail fast with a clear error instead of hanging
    });
    const masked = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`MongoDB connected -> ${masked}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('');
    console.error('Common causes:');
    console.error('  1. server/.env is missing or MONGODB_URI is empty/misspelled inside it');
    console.error('     (make sure you copied .env.example to .env, not just edited the example)');
    console.error('  2. If using MongoDB Atlas:');
    console.error('     - your current IP is not whitelisted (Atlas → Network Access → Add IP Address → Allow Access From Anywhere)');
    console.error('     - your database user password has special characters (@, #, %, etc.) that need URL-encoding');
    console.error('     - the username/password in the URI is wrong');
    console.error('  3. If using local MongoDB, make sure `mongod` is actually running');
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });
}

module.exports = connectDB;
