<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import { UserButton } from '$lib/clerk/index.js';

  import { Button } from '$lib/components/ui/button/index.js';

  interface Props {
    title?: string;
    isAuthenticated?: boolean;
  }

  const { title = 'Dashboard', isAuthenticated = true }: Props = $props();
</script>

<header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-800 bg-gray-950 px-6">
  <!-- Page Title -->
  <h1 class="text-xl font-semibold text-white">{title}</h1>

  <!-- Right Section -->
  <div class="flex items-center gap-4">
    {#if isAuthenticated}
      <!-- New Project Button -->
      <a href="/projects/new">
        <Button class="bg-purple-600 hover:bg-purple-700">
          <Plus class="mr-2 h-4 w-4" />
          New Project
        </Button>
      </a>

      <!-- User Button from Clerk -->
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'h-9 w-9',
          },
        }}
      />
    {:else}
      <a href="/sign-in">
        <Button variant="ghost" class="text-gray-400 hover:text-white">
          Sign In
        </Button>
      </a>
      <a href="/sign-up">
        <Button class="bg-purple-600 hover:bg-purple-700">
          Sign Up
        </Button>
      </a>
    {/if}
  </div>
</header>
