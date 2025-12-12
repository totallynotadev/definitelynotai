<script lang="ts">
  import { goto } from '$app/navigation';
  import { projectsApi } from '$lib/api';
  import { Button } from '$lib/components/ui/button/index.js';
  import { ArrowLeft } from 'lucide-svelte';
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
    <a href="/projects" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
      <ArrowLeft class="h-4 w-4" />
      Back to Projects
    </a>
  </div>

  <p class="text-gray-400 mb-8">
    Describe what you want to build and we'll generate it for you.
  </p>

  <form onsubmit={handleSubmit} class="space-y-6">
    <!-- Project Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
        Project Name
      </label>
      <input
        id="name"
        type="text"
        bind:value={name}
        placeholder="My Awesome App"
        class="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
      />
    </div>

    <!-- Description (optional) -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
        Description <span class="text-gray-500">(optional)</span>
      </label>
      <input
        id="description"
        type="text"
        bind:value={description}
        placeholder="A brief description of your project"
        class="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
      />
    </div>

    <!-- Prompt -->
    <div>
      <label for="prompt" class="block text-sm font-medium text-gray-300 mb-2">
        What do you want to build?
      </label>
      <textarea
        id="prompt"
        bind:value={prompt}
        rows={4}
        placeholder="Describe your app in plain English. Be as detailed as you like..."
        class="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
      ></textarea>

      <!-- Example prompts -->
      <div class="mt-3">
        <p class="mb-2 text-xs text-gray-500">Try an example:</p>
        <div class="flex flex-wrap gap-2">
          {#each examplePrompts as example}
            <button
              type="button"
              onclick={() => useExample(example)}
              class="rounded-md bg-gray-800 px-2.5 py-1 text-xs text-gray-400 transition hover:bg-gray-700 hover:text-white"
            >
              {example.slice(0, 35)}...
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Platforms -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-3">
        Target Platforms
      </label>
      <div class="flex flex-wrap gap-4">
        <label class="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            bind:checked={platforms.web}
            class="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
          />
          <span class="text-gray-300">Web</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            bind:checked={platforms.ios}
            class="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
          />
          <span class="text-gray-300">iOS</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            bind:checked={platforms.android}
            class="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
          />
          <span class="text-gray-300">Android</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            bind:checked={platforms.api}
            class="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
          />
          <span class="text-gray-300">API</span>
        </label>
      </div>
    </div>

    <!-- Error -->
    {#if error}
      <div class="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
        <p class="text-sm text-red-400">{error}</p>
      </div>
    {/if}

    <!-- Submit -->
    <div class="flex gap-4 pt-4">
      <Button
        type="submit"
        disabled={loading}
        class="flex-1 bg-purple-600 py-3 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
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
      </Button>
      <Button
        href="/projects"
        variant="outline"
        class="border-gray-700 px-6 py-3 text-gray-300 hover:bg-gray-800"
      >
        Cancel
      </Button>
    </div>
  </form>
</div>
