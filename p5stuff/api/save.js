'use strict';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, motif } = req.body || {};
  if (!motif) return res.status(400).json({ error: 'motif required' });
  const safe = (name || 'motif').replace(/[^a-z0-9_-]/gi, '_');

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not set' });

  try {
    const r = await fetch(`https://blob.vercel-storage.com/motifs/${safe}.json`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'x-content-type': 'application/json',
        'x-add-random-suffix': '0',
      },
      body: JSON.stringify(motif, null, 2),
    });
    if (!r.ok) throw new Error(`Blob API ${r.status}: ${await r.text()}`);
    const data = await r.json();
    return res.json({ saved: `motifs/${safe}.json`, count: 0, _source: 'blob', _blobUrl: data.url });
  } catch (e) {
    return res.status(500).json({ error: `Save failed: ${e.message}` });
  }
};
