'use strict';

function storeIdFromToken(token) {
  const parts = token.split('_');
  const raw = parts[3] || '';
  return raw.startsWith('store_') ? raw.slice(6) : raw;
}

module.exports = async (req, res) => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not set' });
  const storeId = storeIdFromToken(token);

  if (req.method === 'GET') {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'name required' });
    const safe = name.replace(/[^a-z0-9_-]/gi, '_');
    try {
      const r = await fetch(
        `https://blob.vercel-storage.com/?prefix=${encodeURIComponent('progress/' + safe)}&limit=1`,
        { headers: { authorization: `Bearer ${token}`, 'x-vercel-blob-store-id': storeId, 'x-api-version': '12' } }
      );
      const { blobs = [] } = await r.json();
      if (!blobs.length) return res.json({ done: null });
      const data = await fetch(blobs[0].url, {
        headers: { authorization: `Bearer ${token}` },
      }).then(r => r.json());
      return res.json({ done: Array.isArray(data.done) ? data.done : null });
    } catch {
      return res.json({ done: null });
    }
  }

  if (req.method === 'PUT') {
    const { name, done } = req.body || {};
    if (!name || !Array.isArray(done)) return res.status(400).json({ error: 'name and done required' });
    const safe = name.replace(/[^a-z0-9_-]/gi, '_');
    try {
      const pathname = `progress/${safe}.json`;
      const r = await fetch(`https://blob.vercel-storage.com/?pathname=${encodeURIComponent(pathname)}`, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'x-vercel-blob-access': 'private',
          'x-content-type': 'application/json',
          'x-add-random-suffix': '0',
          'x-allow-overwrite': '1',
          'x-vercel-blob-store-id': storeId,
          'x-api-version': '12',
        },
        body: JSON.stringify({ done }),
      });
      if (!r.ok) throw new Error(`Blob API ${r.status}: ${await r.text()}`);
      return res.json({ saved: true });
    } catch (e) {
      return res.status(500).json({ error: `Save failed: ${e.message}` });
    }
  }

  return res.status(405).end();
};
