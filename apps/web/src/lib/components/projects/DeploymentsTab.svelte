<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Card, CardContent } from '$lib/components/ui/card/index.js';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from '$lib/components/ui/dialog/index.js';
  import {
    Globe,
    Smartphone,
    Server,
    ExternalLink,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    Play,
    RefreshCw,
    FileText,
    Settings2,
  } from 'lucide-svelte';

  type Deployment = {
    id: string;
    platform: string;
    url: string | null;
    status: string;
    error: string | null;
    duration: string | null;
    createdAt: string;
    completedAt: string | null;
    buildLogs?: Array<{
      timestamp: string;
      level: string;
      message: string;
    }>;
  };

  type Props = {
    deployments: Deployment[];
    platforms: string[];
    projectId: string;
    onDeploy?: (platform: string) => Promise<void>;
    onRedeploy?: (deploymentId: string) => Promise<void>;
  };

  let { deployments, platforms, projectId, onDeploy, onRedeploy }: Props = $props();

  // State
  let deployingPlatforms = $state<Set<string>>(new Set());
  let logsDialogOpen = $state(false);
  let selectedDeployment = $state<Deployment | null>(null);

  // Platform configuration
  const platformConfig: Record<
    string,
    { icon: typeof Globe; label: string; color: string; bg: string }
  > = {
    cloudflare_pages: {
      icon: Globe,
      label: 'Cloudflare Pages',
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
    },
    cloudflare_workers: {
      icon: Server,
      label: 'Cloudflare Workers',
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
    },
    vercel: {
      icon: Globe,
      label: 'Vercel',
      color: 'text-white',
      bg: 'bg-gray-700',
    },
    netlify: {
      icon: Globe,
      label: 'Netlify',
      color: 'text-teal-400',
      bg: 'bg-teal-500/20',
    },
    web: {
      icon: Globe,
      label: 'Web',
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    ios: {
      icon: Smartphone,
      label: 'iOS',
      color: 'text-gray-300',
      bg: 'bg-gray-700',
    },
    android: {
      icon: Smartphone,
      label: 'Android',
      color: 'text-green-400',
      bg: 'bg-green-500/20',
    },
    api: {
      icon: Server,
      label: 'API',
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
    },
  };

  // Status configuration
  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string; icon: typeof Clock }
  > = {
    queued: {
      label: 'Queued',
      color: 'text-gray-400',
      bg: 'bg-gray-500/20',
      icon: Clock,
    },
    building: {
      label: 'Building...',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      icon: Loader2,
    },
    deploying: {
      label: 'Deploying...',
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      icon: Loader2,
    },
    success: {
      label: 'Live',
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      icon: CheckCircle2,
    },
    failed: {
      label: 'Failed',
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      icon: XCircle,
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-gray-500',
      bg: 'bg-gray-600/20',
      icon: XCircle,
    },
  };

  function getPlatformConfig(platform: string) {
    return (
      platformConfig[platform] || {
        icon: Globe,
        label: platform.charAt(0).toUpperCase() + platform.slice(1).replace(/_/g, ' '),
        color: 'text-gray-400',
        bg: 'bg-gray-500/20',
      }
    );
  }

  function getStatusConfig(status: string) {
    return (
      statusConfig[status] || {
        label: 'Not started',
        color: 'text-gray-400',
        bg: 'bg-gray-500/20',
        icon: Clock,
      }
    );
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  function formatLogTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // Get deployment for a platform (latest one)
  function getDeploymentForPlatform(platform: string): Deployment | null {
    return deployments.find((d) => d.platform === platform) || null;
  }

  // Check if platform is currently being deployed
  function isDeploying(platform: string): boolean {
    const deployment = getDeploymentForPlatform(platform);
    return (
      deployingPlatforms.has(platform) ||
      deployment?.status === 'building' ||
      deployment?.status === 'deploying' ||
      deployment?.status === 'queued'
    );
  }

  async function handleDeploy(platform: string) {
    if (!onDeploy || isDeploying(platform)) return;

    const newSet = new Set(deployingPlatforms);
    newSet.add(platform);
    deployingPlatforms = newSet;

    try {
      await onDeploy(platform);
    } finally {
      const updatedSet = new Set(deployingPlatforms);
      updatedSet.delete(platform);
      deployingPlatforms = updatedSet;
    }
  }

  async function handleRedeploy(deployment: Deployment) {
    if (!onRedeploy || isDeploying(deployment.platform)) return;

    const newSet = new Set(deployingPlatforms);
    newSet.add(deployment.platform);
    deployingPlatforms = newSet;

    try {
      await onRedeploy(deployment.id);
    } finally {
      const updatedSet = new Set(deployingPlatforms);
      updatedSet.delete(deployment.platform);
      deployingPlatforms = updatedSet;
    }
  }

  function openLogsDialog(deployment: Deployment) {
    selectedDeployment = deployment;
    logsDialogOpen = true;
  }

  function getLogLevelColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-400';
      case 'warn':
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  }
</script>

{#if platforms.length === 0}
  <!-- Empty State: No platforms configured -->
  <Card class="border-gray-800 bg-gray-900">
    <CardContent class="flex flex-col items-center justify-center py-16 text-center">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
        <Settings2 class="h-8 w-8 text-gray-500" />
      </div>
      <h3 class="text-lg font-medium text-white">No platforms configured</h3>
      <p class="mt-2 max-w-sm text-gray-400">
        Edit your project settings to add target platforms for deployment.
      </p>
      <Button variant="outline" class="mt-6 border-gray-700 text-gray-300 hover:bg-gray-800">
        <Settings2 class="mr-2 h-4 w-4" />
        Configure Platforms
      </Button>
    </CardContent>
  </Card>
{:else}
  <!-- Deployments Grid -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {#each platforms as platform (platform)}
      {@const config = getPlatformConfig(platform)}
      {@const deployment = getDeploymentForPlatform(platform)}
      {@const status = deployment ? getStatusConfig(deployment.status) : getStatusConfig('pending')}
      {@const StatusIcon = status.icon}
      {@const PlatformIcon = config.icon}
      {@const deploying = isDeploying(platform)}

      <Card class="border-gray-800 bg-gray-900 transition-colors hover:border-gray-700">
        <CardContent class="p-6">
          <!-- Platform Header -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl {config.bg}"
            >
              <PlatformIcon class="h-6 w-6 {config.color}" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="truncate font-medium text-white">{config.label}</h3>
              <!-- Status Badge -->
              <div class="mt-1 flex items-center gap-1.5">
                {#if deploying && (deployment?.status === 'building' || deployment?.status === 'deploying')}
                  <StatusIcon class="h-3.5 w-3.5 animate-spin {status.color}" />
                {:else}
                  <StatusIcon class="h-3.5 w-3.5 {status.color}" />
                {/if}
                <span class="text-sm {status.color}">
                  {deployment ? status.label : 'Not started'}
                </span>
              </div>
            </div>
          </div>

          <!-- Deployment Details -->
          <div class="mt-4 space-y-3">
            <!-- URL (if live) -->
            {#if deployment?.url && deployment.status === 'success'}
              <div>
                <p class="text-xs text-gray-500">URL</p>
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-0.5 flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 truncate"
                >
                  <span class="truncate">{deployment.url.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink class="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
            {/if}

            <!-- Error Message (if failed) -->
            {#if deployment?.status === 'failed' && deployment.error}
              <div class="rounded-lg bg-red-500/10 p-2">
                <p class="text-xs text-red-400 line-clamp-2">{deployment.error}</p>
              </div>
            {/if}

            <!-- Last Deployed -->
            {#if deployment}
              <div>
                <p class="text-xs text-gray-500">
                  {deployment.status === 'success' ? 'Last deployed' : 'Started'}
                </p>
                <p class="mt-0.5 text-sm text-gray-300">
                  {formatTimeAgo(deployment.completedAt || deployment.createdAt)}
                </p>
              </div>

              <!-- Duration (if available) -->
              {#if deployment.duration && deployment.status === 'success'}
                <div>
                  <p class="text-xs text-gray-500">Build time</p>
                  <p class="mt-0.5 text-sm text-gray-300">{deployment.duration}</p>
                </div>
              {/if}
            {:else}
              <div>
                <p class="text-xs text-gray-500">Status</p>
                <p class="mt-0.5 text-sm text-gray-400">Ready to deploy</p>
              </div>
            {/if}
          </div>

          <!-- Actions -->
          <div class="mt-5 flex gap-2">
            {#if !deployment || deployment.status === 'failed' || deployment.status === 'cancelled'}
              <!-- Deploy button (for new or failed deployments) -->
              <Button
                size="sm"
                onclick={() => handleDeploy(platform)}
                disabled={deploying}
                class="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {#if deploying}
                  <Loader2 class="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Deploying...
                {:else}
                  <Play class="mr-1.5 h-3.5 w-3.5" />
                  Deploy
                {/if}
              </Button>
            {:else if deployment.status === 'success'}
              <!-- Redeploy button (for successful deployments) -->
              <Button
                size="sm"
                onclick={() => handleRedeploy(deployment)}
                disabled={deploying}
                class="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {#if deploying}
                  <Loader2 class="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Deploying...
                {:else}
                  <RefreshCw class="mr-1.5 h-3.5 w-3.5" />
                  Redeploy
                {/if}
              </Button>
            {:else}
              <!-- In progress - show status -->
              <Button
                size="sm"
                disabled
                class="flex-1 border-gray-700 bg-gray-800 text-gray-400"
              >
                <Loader2 class="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {status.label}
              </Button>
            {/if}

            <!-- View Logs button (if deployment exists) -->
            {#if deployment}
              <Button
                size="sm"
                variant="outline"
                onclick={() => openLogsDialog(deployment)}
                class="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <FileText class="h-3.5 w-3.5" />
              </Button>
            {/if}
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>

  <!-- Deployment History -->
  {#if deployments.length > 0}
    <div class="mt-8">
      <h3 class="mb-4 text-sm font-medium text-gray-400">Deployment History</h3>
      <Card class="border-gray-800 bg-gray-900">
        <CardContent class="p-0">
          <div class="divide-y divide-gray-800">
            {#each deployments.slice(0, 10) as deployment (deployment.id)}
              {@const config = getPlatformConfig(deployment.platform)}
              {@const status = getStatusConfig(deployment.status)}
              {@const StatusIcon = status.icon}
              {@const PlatformIcon = config.icon}

              <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg {config.bg}">
                    <PlatformIcon class="h-4 w-4 {config.color}" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-white">{config.label}</span>
                      <span
                        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs {status.bg} {status.color}"
                      >
                        {#if deployment.status === 'building' || deployment.status === 'deploying'}
                          <StatusIcon class="h-3 w-3 animate-spin" />
                        {:else}
                          <StatusIcon class="h-3 w-3" />
                        {/if}
                        {status.label}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">
                      {formatTimeAgo(deployment.createdAt)}
                      {#if deployment.duration && deployment.status === 'success'}
                        <span class="mx-1">·</span>
                        {deployment.duration}
                      {/if}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  {#if deployment.url && deployment.status === 'success'}
                    <a
                      href={deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                    >
                      Visit
                      <ExternalLink class="h-3 w-3" />
                    </a>
                  {/if}
                  <Button
                    size="sm"
                    variant="ghost"
                    onclick={() => openLogsDialog(deployment)}
                    class="text-gray-400 hover:text-white"
                  >
                    <FileText class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            {/each}
          </div>
        </CardContent>
      </Card>
    </div>
  {/if}
{/if}

<!-- Build Logs Dialog -->
<Dialog bind:open={logsDialogOpen}>
  <DialogContent class="border-gray-800 bg-gray-900 sm:max-w-2xl">
    <DialogHeader>
      <DialogTitle class="text-white">
        {#if selectedDeployment}
          {@const config = getPlatformConfig(selectedDeployment.platform)}
          Build Logs - {config.label}
        {:else}
          Build Logs
        {/if}
      </DialogTitle>
      <DialogDescription class="text-gray-400">
        {#if selectedDeployment}
          {@const status = getStatusConfig(selectedDeployment.status)}
          <span class="inline-flex items-center gap-1.5 {status.color}">
            {#if selectedDeployment.status === 'building' || selectedDeployment.status === 'deploying'}
              <Loader2 class="h-3 w-3 animate-spin" />
            {/if}
            {status.label}
          </span>
          <span class="mx-2">·</span>
          <span>{formatTimeAgo(selectedDeployment.createdAt)}</span>
        {/if}
      </DialogDescription>
    </DialogHeader>

    <div class="mt-4 max-h-96 overflow-y-auto rounded-lg bg-gray-950 p-4">
      {#if selectedDeployment?.buildLogs && selectedDeployment.buildLogs.length > 0}
        <div class="space-y-1 font-mono text-sm">
          {#each selectedDeployment.buildLogs as log}
            <div class="flex gap-3">
              <span class="flex-shrink-0 text-gray-600">
                {formatLogTimestamp(log.timestamp)}
              </span>
              <span class="{getLogLevelColor(log.level)} flex-1 break-all">
                {log.message}
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-8 text-center">
          <FileText class="mb-3 h-8 w-8 text-gray-600" />
          <p class="text-gray-400">No build logs available</p>
          <p class="mt-1 text-sm text-gray-500">
            Logs will appear here once the build starts.
          </p>
        </div>
      {/if}
    </div>

    {#if selectedDeployment?.error}
      <div class="mt-4 rounded-lg bg-red-500/10 p-4">
        <h4 class="mb-2 text-sm font-medium text-red-400">Error</h4>
        <p class="text-sm text-red-300">{selectedDeployment.error}</p>
      </div>
    {/if}
  </DialogContent>
</Dialog>

<style>
  /* Custom scrollbar for logs */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #111827;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #374151;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
  }
</style>
