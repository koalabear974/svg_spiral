'use strict';
const fs   = require('fs');
const path = require('path');

module.exports = (_req, res) => {
  const dir = path.join(process.cwd(), 'saves');
  if (!fs.existsSync(dir)) return res.json({ sketches: [] });
  const RE = /^save_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})_?(.*)\.js$/;
  const sketches = fs.readdirSync(dir)
    .filter(f => f.endsWith('.js'))
    .sort().reverse()
    .map(f => {
      const m = RE.exec(f);
      const label = m
        ? (m[6].replace(/_/g, ' ') || 'untitled') + ` · ${m[1]}-${m[2]}-${m[3]}`
        : f.replace('.js', '');
      return { file: f, label };
    });
  res.json({ sketches });
};
