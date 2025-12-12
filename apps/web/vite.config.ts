import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import path from 'path';

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
      // Workaround: svelte-clerk only exports "svelte" condition
      // Order matters - more specific paths first
      { find: 'svelte-clerk/server', replacement: path.resolve(__dirname, 'node_modules/svelte-clerk/dist/server/index.js') },
      { find: 'svelte-clerk/client', replacement: path.resolve(__dirname, 'node_modules/svelte-clerk/dist/client/index.js') },
      { find: 'svelte-clerk', replacement: path.resolve(__dirname, 'node_modules/svelte-clerk/dist/index.js') },
      // Workaround: bits-ui only exports "svelte" condition
      { find: 'bits-ui', replacement: path.resolve(__dirname, '../../node_modules/.bun/bits-ui@0.21.16+c256b0b6a2dbad7b/node_modules/bits-ui/dist/index.js') },
      // Workaround: @melt-ui/svelte only exports "svelte" condition
      { find: '@melt-ui/svelte', replacement: path.resolve(__dirname, '../../node_modules/.bun/@melt-ui+svelte@0.76.2+c256b0b6a2dbad7b/node_modules/@melt-ui/svelte/dist/index.js') },
      // Workaround: runed only exports "svelte" condition (dependency of svelte-sonner)
      { find: 'runed', replacement: path.resolve(__dirname, '../../node_modules/.bun/runed@0.28.0+c256b0b6a2dbad7b/node_modules/runed/dist/index.js') },
      // Workspace packages
      { find: '@definitelynotai/db', replacement: path.resolve(__dirname, '../../packages/db/dist/index.js') },
    ],
  },
  ssr: {
    noExternal: ['@definitelynotai/db'],
  },
});
