import path from 'path';

import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 3000,
    strictPort: false,
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: [
      // Workaround: runed only exports "svelte" condition (dependency of svelte-sonner)
      { find: 'runed', replacement: path.resolve(__dirname, '../../node_modules/.bun/runed@0.35.1+48df3b02c278c612/node_modules/runed/dist/index.js') },
      // Workspace packages
      { find: '@definitelynotai/db', replacement: path.resolve(__dirname, '../../packages/db/dist/index.js') },
    ],
  },
  ssr: {
    noExternal: ['@definitelynotai/db'],
  },
});
