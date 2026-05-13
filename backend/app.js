const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: [frontendOrigin, /^http:\/\/127\.0\.0\.1:\d+$/],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'sportygenz-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

const legacyPublic = path.join(__dirname, '..', 'legacy-static');
app.use('/legacy', express.static(legacyPublic));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
