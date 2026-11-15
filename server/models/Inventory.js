const mongoose = require('mongoose');
const { BLOOD_GROUPS } = require('../utils/constants');

module.exports = mongoose.model(
  'Inventory',
  new mongoose.Schema(
    {
      bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, unique: true },
      units: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
  )
);
