require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const app = require('./app');
const { initDb } = require('./config/db');

const port = Number(process.env.PORT) || 3000;

function start() {
  try {
    initDb();
  } catch (e) {
    console.error('[db] failed to open SQLite:', e.message);
    process.exit(1);
  }
  app.listen(port, () => {
    console.log(`[server] API at http://localhost:${port}`);
    console.log(`[server] Legacy static demo (optional): http://localhost:${port}/legacy/`);
  });
}

start();
