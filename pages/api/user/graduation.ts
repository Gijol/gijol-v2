import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}/api/v1/users/me/graduation`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const payload = await upstream.text();
    const contentType = upstream.headers.get('content-type') || '';

    // Try to respond with JSON if upstream returned JSON
    if (contentType.includes('application/json')) {
      const json = payload ? JSON.parse(payload) : null;
      return res.status(upstream.status).json(json);
    }

    // Otherwise stream as plain text
    res.status(upstream.status).setHeader('content-type', contentType);
    return res.send(payload);
  } catch (err: any) {
    console.error('graduation proxy error:', err);
    return res
      .status(502)
      .json({ message: 'Upstream request failed', error: err?.message || String(err) });
  }
}
