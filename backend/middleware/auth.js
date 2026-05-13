const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');

function getBearerToken(req) {
  const h = req.headers.authorization;
  if (!h || typeof h !== 'string') return null;
  const [type, token] = h.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token.trim();
}

function rowToUser(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    preferredLanguage: row.preferred_language,
    createdAt: row.created_at,
  };
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const secret = process.env.JWT_SECRET || 'dev-default-secret-change-me-in-production';
    if (!secret) {
      // This case is technically unreachable now but kept for logic
      return res.status(500).json({ error: 'Server auth is not configured' });
    }
    const payload = jwt.verify(token, secret);
    const uid = Number(payload.sub);
    if (!Number.isFinite(uid)) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    const db = getDb();
    const row = db
      .prepare('SELECT id, name, email, preferred_language, created_at FROM users WHERE id = ?')
      .get(uid);
    const user = rowToUser(row);
    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(e);
  }
}

module.exports = { requireAuth, getBearerToken };
