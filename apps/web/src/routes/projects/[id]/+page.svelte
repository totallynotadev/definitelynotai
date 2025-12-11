<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const project = {
    id: data.id,
    name: 'E-commerce App',
    description: 'Full-featured online store with shopping cart, checkout flow, and payment integration.',
    status: 'deployed',
    createdAt: 'December 1, 2024',
    lastUpdated: '2 hours ago',
    deploymentUrl: 'https://ecommerce-app.pages.dev',
  };

  const buildHistory = [
    { id: '1', status: 'success', duration: '2m 34s', timestamp: '2 hours ago' },
    { id: '2', status: 'success', duration: '2m 12s', timestamp: '1 day ago' },
    { id: '3', status: 'failed', duration: '1m 45s', timestamp: '2 days ago' },
  ];
</script>

<svelte:head>
  <title>{project.name} | Definitely Not AI</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-4">
    <a href="/projects" class="text-sm text-gray-500 hover:text-gray-700">
      &larr; Back to Projects
    </a>
  </div>

  <div class="flex items-start justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">{project.name}</h1>
      <p class="mt-2 text-gray-600">{project.description}</p>
    </div>
    <div class="flex gap-3">
      <button class="btn-secondary">Edit</button>
      <button class="btn-primary">Deploy</button>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-3">
    <div class="card">
      <h3 class="text-sm font-medium text-gray-500">Status</h3>
      <p class="mt-1 text-lg font-semibold capitalize text-green-600">{project.status}</p>
    </div>
    <div class="card">
      <h3 class="text-sm font-medium text-gray-500">Created</h3>
      <p class="mt-1 text-lg font-semibold text-gray-900">{project.createdAt}</p>
    </div>
    <div class="card">
      <h3 class="text-sm font-medium text-gray-500">Last Updated</h3>
      <p class="mt-1 text-lg font-semibold text-gray-900">{project.lastUpdated}</p>
    </div>
  </div>

  <div class="card">
    <h2 class="text-lg font-semibold text-gray-900">Deployment</h2>
    <div class="mt-4">
      <p class="text-sm text-gray-500">Live URL</p>
      <a
        href={project.deploymentUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="mt-1 text-primary-600 hover:underline"
      >
        {project.deploymentUrl}
      </a>
    </div>
  </div>

  <div class="card">
    <h2 class="text-lg font-semibold text-gray-900">Build History</h2>
    <div class="mt-4 space-y-3">
      {#each buildHistory as build}
        <div class="flex items-center justify-between rounded-md bg-gray-50 p-3">
          <div class="flex items-center gap-3">
            <div
              class="h-2 w-2 rounded-full {build.status === 'success' ? 'bg-green-500' : 'bg-red-500'}"
            ></div>
            <span class="text-sm font-medium capitalize text-gray-700">{build.status}</span>
          </div>
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span>{build.duration}</span>
            <span>{build.timestamp}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
