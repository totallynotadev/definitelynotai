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
    ],
  },
});
