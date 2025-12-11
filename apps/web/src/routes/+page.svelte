<script lang="ts">
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
    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
    <p class="mt-2 text-gray-600">
      Welcome to Definitely Not AI - your Agentic OS where you describe apps and AI builds them.
    </p>
  </div>

  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {#each stats as stat}
      <div class="card">
        <p class="text-sm font-medium text-gray-500">{stat.label}</p>
        <p class="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
      </div>
    {/each}
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
      <p class="mt-2 text-sm text-gray-500">
        Your recent project builds and deployments will appear here.
      </p>
      <div class="mt-4 space-y-3">
        <div class="flex items-center gap-3 rounded-md bg-gray-50 p-3">
          <div class="h-2 w-2 rounded-full bg-green-500"></div>
          <span class="text-sm text-gray-700">Project "E-commerce App" deployed successfully</span>
        </div>
        <div class="flex items-center gap-3 rounded-md bg-gray-50 p-3">
          <div class="h-2 w-2 rounded-full bg-blue-500"></div>
          <span class="text-sm text-gray-700">Building "Dashboard Template"...</span>
        </div>
        <div class="flex items-center gap-3 rounded-md bg-gray-50 p-3">
          <div class="h-2 w-2 rounded-full bg-green-500"></div>
          <span class="text-sm text-gray-700">Project "Landing Page" deployed successfully</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900">Quick Start</h2>
      <p class="mt-2 text-sm text-gray-500">
        Describe your app idea and let AI build it for you.
      </p>
      <div class="mt-4">
        <textarea
          placeholder="Describe your app... e.g., 'A task management app with drag-and-drop kanban boards'"
          rows="4"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        ></textarea>
        <button class="btn-primary mt-3 w-full">Generate App</button>
      </div>
    </div>
  </div>
</div>
