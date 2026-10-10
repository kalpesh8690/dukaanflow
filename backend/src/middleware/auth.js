const jwt = require('jsonwebtoken');
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!payload.sub) return res.status(401).json({ error: 'Invalid token' });
    req.businessId = payload.sub;
    next();
  } catch (_err) { return res.status(401).json({ error: 'Invalid or expired token' }); }
};
