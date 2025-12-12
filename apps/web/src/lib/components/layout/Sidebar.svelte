<script lang="ts">
  import { page } from '$app/stores';
  import { Home, FolderKanban, Settings, PanelLeftClose, PanelLeft } from 'lucide-svelte';
  import { cn } from '$lib/utils.js';

  type Props = {
    collapsed?: boolean;
  };

  let { collapsed = $bindable(false) }: Props = $props();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  }
</script>

<aside
  class={cn(
    'fixed left-0 top-0 z-40 flex h-screen flex-col bg-gray-900 transition-all duration-300',
    collapsed ? 'w-16' : 'w-60'
  )}
>
  <!-- Logo/Brand -->
  <div class="flex h-16 items-center justify-between border-b border-gray-800 px-4">
    {#if !collapsed}
      <a href="/" class="flex items-center gap-2">
        <span class="text-2xl">🤖</span>
        <span class="text-lg font-semibold text-white">Definitely Not AI</span>
      </a>
    {:else}
      <a href="/" class="mx-auto">
        <span class="text-2xl">🤖</span>
      </a>
    {/if}
  </div>

  <!-- Navigation -->
  <nav class="flex-1 space-y-1 px-2 py-4">
    {#each navItems as item}
      {@const active = isActive(item.href, $page.url.pathname)}
      <a
        href={item.href}
        class={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'bg-purple-600 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white',
          collapsed && 'justify-center px-2'
        )}
      >
        <item.icon class="h-5 w-5 shrink-0" />
        {#if !collapsed}
          <span>{item.label}</span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Collapse Button -->
  <div class="border-t border-gray-800 p-2">
    <button
      onclick={() => (collapsed = !collapsed)}
      class="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
    >
      {#if collapsed}
        <PanelLeft class="h-5 w-5" />
      {:else}
        <PanelLeftClose class="h-5 w-5" />
        <span>Collapse</span>
      {/if}
    </button>
  </div>
</aside>
