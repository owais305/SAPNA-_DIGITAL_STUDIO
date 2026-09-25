// Utility: makes sure the admin account in the database matches the
// DEFAULT_ADMIN_USERNAME / DEFAULT_ADMIN_PASSWORD values in your .env file.
// Safe to run any time — creates the admin if missing, or resets the
// password if it already exists with different credentials.
//
// Usage:
//   npm run reset-admin

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sapna_digital_studio';
  const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const email = process.env.DEFAULT_ADMIN_EMAIL || '';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err.message);
    console.error('   Check MONGODB_URI in your .env file, then try again.');
    process.exit(1);
  }

  const password_hash = bcrypt.hashSync(password, 10);
  await Admin.findOneAndUpdate(
    { username },
    { username, password_hash, email },
    { upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`✅ Admin account ready -> username: ${username} / password: ${password}`);
  console.log('   Log in with these, then change the password from Settings.');
  process.exit(0);
})();
