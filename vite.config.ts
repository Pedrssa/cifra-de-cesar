import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// DEMO=1 gera um bundle IIFE (script clássico) para a demo em arquivo único:
// o htmlpreview.github.io reinsere os scripts sem type="module".
const demo = process.env.DEMO === '1';

export default defineConfig({
  // Caminhos relativos: o build funciona em qualquer subpasta.
  base: './',
  plugins: [react()],
  build: demo
    ? {
        modulePreload: false,
        rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
      }
    : {},
});
