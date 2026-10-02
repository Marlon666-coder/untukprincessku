import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` makes the build work from any sub-path (e.g. GitHub Pages
// at https://<user>.github.io/<repo>/). Routing uses HashRouter for the same reason.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          three: ['three'],
        },
      },
    },
  },
});
