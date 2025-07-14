export default async function handler(req, res) {
  const BACKEND_BASE = process.env.BACKEND_BASE_URL;
  if (!BACKEND_BASE) {
    return res.status(500).json({ error: 'BACKEND_BASE_URL env var is missing on Vercel' });
  }

  const forwardPath = req.url.replace('/api/proxy', '');
  const targetURL = BACKEND_BASE + forwardPath;

  const backendRes = await fetch(targetURL, {
    method: req.method,
    headers: {
      ...req.headers,
      host: undefined,
      'content-length': undefined,
    },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
  });

  res.status(backendRes.status);
  backendRes.headers.forEach((v, k) => res.setHeader(k, v));
  const data = await backendRes.arrayBuffer();
  res.send(Buffer.from(data));
}
