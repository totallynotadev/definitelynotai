<script lang="ts">
  import '../app.css';
  import { ClerkProvider, SignedIn, SignedOut, UserButton } from 'svelte-clerk';

  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<ClerkProvider>
  <div class="min-h-screen bg-gray-50">
    <nav class="border-b bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center gap-8">
            <a href="/" class="text-xl font-bold text-gray-900">
              Definitely Not AI
            </a>
            <div class="hidden md:flex md:gap-6">
              <a
                href="/"
                class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Dashboard
              </a>
              <a
                href="/projects"
                class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Projects
              </a>
              <a
                href="/settings"
                class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Settings
              </a>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <SignedIn>
              <button class="btn-primary">New Project</button>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <a
                href="/sign-in"
                class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Sign In
              </a>
              <a href="/sign-up" class="btn-primary">Sign Up</a>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {@render children()}
    </main>
  </div>
</ClerkProvider>
