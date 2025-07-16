// client/api/proxy/index.js
export default async function handler(req, res) {
  const BACKEND_BASE = process.env.BACKEND_BASE_URL;

  if (!BACKEND_BASE) {
    return res.status(500).json({ error: 'BACKEND_BASE_URL is not set' });
  }

  const path = req.url.replace('/api/proxy', '');
  const url = BACKEND_BASE + path;

  const response = await fetch(url, {
    method: req.method,
    headers: {
      ...req.headers,
      host: '',
    },
    body: req.method === 'GET' || req.method === 'HEAD' ? null : req, // ⚠️ use `req` directly
    duplex: 'half', // ⚠️ required to avoid duplex error
  });

  res.status(response.status);

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const data = await response.arrayBuffer();
  res.send(Buffer.from(data));
}
