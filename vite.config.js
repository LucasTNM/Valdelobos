// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // SUBSTITUA pelo nome exato do seu repositório no GitHub, com as barras
  base: '/Valdelobos/', 
  build: {
    // Garante que os assets grandes não quebrem o build
    chunkSizeWarningLimit: 1500,
  }
});