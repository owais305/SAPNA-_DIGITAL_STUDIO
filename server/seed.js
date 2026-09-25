const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Service = require('./models/Service');
const Gallery = require('./models/Gallery');

async function seed() {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@sapnadigitalstudio.com';
    const password_hash = bcrypt.hashSync(password, 10);
    await Admin.create({ username, password_hash, email });
    console.log(`Seeded default admin -> username: ${username} / password: ${password} (please change this after first login)`);
  }

  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    const defaults = [
      { title: 'Portrait Photography', description: 'Capturing your personality with perfect lighting.', price: 2500, thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80', sort_order: 0 },
      { title: 'Wedding Photography', description: 'We capture your special moments beautifully.', price: 25000, thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80', sort_order: 1 },
      { title: 'Product Photography', description: 'High quality shots for your products and brand.', price: 3500, thumbnail: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=700&q=80', sort_order: 2 },
      { title: 'Landscape Photography', description: 'Breathtaking landscapes in perfect frame.', price: 3000, thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=700&q=80', sort_order: 3 },
    ];
    await Service.insertMany(defaults);
  }

  const galleryCount = await Gallery.countDocuments();
  if (galleryCount === 0) {
    const defaults = [
      { image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80', category: 'Portrait Photography', alt: 'Studio portrait of a woman', sort_order: 0 },
      { image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=500&q=80', category: 'Landscape Photography', alt: 'Mountain lake with a small boat', sort_order: 1 },
      { image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=500&q=80', category: 'Portrait Photography', alt: 'Photographer at work', sort_order: 2 },
      { image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500&q=80', category: 'Wedding Photography', alt: 'Bride in veil', sort_order: 3 },
      { image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=500&q=80', category: 'Landscape Photography', alt: 'City street at night', sort_order: 4 },
      { image_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=500&q=80', category: 'Landscape Photography', alt: 'Mountain range at sunset', sort_order: 5 },
    ];
    await Gallery.insertMany(defaults);
  }
}

module.exports = seed;
