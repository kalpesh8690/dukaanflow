const mongoose = require('mongoose');
const businessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  ownerName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model('Business', businessSchema);
