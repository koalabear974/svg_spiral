'use strict';

function storeIdFromToken(token) {
  const parts = token.split('_');
  const raw = parts[3] || '';
  return raw.startsWith('store_') ? raw.slice(6) : raw;
}

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') return res.status(405).end();
  const safe = (req.query.name || '').replace(/[^a-z0-9_-]/gi, '_');
  if (!safe) return res.status(400).json({ error: 'name required' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not set' });

  try {
    const listHeaders = {
      authorization: `Bearer ${token}`,
      'x-vercel-blob-store-id': storeIdFromToken(token),
      'x-api-version': '12',
    };
    const lr = await fetch(
      `https://blob.vercel-storage.com/?prefix=${encodeURIComponent(`motifs/${safe}.json`)}&limit=10`,
      { headers: listHeaders }
    );
    const { blobs = [] } = await lr.json();
    const match = blobs.find(b => b.pathname === `motifs/${safe}.json`);
    if (!match) return res.status(404).json({ error: 'not found' });

    const dr = await fetch('https://blob.vercel-storage.com/delete', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'x-vercel-blob-store-id': storeIdFromToken(token),
        'x-api-version': '12',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ urls: [match.url] }),
    });
    if (!dr.ok) throw new Error(`Delete API ${dr.status}: ${await dr.text()}`);
    return res.json({ deleted: true, _source: 'blob' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
