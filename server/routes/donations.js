const router = require('express').Router();
const Donation = require('../models/Donation');
const { protect, allow } = require('../middleware/auth');
const upload = require('../middleware/upload');
const wrap = require('../utils/wrap');
const { checkDonor } = require('../utils/eligibility');

router.use(protect, allow('donor'));

router.post('/', upload.single('document'), wrap(async (req, res) => {
  const { appointmentDate, consent } = req.body;
  const weight = Number(req.body.weight);
  const hemoglobin = Number(req.body.hemoglobin);
  let declaration = {};
  try { declaration = JSON.parse(req.body.declaration || '{}'); } catch { /* ignore */ }

  if (consent !== 'true') return res.status(400).json({ message: 'Confirm the declaration to continue' });
  if (!appointmentDate || new Date(appointmentDate) <= new Date())
    return res.status(400).json({ message: 'Pick an appointment date in the future' });
  if (!weight || !hemoglobin) return res.status(400).json({ message: 'Enter your weight and hemoglobin' });

  const open = await Donation.findOne({ donor: req.user._id, status: { $in: ['pending', 'approved'] } });
  if (open) return res.status(409).json({ message: 'You already have an open donation. Wait for it to finish or cancel it' });

  const reasons = checkDonor({
    dob: req.user.dob, gender: req.user.gender, weight, hemoglobin, declaration,
    lastDonationDate: req.user.lastDonationDate, appointmentDate,
  });
  if (reasons.length)
    return res.status(422).json({ message: 'You are not eligible to donate right now', reasons });

  const donation = await Donation.create({
    donor: req.user._id, bloodGroup: req.user.bloodGroup, appointmentDate, weight, hemoglobin,
    declaration, document: req.file?.filename,
  });
  res.status(201).json(donation);
}));

router.get('/mine', wrap(async (req, res) => {
  res.json(await Donation.find({ donor: req.user._id }).sort('-createdAt'));
}));

router.patch('/:id/cancel', wrap(async (req, res) => {
  const d = await Donation.findOne({ _id: req.params.id, donor: req.user._id });
  if (!d) return res.status(404).json({ message: 'Donation not found' });
  if (!['pending', 'approved'].includes(d.status)) return res.status(400).json({ message: 'This donation can no longer be cancelled' });
  d.status = 'cancelled';
  await d.save();
  res.json(d);
}));

module.exports = router;
