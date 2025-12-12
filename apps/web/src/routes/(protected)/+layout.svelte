<script lang="ts">
  import { page } from '$app/stores';
  import { DashboardLayout } from '$lib/components/layout/index.js';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  // Derive page title from route
  function getPageTitle(pathname: string): string {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/projects/new')) return 'New Project';
    if (pathname.startsWith('/projects/')) return 'Project Details';
    if (pathname.startsWith('/projects')) return 'Projects';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  }

  const pageTitle = $derived(getPageTitle($page.url.pathname));
</script>

<DashboardLayout title={pageTitle}>
  {@render children()}
</DashboardLayout>
