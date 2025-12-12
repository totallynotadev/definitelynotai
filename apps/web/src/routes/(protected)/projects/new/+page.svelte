<script lang="ts">
  import {
    ArrowLeft,
    ArrowRight,
    Rocket,
    Loader2,
    Globe,
    Smartphone,
    Server,
    Sparkles,
    Check,
    AlertCircle,
    Lightbulb,
  } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  import { projectsApi } from '$lib/api';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Card, CardContent } from '$lib/components/ui/card/index.js';
  import { notify } from '$lib/utils/toast';

  import type { PageData } from './$types';

  import { goto } from '$app/navigation';

  interface Props {
    data: PageData;
  }

  const { data }: Props = $props();

  // Form state
  let name = $state('');
  let description = $state('');
  let prompt = $state('');
  let platforms = $state<Record<string, boolean>>({
    web: false,
    ios: false,
    android: false,
    api: false,
  });

  // UI state
  let currentStep = $state(1);
  let loading = $state(false);
  let errors = $state<Record<string, string>>({});
  const touched = $state<Record<string, boolean>>({});

  const totalSteps = 3;

  // Platform configuration
  const platformOptions = [
    {
      id: 'web',
      name: 'Web App',
      description: 'Responsive web application',
      icon: Globe,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500',
    },
    {
      id: 'ios',
      name: 'iOS',
      description: 'Native iPhone & iPad app',
      icon: Smartphone,
      color: 'text-gray-300',
      bg: 'bg-gray-500/20',
      border: 'border-gray-400',
    },
    {
      id: 'android',
      name: 'Android',
      description: 'Native Android app',
      icon: Smartphone,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500',
    },
    {
      id: 'api',
      name: 'API',
      description: 'Backend REST API',
      icon: Server,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      border: 'border-purple-500',
    },
  ];

  const examplePrompts = [
    {
      short: 'Fitness Tracker',
      full: 'Build a fitness tracker app with workout logging, exercise library with video demos, progress charts showing weight/reps over time, personal records tracking, and weekly workout scheduling.',
    },
    {
      short: 'Recipe Manager',
      full: 'Create a recipe app with meal planning calendar, grocery list generation from selected recipes, nutritional information calculator, cooking timers, and the ability to scale recipe servings.',
    },
    {
      short: 'Habit Tracker',
      full: 'Make a habit tracker with daily/weekly habits, streak counting with visual calendars, reminder notifications, statistics dashboard, and motivational milestones with achievements.',
    },
    {
      short: 'Finance Dashboard',
      full: 'Build a personal finance dashboard with expense categorization, budget tracking with alerts, recurring transaction management, monthly reports with charts, and savings goals progress.',
    },
    {
      short: 'Task Manager',
      full: 'Create a task management app with projects and subtasks, due dates and priorities, kanban board view, team collaboration features, and time tracking for each task.',
    },
    {
      short: 'Notes App',
      full: 'Build a notes application with rich text editing, folder organization, tags and search, markdown support, image attachments, and automatic cloud sync across devices.',
    },
  ];

  const promptTips = [
    'Be specific about the features you need',
    'Mention your target users (e.g., "for small business owners")',
    'Describe the data your app will handle',
    'Include any integrations you need (payments, auth, etc.)',
  ];

  // Derived values
  const selectedPlatforms = $derived(
    Object.entries(platforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform)
  );

  const promptLength = $derived(prompt.length);
  const promptProgress = $derived(Math.min((promptLength / 200) * 100, 100));

  const canProceedStep1 = $derived(name.trim().length >= 2);
  const canProceedStep2 = $derived(prompt.trim().length >= 20);
  const canProceedStep3 = $derived(selectedPlatforms.length > 0);

  const isFormValid = $derived(canProceedStep1 && canProceedStep2 && canProceedStep3);

  // Validation
  function validateField(field: string) {
    touched[field] = true;

    switch (field) {
      case 'name':
        if (!name.trim()) {
          errors.name = 'Project name is required';
        } else if (name.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;
      case 'prompt':
        if (!prompt.trim()) {
          errors.prompt = 'Please describe what you want to build';
        } else if (prompt.trim().length < 20) {
          errors.prompt = 'Please provide more detail (at least 20 characters)';
        } else {
          delete errors.prompt;
        }
        break;
      case 'platforms':
        if (selectedPlatforms.length === 0) {
          errors.platforms = 'Select at least one platform';
        } else {
          delete errors.platforms;
        }
        break;
    }
    errors = { ...errors };
  }

  function useExample(example: { short: string; full: string }) {
    prompt = example.full;
    touched.prompt = true;
    delete errors.prompt;
    errors = { ...errors };
  }

  function togglePlatform(platformId: string) {
    platforms[platformId] = !platforms[platformId];
    platforms = { ...platforms };
    if (touched.platforms) {
      validateField('platforms');
    }
  }

  function goToStep(step: number) {
    if (step < currentStep) {
      currentStep = step;
    } else if (step === 2 && canProceedStep1) {
      validateField('name');
      if (!errors.name) {currentStep = 2;}
    } else if (step === 3 && canProceedStep1 && canProceedStep2) {
      validateField('prompt');
      if (!errors.prompt) {currentStep = 3;}
    }
  }

  function nextStep() {
    if (currentStep === 1) {
      validateField('name');
      if (!errors.name) {currentStep = 2;}
    } else if (currentStep === 2) {
      validateField('prompt');
      if (!errors.prompt) {currentStep = 3;}
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  async function handleSubmit() {
    // Validate all fields
    validateField('name');
    validateField('prompt');
    validateField('platforms');

    if (Object.keys(errors).length > 0 || !isFormValid) {
      return;
    }

    if (!data.token) {
      errors.submit = 'Not authenticated. Please sign in again.';
      errors = { ...errors };
      return;
    }

    loading = true;

    try {
      const trimmedDescription = description.trim();
      const projectName = name.trim();
      const result = await projectsApi.create(
        {
          name: projectName,
          ...(trimmedDescription ? { description: trimmedDescription } : {}),
          prompt: prompt.trim(),
          platforms: selectedPlatforms,
        },
        data.token
      );

      notify.projectCreated(projectName);
      goto(`/projects/${result.project.id}`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create project';
      errors.submit = errorMessage;
      errors = { ...errors };
      notify.apiError(errorMessage);
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>New Project | Definitely Not AI</title>
</svelte:head>

<div class="min-h-[calc(100vh-8rem)]" in:fade={{ duration: 200 }}>
  <!-- Header -->
  <div class="mb-8">
    <a
      href="/projects"
      class="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to Projects
    </a>
    <h1 class="mt-4 text-2xl font-bold text-white sm:text-3xl">Create New Project</h1>
    <p class="mt-2 text-gray-400">
      Describe what you want to build and we'll generate it for you.
    </p>
  </div>

  <!-- Step Indicator -->
  <div class="mb-8">
    <div class="flex items-center justify-between">
      {#each [1, 2, 3] as step}
        {@const isActive = currentStep === step}
        {@const isComplete = currentStep > step}
        {@const canClick =
          step === 1 || (step === 2 && canProceedStep1) || (step === 3 && canProceedStep1 && canProceedStep2)}

        <button
          type="button"
          onclick={() => goToStep(step)}
          disabled={!canClick && step > currentStep}
          class="flex items-center gap-3 {canClick || step <= currentStep
            ? 'cursor-pointer'
            : 'cursor-not-allowed opacity-50'}"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all {isActive
              ? 'border-purple-500 bg-purple-500 text-white'
              : isComplete
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-600 bg-gray-800 text-gray-400'}"
          >
            {#if isComplete}
              <Check class="h-5 w-5" />
            {:else}
              {step}
            {/if}
          </div>
          <div class="hidden text-left sm:block">
            <p class="text-sm font-medium {isActive ? 'text-white' : 'text-gray-400'}">
              {step === 1 ? 'Basic Info' : step === 2 ? 'Describe App' : 'Platforms'}
            </p>
            <p class="text-xs text-gray-500">
              {step === 1 ? 'Name your project' : step === 2 ? 'What to build' : 'Choose targets'}
            </p>
          </div>
        </button>

        {#if step < 3}
          <div
            class="mx-2 h-0.5 flex-1 rounded {currentStep > step ? 'bg-green-500' : 'bg-gray-700'}"
          ></div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Main Content -->
  <div class="grid gap-8 lg:grid-cols-3">
    <!-- Form Section -->
    <div class="lg:col-span-2">
      <form onsubmit={(e) => { e.preventDefault(); if (currentStep === 3) {handleSubmit();} else {nextStep();} }}>
        <!-- Step 1: Basic Info -->
        {#if currentStep === 1}
          <Card class="border-gray-800 bg-gray-900">
            <CardContent class="p-6">
              <h2 class="mb-6 text-lg font-semibold text-white">Basic Information</h2>

              <div class="space-y-6">
                <!-- Project Name -->
                <div>
                  <label for="name" class="mb-2 block text-sm font-medium text-gray-300">
                    Project Name <span class="text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    bind:value={name}
                    onblur={() => validateField('name')}
                    placeholder="My Awesome App"
                    class="w-full rounded-lg border bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:ring-2 focus:ring-purple-500/20 {errors.name && touched.name
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-700 focus:border-purple-500'}"
                  />
                  {#if errors.name && touched.name}
                    <p class="mt-2 flex items-center gap-1 text-sm text-red-400">
                      <AlertCircle class="h-4 w-4" />
                      {errors.name}
                    </p>
                  {:else}
                    <p class="mt-2 text-sm text-gray-500">
                      Choose a memorable name for your project
                    </p>
                  {/if}
                </div>

                <!-- Description -->
                <div>
                  <label for="description" class="mb-2 block text-sm font-medium text-gray-300">
                    Description <span class="text-gray-500">(optional)</span>
                  </label>
                  <input
                    id="description"
                    type="text"
                    bind:value={description}
                    placeholder="A brief description of your project"
                    class="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                  <p class="mt-2 text-sm text-gray-500">
                    A short summary to help you remember what this project is about
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        {/if}

        <!-- Step 2: Describe Your App -->
        {#if currentStep === 2}
          <Card class="border-gray-800 bg-gray-900">
            <CardContent class="p-6">
              <div class="mb-6 flex items-start justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-white">Describe Your App</h2>
                  <p class="mt-1 text-sm text-gray-400">
                    Be as detailed as possible for better results
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <Sparkles class="h-4 w-4 text-purple-400" />
                  <span class="text-sm text-purple-400">AI-Powered</span>
                </div>
              </div>

              <div class="space-y-6">
                <!-- Prompt Textarea -->
                <div>
                  <label for="prompt" class="mb-2 block text-sm font-medium text-gray-300">
                    What do you want to build? <span class="text-red-400">*</span>
                  </label>
                  <textarea
                    id="prompt"
                    bind:value={prompt}
                    onblur={() => validateField('prompt')}
                    rows={8}
                    placeholder="Describe your app in plain English. Include the features you want, the type of users, what data it should handle, and any specific functionality you need..."
                    class="w-full resize-none rounded-lg border bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:ring-2 focus:ring-purple-500/20 {errors.prompt && touched.prompt
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-700 focus:border-purple-500'}"
                  ></textarea>

                  <!-- Character count and progress -->
                  <div class="mt-2 flex items-center justify-between">
                    {#if errors.prompt && touched.prompt}
                      <p class="flex items-center gap-1 text-sm text-red-400">
                        <AlertCircle class="h-4 w-4" />
                        {errors.prompt}
                      </p>
                    {:else}
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 w-24 overflow-hidden rounded-full bg-gray-700">
                          <div
                            class="h-full transition-all duration-300 {promptLength >= 200
                              ? 'bg-green-500'
                              : promptLength >= 100
                                ? 'bg-yellow-500'
                                : 'bg-purple-500'}"
                            style="width: {promptProgress}%"
                          ></div>
                        </div>
                        <span class="text-xs text-gray-500">
                          {promptLength >= 200
                            ? 'Great detail!'
                            : promptLength >= 100
                              ? 'Good start'
                              : 'Add more detail'}
                        </span>
                      </div>
                    {/if}
                    <span class="text-sm text-gray-500">{promptLength} characters</span>
                  </div>
                </div>

                <!-- Tips -->
                <div class="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <Lightbulb class="h-4 w-4 text-yellow-400" />
                    <span class="text-sm font-medium text-gray-300">Tips for better results</span>
                  </div>
                  <ul class="space-y-1.5">
                    {#each promptTips as tip}
                      <li class="flex items-start gap-2 text-sm text-gray-400">
                        <span class="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-500"></span>
                        {tip}
                      </li>
                    {/each}
                  </ul>
                </div>

                <!-- Example prompts -->
                <div>
                  <p class="mb-3 text-sm font-medium text-gray-300">Or try an example:</p>
                  <div class="flex flex-wrap gap-2">
                    {#each examplePrompts as example}
                      <button
                        type="button"
                        onclick={() => useExample(example)}
                        class="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-all hover:border-purple-500 hover:bg-gray-700 hover:text-white"
                      >
                        {example.short}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        {/if}

        <!-- Step 3: Choose Platforms -->
        {#if currentStep === 3}
          <Card class="border-gray-800 bg-gray-900">
            <CardContent class="p-6">
              <h2 class="mb-2 text-lg font-semibold text-white">Choose Platforms</h2>
              <p class="mb-6 text-sm text-gray-400">
                Select where you want your app to run. You can always add more later.
              </p>

              {#if errors.platforms && touched.platforms}
                <div class="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <AlertCircle class="h-4 w-4 text-red-400" />
                  <p class="text-sm text-red-400">{errors.platforms}</p>
                </div>
              {/if}

              <div class="grid grid-cols-2 gap-4">
                {#each platformOptions as platform}
                  {@const isSelected = platforms[platform.id]}
                  {@const Icon = platform.icon}

                  <button
                    type="button"
                    onclick={() => togglePlatform(platform.id)}
                    class="group relative rounded-xl border-2 p-6 text-left transition-all {isSelected
                      ? `${platform.border} ${platform.bg}`
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'}"
                  >
                    {#if isSelected}
                      <div
                        class="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full {platform.bg} {platform.border} border"
                      >
                        <Check class="h-4 w-4 {platform.color}" />
                      </div>
                    {/if}

                    <div
                      class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl {isSelected
                        ? platform.bg
                        : 'bg-gray-700 group-hover:bg-gray-600'}"
                    >
                      <Icon
                        class="h-7 w-7 {isSelected ? platform.color : 'text-gray-400 group-hover:text-gray-300'}"
                      />
                    </div>

                    <h3
                      class="text-lg font-semibold {isSelected
                        ? 'text-white'
                        : 'text-gray-300 group-hover:text-white'}"
                    >
                      {platform.name}
                    </h3>
                    <p class="mt-1 text-sm {isSelected ? 'text-gray-300' : 'text-gray-500'}">
                      {platform.description}
                    </p>
                  </button>
                {/each}
              </div>

              {#if selectedPlatforms.length > 0}
                <p class="mt-4 text-sm text-gray-400">
                  Selected: {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                </p>
              {/if}
            </CardContent>
          </Card>

          <!-- Submit Error -->
          {#if errors.submit}
            <div class="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <div class="flex items-center gap-2">
                <AlertCircle class="h-5 w-5 text-red-400" />
                <p class="text-sm text-red-400">{errors.submit}</p>
              </div>
            </div>
          {/if}
        {/if}

        <!-- Navigation Buttons -->
        <div class="mt-6 flex items-center justify-between">
          <div>
            {#if currentStep > 1}
              <Button
                type="button"
                variant="outline"
                onclick={prevStep}
                class="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft class="mr-2 h-4 w-4" />
                Back
              </Button>
            {:else}
              <Button
                href="/projects"
                variant="outline"
                class="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            {/if}
          </div>

          <div>
            {#if currentStep < 3}
              <Button
                type="submit"
                disabled={currentStep === 1 ? !canProceedStep1 : !canProceedStep2}
                class="bg-purple-600 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
                <ArrowRight class="ml-2 h-4 w-4" />
              </Button>
            {:else}
              <Button
                type="submit"
                disabled={!isFormValid || loading}
                class="bg-purple-600 px-8 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {#if loading}
                  <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                {:else}
                  <Rocket class="mr-2 h-4 w-4" />
                  Create Project
                {/if}
              </Button>
            {/if}
          </div>
        </div>
      </form>
    </div>

    <!-- Preview Panel -->
    <div class="hidden lg:block">
      <div class="sticky top-6">
        <Card class="border-gray-800 bg-gray-900">
          <CardContent class="p-6">
            <h3 class="mb-4 text-sm font-medium text-gray-400">Project Preview</h3>

            <div class="space-y-4">
              <!-- Project Name Preview -->
              <div>
                <p class="text-xs text-gray-500">Name</p>
                <p class="mt-1 text-lg font-semibold text-white">
                  {name.trim() || 'Untitled Project'}
                </p>
              </div>

              <!-- Description Preview -->
              {#if description.trim()}
                <div>
                  <p class="text-xs text-gray-500">Description</p>
                  <p class="mt-1 text-sm text-gray-300">{description}</p>
                </div>
              {/if}

              <!-- Platforms Preview -->
              <div>
                <p class="text-xs text-gray-500">Platforms</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  {#if selectedPlatforms.length === 0}
                    <span class="text-sm text-gray-500">None selected</span>
                  {:else}
                    {#each selectedPlatforms as platformId}
                      {@const platform = platformOptions.find((p) => p.id === platformId)}
                      {#if platform}
                        {@const Icon = platform.icon}
                        <span
                          class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm {platform.bg} {platform.color}"
                        >
                          <Icon class="h-3.5 w-3.5" />
                          {platform.name}
                        </span>
                      {/if}
                    {/each}
                  {/if}
                </div>
              </div>

              <!-- Prompt Preview -->
              {#if prompt.trim()}
                <div>
                  <p class="text-xs text-gray-500">What you're building</p>
                  <p class="mt-1 line-clamp-6 text-sm text-gray-300">
                    {prompt.trim()}
                  </p>
                </div>
              {/if}

              <!-- Status Indicator -->
              <div class="border-t border-gray-800 pt-4">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    {#if canProceedStep1}
                      <Check class="h-4 w-4 text-green-400" />
                    {:else}
                      <div class="h-4 w-4 rounded-full border border-gray-600"></div>
                    {/if}
                    <span class="text-sm {canProceedStep1 ? 'text-green-400' : 'text-gray-500'}">
                      Basic info
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    {#if canProceedStep2}
                      <Check class="h-4 w-4 text-green-400" />
                    {:else}
                      <div class="h-4 w-4 rounded-full border border-gray-600"></div>
                    {/if}
                    <span class="text-sm {canProceedStep2 ? 'text-green-400' : 'text-gray-500'}">
                      App description
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    {#if canProceedStep3}
                      <Check class="h-4 w-4 text-green-400" />
                    {:else}
                      <div class="h-4 w-4 rounded-full border border-gray-600"></div>
                    {/if}
                    <span class="text-sm {canProceedStep3 ? 'text-green-400' : 'text-gray-500'}">
                      Platforms selected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Tips Card -->
        <Card class="mt-4 border-gray-800 bg-gray-900/50">
          <CardContent class="p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
                <Sparkles class="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-white">Pro Tip</p>
                <p class="mt-1 text-xs text-gray-400">
                  {currentStep === 1
                    ? 'Choose a descriptive name that reflects what your app does.'
                    : currentStep === 2
                      ? 'The more detail you provide, the better your generated app will match your vision.'
                      : 'Start with Web + API for a full-stack application.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</div>
