// npm run build:demo — build IIFE em demo/ e junta tudo num único index.html.
import { execFileSync } from 'node:child_process';

execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', 'demo', '--emptyOutDir'], {
  stdio: 'inherit',
  env: { ...process.env, DEMO: '1' },
});
await import('./inline-demo.mjs');
