'use strict';
const { list, del } = require('@vercel/blob');

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') return res.status(405).end();
  const safe = (req.query.name || '').replace(/[^a-z0-9_-]/gi, '_');
  if (!safe) return res.status(400).json({ error: 'name required' });

  try {
    const { blobs } = await list({ prefix: `motifs/${safe}.json` });
    const match = blobs.find(b => b.pathname === `motifs/${safe}.json`);
    if (match) {
      await del(match.url);
      return res.json({ deleted: true, _source: 'blob' });
    }
  } catch {}

  res.status(404).json({ error: 'not found' });
};
