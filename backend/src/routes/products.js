const router = require('express').Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
router.use(auth);
function validId(id) { return mongoose.isValidObjectId(id); }
router.get('/', async (req, res, next) => { try { const products = await Product.find({ businessId: req.businessId }).sort({ createdAt: -1 }).limit(200).lean(); res.json({ products }); } catch (err) { next(err); } });
router.post('/', async (req, res, next) => {
  try {
    const { name, sku = '', price, stock = 0 } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 160 || !Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0 || typeof sku !== 'string') return res.status(400).json({ error: 'Valid name, price, and stock are required' });
    const product = await Product.create({ businessId: req.businessId, name: name.trim(), sku: sku.trim(), price, stock });
    res.status(201).json({ product });
  } catch (err) { next(err); }
});
router.patch('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' });
    const allowed = ['name', 'sku', 'price', 'stock', 'active']; const update = {};
    for (const key of allowed) if (Object.hasOwn(req.body || {}, key)) update[key] = req.body[key];
    if (!Object.keys(update).length) return res.status(400).json({ error: 'No editable fields supplied' });
    if ('name' in update && (typeof update.name !== 'string' || !update.name.trim() || update.name.trim().length > 160)) return res.status(400).json({ error: 'Invalid product name' });
    if ('sku' in update && (typeof update.sku !== 'string' || update.sku.trim().length > 80)) return res.status(400).json({ error: 'Invalid SKU' });
    if ('price' in update && (typeof update.price !== 'number' || !Number.isFinite(update.price) || update.price < 0)) return res.status(400).json({ error: 'Invalid price' });
    if ('stock' in update && (typeof update.stock !== 'number' || !Number.isInteger(update.stock) || update.stock < 0)) return res.status(400).json({ error: 'Invalid stock' });
    if ('active' in update && typeof update.active !== 'boolean') return res.status(400).json({ error: 'Invalid active value' });
    if ('name' in update) update.name = update.name.trim();
    if ('sku' in update) update.sku = update.sku.trim();
    const product = await Product.findOneAndUpdate({ _id: req.params.id, businessId: req.businessId }, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => { try { if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' }); const product = await Product.findOneAndDelete({ _id: req.params.id, businessId: req.businessId }); if (!product) return res.status(404).json({ error: 'Product not found' }); res.status(204).end(); } catch (err) { next(err); } });
module.exports = router;
