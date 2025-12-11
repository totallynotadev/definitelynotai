<script lang="ts">
  import { goto } from '$app/navigation';
  import { projectsApi } from '$lib/api';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();

  let name = $state('');
  let description = $state('');
  let prompt = $state('');
  let platforms = $state({
    web: true,
    ios: false,
    android: false,
    api: true,
  });

  let loading = $state(false);
  let error = $state<string | null>(null);

  const examplePrompts = [
    'Build a fitness tracker with workout logging and progress charts',
    'Create a recipe app with meal planning and grocery lists',
    'Make a habit tracker with streaks, reminders, and statistics',
    'Build a personal finance dashboard with expense tracking',
  ];

  function useExample(example: string) {
    prompt = example;
  }

  async function handleSubmit() {
    error = null;

    const selectedPlatforms = Object.entries(platforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform);

    if (!name.trim()) {
      error = 'Project name is required';
      return;
    }

    if (!prompt.trim() || prompt.length < 10) {
      error = 'Please describe what you want to build (at least 10 characters)';
      return;
    }

    if (selectedPlatforms.length === 0) {
      error = 'Select at least one platform';
      return;
    }

    if (!data.token) {
      error = 'Not authenticated';
      return;
    }

    loading = true;

    try {
      const trimmedDescription = description.trim();
      const result = await projectsApi.create({
        name: name.trim(),
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        prompt: prompt.trim(),
        platforms: selectedPlatforms,
      }, data.token);

      goto(`/projects/${result.project.id}`);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to create project';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>New Project | Definitely Not AI</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
  <div class="mb-6">
    <a href="/projects" class="text-sm text-gray-500 hover:text-gray-700">
      &larr; Back to Projects
    </a>
  </div>

  <h1 class="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
  <p class="text-gray-600 mb-8">
    Describe what you want to build and we'll generate it for you.
  </p>

  <form onsubmit={handleSubmit} class="space-y-6">
    <!-- Project Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
        Project Name
      </label>
      <input
        id="name"
        type="text"
        bind:value={name}
        placeholder="My Awesome App"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      />
    </div>

    <!-- Description (optional) -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
        Description <span class="text-gray-400">(optional)</span>
      </label>
      <input
        id="description"
        type="text"
        bind:value={description}
        placeholder="A brief description of your project"
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      />
    </div>

    <!-- Prompt -->
    <div>
      <label for="prompt" class="block text-sm font-medium text-gray-700 mb-2">
        What do you want to build?
      </label>
      <textarea
        id="prompt"
        bind:value={prompt}
        rows={4}
        placeholder="Describe your app in plain English. Be as detailed as you like..."
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
      ></textarea>

      <!-- Example prompts -->
      <div class="mt-3">
        <p class="text-xs text-gray-500 mb-2">Try an example:</p>
        <div class="flex flex-wrap gap-2">
          {#each examplePrompts as example}
            <button
              type="button"
              onclick={() => useExample(example)}
              class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-md transition"
            >
              {example.slice(0, 35)}...
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Platforms -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Target Platforms
      </label>
      <div class="flex flex-wrap gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={platforms.web}
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-gray-700">Web</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={platforms.ios}
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-gray-700">iOS</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={platforms.android}
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-gray-700">Android</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={platforms.api}
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-gray-700">API</span>
        </label>
      </div>
    </div>

    <!-- Error -->
    {#if error}
      <div class="rounded-lg border border-red-200 bg-red-50 p-3">
        <p class="text-red-700 text-sm">{error}</p>
      </div>
    {/if}

    <!-- Submit -->
    <div class="flex gap-4 pt-4">
      <button
        type="submit"
        disabled={loading}
        class="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if loading}
          <span class="flex items-center justify-center gap-2">
            <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </span>
        {:else}
          Create Project
        {/if}
      </button>
      <a
        href="/projects"
        class="btn-secondary px-6 py-3"
      >
        Cancel
      </a>
    </div>
  </form>
</div>
