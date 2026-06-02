'use strict';

function storeIdFromToken(token) {
  const parts = token.split('_'); // vercel_blob_rw_{storeId}_{secret}
  const raw = parts[3] || '';
  return raw.startsWith('store_') ? raw.slice(6) : raw;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, motif } = req.body || {};
  if (!motif) return res.status(400).json({ error: 'motif required' });
  const safe = (name || 'motif').replace(/[^a-z0-9_-]/gi, '_');

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not set' });

  try {
    const pathname = `motifs/${safe}.json`;
    const r = await fetch(`https://blob.vercel-storage.com/?pathname=${encodeURIComponent(pathname)}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'x-vercel-blob-access': 'private',
        'x-content-type': 'application/json',
        'x-add-random-suffix': '0',
        'x-allow-overwrite': '1',
        'x-vercel-blob-store-id': storeIdFromToken(token),
        'x-api-version': '12',
      },
      body: JSON.stringify(motif, null, 2),
    });
    if (!r.ok) throw new Error(`Blob API ${r.status}: ${await r.text()}`);
    const data = await r.json();
    return res.json({ saved: pathname, count: 0, _source: 'blob', _blobUrl: data.url });
  } catch (e) {
    return res.status(500).json({ error: `Save failed: ${e.message}` });
  }
};
