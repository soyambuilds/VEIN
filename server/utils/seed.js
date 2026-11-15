// Optional demo data:  npm run seed
require('dotenv').config();
const connectDB = require('../config/db');
const bootstrap = require('./bootstrap');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Review = require('../models/Review');

(async () => {
  await connectDB();
  await bootstrap();
  const stock = { 'A+': 24, 'A-': 6, 'B+': 31, 'B-': 4, 'AB+': 12, 'AB-': 3, 'O+': 40, 'O-': 9 };
  for (const [bloodGroup, units] of Object.entries(stock)) await Inventory.updateOne({ bloodGroup }, { units });

  const demo = [
    { name: 'Demo Donor', email: 'donor@vein.local', role: 'donor', bloodGroup: 'O+', gender: 'male', dob: '2000-05-12', phone: '9000000001', city: 'Sambalpur' },
    { name: 'Demo Receiver', email: 'receiver@vein.local', role: 'receiver', bloodGroup: 'B+', phone: '9000000002', city: 'Bhubaneswar' },
  ];
  for (const u of demo) {
    if (!(await User.findOne({ email: u.email }))) await User.create({ ...u, password: 'Demo@12345' });
  }
  const donor = await User.findOne({ email: 'donor@vein.local' });
  if (!(await Review.countDocuments()))
    await Review.create({ user: donor._id, rating: 5, comment: 'Booking and approval took minutes. Clear and easy.' });
  console.log('Seeded. Demo logins: donor@vein.local / receiver@vein.local, password Demo@12345');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
