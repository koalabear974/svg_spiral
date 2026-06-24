'use strict';

// Use a pre-generated manifest to avoid fs.readdirSync triggering Vercel's
// file tracer to bundle the entire saves/ directory (700MB+) into the lambda.
// Regenerate saves/manifest.json locally whenever new saves are committed.
const manifest = require('../saves/manifest.json');

module.exports = (_req, res) => {
  res.json({ sketches: manifest });
};
