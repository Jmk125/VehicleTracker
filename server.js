const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const PORT = parseInt(process.env.PORT || '3050', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'vehicle_tracker.db');

async function createDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

function validateVehicles(payload) {
  return Array.isArray(payload);
}

async function main() {
  const db = await createDb();
  const app = express();

  app.use(express.json({ limit: '5mb' }));
  app.use(express.static(__dirname));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, port: PORT, host: HOST, db: DB_PATH });
  });

  app.get('/api/vehicles', async (_req, res) => {
    const row = await db.get('SELECT value FROM app_state WHERE key = ?', 'vehicles');
    if (!row) {
      return res.json({ vehicles: [] });
    }

    try {
      return res.json({ vehicles: JSON.parse(row.value) });
    } catch {
      return res.status(500).json({ error: 'Stored vehicle data is invalid JSON.' });
    }
  });

  app.put('/api/vehicles', async (req, res) => {
    const { vehicles } = req.body || {};
    if (!validateVehicles(vehicles)) {
      return res.status(400).json({ error: 'Body must include a vehicles array.' });
    }

    await db.run(
      `INSERT INTO app_state (key, value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
      'vehicles',
      JSON.stringify(vehicles),
    );

    return res.json({ ok: true, count: vehicles.length });
  });

  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'fleet_analyzer.html'));
  });

  app.listen(PORT, HOST, () => {
    console.log(`Vehicle Tracker server running at http://${HOST}:${PORT}`);
    console.log(`Database: ${DB_PATH}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
