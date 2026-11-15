const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { BLOOD_GROUPS } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['donor', 'receiver', 'admin'], default: 'donor' },
    bloodGroup: { type: String, enum: BLOOD_GROUPS },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dob: Date,
    lastDonationDate: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function () {
  const o = this.toObject();
  delete o.password;
  delete o.__v;
  return o;
};

module.exports = mongoose.model('User', userSchema);
