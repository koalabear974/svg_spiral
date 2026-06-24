'use strict';
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const RE = /^save_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})_?(.*)\.js$/;

module.exports = (_req, res) => {
  const dir = path.join(ROOT, 'saves');
  if (!fs.existsSync(dir)) return res.json({ sketches: [] });
  const sketches = fs.readdirSync(dir)
    .filter(f => RE.test(f))
    .sort()
    .reverse()
    .map(f => {
      const m = RE.exec(f);
      const label = (m[6].replace(/_/g, ' ') || 'untitled') + ` · ${m[1]}-${m[2]}-${m[3]}`;
      return { file: f, label };
    });
  res.json({ sketches });
};
