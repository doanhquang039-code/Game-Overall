import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative asset paths for Electron and standalone offline usage
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
