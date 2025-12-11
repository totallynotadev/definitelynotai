<script lang="ts">
  let apiKeyVisible = $state(false);
  const maskedApiKey = 'sk-••••••••••••••••••••••••••••••';
</script>

<svelte:head>
  <title>Settings | Definitely Not AI</title>
</svelte:head>

<div class="space-y-8">
  <div>
    <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
    <p class="mt-2 text-gray-600">
      Configure your Definitely Not AI workspace and preferences.
    </p>
  </div>

  <div class="grid gap-6">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900">Profile</h2>
      <p class="mt-1 text-sm text-gray-500">Manage your account information.</p>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            value="John Doe"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value="john@example.com"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
      <div class="mt-4">
        <button class="btn-primary">Save Changes</button>
      </div>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900">API Configuration</h2>
      <p class="mt-1 text-sm text-gray-500">Manage your API keys and integrations.</p>
      <div class="mt-6">
        <label for="apiKey" class="block text-sm font-medium text-gray-700">API Key</label>
        <div class="mt-1 flex gap-2">
          <input
            type={apiKeyVisible ? 'text' : 'password'}
            id="apiKey"
            value={maskedApiKey}
            readonly
            class="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            class="btn-secondary"
            onclick={() => (apiKeyVisible = !apiKeyVisible)}
          >
            {apiKeyVisible ? 'Hide' : 'Show'}
          </button>
          <button class="btn-secondary">Regenerate</button>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900">Preferences</h2>
      <p class="mt-1 text-sm text-gray-500">Customize your experience.</p>
      <div class="mt-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">Email Notifications</p>
            <p class="text-sm text-gray-500">Receive updates about your builds and deployments.</p>
          </div>
          <button
            class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600"
            role="switch"
            aria-checked="true"
          >
            <span class="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition"></span>
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">Dark Mode</p>
            <p class="text-sm text-gray-500">Use dark theme across the application.</p>
          </div>
          <button
            class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
            role="switch"
            aria-checked="false"
          >
            <span class="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition"></span>
          </button>
        </div>
      </div>
    </div>

    <div class="card border-red-200">
      <h2 class="text-lg font-semibold text-red-600">Danger Zone</h2>
      <p class="mt-1 text-sm text-gray-500">Irreversible and destructive actions.</p>
      <div class="mt-6">
        <button class="btn bg-red-600 text-white hover:bg-red-700">
          Delete Account
        </button>
      </div>
    </div>
  </div>
</div>
