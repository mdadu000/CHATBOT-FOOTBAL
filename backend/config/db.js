const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

function initDb() {
  const filePath =
    process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'sportygenz.db');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password TEXT NOT NULL,
      preferred_language TEXT NOT NULL DEFAULT 'en',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'New chat',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('user','model')),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_chats_user_updated ON chats(user_id, updated_at);
    CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id, id);
  `);

  console.log(`[db] SQLite ready at ${filePath}`);
  return db;
}

function closeDb() {
  if (db) {
    try {
      db.close();
    } finally {
      db = undefined;
    }
  }
}

module.exports = { initDb, getDb, closeDb };
