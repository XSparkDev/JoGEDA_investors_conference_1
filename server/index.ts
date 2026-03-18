import express from 'express';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

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

// --- Database setup ---
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

// --- Routes ---

app.get('/api/attendees', (_req, res) => {
  try {
    const rows = db
      .prepare(
        `
        SELECT id, name, email, organisation, phone, investmentFocus, createdAt
        FROM attendees
        ORDER BY datetime(createdAt) DESC;
      `.trim()
      )
      .all();

    res.json({ attendees: rows });
  } catch (err) {
    console.error('Failed to list attendees', err);
    res.status(500).json({ message: 'Failed to load attendees.' });
  }
});

app.post('/api/checkin', (req, res) => {
  const { code } = req.body as { code?: string };

  if (!code) {
    return res.status(400).json({ ok: false, message: 'Missing QR code payload.' });
  }

  console.log('Received QR scan code:', code);

  return res.json({
    ok: true,
    message: 'QR code received.',
    code,
  });
});

app.get('/api/conference/user-status/:uid', async (req, res) => {
  const { uid } = req.params;
  const baseUrl =
    process.env.BASE_URL ||
    process.env.STATUS_BASE_URL ||
    process.env.VITE_BASE_URL;
  const apiKey =
    process.env.CONFERENCE_API_KEY ||
    process.env.VITE_CONFERENCE_API_KEY;

  if (!apiKey) {
    console.error('[status-proxy] Missing CONFERENCE_API_KEY/VITE_CONFERENCE_API_KEY in environment', {
      hasCONFERENCE_API_KEY: !!process.env.CONFERENCE_API_KEY,
      hasVITE_CONFERENCE_API_KEY: !!process.env.VITE_CONFERENCE_API_KEY,
    });
    return res.status(500).json({ message: 'CONFERENCE_API_KEY or VITE_CONFERENCE_API_KEY not configured on server.' });
  }

  try {
    console.log('[status-proxy] Outbound request', {
      uid,
      baseUrl,
      hasApiKey: !!apiKey,
      url: `${baseUrl}/api/conference/user-status/${encodeURIComponent(uid)}`,
    });

    const upstream = await fetch(
      `${baseUrl}/api/conference/user-status/${encodeURIComponent(uid)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    console.log('[status-proxy] Upstream response status', upstream.status);

    const text = await upstream.text();
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      console.warn('[status-proxy] Failed to parse upstream JSON, returning raw text snippet');
      data = { raw: text.slice(0, 200) };
    }

    if (!upstream.ok) {
      console.error('[status-proxy] Upstream error', {
        status: upstream.status,
        bodyPreview: typeof data === 'string' ? data.slice(0, 200) : data,
      });
      return res.status(upstream.status).json(data || { message: 'Upstream error' });
    }

    return res.json(data);
  } catch (err) {
    console.error('[status-proxy] Proxy status check failed', err);
    return res.status(502).json({ message: 'Failed to contact status service.' });
  }
});

app.listen(port, () => {
  console.log(`QR backend listening on http://localhost:${port}`);
});


