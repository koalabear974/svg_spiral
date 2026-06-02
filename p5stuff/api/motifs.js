'use strict';
const fs   = require('fs');
const path = require('path');

module.exports = (_req, res) => {
  const MOTIFS = path.join(process.cwd(), 'motifs');
  if (!fs.existsSync(MOTIFS)) return res.json({ motifs: [] });
  const motifs = fs.readdirSync(MOTIFS)
    .filter(f => f.endsWith('.json'))
    .sort()
    .map(f => {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(MOTIFS, f)));
        return {
          file:         f,
          name:         d.name        || f.replace('.json', ''),
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
};
