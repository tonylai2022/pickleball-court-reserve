// Wrapper that spawns minimal-server.js and logs detailed lifecycle events
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const childPath = path.join(__dirname, 'minimal-server.js');

console.log('[wrapper] Spawning child process for minimal-server.js');

const child = spawn(process.argv[0], [childPath], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, WRAPPER: '1' }
});

child.stdout.on('data', d => process.stdout.write(`[child stdout] ${d}`));
child.stderr.on('data', d => process.stderr.write(`[child stderr] ${d}`));

child.on('exit', (code, signal) => {
  console.error(`[wrapper] Child exited code=${code} signal=${signal}`);
  setTimeout(() => {
    console.error('[wrapper] Exiting wrapper after child termination');
    process.exit(code || 0);
  }, 100);
});

child.on('error', err => {
  console.error('[wrapper] Failed to spawn child', err);
});

// Keep wrapper alive with interval to show it persists if child dies
let ticks = 0;
setInterval(() => {
  ticks += 1;
  if (ticks % 30 === 0) {
    console.log(`[wrapper] still alive ticks=${ticks}`);
  }
}, 1000);
