'use strict';
const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const http     = require('http');
const { Server } = require('socket.io');

const app      = express();
const server   = http.createServer(app);
const io       = new Server(server);
const PORT     = process.env.PORT || 8765;
const ROOT     = __dirname;
const MOTIFS   = path.join(ROOT, 'motifs');

// ── Live reload ───────────────────────────────────────────────────────────────
let _reloadTimer = null;
function scheduleReload() {
  clearTimeout(_reloadTimer);
  _reloadTimer = setTimeout(() => io.emit('reload'), 200);
}
[
  path.join(ROOT, 'sketch.js'),
  path.join(ROOT, 'index.html'),
].forEach(f => {
  try { fs.watch(f, scheduleReload); } catch { /* file may not exist yet */ }
});
// Watch motifs dir so new motifs trigger a reload on the sketch page
try { fs.watch(MOTIFS, scheduleReload); } catch { /* dir may not exist yet */ }

app.use(express.json({ limit: '50mb' }));

// ── API ──────────────────────────────────────────────────────────────────────

app.get('/api/sketches', (_req, res) => {
  const dir = path.join(ROOT, 'saves');
  if (!fs.existsSync(dir)) return res.json({ sketches: [] });
  // parse save_YYYYMMDD_HHMM_name.js  (name part may be absent)
  const RE = /^save_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})_?(.*)\.js$/;
  const sketches = fs.readdirSync(dir)
    .filter(f => f.endsWith('.js'))
    .sort()
    .reverse()                           // newest first
    .map(f => {
      const m = RE.exec(f);
      const label = m
        ? (m[6].replace(/_/g, ' ') || 'untitled') + ` · ${m[1]}-${m[2]}-${m[3]}`
        : f.replace('.js', '');
      return { file: f, label };
    });
  res.json({ sketches });
});

app.get('/api/motifs', (_req, res) => {
  if (!fs.existsSync(MOTIFS)) return res.json({ motifs: [] });
  const motifs = fs.readdirSync(MOTIFS)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(MOTIFS, f)));
        return {
          file: f,
          name:        d.name        || f.replace('.json', ''),
          stitchWidth:  d.stitchWidth  || 0,
          stitchHeight: d.stitchHeight || 0,
          cellSizePx:   d.cellSizePx   || 0,
          colorCount:   (d.colors || []).length,
          colors:       (d.colors || []).map(c => c.hexValue).filter(Boolean),
          source:       d.source || '',
        };
      } catch { return null; }
    })
    .filter(Boolean);
  res.json({ motifs });
});

app.post('/proxy', async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`upstream HTTP ${resp.status}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    const ct  = resp.headers.get('content-type') || 'image/png';

    let out = buf, width = 0, height = 0;
    try {
      // eslint-disable-next-line import/no-extraneous-dependencies
      const sharp = require('sharp');
      const meta  = await sharp(buf).metadata();
      width = meta.width; height = meta.height;
      const MAX = 1200;
      if (width > MAX || height > MAX) {
        out    = await sharp(buf).resize(MAX, MAX, { fit: 'inside' }).png().toBuffer();
        const m2 = await sharp(out).metadata();
        width = m2.width; height = m2.height;
      }
    } catch { /* sharp optional */ }

    res.json({ dataUrl: `data:${ct};base64,${out.toString('base64')}`, width, height });
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
});

app.post('/save', (req, res) => {
  const { name, motif } = req.body || {};
  if (!motif) return res.status(400).json({ error: 'motif required' });
  fs.mkdirSync(MOTIFS, { recursive: true });
  const safe = (name || 'motif').replace(/[^a-z0-9_-]/gi, '_');
  fs.writeFileSync(path.join(MOTIFS, `${safe}.json`), JSON.stringify(motif, null, 2));
  _rebuildManifest();
  const count = fs.readdirSync(MOTIFS).filter(f => f.endsWith('.json')).length;
  res.json({ saved: `motifs/${safe}.json`, count });
});

function _rebuildManifest() {
  if (!fs.existsSync(MOTIFS)) return;
  const all = fs.readdirSync(MOTIFS)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => { try { return JSON.parse(fs.readFileSync(path.join(MOTIFS, f))); } catch { return null; } })
    .filter(Boolean);
  fs.writeFileSync(
    path.join(MOTIFS, 'motifs.js'),
    `// Auto-generated — do not edit\nwindow.IMPORTED_MOTIFS = ${JSON.stringify(all, null, 2)};\n`,
  );
}

// ── Static + index redirect ──────────────────────────────────────────────────

// Serve everything under /libs, /assets, /saves, /motifs, etc.
app.use(express.static(ROOT, { index: false }));

// Root → dashboard
app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'dashboard.html')));

// ── Start ────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │  Motif Studio                           │
  ├─────────────────────────────────────────┤
  │  Dashboard  →  http://localhost:${PORT}/  │
  │  Studio     →  http://localhost:${PORT}/motif_studio.html
  │  Browser    →  http://localhost:${PORT}/motif_browser.html
  └─────────────────────────────────────────┘
`);
});
