import express from 'express';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

// --- Local SQLite setup (legacy/demo) ---
const dbPath = path.join(process.cwd(), 'data', 'attendees.db');

// Ensure the directory for the SQLite DB exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(
  `
  CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organisation TEXT,
    phone TEXT,
    investmentFocus TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );
`.trim()
);

// Seed with some dummy data for local testing if empty
const existingCount = db
  .prepare('SELECT COUNT(*) as count FROM attendees;')
  .get() as { count: number };

if (existingCount.count === 0) {
  const seedAttendees = [
    {
      name: 'Dr Vuyiwe Marambana',
      email: 'vuyiwe.marambana@example.com',
      organisation: 'JoGEDA',
      phone: '+27 11 555 0101',
      investmentFocus: 'Tourism & Property Development',
    },
    {
      name: 'Cllr Nomvuyo Mposelwa',
      email: 'nomvuyo.mposelwa@example.com',
      organisation: 'Joe Gqabi District Municipality',
      phone: '+27 11 555 0202',
      investmentFocus: 'Agriculture & Agro-processing',
    },
    {
      name: 'Bantu Magqashela',
      email: 'bantu.magqashela@example.com',
      organisation: 'JoGEDA Board',
      phone: '+27 11 555 0303',
      investmentFocus: 'Renewable Energy',
    },
    {
      name: 'Thandi Mokoena',
      email: 'thandi.mokoena@example.com',
      organisation: 'Frontier Capital',
      phone: '+27 21 555 0404',
      investmentFocus: 'Industrial & Logistics',
    },
  ];

  const insert = db.prepare(
    `
    INSERT INTO attendees (name, email, organisation, phone, investmentFocus)
    VALUES (@name, @email, @organisation, @phone, @investmentFocus);
  `.trim()
  );

  const insertMany = db.transaction((rows: typeof seedAttendees) => {
    for (const row of rows) {
      insert.run(row);
    }
  });

  insertMany(seedAttendees);
}

// --- Supabase admin client ---
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

if (!supabaseAdmin) {
  console.warn(
    '[supabase] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not fully configured. ' +
      'Registration mirroring will be disabled until these are set.'
  );
}

// --- Static app hosting (serves Vite build) ---
const distDir = path.join(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// SPA fallback for client-side routes (ignore API routes)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).end();
  if (!fs.existsSync(indexHtmlPath)) {
    return res
      .status(404)
      .send('App build not found. Run `npm run build` to generate the static files.');
  }
  return res.sendFile(indexHtmlPath);
});

app.listen(port, () => {
  console.log(`QR backend listening on http://localhost:${port}`);
});


