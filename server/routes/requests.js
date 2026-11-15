const router = require('express').Router();
const BloodRequest = require('../models/BloodRequest');
const { protect, allow } = require('../middleware/auth');
const upload = require('../middleware/upload');
const wrap = require('../utils/wrap');

router.use(protect, allow('receiver'));

router.post('/', upload.single('document'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Attach the doctor’s prescription or hospital letter' });
  const { patientName, bloodGroup, units, hospital, city, contactPhone, urgency, requiredBy, reason } = req.body;
  if (new Date(requiredBy) < new Date(new Date().toDateString()))
    return res.status(400).json({ message: 'Required-by date cannot be in the past' });
  const request = await BloodRequest.create({
    receiver: req.user._id, patientName, bloodGroup, units: Number(units), hospital, city,
    contactPhone, urgency, requiredBy, reason, document: req.file.filename,
  });
  res.status(201).json(request);
}));

router.get('/mine', wrap(async (req, res) => {
  res.json(await BloodRequest.find({ receiver: req.user._id }).sort('-createdAt'));
}));

router.patch('/:id/cancel', wrap(async (req, res) => {
  const r = await BloodRequest.findOne({ _id: req.params.id, receiver: req.user._id });
  if (!r) return res.status(404).json({ message: 'Request not found' });
  if (!['pending', 'approved'].includes(r.status)) return res.status(400).json({ message: 'This request can no longer be cancelled' });
  r.status = 'cancelled';
  await r.save();
  res.json(r);
}));

module.exports = router;
