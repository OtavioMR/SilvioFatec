import { buildGreeting } from '../src/greeting.js';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end(JSON.stringify({ error: 'Método não permitido' }));
  }

  try {
    const url = new URL(req.url, 'http://localhost');
    const message = buildGreeting(url.searchParams.get('name'));
    res.statusCode = 200;
    return res.end(JSON.stringify({ message }));
  } catch (err) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: err.message }));
  }
}
