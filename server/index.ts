import express from 'express';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json({ limit: '10mb' }));

const appleAppUrl = 'https://apps.apple.com/us/app/xs-card/id6742452317';
const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.p.zzles.xscard';

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

// Fast app store redirect for QR install links.
// This runs before static serving so users are not blocked on SPA boot time.
app.get('/', (req, res, next) => {
  if (req.query.install !== '1') return next();

  const ua = String(req.headers['user-agent'] || '');
  const isAndroid = /Android/i.test(ua);
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && /Mobile/i.test(ua));

  if (isIOS && appleAppUrl) {
    return res.redirect(302, appleAppUrl);
  }

  if (isAndroid && googlePlayUrl) {
    return res.redirect(302, googlePlayUrl);
  }

  const noStoreLinksConfigured = !appleAppUrl && !googlePlayUrl;
  return res.status(noStoreLinksConfigured ? 500 : 200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Download XS Card</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        background: #f5f5f5;
        color: #111827;
      }
      .card {
        width: min(420px, calc(100vw - 32px));
        background: #ffffff;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        text-align: center;
      }
      .links {
        margin-top: 16px;
        display: grid;
        gap: 12px;
      }
      a {
        display: block;
        border-radius: 12px;
        padding: 14px 16px;
        text-decoration: none;
        font-weight: 700;
        color: #ffffff;
      }
      .apple { background: #111111; }
      .google { background: #6b8e23; }
      .warn {
        margin-top: 12px;
        color: #b91c1c;
        font-size: 14px;
        line-height: 1.4;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Download XS Card</h1>
      <p>Choose your app store to continue.</p>
      <div class="links">
        ${appleAppUrl ? `<a class="apple" href="${appleAppUrl}">Download on App Store</a>` : ''}
        ${googlePlayUrl ? `<a class="google" href="${googlePlayUrl}">Download on Google Play</a>` : ''}
      </div>
      ${noStoreLinksConfigured ? '<p class="warn">App store links are not configured yet. Please contact the event team.</p>' : ''}
    </main>
  </body>
</html>`);
});

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


