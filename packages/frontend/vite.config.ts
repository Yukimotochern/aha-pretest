/// <reference types="vitest" />
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/frontend',

  server: {
    port: 4200,
    host: '0.0.0.0',
    proxy: {
      '/trpc': {
        target: `http://${process.env.VITE_PROXY_HOST}:4000/trpc`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trpc/, ''),
      },
    },
    fs: {
      allow: [
        // search up for workspace root
        searchForWorkspaceRoot(process.cwd()),
      ],
    },
  },

  preview: {
    port: 4300,
    host: '0.0.0.0',
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
