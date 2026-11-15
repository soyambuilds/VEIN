const router = require('express').Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const Inventory = require('../models/Inventory');
const { protect, allow } = require('../middleware/auth');
const wrap = require('../utils/wrap');
const { BLOOD_GROUPS } = require('../utils/constants');

router.use(protect, allow('admin'));
const bad = (res, message, status = 400) => res.status(status).json({ message });

router.get('/stats', wrap(async (req, res) => {
  const [donors, receivers, pendingDonations, pendingRequests, inv] = await Promise.all([
    User.countDocuments({ role: 'donor' }),
    User.countDocuments({ role: 'receiver' }),
    Donation.countDocuments({ status: 'pending' }),
    BloodRequest.countDocuments({ status: 'pending' }),
    Inventory.find(),
  ]);
  res.json({ donors, receivers, pendingDonations, pendingRequests, totalUnits: inv.reduce((s, i) => s + i.units, 0) });
}));

// ---- Donation workflow: pending -> approved/rejected -> completed (adds stock)
router.get('/donations', wrap(async (req, res) => {
  const q = req.query.status ? { status: req.query.status } : {};
  res.json(await Donation.find(q).populate('donor', 'name email phone city').sort('-createdAt').limit(200));
}));

router.patch('/donations/:id', wrap(async (req, res) => {
  const { action, note = '' } = req.body;
  const d = await Donation.findById(req.params.id);
  if (!d) return bad(res, 'Donation not found', 404);

  if (action === 'approve' || action === 'reject') {
    if (d.status !== 'pending') return bad(res, 'Only pending donations can be reviewed');
    d.status = action === 'approve' ? 'approved' : 'rejected';
  } else if (action === 'complete') {
    if (d.status !== 'approved') return bad(res, 'Approve the donation before recording the collection');
    d.status = 'completed';
    await Inventory.updateOne({ bloodGroup: d.bloodGroup }, { $inc: { units: d.units } }, { upsert: true });
    await User.updateOne({ _id: d.donor }, { lastDonationDate: new Date() });
  } else return bad(res, 'Unknown action');

  d.adminNote = note;
  d.reviewedBy = req.user._id;
  await d.save();
  res.json(d);
}));

// ---- Requisition workflow: pending -> approved/rejected -> fulfilled (deducts stock)
router.get('/requests', wrap(async (req, res) => {
  const q = req.query.status ? { status: req.query.status } : {};
  const list = await BloodRequest.find(q).populate('receiver', 'name email phone').limit(200);
  const rank = { critical: 0, urgent: 1, normal: 2 };
  list.sort((a, b) => rank[a.urgency] - rank[b.urgency] || b.createdAt - a.createdAt);
  res.json(list);
}));

router.patch('/requests/:id', wrap(async (req, res) => {
  const { action, note = '' } = req.body;
  const r = await BloodRequest.findById(req.params.id);
  if (!r) return bad(res, 'Request not found', 404);

  if (action === 'approve') {
    if (r.status !== 'pending') return bad(res, 'Only pending requests can be reviewed');
    const stock = await Inventory.findOne({ bloodGroup: r.bloodGroup });
    if (!stock || stock.units < r.units) return bad(res, `Not enough ${r.bloodGroup} in stock (${stock?.units || 0} units available)`);
    r.status = 'approved';
  } else if (action === 'reject') {
    if (r.status !== 'pending') return bad(res, 'Only pending requests can be reviewed');
    r.status = 'rejected';
  } else if (action === 'fulfill') {
    if (r.status !== 'approved') return bad(res, 'Approve the request before issuing blood');
    // Atomic: only deducts if enough units remain
    const out = await Inventory.findOneAndUpdate(
      { bloodGroup: r.bloodGroup, units: { $gte: r.units } }, { $inc: { units: -r.units } }
    );
    if (!out) return bad(res, `Not enough ${r.bloodGroup} in stock to issue this request`);
    r.status = 'fulfilled';
  } else return bad(res, 'Unknown action');

  r.adminNote = note;
  r.reviewedBy = req.user._id;
  await r.save();
  res.json(r);
}));

// ---- Inventory
router.patch('/inventory/:group', wrap(async (req, res) => {
  const bloodGroup = req.params.group;
  const units = Number(req.body.units);
  if (!BLOOD_GROUPS.includes(bloodGroup)) return bad(res, 'Unknown blood group');
  if (!Number.isInteger(units) || units < 0) return bad(res, 'Units must be a whole number, 0 or more');
  res.json(await Inventory.findOneAndUpdate({ bloodGroup }, { units }, { new: true, upsert: true }));
}));

// ---- Users
router.get('/users', wrap(async (req, res) => {
  res.json(await User.find().sort('-createdAt').limit(500));
}));

router.patch('/users/:id/active', wrap(async (req, res) => {
  if (req.params.id === String(req.user._id)) return bad(res, 'You cannot deactivate your own account');
  const u = await User.findByIdAndUpdate(req.params.id, { active: !!req.body.active }, { new: true });
  if (!u) return bad(res, 'User not found', 404);
  res.json(u);
}));

module.exports = router;
