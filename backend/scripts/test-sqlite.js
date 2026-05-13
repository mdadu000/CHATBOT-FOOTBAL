/**
 * Smoke test: temp SQLite file, migrations, insert/select user.
 * Run from repo root: npm run test:db -w backend
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const tmp = path.join(os.tmpdir(), `sg-test-${Date.now()}.db`);
process.env.SQLITE_PATH = tmp;

const { initDb, getDb, closeDb } = require('../config/db');

try {
  initDb();
  const db = getDb();
  const r = db
    .prepare('SELECT COUNT(*) as c FROM sqlite_master WHERE type = ? AND name = ?')
    .get('table', 'users');
  if (!r || r.c !== 1) throw new Error('users table missing');
  const info = db
    .prepare('INSERT INTO users (name, email, password, preferred_language) VALUES (?,?,?,?)')
    .run('Test', 'test@example.com', 'hashed', 'en');
  const u = db.prepare('SELECT id, email FROM users WHERE id = ?').get(info.lastInsertRowid);
  if (!u || u.email !== 'test@example.com') throw new Error('insert/select failed');
  console.log('[test:db] OK', { id: u.id });
} finally {
  closeDb();
  try {
    fs.unlinkSync(tmp);
  } catch {
    /* file may still be locked briefly on Windows */
  }
}
