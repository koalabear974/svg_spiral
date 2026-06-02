'use strict';

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') return res.status(405).end();
  const safe = (req.query.name || '').replace(/[^a-z0-9_-]/gi, '_');
  if (!safe) return res.status(400).json({ error: 'name required' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not set' });

  try {
    // Find the blob URL first
    const lr = await fetch(`https://blob.vercel-storage.com/?prefix=motifs/${safe}.json&limit=10`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const { blobs = [] } = await lr.json();
    const match = blobs.find(b => b.pathname === `motifs/${safe}.json`);
    if (!match) return res.status(404).json({ error: 'not found' });

    const dr = await fetch('https://blob.vercel-storage.com/delete', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ urls: [match.url] }),
    });
    if (!dr.ok) throw new Error(`Delete API ${dr.status}`);
    return res.json({ deleted: true, _source: 'blob' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
