<script lang="ts">
  import { SignUp } from 'svelte-clerk';
</script>

<svelte:head>
  <title>Sign Up | Definitely Not AI</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
  <div class="mb-8 text-center">
    <h1 class="text-3xl font-bold text-white">Definitely Not AI</h1>
    <p class="mt-2 text-gray-400">Create an account to start building</p>
  </div>

  <div class="w-full max-w-md">
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl="/projects"
    />
  </div>

  <p class="mt-8 text-center text-sm text-gray-500">
    Already have an account?
    <a href="/sign-in" class="font-medium text-indigo-400 hover:text-indigo-300">
      Sign in
    </a>
  </p>
</div>
