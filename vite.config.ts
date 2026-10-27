import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Caminhos relativos: o build funciona em https://<usuário>.github.io/cifra-de-cesar/.
  base: './',
  plugins: [react()],
});
