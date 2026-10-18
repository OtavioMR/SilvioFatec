import { createServer } from 'node:http';
import hello from '../../api/hello.js';
import health from '../../api/health.js';

const routes = { '/api/hello': hello, '/api/health': health };

/** Sobe um servidor HTTP local que imita as funções da Vercel. */
export function startServer(port = 0) {
  const server = createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    const handler = routes[pathname];
    if (!handler) {
      res.statusCode = 404;
      return res.end('not found');
    }
    return handler(req, res);
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, url: `http://127.0.0.1:${server.address().port}` });
    });
  });
}
