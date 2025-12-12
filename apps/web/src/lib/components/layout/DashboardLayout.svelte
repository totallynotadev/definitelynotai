<script lang="ts">
  import { cn } from '$lib/utils.js';

  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';

  import type { Snippet } from 'svelte';

  type Props = {
    title?: string;
    children: Snippet;
  };

  const { title = 'Dashboard', children }: Props = $props();

  let sidebarCollapsed = $state(false);
</script>

<div class="flex h-screen bg-gray-950 text-white">
  <Sidebar bind:collapsed={sidebarCollapsed} />

  <div
    class={cn(
      'flex flex-1 flex-col overflow-hidden transition-all duration-300',
      sidebarCollapsed ? 'ml-16' : 'ml-60'
    )}
  >
    <Header {title} />

    <main class="flex-1 overflow-auto p-6">
      {@render children()}
    </main>
  </div>
</div>
