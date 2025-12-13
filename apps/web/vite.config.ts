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
      // Workaround: bits-ui only exports "svelte" condition (use 0.21.x for compatibility with UI components)
      { find: 'bits-ui', replacement: path.resolve(__dirname, '../../node_modules/.bun/bits-ui@0.21.16+c256b0b6a2dbad7b/node_modules/bits-ui/dist/index.js') },
      // Workaround: @melt-ui/svelte only exports "svelte" condition
      { find: '@melt-ui/svelte', replacement: path.resolve(__dirname, '../../node_modules/.bun/@melt-ui+svelte@0.76.2+c256b0b6a2dbad7b/node_modules/@melt-ui/svelte/dist/index.js') },
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
