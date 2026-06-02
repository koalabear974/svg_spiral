import { list } from '@vercel/blob';

export default async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const motifs = [];
  try {
    const { blobs } = await list({ prefix: 'motifs/' });
    for (const blob of blobs.filter(b => b.pathname.endsWith('.json'))) {
      try {
        const r = await fetch(blob.url);
        const d = await r.json();
        motifs.push({ ...d, _file: blob.pathname.split('/').pop(), _source: 'blob', _blobUrl: blob.url });
      } catch {}
    }
  } catch {}

  res.json({ motifs });
};
