const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  sku: { type: String, trim: true, maxlength: 80, default: '' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });
productSchema.index({ businessId: 1, name: 1 });
module.exports = mongoose.model('Product', productSchema);
