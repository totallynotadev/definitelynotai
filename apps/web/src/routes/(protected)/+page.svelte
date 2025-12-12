<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';

  const stats = [
    { label: 'Total Projects', value: '12' },
    { label: 'Active Builds', value: '3' },
    { label: 'Deployments', value: '48' },
    { label: 'API Calls', value: '2.4k' },
  ];
</script>

<svelte:head>
  <title>Dashboard | Definitely Not AI</title>
</svelte:head>

<div class="space-y-8">
  <div>
    <p class="text-gray-400">
      Welcome to Definitely Not AI - your Agentic OS where you describe apps and AI builds them.
    </p>
  </div>

  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {#each stats as stat}
      <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <p class="text-sm font-medium text-gray-400">{stat.label}</p>
        <p class="mt-1 text-3xl font-semibold text-white">{stat.value}</p>
      </div>
    {/each}
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h2 class="text-lg font-semibold text-white">Recent Activity</h2>
      <p class="mt-2 text-sm text-gray-400">
        Your recent project builds and deployments will appear here.
      </p>
      <div class="mt-4 space-y-3">
        <div class="flex items-center gap-3 rounded-md bg-gray-800 p-3">
          <div class="h-2 w-2 rounded-full bg-green-500"></div>
          <span class="text-sm text-gray-300">Project "E-commerce App" deployed successfully</span>
        </div>
        <div class="flex items-center gap-3 rounded-md bg-gray-800 p-3">
          <div class="h-2 w-2 rounded-full bg-blue-500"></div>
          <span class="text-sm text-gray-300">Building "Dashboard Template"...</span>
        </div>
        <div class="flex items-center gap-3 rounded-md bg-gray-800 p-3">
          <div class="h-2 w-2 rounded-full bg-green-500"></div>
          <span class="text-sm text-gray-300">Project "Landing Page" deployed successfully</span>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h2 class="text-lg font-semibold text-white">Quick Start</h2>
      <p class="mt-2 text-sm text-gray-400">
        Describe your app idea and let AI build it for you.
      </p>
      <div class="mt-4">
        <textarea
          placeholder="Describe your app... e.g., 'A task management app with drag-and-drop kanban boards'"
          rows="4"
          class="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        ></textarea>
        <Button class="mt-3 w-full bg-purple-600 hover:bg-purple-700">Generate App</Button>
      </div>
    </div>
  </div>
</div>
