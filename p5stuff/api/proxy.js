'use strict';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`upstream HTTP ${resp.status}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    const ct  = resp.headers.get('content-type') || 'image/png';
    res.json({ dataUrl: `data:${ct};base64,${buf.toString('base64')}`, width: 0, height: 0 });
  } catch (e) {
    res.status(500).json({ error: String(e.message) });
  }
};
