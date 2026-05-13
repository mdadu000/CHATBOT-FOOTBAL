const express = require('express');
const rateLimit = require('express-rate-limit');
const { postChat, getChats, getChatById, deleteChat } = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(requireAuth);

router.post('/chat', chatLimiter, postChat);
router.get('/chats', getChats);
router.get('/chats/:id', getChatById);
router.delete('/chats/:id', deleteChat);

module.exports = router;
