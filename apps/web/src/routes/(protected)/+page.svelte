<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import {
    FolderKanban,
    Loader2,
    CheckCircle2,
    XCircle,
    Plus,
    BookOpen,
    ArrowRight,
    Rocket,
  } from 'lucide-svelte';

  type PageData = {
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
    stats: {
      total: number;
      draft: number;
      generating: number;
      building: number;
      deployed: number;
      failed: number;
    };
    recentProjects: Array<{
      id: string;
      name: string;
      status: string;
      prompt: string;
      updatedAt: string;
    }>;
  };

  let { data }: { data: PageData } = $props();

  const statsCards = $derived([
    {
      label: 'Total Projects',
      value: data.stats.total,
      icon: FolderKanban,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      label: 'Building',
      value: data.stats.generating + data.stats.building,
      icon: Loader2,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      spin: true,
    },
    {
      label: 'Deployed',
      value: data.stats.deployed,
      icon: CheckCircle2,
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
    {
      label: 'Failed',
      value: data.stats.failed,
      icon: XCircle,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
    },
  ]);

  const quickActions = [
    {
      title: 'Create New Project',
      description: 'Start building your next AI-powered app',
      icon: Plus,
      href: '/projects/new',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      title: 'View Documentation',
      description: 'Learn how to build apps with AI',
      icon: BookOpen,
      href: '/docs',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
  ];

  const statusColors: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    generating: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    building: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    deployed: { bg: 'bg-green-500/20', text: 'text-green-400' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400' },
    archived: { bg: 'bg-gray-600/20', text: 'text-gray-500' },
  };

  function getStatusColor(status: string) {
    return statusColors[status] || statusColors.draft;
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  function truncatePrompt(prompt: string, maxLength = 100): string {
    if (prompt.length <= maxLength) return prompt;
    return prompt.slice(0, maxLength).trim() + '...';
  }

  function capitalizeStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  const hasProjects = $derived(data.stats.total > 0);
</script>

<svelte:head>
  <title>Dashboard | Definitely Not AI</title>
</svelte:head>

<div class="space-y-8">
  <!-- Welcome Section -->
  <div>
    <p class="text-gray-400">
      Welcome to Definitely Not AI - your Agentic OS where you describe apps and AI builds them.
    </p>
  </div>

  <!-- Stats Cards -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each statsCards as stat}
      <Card
        class="border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700 hover:bg-gray-900/80"
      >
        <CardContent class="p-6">
          <div class="flex items-center gap-4">
            <div class={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.iconBg}`}>
              <stat.icon class={`h-6 w-6 ${stat.iconColor} ${stat.spin ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p class="text-3xl font-bold text-white">{stat.value}</p>
              <p class="text-sm text-gray-400">{stat.label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>

  {#if hasProjects}
    <!-- Recent Projects Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-white">Recent Projects</h2>
        <a
          href="/projects"
          class="flex items-center gap-1 text-sm text-purple-400 transition-colors hover:text-purple-300"
        >
          View all
          <ArrowRight class="h-4 w-4" />
        </a>
      </div>

      <div class="grid gap-4">
        {#each data.recentProjects as project}
          <a href={`/projects/${project.id}`} class="block">
            <Card
              class="border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700 hover:bg-gray-900/80"
            >
              <CardContent class="p-4">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-3">
                      <h3 class="font-semibold text-white">{project.name}</h3>
                      <span
                        class={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(project.status).bg} ${getStatusColor(project.status).text}`}
                      >
                        {capitalizeStatus(project.status)}
                      </span>
                    </div>
                    <p class="mt-1 text-sm text-gray-400">
                      {truncatePrompt(project.prompt)}
                    </p>
                  </div>
                  <span class="shrink-0 text-xs text-gray-500">
                    {formatTimeAgo(project.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </a>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Empty State -->
    <Card class="border-gray-800 bg-gray-900">
      <CardContent class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/10">
          <Rocket class="h-10 w-10 text-purple-400" />
        </div>
        <h3 class="text-xl font-semibold text-white">No projects yet</h3>
        <p class="mt-2 max-w-sm text-gray-400">
          Create your first AI-powered app by describing what you want to build.
        </p>
        <Button href="/projects/new" class="mt-6 bg-purple-600 hover:bg-purple-700">
          <Plus class="mr-2 h-4 w-4" />
          Create Your First Project
        </Button>
      </CardContent>
    </Card>
  {/if}

  <!-- Quick Actions Section -->
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-white">Quick Actions</h2>
    <div class="grid gap-4 sm:grid-cols-2">
      {#each quickActions as action}
        <a href={action.href}>
          <Card
            class="h-full border-gray-800 bg-gray-900 transition-all duration-200 hover:border-purple-500/50 hover:bg-gray-900/80"
          >
            <CardContent class="flex items-center gap-4 p-6">
              <div class={`flex h-12 w-12 items-center justify-center rounded-lg ${action.iconBg}`}>
                <action.icon class={`h-6 w-6 ${action.iconColor}`} />
              </div>
              <div>
                <h3 class="font-semibold text-white">{action.title}</h3>
                <p class="text-sm text-gray-400">{action.description}</p>
              </div>
            </CardContent>
          </Card>
        </a>
      {/each}
    </div>
  </div>
</div>
