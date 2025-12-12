<script lang="ts">
  import { onMount } from 'svelte';
  import { projectsApi, type Project } from '$lib/api';
  import { Button } from '$lib/components/ui/button/index.js';
  import { FolderKanban } from 'lucide-svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();

  let projects = $state<Project[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    if (!data.token) {
      error = 'Not authenticated';
      loading = false;
      return;
    }

    try {
      const result = await projectsApi.list(data.token);
      projects = result.projects;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load projects';
    } finally {
      loading = false;
    }
  });

  function getStatusColor(status: string): string {
    switch (status) {
      case 'deployed':
      case 'complete':
        return 'bg-green-500/20 text-green-400';
      case 'building':
      case 'generating':
        return 'bg-blue-500/20 text-blue-400';
      case 'validating':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'planning':
        return 'bg-purple-500/20 text-purple-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'draft':
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  }
</script>

<svelte:head>
  <title>Projects | Definitely Not AI</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <p class="text-gray-400">
      Manage your AI-generated applications and their deployments.
    </p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-400">
        <svg class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading projects...</span>
      </div>
    </div>
  {:else if error}
    <div class="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
      <p class="text-red-400">{error}</p>
    </div>
  {:else if projects.length === 0}
    <div class="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
      <FolderKanban class="mx-auto h-12 w-12 text-gray-600" />
      <h3 class="mt-4 text-lg font-semibold text-white">No projects yet</h3>
      <p class="mt-2 text-gray-400">Get started by creating your first project.</p>
      <Button href="/projects/new" class="mt-4 bg-purple-600 hover:bg-purple-700">
        Create your first project
      </Button>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each projects as project}
        <a
          href="/projects/{project.id}"
          class="block rounded-lg border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-gray-700 hover:bg-gray-800/50"
        >
          <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-white">{project.name}</h3>
              {#if project.description}
                <p class="mt-1 text-sm text-gray-400">{project.description}</p>
              {:else}
                <p class="mt-1 truncate text-sm italic text-gray-500">{project.prompt}</p>
              {/if}
            </div>
            <span
              class="ml-4 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {getStatusColor(project.status)}"
            >
              {project.status}
            </span>
          </div>
          {#if project.platforms && project.platforms.length > 0}
            <div class="mt-3 flex flex-wrap gap-2">
              {#each project.platforms as platform}
                <span class="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  {platform}
                </span>
              {/each}
            </div>
          {/if}
          <p class="mt-4 text-xs text-gray-500">Last updated {formatDate(project.updatedAt)}</p>
        </a>
      {/each}
    </div>
  {/if}
</div>
