<script lang="ts">
  import { onMount } from 'svelte';
  import { projectsApi, type Project } from '$lib/api';
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
        return 'bg-green-100 text-green-700';
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'building':
        return 'bg-blue-100 text-blue-700';
      case 'generating':
        return 'bg-blue-100 text-blue-700';
      case 'validating':
        return 'bg-yellow-100 text-yellow-700';
      case 'planning':
        return 'bg-purple-100 text-purple-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Projects</h1>
      <p class="mt-2 text-gray-600">
        Manage your AI-generated applications and their deployments.
      </p>
    </div>
    <a href="/projects/new" class="btn-primary">New Project</a>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-500">
        <svg class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading projects...</span>
      </div>
    </div>
  {:else if error}
    <div class="rounded-lg border border-red-200 bg-red-50 p-4">
      <p class="text-red-700">{error}</p>
    </div>
  {:else if projects.length === 0}
    <div class="card text-center py-12">
      <div class="mx-auto h-12 w-12 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      </div>
      <h3 class="mt-4 text-lg font-semibold text-gray-900">No projects yet</h3>
      <p class="mt-2 text-gray-500">Get started by creating your first project.</p>
      <a href="/projects/new" class="btn-primary mt-4 inline-block">
        Create your first project
      </a>
    </div>
  {:else}
    <div class="grid gap-4">
      {#each projects as project}
        <a href="/projects/{project.id}" class="card transition-shadow hover:shadow-md">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900">{project.name}</h3>
              {#if project.description}
                <p class="mt-1 text-sm text-gray-500">{project.description}</p>
              {:else}
                <p class="mt-1 text-sm text-gray-400 italic truncate">{project.prompt}</p>
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
                <span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {platform}
                </span>
              {/each}
            </div>
          {/if}
          <p class="mt-4 text-xs text-gray-400">Last updated {formatDate(project.updatedAt)}</p>
        </a>
      {/each}
    </div>
  {/if}
</div>
