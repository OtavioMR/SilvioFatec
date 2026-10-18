export default function handler(_req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ status: 'ok', commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local' }));
}
