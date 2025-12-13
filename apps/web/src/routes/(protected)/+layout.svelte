<script lang="ts">
  import { DashboardLayout } from '$lib/components/layout/index.js';
  import { browser } from '$app/environment';
  import { initClerk, getClerk, isSignedIn } from '$lib/clerk/index.js';
  import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';

  import type { Snippet } from 'svelte';

  import { page } from '$app/stores';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  let authChecked = $state(false);
  let isAuthenticated = $state(false);
  let hasInitialized = false;

  // Check auth client-side
  $effect(() => {
    if (!browser || hasInitialized) return;
    hasInitialized = true;

    (async () => {
      try {
        await initClerk(PUBLIC_CLERK_PUBLISHABLE_KEY);
        const clerk = getClerk();

        if (clerk?.user) {
          isAuthenticated = true;
        } else {
          // Not signed in - redirect to sign-in
          console.log('[protected layout] User not authenticated, redirecting to sign-in');
          window.location.href = '/sign-in';
          return;
        }
      } catch (e) {
        console.error('[protected layout] Error checking auth:', e);
        window.location.href = '/sign-in';
        return;
      }

      authChecked = true;
    })();
  });

  // Derive page title from route
  function getPageTitle(pathname: string): string {
    if (pathname === '/') {return 'Dashboard';}
    if (pathname.startsWith('/projects/new')) {return 'New Project';}
    if (pathname.startsWith('/projects/')) {return 'Project Details';}
    if (pathname.startsWith('/projects')) {return 'Projects';}
    if (pathname.startsWith('/settings')) {return 'Settings';}
    return 'Dashboard';
  }

  const pageTitle = $derived(getPageTitle($page.url.pathname));
</script>

{#if authChecked && isAuthenticated}
  <DashboardLayout title={pageTitle}>
    {@render children()}
  </DashboardLayout>
{:else}
  <div class="flex min-h-screen items-center justify-center bg-gray-950">
    <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
  </div>
{/if}
