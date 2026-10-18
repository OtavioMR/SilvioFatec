// Servidor de desenvolvimento local: serve o site (public/) e a API (api/).
// Na Vercel isso é feito pela própria plataforma; aqui é só para testar no seu computador.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import hello from '../api/hello.js';
import health from '../api/health.js';

const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const PORT = process.env.PORT ?? 3000;

const apiRoutes = { '/api/hello': hello, '/api/health': health };
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  // 1) Rotas da API
  const apiHandler = apiRoutes[pathname];
  if (apiHandler) return apiHandler(req, res);

  // 2) Arquivos estáticos de public/ ("/" vira "/index.html")
  const requested = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.join(PUBLIC_DIR, requested);

  // Segurança: impede sair da pasta public/ (ex.: /../package.json)
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.statusCode = 403;
    return res.end('forbidden');
  }

  try {
    const content = await readFile(filePath);
    res.setHeader('Content-Type', mimeTypes[path.extname(filePath)] ?? 'application/octet-stream');
    res.end(content);
  } catch {
    res.statusCode = 404;
    res.end('not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Servidor local: http://localhost:${PORT}`);
  console.log(`   Site:   http://localhost:${PORT}/`);
  console.log(`   API:    http://localhost:${PORT}/api/hello?name=Mundo`);
  console.log(`   Saúde:  http://localhost:${PORT}/api/health\n`);
});
