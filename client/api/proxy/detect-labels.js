export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const fetch = (await import('node-fetch')).default;

  const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;

  if (!BACKEND_BASE_URL) {
    return res.status(500).json({ error: 'Missing BACKEND_BASE_URL env' });
  }

  const backendURL = `${BACKEND_BASE_URL}/detect-labels`;

  try {
    const backendResponse = await fetch(backendURL, {
      method: req.method,
      headers: {
        ...req.headers,
        host: BACKEND_BASE_URL.replace(/^https?:\/\//, '').split('/')[0],
      },
      body: req,
    });

    backendResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(backendResponse.status);
    backendResponse.body.pipe(res);
  } catch (err) {
    console.error('❌ Proxy error:', err.message);
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}
