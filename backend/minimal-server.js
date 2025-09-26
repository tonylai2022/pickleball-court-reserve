// Ultra-minimal HTTP server to diagnose silent termination issues
// Intentionally avoids Express and any external dependencies.
import http from 'http';

const PORT = process.env.PORT || 3100; // use different port to avoid conflicts
const HOST = '0.0.0.0';

const startedAt = Date.now();

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    const uptimeMs = Date.now() - startedAt;
    const payload = JSON.stringify({ ok: true, pid: process.pid, uptimeMs });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(payload);
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('minimal-ok');
});

server.on('error', (err) => {
  console.error('[minimal-server] server error', err);
});

process.on('uncaughtException', (err) => {
  console.error('[minimal-server] uncaughtException', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[minimal-server] unhandledRejection', reason);
});
process.on('exit', (code) => {
  console.error(`[minimal-server] process exit code=${code}`);
});
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(sig => {
  process.on(sig, () => {
    console.error(`[minimal-server] received ${sig}, shutting down`);
    server.close(() => process.exit(0));
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[minimal-server] listening on http://${HOST}:${PORT} pid=${process.pid}`);
});
