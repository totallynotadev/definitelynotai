<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { ArrowLeft, ExternalLink } from 'lucide-svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();

  const project = $derived({
    id: data.id,
    name: 'E-commerce App',
    description: 'Full-featured online store with shopping cart, checkout flow, and payment integration.',
    status: 'deployed',
    createdAt: 'December 1, 2024',
    lastUpdated: '2 hours ago',
    deploymentUrl: 'https://ecommerce-app.pages.dev',
  });

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
    <a href="/projects" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
      <ArrowLeft class="h-4 w-4" />
      Back to Projects
    </a>
  </div>

  <div class="flex items-start justify-between">
    <div>
      <h1 class="text-3xl font-bold text-white">{project.name}</h1>
      <p class="mt-2 text-gray-400">{project.description}</p>
    </div>
    <div class="flex gap-3">
      <Button variant="outline" class="border-gray-700 text-gray-300 hover:bg-gray-800">
        Edit
      </Button>
      <Button class="bg-purple-600 hover:bg-purple-700">
        Deploy
      </Button>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-3">
    <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h3 class="text-sm font-medium text-gray-400">Status</h3>
      <p class="mt-1 text-lg font-semibold capitalize text-green-400">{project.status}</p>
    </div>
    <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h3 class="text-sm font-medium text-gray-400">Created</h3>
      <p class="mt-1 text-lg font-semibold text-white">{project.createdAt}</p>
    </div>
    <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h3 class="text-sm font-medium text-gray-400">Last Updated</h3>
      <p class="mt-1 text-lg font-semibold text-white">{project.lastUpdated}</p>
    </div>
  </div>

  <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
    <h2 class="text-lg font-semibold text-white">Deployment</h2>
    <div class="mt-4">
      <p class="text-sm text-gray-400">Live URL</p>
      <a
        href={project.deploymentUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="mt-1 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 hover:underline"
      >
        {project.deploymentUrl}
        <ExternalLink class="h-4 w-4" />
      </a>
    </div>
  </div>

  <div class="rounded-lg border border-gray-800 bg-gray-900 p-6">
    <h2 class="text-lg font-semibold text-white">Build History</h2>
    <div class="mt-4 space-y-3">
      {#each buildHistory as build}
        <div class="flex items-center justify-between rounded-md bg-gray-800 p-3">
          <div class="flex items-center gap-3">
            <div
              class="h-2 w-2 rounded-full {build.status === 'success' ? 'bg-green-500' : 'bg-red-500'}"
            ></div>
            <span class="text-sm font-medium capitalize text-gray-300">{build.status}</span>
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
