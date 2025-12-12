<script lang="ts">
  import {
    ArrowLeft,
    Play,
    Settings,
    Trash2,
    Pencil,
    Copy,
    Download,
    Globe,
    Smartphone,
    Server,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Code,
    Rocket,
  } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  import { AgentLogsTab, DeploymentsTab } from '$lib/components/projects/index.js';
  import { ProjectDetailSkeleton } from '$lib/components/skeletons/index.js';
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '$lib/components/ui/alert-dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs/index.js';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '$lib/components/ui/dialog/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import { notify } from '$lib/utils/toast';

  import { goto } from '$app/navigation';
  import { navigating } from '$app/stores';



  type Project = {
    id: string;
    name: string;
    description: string | null;
    prompt: string;
    status: string;
    platforms: string[];
    createdAt: string;
    updatedAt: string;
  };

  type Deployment = {
    id: string;
    platform: string;
    url: string | null;
    status: string;
    error: string | null;
    duration: string | null;
    createdAt: string;
    completedAt: string | null;
  };

  type AgentLog = {
    id: string;
    step: string;
    message: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  };

  type PageData = {
    project: Project;
    deployments: Deployment[];
    agentLogs: AgentLog[];
    token: string | null;
  };

  const { data }: { data: PageData } = $props();

  // State
  let editNameMode = $state(false);
  let editedName = $state(data.project.name);
  let settingsDialogOpen = $state(false);
  let deleteDialogOpen = $state(false);
  let editPromptDialogOpen = $state(false);
  let editedPrompt = $state(data.project.prompt);
  let isDeleting = $state(false);
  let isSaving = $state(false);

  // Status helpers
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
    generating: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
    building: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
    deployed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
    archived: { bg: 'bg-gray-600/20', text: 'text-gray-500', border: 'border-gray-600/50' },
  };

  const deploymentStatusColors: Record<string, { bg: string; text: string }> = {
    queued: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    building: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    deploying: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    success: { bg: 'bg-green-500/20', text: 'text-green-400' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400' },
    cancelled: { bg: 'bg-gray-600/20', text: 'text-gray-500' },
  };

  // State for agent logs
  let agentLogs = $state(data.agentLogs);

  // Navigation state
  const isNavigating = $derived($navigating !== null);

  function getStatusColor(status: string) {
    return statusColors[status] || statusColors.draft;
  }

  function getDeploymentStatusColor(status: string) {
    return deploymentStatusColors[status] || deploymentStatusColors.queued;
  }

  function capitalizeStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {return 'just now';}
    if (diffInSeconds < 3600) {return `${Math.floor(diffInSeconds / 60)}m ago`;}
    if (diffInSeconds < 86400) {return `${Math.floor(diffInSeconds / 3600)}h ago`;}
    if (diffInSeconds < 604800) {return `${Math.floor(diffInSeconds / 86400)}d ago`;}
    return date.toLocaleDateString();
  }

  function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function getPlatformIcon(platform: string) {
    const normalized = platform.toLowerCase();
    if (normalized.includes('web') || normalized.includes('page')) {return Globe;}
    if (normalized.includes('ios') || normalized.includes('android') || normalized.includes('mobile'))
      {return Smartphone;}
    if (normalized.includes('api') || normalized.includes('worker') || normalized.includes('backend'))
      {return Server;}
    return Globe;
  }

  function getPlatformLabel(platform: string): string {
    const labels: Record<string, string> = {
      cloudflare_pages: 'Cloudflare Pages',
      cloudflare_workers: 'Cloudflare Workers',
      vercel: 'Vercel',
      netlify: 'Netlify',
    };
    return labels[platform] || platform;
  }

  // Actions
  function handleSaveName() {
    if (editedName.trim() && editedName !== data.project.name) {
      // TODO: API call to save name
      console.log('Save name:', editedName);
      notify.projectUpdated(editedName.trim());
    }
    editNameMode = false;
  }

  function handleCancelEditName() {
    editedName = data.project.name;
    editNameMode = false;
  }

  function handleSavePrompt() {
    if (editedPrompt.trim() && editedPrompt !== data.project.prompt) {
      isSaving = true;
      // TODO: API call to save prompt
      console.log('Save prompt:', editedPrompt);
      setTimeout(() => {
        isSaving = false;
        editPromptDialogOpen = false;
        notify.projectUpdated(data.project.name);
      }, 500);
    }
  }

  function handleBuild() {
    // TODO: API call to start build
    console.log('Start build for project:', data.project.id);
    notify.buildStarted(data.project.name);
  }

  function handleDelete() {
    isDeleting = true;
    // TODO: API call to delete project
    const projectName = data.project.name;
    console.log('Delete project:', data.project.id);
    setTimeout(() => {
      isDeleting = false;
      deleteDialogOpen = false;
      notify.projectDeleted(projectName);
      goto('/projects');
    }, 500);
  }

  function handleDuplicate() {
    // TODO: API call to duplicate project
    console.log('Duplicate project:', data.project.id);
    notify.success('Project duplicated', 'A copy has been created');
  }

  function handleExport() {
    // TODO: Export project data
    console.log('Export project:', data.project.id);
    notify.success('Export started', 'Your project data is being prepared');
  }

  async function handleRefreshLogs() {
    try {
      const response = await fetch(`/api/projects/${data.project.id}/logs`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        agentLogs = result.logs;
      }
    } catch (error) {
      console.error('Failed to refresh logs:', error);
      notify.apiError('Failed to refresh logs');
    }
  }

  async function handleDeploy(platform: string) {
    // TODO: API call to deploy to platform
    console.log('Deploy to platform:', platform, 'for project:', data.project.id);
    notify.deployStarted(platform);
  }

  async function handleRedeploy(deploymentId: string) {
    // TODO: API call to redeploy
    console.log('Redeploy deployment:', deploymentId);
    notify.info('Redeployment started');
  }

  const isBuilding = $derived(
    data.project.status === 'building' || data.project.status === 'generating'
  );
  const latestDeployment = $derived(
    data.deployments.find((d) => d.status === 'success') || data.deployments[0]
  );
</script>

<svelte:head>
  <title>{data.project.name} | Definitely Not AI</title>
</svelte:head>

<div class="space-y-6" in:fade={{ duration: 200 }}>
  <!-- Back Button -->
  <a
    href="/projects"
    class="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
  >
    <ArrowLeft class="h-4 w-4" />
    Projects
  </a>

  <!-- Page Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="flex-1">
      <!-- Editable Project Name -->
      {#if editNameMode}
        <div class="flex items-center gap-2">
          <Input
            type="text"
            bind:value={editedName}
            class="h-10 border-gray-700 bg-gray-900 text-2xl font-bold text-white"
            onkeydown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') {handleSaveName();}
              if (e.key === 'Escape') {handleCancelEditName();}
            }}
          />
          <Button size="sm" onclick={handleSaveName} class="bg-purple-600 hover:bg-purple-700">
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onclick={handleCancelEditName}
            class="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
        </div>
      {:else}
        <button
          onclick={() => (editNameMode = true)}
          class="group flex items-center gap-2 text-left"
        >
          <h1 class="text-2xl font-bold text-white sm:text-3xl">{data.project.name}</h1>
          <Pencil
            class="h-4 w-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>
      {/if}

      <!-- Status Badge -->
      <div class="mt-2 flex items-center gap-3">
        <span
          class="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium {getStatusColor(
            data.project.status
          ).bg} {getStatusColor(data.project.status).text} {getStatusColor(data.project.status)
            .border}"
        >
          {#if isBuilding}
            <Loader2 class="mr-1.5 h-3 w-3 animate-spin" />
          {/if}
          {capitalizeStatus(data.project.status)}
        </span>
        {#if data.project.description}
          <span class="text-sm text-gray-400">{data.project.description}</span>
        {/if}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-2">
      <Button
        onclick={handleBuild}
        disabled={isBuilding}
        class="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
      >
        {#if isBuilding}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Building...
        {:else}
          <Play class="mr-2 h-4 w-4" />
          Build
        {/if}
      </Button>
      <Button
        variant="outline"
        onclick={() => (settingsDialogOpen = true)}
        class="border-gray-700 text-gray-300 hover:bg-gray-800"
      >
        <Settings class="mr-2 h-4 w-4" />
        Settings
      </Button>
      <Button
        variant="ghost"
        onclick={() => (deleteDialogOpen = true)}
        class="text-red-400 hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>
  </div>

  <!-- Tabs -->
  <Tabs value="overview" class="space-y-6">
    <TabsList class="border-b border-gray-800 bg-transparent">
      <TabsTrigger
        value="overview"
        class="border-b-2 border-transparent px-4 py-2 text-gray-400 data-[state=active]:border-purple-500 data-[state=active]:text-white"
      >
        Overview
      </TabsTrigger>
      <TabsTrigger
        value="logs"
        class="border-b-2 border-transparent px-4 py-2 text-gray-400 data-[state=active]:border-purple-500 data-[state=active]:text-white"
      >
        Agent Logs
      </TabsTrigger>
      <TabsTrigger
        value="deployments"
        class="border-b-2 border-transparent px-4 py-2 text-gray-400 data-[state=active]:border-purple-500 data-[state=active]:text-white"
      >
        Deployments
      </TabsTrigger>
      <TabsTrigger
        value="code"
        class="border-b-2 border-transparent px-4 py-2 text-gray-400 data-[state=active]:border-purple-500 data-[state=active]:text-white"
      >
        Code
      </TabsTrigger>
    </TabsList>

    <!-- Overview Tab -->
    <TabsContent value="overview" class="mt-6">
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Left Column (2/3) -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Prompt Card -->
          <Card class="border-gray-800 bg-gray-900">
            <CardHeader class="flex flex-row items-center justify-between pb-2">
              <CardTitle class="text-sm font-medium text-gray-400">What you asked for</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onclick={() => {
                  editedPrompt = data.project.prompt;
                  editPromptDialogOpen = true;
                }}
                class="h-8 text-gray-400 hover:text-white"
              >
                <Pencil class="mr-1 h-3 w-3" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <p class="whitespace-pre-wrap text-white">{data.project.prompt}</p>
            </CardContent>
          </Card>

          <!-- Generated Plan Card -->
          <Card class="border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle class="text-sm font-medium text-gray-400">Generated Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {#if data.project.status === 'draft'}
                <div class="flex flex-col items-center justify-center py-8 text-center">
                  <div
                    class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10"
                  >
                    <Rocket class="h-6 w-6 text-purple-400" />
                  </div>
                  <p class="text-gray-400">
                    Click "Build" to generate an AI plan for your project.
                  </p>
                </div>
              {:else}
                <div class="space-y-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-400">App Summary</h4>
                    <p class="mt-1 text-white">
                      {data.project.description || 'AI-generated application based on your prompt.'}
                    </p>
                  </div>

                  {#if data.project.platforms.length > 0}
                    <div>
                      <h4 class="text-sm font-medium text-gray-400">Target Platforms</h4>
                      <div class="mt-2 flex flex-wrap gap-2">
                        {#each data.project.platforms as platform}
                          {@const Icon = getPlatformIcon(platform)}
                          <span
                            class="inline-flex items-center gap-1.5 rounded-md bg-gray-800 px-2.5 py-1 text-sm text-gray-300"
                          >
                            <Icon class="h-3.5 w-3.5" />
                            {getPlatformLabel(platform)}
                          </span>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  <!-- Placeholder for future plan details -->
                  <div class="rounded-lg border border-dashed border-gray-700 p-4 text-center">
                    <p class="text-sm text-gray-500">
                      Detailed plan information will appear here after the AI analyzes your prompt.
                    </p>
                  </div>
                </div>
              {/if}
            </CardContent>
          </Card>
        </div>

        <!-- Right Column (1/3) -->
        <div class="space-y-6">
          <!-- Details Card -->
          <Card class="border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle class="text-sm font-medium text-gray-400">Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <p class="text-xs text-gray-500">Created</p>
                <p class="text-sm text-white">{formatDate(data.project.createdAt)}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Updated</p>
                <p class="text-sm text-white">{formatTimeAgo(data.project.updatedAt)}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Status</p>
                <span
                  class="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium {getStatusColor(
                    data.project.status
                  ).bg} {getStatusColor(data.project.status).text}"
                >
                  {capitalizeStatus(data.project.status)}
                </span>
              </div>
              {#if data.project.platforms.length > 0}
                <div>
                  <p class="text-xs text-gray-500">Platforms</p>
                  <div class="mt-1 flex gap-2">
                    {#each data.project.platforms as platform}
                      {@const Icon = getPlatformIcon(platform)}
                      <div
                        class="flex h-8 w-8 items-center justify-center rounded-md bg-gray-800"
                        title={getPlatformLabel(platform)}
                      >
                        <Icon class="h-4 w-4 text-gray-400" />
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </CardContent>
          </Card>

          <!-- Quick Actions Card -->
          <Card class="border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle class="text-sm font-medium text-gray-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <Button
                onclick={handleBuild}
                disabled={isBuilding}
                class="w-full justify-start bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                <Play class="mr-2 h-4 w-4" />
                {isBuilding ? 'Building...' : 'Start Build'}
              </Button>
              <Button
                variant="outline"
                onclick={handleDuplicate}
                class="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Copy class="mr-2 h-4 w-4" />
                Duplicate Project
              </Button>
              <Button
                variant="outline"
                onclick={handleExport}
                class="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Download class="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>

    <!-- Agent Logs Tab -->
    <TabsContent value="logs" class="mt-6">
      <AgentLogsTab
        logs={agentLogs}
        projectId={data.project.id}
        projectStatus={data.project.status}
        onRefresh={handleRefreshLogs}
      />
    </TabsContent>

    <!-- Deployments Tab -->
    <TabsContent value="deployments" class="mt-6">
      <DeploymentsTab
        deployments={data.deployments}
        platforms={data.project.platforms}
        projectId={data.project.id}
        onDeploy={handleDeploy}
        onRedeploy={handleRedeploy}
      />
    </TabsContent>

    <!-- Code Tab (Placeholder) -->
    <TabsContent value="code" class="mt-6">
      <Card class="border-gray-800 bg-gray-900">
        <CardContent class="flex flex-col items-center justify-center py-16 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
            <Code class="h-8 w-8 text-gray-500" />
          </div>
          <h3 class="text-lg font-medium text-white">Code Preview Coming Soon</h3>
          <p class="mt-2 max-w-md text-gray-400">
            View and edit the generated code for your project. This feature will be available in a
            future update.
          </p>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</div>

<!-- Edit Prompt Dialog -->
<Dialog bind:open={editPromptDialogOpen}>
  <DialogContent class="border-gray-800 bg-gray-900 sm:max-w-lg">
    <DialogHeader>
      <DialogTitle class="text-white">Edit Prompt</DialogTitle>
      <DialogDescription class="text-gray-400">
        Update the prompt that describes what you want to build.
      </DialogDescription>
    </DialogHeader>
    <div class="py-4">
      <Textarea
        bind:value={editedPrompt}
        rows={6}
        class="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
        placeholder="Describe what you want to build..."
      />
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onclick={() => (editPromptDialogOpen = false)}
        class="border-gray-700 text-gray-300 hover:bg-gray-800"
      >
        Cancel
      </Button>
      <Button onclick={handleSavePrompt} disabled={isSaving} class="bg-purple-600 hover:bg-purple-700">
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<!-- Settings Dialog -->
<Dialog bind:open={settingsDialogOpen}>
  <DialogContent class="border-gray-800 bg-gray-900 sm:max-w-lg">
    <DialogHeader>
      <DialogTitle class="text-white">Project Settings</DialogTitle>
      <DialogDescription class="text-gray-400">
        Configure your project settings and preferences.
      </DialogDescription>
    </DialogHeader>
    <div class="space-y-4 py-4">
      <div>
        <label class="text-sm font-medium text-gray-300">Project Name</label>
        <Input
          type="text"
          value={data.project.name}
          class="mt-1 border-gray-700 bg-gray-800 text-white"
        />
      </div>
      <div>
        <label class="text-sm font-medium text-gray-300">Description</label>
        <Textarea
          value={data.project.description || ''}
          rows={3}
          class="mt-1 border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
          placeholder="Add a description..."
        />
      </div>
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onclick={() => (settingsDialogOpen = false)}
        class="border-gray-700 text-gray-300 hover:bg-gray-800"
      >
        Cancel
      </Button>
      <Button class="bg-purple-600 hover:bg-purple-700">Save Settings</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<!-- Delete Confirmation Dialog -->
<AlertDialog bind:open={deleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Project</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{data.project.name}"? This action cannot be undone and will
        permanently remove the project, all deployments, and generated code.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel class="border-gray-700 text-gray-300 hover:bg-gray-800">
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction
        class="bg-red-600 text-white hover:bg-red-700"
        onclick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete Project'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
