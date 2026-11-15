const router = require('express').Router();
const Inventory = require('../models/Inventory');
const wrap = require('../utils/wrap');
const { BLOOD_GROUPS } = require('../utils/constants');

// Public: anyone can see current stock
router.get('/', wrap(async (req, res) => {
  const rows = await Inventory.find();
  const map = Object.fromEntries(rows.map((r) => [r.bloodGroup, r]));
  res.json(BLOOD_GROUPS.map((g) => ({ bloodGroup: g, units: map[g]?.units || 0, updatedAt: map[g]?.updatedAt })));
}));

module.exports = router;
