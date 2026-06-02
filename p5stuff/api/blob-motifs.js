'use strict';

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const motifs = [];

  if (token) {
    try {
      const r = await fetch(`https://blob.vercel-storage.com/?prefix=motifs/&limit=1000`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const { blobs = [] } = await r.json();
      for (const blob of blobs.filter(b => b.pathname.endsWith('.json'))) {
        try {
          // Use downloadUrl (pre-signed) or auth header for private blobs
          const fetchUrl = blob.downloadUrl || blob.url;
          const d = await fetch(fetchUrl, {
            headers: { authorization: `Bearer ${token}` },
          }).then(r => r.json());
          motifs.push({ ...d, _file: blob.pathname.split('/').pop(), _source: 'blob', _blobUrl: blob.url });
        } catch {}
      }
    } catch {}
  }

  res.json({ motifs });
};
