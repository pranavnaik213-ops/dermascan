export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Use GET for health status.' }));
  }

  const payload = {
    status: 'online',
    platform: 'DermaScan Vercel Edge Serverless',
    runtime: 'vercel-serverless',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(payload);
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(payload));
}

