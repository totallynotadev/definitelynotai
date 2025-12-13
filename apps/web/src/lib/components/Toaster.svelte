<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Use $state for dynamic component to work properly in Svelte 5
  let ToasterComponent = $state<any>(null);
  let ready = $state(false);

  onMount(async () => {
    if (browser) {
      // Dynamic import to avoid store initialization during SSR
      const module = await import('svelte-sonner');
      ToasterComponent = module.Toaster;
      ready = true;
    }
  });
</script>

{#if ready && ToasterComponent}
  <ToasterComponent
    position="bottom-right"
    richColors
    theme="dark"
    toastOptions={{
      style: 'background: #1f2937; border: 1px solid #374151; color: #f3f4f6;',
      classNames: {
        toast: 'font-sans',
        title: 'font-medium',
        description: 'text-gray-400',
        success: 'bg-green-900/50 border-green-800 text-green-100',
        error: 'bg-red-900/50 border-red-800 text-red-100',
        info: 'bg-blue-900/50 border-blue-800 text-blue-100',
        warning: 'bg-yellow-900/50 border-yellow-800 text-yellow-100',
      },
    }}
  />
{/if}
