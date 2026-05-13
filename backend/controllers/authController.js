const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');
const { SUPPORTED_LANGS } = require('../config/constants');

function toSafeUser(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    preferredLanguage: row.preferred_language,
    createdAt: row.created_at,
  };
}

function signToken(userId) {
  const secret = process.env.JWT_SECRET || 'dev-default-secret-change-me-in-production';
  return jwt.sign({ sub: String(userId) }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function signup(req, res, next) {
  try {
    // Removed strict check for JWT_SECRET as we have a fallback
    const { name, email, password, preferredLanguage } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const lang = SUPPORTED_LANGS.includes(preferredLanguage) ? preferredLanguage : 'en';
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const insert = db.prepare(
      `INSERT INTO users (name, email, password, preferred_language)
       VALUES (?, ?, ?, ?)`
    );
    try {
      const info = insert.run(
        String(name).trim(),
        String(email).toLowerCase().trim(),
        hashed,
        lang
      );
      const row = db
        .prepare('SELECT id, name, email, preferred_language, created_at FROM users WHERE id = ?')
        .get(info.lastInsertRowid);
      const token = signToken(row.id);
      res.status(201).json({ token, user: toSafeUser(row) });
    } catch (e) {
      if (e && String(e.message).includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      throw e;
    }
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    // Removed strict check for JWT_SECRET as we have a fallback
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user.id);
    const row = db
      .prepare('SELECT id, name, email, preferred_language, created_at FROM users WHERE id = ?')
      .get(user.id);
    res.json({ token, user: toSafeUser(row) });
  } catch (e) {
    next(e);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function updateProfile(req, res, next) {
  try {
    const { name, preferredLanguage } = req.body || {};
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.user.id));
    if (!row) return res.status(404).json({ error: 'User not found' });
    let nextName = row.name;
    let nextLang = row.preferred_language;
    if (name !== undefined) nextName = String(name).trim() || nextName;
    if (preferredLanguage !== undefined && SUPPORTED_LANGS.includes(preferredLanguage)) {
      nextLang = preferredLanguage;
    }
    db.prepare('UPDATE users SET name = ?, preferred_language = ? WHERE id = ?').run(nextName, nextLang, Number(req.user.id));
    const updated = db
      .prepare('SELECT id, name, email, preferred_language, created_at FROM users WHERE id = ?')
      .get(Number(req.user.id));
    res.json({ user: toSafeUser(updated) });
  } catch (e) {
    next(e);
  }
}

module.exports = { signup, login, me, updateProfile };
