const router = require('express').Router();
const Review = require('../models/Review');
const { protect, allow } = require('../middleware/auth');
const wrap = require('../utils/wrap');

router.get('/', wrap(async (req, res) => {
  const list = await Review.find().populate('user', 'name role').sort('-createdAt').limit(50);
  res.json(list);
}));

router.post('/', protect, allow('donor', 'receiver'), wrap(async (req, res) => {
  const review = await Review.create({ user: req.user._id, rating: Number(req.body.rating), comment: req.body.comment });
  res.status(201).json(await review.populate('user', 'name role'));
}));

router.delete('/:id', protect, wrap(async (req, res) => {
  const r = await Review.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Review not found' });
  if (req.user.role !== 'admin' && !r.user.equals(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  await r.deleteOne();
  res.json({ ok: true });
}));

module.exports = router;
