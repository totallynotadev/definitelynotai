<script lang="ts">
  import { goto } from '$app/navigation';
  import { SignIn, SignedIn } from 'svelte-clerk';

  // Redirect authenticated users to projects
  function handleRedirect() {
    goto('/projects');
  }
</script>

<SignedIn>
  {#snippet children()}
    {handleRedirect()}
  {/snippet}
</SignedIn>

<svelte:head>
  <title>Sign In | Definitely Not AI</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
  <div class="mb-8 text-center">
    <h1 class="text-3xl font-bold text-white">Definitely Not AI</h1>
    <p class="mt-2 text-gray-400">Sign in to continue building amazing apps</p>
  </div>

  <div class="w-full max-w-md">
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      forceRedirectUrl="/projects"
    />
  </div>

  <p class="mt-8 text-center text-sm text-gray-500">
    Don't have an account?
    <a href="/sign-up" class="font-medium text-indigo-400 hover:text-indigo-300">
      Sign up
    </a>
  </p>
</div>
