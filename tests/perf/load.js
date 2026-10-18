import autocannon from 'autocannon';
import { startServer } from '../helpers/server.js';

// Limites (folgados de propósito: runners do GitHub são compartilhados)
const LIMITS = { p99Ms: 100, minReqPerSec: 500, maxErrors: 0 };

const { server, url } = await startServer();

const result = await autocannon({
  url: `${url}/api/hello?name=Perf`,
  connections: 10,
  duration: 5
});

await new Promise((resolve) => server.close(resolve));

const summary = {
  reqPerSecAvg: result.requests.average,
  latencyP99Ms: result.latency.p99,
  errors: result.errors + result.non2xx + result.timeouts
};
console.log('Resultado:', summary);
console.log('Limites  :', LIMITS);

const failures = [];
if (summary.latencyP99Ms > LIMITS.p99Ms) failures.push(`p99 ${summary.latencyP99Ms}ms > ${LIMITS.p99Ms}ms`);
if (summary.reqPerSecAvg < LIMITS.minReqPerSec) failures.push(`req/s ${summary.reqPerSecAvg} < ${LIMITS.minReqPerSec}`);
if (summary.errors > LIMITS.maxErrors) failures.push(`erros: ${summary.errors}`);

if (failures.length) {
  console.error('❌ Performance reprovada:\n - ' + failures.join('\n - '));
  process.exit(1);
}
console.log('✅ Performance aprovada');
