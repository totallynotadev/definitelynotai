<script lang="ts">
  import { Plus, User, Settings, LogOut } from 'lucide-svelte';
  import { SignedIn, SignedOut, UserButton, SignOutButton } from 'svelte-clerk';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';

  type Props = {
    title?: string;
  };

  let { title = 'Dashboard' }: Props = $props();
</script>

<header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-800 bg-gray-950 px-6">
  <!-- Page Title -->
  <h1 class="text-xl font-semibold text-white">{title}</h1>

  <!-- Right Section -->
  <div class="flex items-center gap-4">
    <SignedIn>
      <!-- New Project Button -->
      <Button href="/projects/new" class="bg-purple-600 hover:bg-purple-700">
        <Plus class="mr-2 h-4 w-4" />
        New Project
      </Button>

      <!-- User Button from Clerk -->
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'h-9 w-9',
          },
        }}
      />
    </SignedIn>

    <SignedOut>
      <Button href="/sign-in" variant="ghost" class="text-gray-400 hover:text-white">
        Sign In
      </Button>
      <Button href="/sign-up" class="bg-purple-600 hover:bg-purple-700">
        Sign Up
      </Button>
    </SignedOut>
  </div>
</header>
