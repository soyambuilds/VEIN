const mongoose = require('mongoose');

module.exports = mongoose.model(
  'Review',
  new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true, trim: true, maxlength: 400 },
    },
    { timestamps: true }
  )
);
