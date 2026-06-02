'use strict';

function storeIdFromToken(token) {
  const parts = token.split('_');
  const raw = parts[3] || '';
  return raw.startsWith('store_') ? raw.slice(6) : raw;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const motifs = [];

  if (token) {
    try {
      const r = await fetch(`https://blob.vercel-storage.com/?prefix=motifs%2F&limit=1000`, {
        headers: {
          authorization: `Bearer ${token}`,
          'x-vercel-blob-store-id': storeIdFromToken(token),
          'x-api-version': '12',
        },
      });
      const { blobs = [] } = await r.json();
      for (const blob of blobs.filter(b => b.pathname.endsWith('.json'))) {
        try {
          const d = await fetch(blob.downloadUrl, {
            headers: { authorization: `Bearer ${token}` },
          }).then(r => r.json());
          motifs.push({ ...d, _file: blob.pathname.split('/').pop(), _source: 'blob', _blobUrl: blob.url });
        } catch {}
      }
    } catch {}
  }

  res.json({ motifs });
};
