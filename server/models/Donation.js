const mongoose = require('mongoose');
const { BLOOD_GROUPS } = require('../utils/constants');

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    units: { type: Number, default: 1 },
    appointmentDate: { type: Date, required: true },
    weight: { type: Number, required: true },
    hemoglobin: { type: Number, required: true },
    declaration: { type: mongoose.Schema.Types.Mixed, default: {} },
    document: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    adminNote: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
