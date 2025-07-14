export default async function handler(req, res) {
  const BACKEND_BASE = process.env.BACKEND_BASE_URL || 'http://localhost:3000';

  const target = BACKEND_BASE + req.url.replace('/api/proxy', '');

  const backendRes = await fetch(target, {
    method: req.method,
    headers: { ...req.headers, host: undefined },
    body:
      req.method !== 'GET' && req.method !== 'HEAD'
        ? JSON.stringify(req.body)
        : undefined,
  });

  res.status(backendRes.status);
  backendRes.headers.forEach((v, k) => res.setHeader(k, v));
  res.send(Buffer.from(await backendRes.arrayBuffer()));
}
