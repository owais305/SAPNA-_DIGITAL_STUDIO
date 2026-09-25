// Quick diagnostic tool — run this if the server can't connect to MongoDB.
//   cd server
//   node check-env.js
//
// It shows exactly which .env file (if any) was found and what
// MONGODB_URI value Node actually sees, without starting the whole app.

const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
console.log('Looking for .env at:', envPath);

if (!fs.existsSync(envPath)) {
  console.log('❌ No .env file found there.');
  console.log('   Fix: copy .env.example to .env in this exact folder:');
  console.log('   copy .env.example .env   (Windows)   OR   cp .env.example .env   (Mac/Linux)');
  process.exit(1);
}

console.log('✅ .env file found.');

require('dotenv').config({ path: envPath });

if (!process.env.MONGODB_URI) {
  console.log('❌ .env exists, but MONGODB_URI did not load from it.');
  console.log('   This usually means the file has a formatting/encoding problem.');
  console.log('   Open it and make sure the line looks exactly like:');
  console.log('   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname');
  console.log('   (no quotes, no spaces around the "=", saved as plain UTF-8 text)');
  process.exit(1);
}

const masked = process.env.MONGODB_URI.trim().replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log('✅ MONGODB_URI loaded:', masked);
console.log('');
console.log('If this looks correct, try: node server.js');
console.log('If it still fails to connect, the error will now mention the real reason');
console.log('(wrong password, IP not whitelisted on Atlas, etc).');
