const mongoose = require('mongoose');
const { BLOOD_GROUPS } = require('../utils/constants');

const requestSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientName: { type: String, required: true, trim: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    units: { type: Number, required: true, min: 1, max: 10 },
    hospital: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    urgency: { type: String, enum: ['normal', 'urgent', 'critical'], default: 'normal' },
    requiredBy: { type: Date, required: true },
    reason: { type: String, trim: true, maxlength: 500 },
    document: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'fulfilled', 'cancelled'],
      default: 'pending',
      index: true,
    },
    adminNote: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodRequest', requestSchema);
