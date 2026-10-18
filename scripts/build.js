import { mkdirSync, writeFileSync, existsSync } from 'node:fs';

if (!existsSync('public/index.html')) {
  console.error('public/index.html não encontrado');
  process.exit(1);
}

mkdirSync('public', { recursive: true });
const info = {
  commit: process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
  builtAt: new Date().toISOString()
};
writeFileSync('public/build-info.json', JSON.stringify(info, null, 2));
console.log('Build OK:', info);
