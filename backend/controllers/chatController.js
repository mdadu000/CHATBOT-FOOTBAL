const { getDb } = require('../config/db');
const { generateChatResponse } = require('../services/geminiService');

function sseWrite(res, obj) {
  res.write(`data: ${JSON.stringify(obj)}\n\n`);
}

function isChatId(id) {
  return /^\d+$/.test(String(id));
}

function loadHistoryRows(db, chatId) {
  return db
    .prepare('SELECT role, content FROM messages WHERE chat_id = ? ORDER BY id ASC')
    .all(chatId)
    .map((m) => ({ role: m.role, content: m.content }));
}

async function postChat(req, res, next) {
  try {
    const { message, chatId: rawChatId, language, stream } = req.body || {};
    const wantsStream = Boolean(stream) || req.headers.accept?.includes('text/event-stream');
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const userId = Number(req.user.id);
    const lang = typeof language === 'string' && language.trim() ? language.trim() : 'auto';
    const preferred = req.user.preferredLanguage || 'en';
    const db = getDb();
    const text = message.trim();

    let chatId;
    if (rawChatId) {
      if (!isChatId(rawChatId)) {
        return res.status(400).json({ error: 'Invalid chat id' });
      }
      const row = db
        .prepare('SELECT id FROM chats WHERE id = ? AND user_id = ?')
        .get(Number(rawChatId), userId);
      if (!row) return res.status(404).json({ error: 'Chat not found' });
      chatId = row.id;
    } else {
      const info = db.prepare('INSERT INTO chats (user_id, title) VALUES (?, ?)').run(userId, 'New chat');
      chatId = info.lastInsertRowid;
    }

    db.prepare('INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)').run(chatId, 'user', text);

    const chatRow = db.prepare('SELECT title FROM chats WHERE id = ?').get(chatId);
    let title = chatRow.title;
    if (!title || title === 'New chat') {
      title = text.slice(0, 80) || 'New chat';
    }
    db.prepare(`UPDATE chats SET title = ?, updated_at = datetime('now') WHERE id = ?`).run(title, chatId);

    const history = loadHistoryRows(db, chatId);

    if (wantsStream) {
      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      if (typeof res.flushHeaders === 'function') res.flushHeaders();

      sseWrite(res, { type: 'meta', chatId: String(chatId) });

      let full = '';
      try {
        const streamResult = await generateChatResponse({
          history: history.slice(0, -1),
          userMessage: text,
          language: lang,
          preferredLanguage: preferred,
          stream: true,
        });

        const iterable = streamResult.stream || streamResult;
        for await (const chunk of iterable) {
          const part = typeof chunk.text === 'function' ? chunk.text() : '';
          if (part) {
            full += part;
            sseWrite(res, { type: 'token', text: part });
          }
        }
      } catch (e) {
        console.error('[chat stream]', e);
        const fallback =
          "Yo fam! My link to the stadium glitched - but I'm still here. Try again in a sec. No cap.";
        full = fallback;
        sseWrite(res, { type: 'token', text: fallback });
      }

      db.prepare('INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)').run(chatId, 'model', full);
      db.prepare(`UPDATE chats SET updated_at = datetime('now') WHERE id = ?`).run(chatId);
      sseWrite(res, { type: 'done', chatId: String(chatId) });
      res.end();
      return;
    }

    let reply;
    try {
      reply = await generateChatResponse({
        history: history.slice(0, -1),
        userMessage: text,
        language: lang,
        preferredLanguage: preferred,
        stream: false,
      });
    } catch (e) {
      console.error('[chat]', e);
      reply =
        "Yo fam! My link to the stadium glitched - but I'm still here. Try again in a sec. No cap.";
    }

    db.prepare('INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)').run(chatId, 'model', reply);
    db.prepare(`UPDATE chats SET updated_at = datetime('now') WHERE id = ?`).run(chatId);

    res.json({ reply, chatId: String(chatId) });
  } catch (e) {
    next(e);
  }
}

async function getChats(req, res, next) {
  try {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT c.id, c.title, c.updated_at as updatedAt,
          (SELECT content FROM messages m WHERE m.chat_id = c.id ORDER BY m.id DESC LIMIT 1) as preview
         FROM chats c
         WHERE c.user_id = ?
         ORDER BY datetime(c.updated_at) DESC
         LIMIT 100`
      )
      .all(req.user.id);
    const mapped = rows.map((c) => ({
      id: String(c.id),
      title: c.title,
      updatedAt: c.updatedAt,
      preview: c.preview ? String(c.preview).slice(0, 120) : '',
    }));
    res.json({ chats: mapped });
  } catch (e) {
    next(e);
  }
}

async function getChatById(req, res, next) {
  try {
    if (!isChatId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid chat id' });
    }
    const db = getDb();
    const chat = db
      .prepare('SELECT id, title, updated_at as updatedAt FROM chats WHERE id = ? AND user_id = ?')
      .get(Number(req.params.id), req.user.id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    const messages = db
      .prepare(
        'SELECT id, role, content, created_at as createdAt FROM messages WHERE chat_id = ? ORDER BY id ASC'
      )
      .all(chat.id)
      .map((m) => ({
        id: String(m.id),
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));
    res.json({
      chat: {
        id: String(chat.id),
        title: chat.title,
        updatedAt: chat.updatedAt,
        messages,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function deleteChat(req, res, next) {
  try {
    if (!isChatId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid chat id' });
    }
    const db = getDb();
    const info = db.prepare('DELETE FROM chats WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user.id);
    if (!info.changes) return res.status(404).json({ error: 'Chat not found' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { postChat, getChats, getChatById, deleteChat };
