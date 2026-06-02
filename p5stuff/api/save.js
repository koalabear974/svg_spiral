'use strict';
const { put } = require('@vercel/blob');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, motif } = req.body || {};
  if (!motif) return res.status(400).json({ error: 'motif required' });
  const safe = (name || 'motif').replace(/[^a-z0-9_-]/gi, '_');

  try {
    const blob = await put(`motifs/${safe}.json`, JSON.stringify(motif, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });
    return res.json({ saved: `motifs/${safe}.json`, count: 0, _source: 'blob', _blobUrl: blob.url });
  } catch (e) {
    return res.status(500).json({ error: `Save failed: ${e.message}` });
  }
};
