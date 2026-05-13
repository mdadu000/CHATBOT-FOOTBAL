const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, login, me, updateProfile } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateProfile);

module.exports = router;
