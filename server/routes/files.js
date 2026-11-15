const router = require('express').Router();
const path = require('path');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const { protect } = require('../middleware/auth');
const { dir } = require('../middleware/upload');
const wrap = require('../utils/wrap');

// Documents are private: only admins and the person who uploaded them can open a file.
router.get('/:name', protect, wrap(async (req, res) => {
  const name = path.basename(req.params.name);
  if (req.user.role !== 'admin') {
    const owns =
      (await Donation.exists({ document: name, donor: req.user._id })) ||
      (await BloodRequest.exists({ document: name, receiver: req.user._id }));
    if (!owns) return res.status(403).json({ message: 'You do not have access to this file' });
  }
  res.sendFile(path.join(dir, name), (err) => { if (err && !res.headersSent) res.status(404).json({ message: 'File not found' }); });
}));

module.exports = router;
