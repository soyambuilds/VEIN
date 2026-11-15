const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { BLOOD_GROUPS } = require('./constants');

// Runs at every startup: makes sure the 8 stock rows and the first admin exist.
module.exports = async function bootstrap() {
  await Promise.all(
    BLOOD_GROUPS.map((bloodGroup) =>
      Inventory.updateOne({ bloodGroup }, { $setOnInsert: { bloodGroup, units: 0 } }, { upsert: true })
    )
  );
  const email = (process.env.ADMIN_EMAIL || 'admin@vein.local').toLowerCase();
  if (!(await User.findOne({ email }))) {
    await User.create({
      name: process.env.ADMIN_NAME || 'VEIN Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log('Admin account created:', email);
  }
};
