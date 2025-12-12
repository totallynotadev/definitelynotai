<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';

  let apiKeyVisible = $state(false);
  const maskedApiKey = 'sk-••••••••••••••••••••••••••••••';
</script>

<svelte:head>
  <title>Settings | Definitely Not AI</title>
</svelte:head>

<div class="space-y-8">
  <div>
    <p class="text-gray-400">
      Configure your Definitely Not AI workspace and preferences.
    </p>
  </div>

  <div class="grid gap-6">
    <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h2 class="text-lg font-semibold text-white">Profile</h2>
      <p class="mt-1 text-sm text-gray-400">Manage your account information.</p>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300">Name</label>
          <input
            type="text"
            id="name"
            value="John Doe"
            class="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            id="email"
            value="john@example.com"
            class="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>
      <div class="mt-4">
        <Button class="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
      </div>
    </div>

    <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h2 class="text-lg font-semibold text-white">API Configuration</h2>
      <p class="mt-1 text-sm text-gray-400">Manage your API keys and integrations.</p>
      <div class="mt-6">
        <label for="apiKey" class="block text-sm font-medium text-gray-300">API Key</label>
        <div class="mt-1 flex gap-2">
          <input
            type={apiKeyVisible ? 'text' : 'password'}
            id="apiKey"
            value={maskedApiKey}
            readonly
            class="block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Button
            variant="outline"
            class="border-gray-700 text-gray-300 hover:bg-gray-800"
            onclick={() => (apiKeyVisible = !apiKeyVisible)}
          >
            {apiKeyVisible ? 'Hide' : 'Show'}
          </Button>
          <Button variant="outline" class="border-gray-700 text-gray-300 hover:bg-gray-800">
            Regenerate
          </Button>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h2 class="text-lg font-semibold text-white">Preferences</h2>
      <p class="mt-1 text-sm text-gray-400">Customize your experience.</p>
      <div class="mt-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-white">Email Notifications</p>
            <p class="text-sm text-gray-400">Receive updates about your builds and deployments.</p>
          </div>
          <button
            class="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600"
            role="switch"
            aria-checked="true"
            aria-label="Toggle email notifications"
          >
            <span class="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition"></span>
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-white">Auto-deploy on Complete</p>
            <p class="text-sm text-gray-400">Automatically deploy projects when generation completes.</p>
          </div>
          <button
            class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700"
            role="switch"
            aria-checked="false"
            aria-label="Toggle auto-deploy"
          >
            <span class="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition"></span>
          </button>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-red-500/30 bg-gray-900 p-6">
      <h2 class="text-lg font-semibold text-red-400">Danger Zone</h2>
      <p class="mt-1 text-sm text-gray-400">Irreversible and destructive actions.</p>
      <div class="mt-6">
        <Button class="bg-red-600 hover:bg-red-700">
          Delete Account
        </Button>
      </div>
    </div>
  </div>
</div>
