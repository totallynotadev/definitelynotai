<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
  import {
    CheckCircle2,
    XCircle,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Rocket,
    ScrollText,
  } from 'lucide-svelte';

  type AgentLog = {
    id: string;
    step: string;
    message: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  };

  type Props = {
    logs: AgentLog[];
    projectId: string;
    projectStatus: string;
    onRefresh?: () => Promise<void>;
  };

  let { logs, projectId, projectStatus, onRefresh }: Props = $props();

  // State
  let autoScroll = $state(true);
  let isRefreshing = $state(false);
  let expandedMetadata = $state<Set<string>>(new Set());
  let logsContainer: HTMLDivElement | null = $state(null);
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  // Step configuration
  const stepConfig: Record<
    string,
    { color: string; bg: string; border: string; label: string }
  > = {
    analyzing: {
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/50',
      label: 'Analyzing',
    },
    planning: {
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      label: 'Planning',
    },
    generating: {
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/50',
      label: 'Generating',
    },
    reviewing: {
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/20',
      border: 'border-indigo-500/50',
      label: 'Reviewing',
    },
    refining: {
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/50',
      label: 'Refining',
    },
    testing: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      label: 'Testing',
    },
    validating: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      label: 'Validating',
    },
    deploying: {
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      label: 'Deploying',
    },
    complete: {
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      label: 'Complete',
    },
    error: {
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      label: 'Error',
    },
  };

  function getStepConfig(step: string) {
    return (
      stepConfig[step] || {
        color: 'text-gray-400',
        bg: 'bg-gray-500/20',
        border: 'border-gray-500/50',
        label: step.charAt(0).toUpperCase() + step.slice(1),
      }
    );
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 10) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  function toggleMetadata(logId: string) {
    const newSet = new Set(expandedMetadata);
    if (newSet.has(logId)) {
      newSet.delete(logId);
    } else {
      newSet.add(logId);
    }
    expandedMetadata = newSet;
  }

  function formatJson(obj: Record<string, unknown>): string {
    return JSON.stringify(obj, null, 2);
  }

  async function handleRefresh() {
    if (isRefreshing || !onRefresh) return;
    isRefreshing = true;
    try {
      await onRefresh();
    } finally {
      isRefreshing = false;
    }
  }

  function scrollToBottom() {
    if (logsContainer && autoScroll) {
      logsContainer.scrollTo({
        top: logsContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  // Determine if project is actively building
  const isBuilding = $derived(
    projectStatus === 'building' || projectStatus === 'generating'
  );

  // Get status for each log entry
  function getLogStatus(log: AgentLog, index: number, allLogs: AgentLog[]): 'complete' | 'error' | 'in_progress' {
    if (log.step === 'error') return 'error';
    if (log.step === 'complete') return 'complete';

    // If this is the latest log and project is still building, it's in progress
    if (index === 0 && isBuilding) return 'in_progress';

    // Otherwise it's complete
    return 'complete';
  }

  // Auto-scroll when logs change
  $effect(() => {
    if (logs.length > 0) {
      // Small delay to ensure DOM has updated
      setTimeout(scrollToBottom, 100);
    }
  });

  // Setup polling when building
  onMount(() => {
    if (isBuilding && onRefresh) {
      pollingInterval = setInterval(() => {
        handleRefresh();
      }, 3000); // Poll every 3 seconds
    }
  });

  onDestroy(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  });

  // Update polling based on build status
  $effect(() => {
    if (isBuilding && !pollingInterval && onRefresh) {
      pollingInterval = setInterval(() => {
        handleRefresh();
      }, 3000);
    } else if (!isBuilding && pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  });
</script>

<Card class="border-gray-800 bg-gray-900">
  <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
    <CardTitle class="text-white">Agent Activity</CardTitle>
    <div class="flex items-center gap-3">
      <!-- Auto-scroll toggle -->
      <label class="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          bind:checked={autoScroll}
          class="h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
        />
        <span class="text-sm text-gray-400">Auto-scroll</span>
      </label>

      <!-- Refresh button -->
      {#if onRefresh}
        <Button
          size="sm"
          variant="outline"
          onclick={handleRefresh}
          disabled={isRefreshing}
          class="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw class="mr-1.5 h-3.5 w-3.5 {isRefreshing ? 'animate-spin' : ''}" />
          Refresh
        </Button>
      {/if}
    </div>
  </CardHeader>

  <CardContent>
    {#if logs.length === 0}
      <!-- Empty State -->
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
          <ScrollText class="h-8 w-8 text-gray-500" />
        </div>
        <h3 class="text-lg font-medium text-white">No activity yet</h3>
        <p class="mt-2 max-w-sm text-gray-400">
          Click "Build" to start the agent and watch it analyze, plan, and generate your application.
        </p>
        <div class="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <Rocket class="h-4 w-4" />
          <span>Agent logs will appear here in real-time</span>
        </div>
      </div>
    {:else}
      <!-- Logs Timeline -->
      <div
        bind:this={logsContainer}
        class="max-h-[600px] overflow-y-auto pr-2"
        style="scrollbar-width: thin; scrollbar-color: #374151 #1f2937;"
      >
        <div class="relative space-y-0">
          {#each logs as log, index (log.id)}
            {@const status = getLogStatus(log, index, logs)}
            {@const config = getStepConfig(log.step)}
            {@const isExpanded = expandedMetadata.has(log.id)}
            {@const isLast = index === logs.length - 1}

            <div class="relative flex gap-4 pb-6">
              <!-- Timeline line -->
              {#if !isLast}
                <div
                  class="absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 bg-gray-700"
                ></div>
              {/if}

              <!-- Status indicator -->
              <div class="relative z-10 flex-shrink-0">
                {#if status === 'in_progress'}
                  <!-- Pulsing dot for in-progress -->
                  <div class="relative flex h-6 w-6 items-center justify-center">
                    <div
                      class="absolute h-4 w-4 animate-ping rounded-full {config.bg} opacity-75"
                    ></div>
                    <div
                      class="relative h-3 w-3 rounded-full {config.bg} ring-2 ring-gray-900"
                    ></div>
                  </div>
                {:else if status === 'complete'}
                  <!-- Green check for complete -->
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 ring-2 ring-gray-900"
                  >
                    <CheckCircle2 class="h-4 w-4 text-green-400" />
                  </div>
                {:else}
                  <!-- Red X for error -->
                  <div
                    class="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 ring-2 ring-gray-900"
                  >
                    <XCircle class="h-4 w-4 text-red-400" />
                  </div>
                {/if}
              </div>

              <!-- Log content -->
              <div class="flex-1 min-w-0">
                <!-- Header row -->
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {config.bg} {config.color}"
                  >
                    {config.label}
                  </span>
                  <span class="text-xs text-gray-500">
                    {formatTimeAgo(log.createdAt)}
                  </span>
                  {#if status === 'in_progress'}
                    <span class="text-xs text-purple-400">Processing...</span>
                  {/if}
                </div>

                <!-- Message -->
                <p class="mt-1.5 text-sm text-gray-300 leading-relaxed">
                  {log.message}
                </p>

                <!-- Metadata toggle -->
                {#if log.metadata && Object.keys(log.metadata).length > 0}
                  <button
                    onclick={() => toggleMetadata(log.id)}
                    class="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {#if isExpanded}
                      <ChevronDown class="h-3 w-3" />
                    {:else}
                      <ChevronRight class="h-3 w-3" />
                    {/if}
                    <span>
                      {isExpanded ? 'Hide' : 'Show'} metadata
                    </span>
                  </button>

                  <!-- Expandable metadata -->
                  {#if isExpanded}
                    <div class="mt-2 rounded-lg bg-gray-800/50 p-3 overflow-x-auto">
                      <pre class="text-xs text-gray-400 font-mono whitespace-pre-wrap break-all">{formatJson(log.metadata)}</pre>
                    </div>
                  {/if}
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <!-- Building indicator at bottom -->
        {#if isBuilding}
          <div class="flex items-center gap-3 py-4 px-2 border-t border-gray-800">
            <div class="relative flex h-5 w-5 items-center justify-center">
              <div class="absolute h-3 w-3 animate-ping rounded-full bg-purple-500/50"></div>
              <div class="relative h-2 w-2 rounded-full bg-purple-500"></div>
            </div>
            <span class="text-sm text-gray-400">
              Agent is working...
            </span>
          </div>
        {/if}
      </div>
    {/if}
  </CardContent>
</Card>

<style>
  /* Custom scrollbar styles for webkit browsers */
  div::-webkit-scrollbar {
    width: 6px;
  }

  div::-webkit-scrollbar-track {
    background: #1f2937;
    border-radius: 3px;
  }

  div::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 3px;
  }

  div::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
  }
</style>
