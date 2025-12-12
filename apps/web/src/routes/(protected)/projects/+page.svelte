<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Card, CardContent } from '$lib/components/ui/card/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '$lib/components/ui/select/index.js';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '$lib/components/ui/table/index.js';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '$lib/components/ui/dropdown-menu/index.js';
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
  import {
    Plus,
    Search,
    LayoutGrid,
    List,
    Globe,
    Smartphone,
    Server,
    MoreVertical,
    Eye,
    Pencil,
    Trash2,
    Rocket,
  } from 'lucide-svelte';

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

  type PageData = {
    projects: Project[];
    projectCount: number;
    token: string | null;
  };

  let { data }: { data: PageData } = $props();

  // State
  let searchQuery = $state('');
  let statusFilter = $state<string>('all');
  let viewMode = $state<'grid' | 'list'>('grid');
  let deleteDialogOpen = $state(false);
  let projectToDelete = $state<Project | null>(null);
  let isDeleting = $state(false);

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'generating', label: 'Generating' },
    { value: 'building', label: 'Building' },
    { value: 'deployed', label: 'Deployed' },
    { value: 'failed', label: 'Failed' },
  ];

  // Filtered projects
  const filteredProjects = $derived(() => {
    let result = data.projects;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.prompt.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    return result;
  });

  // Helpers
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

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  }

  function capitalizeStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function getPlatformIcon(platform: string) {
    const normalized = platform.toLowerCase();
    if (normalized.includes('web') || normalized.includes('page')) return Globe;
    if (normalized.includes('ios') || normalized.includes('android') || normalized.includes('mobile'))
      return Smartphone;
    if (normalized.includes('api') || normalized.includes('worker') || normalized.includes('backend'))
      return Server;
    return Globe;
  }

  function openDeleteDialog(project: Project) {
    projectToDelete = project;
    deleteDialogOpen = true;
  }

  async function handleDelete() {
    if (!projectToDelete || !data.token) return;

    isDeleting = true;
    try {
      // TODO: Implement actual delete API call
      // await projectsApi.delete(data.token, projectToDelete.id);

      // For now, just close the dialog
      // In production, you'd refetch data or update state
      console.log('Delete project:', projectToDelete.id);
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      isDeleting = false;
      deleteDialogOpen = false;
      projectToDelete = null;
    }
  }

  const hasProjects = $derived(data.projects.length > 0);
  const hasFilteredProjects = $derived(filteredProjects().length > 0);
</script>

<svelte:head>
  <title>Projects | Definitely Not AI</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header Section -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p class="text-gray-400">
        {data.projectCount} project{data.projectCount !== 1 ? 's' : ''}
      </p>
    </div>
    <Button href="/projects/new" class="bg-purple-600 hover:bg-purple-700">
      <Plus class="mr-2 h-4 w-4" />
      New Project
    </Button>
  </div>

  {#if hasProjects}
    <!-- Toolbar -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 gap-3">
        <!-- Search -->
        <div class="relative max-w-sm flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search projects..."
            bind:value={searchQuery}
            class="border-gray-700 bg-gray-900 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500"
          />
        </div>

        <!-- Status Filter -->
        <Select type="single" bind:value={statusFilter}>
          <SelectTrigger class="w-[160px] border-gray-700 bg-gray-900 text-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent class="border-gray-700 bg-gray-900">
            {#each statusOptions as option}
              <SelectItem value={option.value} class="text-white hover:bg-gray-800">
                {option.label}
              </SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>

      <!-- View Toggle -->
      <div class="flex gap-1 rounded-lg border border-gray-700 bg-gray-900 p-1">
        <button
          onclick={() => (viewMode = 'grid')}
          class="rounded-md p-2 transition-colors {viewMode === 'grid'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:text-white'}"
          aria-label="Grid view"
        >
          <LayoutGrid class="h-4 w-4" />
        </button>
        <button
          onclick={() => (viewMode = 'list')}
          class="rounded-md p-2 transition-colors {viewMode === 'list'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:text-white'}"
          aria-label="List view"
        >
          <List class="h-4 w-4" />
        </button>
      </div>
    </div>

    {#if hasFilteredProjects}
      {#if viewMode === 'grid'}
        <!-- Grid View -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each filteredProjects() as project}
            <a href={`/projects/${project.id}`} class="group block">
              <Card
                class="h-full border-gray-800 bg-gray-900 transition-all duration-200 group-hover:border-purple-500/50 group-hover:shadow-lg group-hover:shadow-purple-500/5"
              >
                <CardContent class="flex h-full flex-col p-5">
                  <!-- Header with name and status -->
                  <div class="mb-3 flex items-start justify-between gap-3">
                    <h3 class="text-lg font-semibold text-white">{project.name}</h3>
                    <span
                      class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(
                        project.status
                      ).bg} {getStatusColor(project.status).text}"
                    >
                      {capitalizeStatus(project.status)}
                    </span>
                  </div>

                  <!-- Prompt excerpt -->
                  <p class="mb-4 flex-1 text-sm leading-relaxed text-gray-400 line-clamp-2">
                    {truncateText(project.description || project.prompt, 120)}
                  </p>

                  <!-- Platforms -->
                  {#if project.platforms && project.platforms.length > 0}
                    <div class="mb-4 flex gap-2">
                      {#each project.platforms as platform}
                        {@const Icon = getPlatformIcon(platform)}
                        <div
                          class="flex h-8 w-8 items-center justify-center rounded-md bg-gray-800"
                          title={platform}
                        >
                          <Icon class="h-4 w-4 text-gray-400" />
                        </div>
                      {/each}
                    </div>
                  {/if}

                  <!-- Footer -->
                  <div class="flex items-center justify-between border-t border-gray-800 pt-3 text-xs text-gray-500">
                    <span>Created {formatTimeAgo(project.createdAt)}</span>
                    <span>Updated {formatTimeAgo(project.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </a>
          {/each}
        </div>
      {:else}
        <!-- List View -->
        <div class="rounded-lg border border-gray-800 bg-gray-900">
          <Table>
            <TableHeader>
              <TableRow class="border-gray-800 hover:bg-transparent">
                <TableHead class="text-gray-400">Name</TableHead>
                <TableHead class="text-gray-400">Status</TableHead>
                <TableHead class="text-gray-400">Platforms</TableHead>
                <TableHead class="text-gray-400">Created</TableHead>
                <TableHead class="text-gray-400">Updated</TableHead>
                <TableHead class="w-[50px] text-gray-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each filteredProjects() as project}
                <TableRow class="border-gray-800 hover:bg-gray-800/50">
                  <TableCell>
                    <a href={`/projects/${project.id}`} class="font-medium text-white hover:text-purple-400">
                      {project.name}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(
                        project.status
                      ).bg} {getStatusColor(project.status).text}"
                    >
                      {capitalizeStatus(project.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div class="flex gap-1">
                      {#each project.platforms as platform}
                        {@const Icon = getPlatformIcon(platform)}
                        <div
                          class="flex h-6 w-6 items-center justify-center rounded bg-gray-800"
                          title={platform}
                        >
                          <Icon class="h-3 w-3 text-gray-400" />
                        </div>
                      {/each}
                    </div>
                  </TableCell>
                  <TableCell class="text-gray-400">{formatDate(project.createdAt)}</TableCell>
                  <TableCell class="text-gray-400">{formatDate(project.updatedAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button class="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white">
                          <MoreVertical class="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent class="border-gray-700 bg-gray-900">
                        <DropdownMenuItem class="text-white hover:bg-gray-800">
                          <a href={`/projects/${project.id}`} class="flex w-full items-center gap-2">
                            <Eye class="h-4 w-4" />
                            View
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem class="text-white hover:bg-gray-800">
                          <a href={`/projects/${project.id}/edit`} class="flex w-full items-center gap-2">
                            <Pencil class="h-4 w-4" />
                            Edit
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          class="text-red-400 hover:bg-gray-800 hover:text-red-400"
                          onclick={(e: Event) => {
                            e.preventDefault();
                            openDeleteDialog(project);
                          }}
                        >
                          <div class="flex w-full items-center gap-2">
                            <Trash2 class="h-4 w-4" />
                            Delete
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      {/if}
    {:else}
      <!-- No results from filter -->
      <Card class="border-gray-800 bg-gray-900">
        <CardContent class="flex flex-col items-center justify-center py-12 text-center">
          <Search class="mb-4 h-12 w-12 text-gray-600" />
          <h3 class="text-lg font-semibold text-white">No projects found</h3>
          <p class="mt-2 text-gray-400">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <Button
            variant="outline"
            class="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
            onclick={() => {
              searchQuery = '';
              statusFilter = 'all';
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>
    {/if}
  {:else}
    <!-- Empty State -->
    <Card class="border-gray-800 bg-gray-900">
      <CardContent class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/10">
          <Rocket class="h-10 w-10 text-purple-400" />
        </div>
        <h3 class="text-xl font-semibold text-white">No projects yet</h3>
        <p class="mt-2 max-w-md text-gray-400">
          Describe an app and we'll build it for you. Get started by creating your first AI-powered
          project.
        </p>
        <Button href="/projects/new" class="mt-6 bg-purple-600 hover:bg-purple-700">
          <Plus class="mr-2 h-4 w-4" />
          Create Your First Project
        </Button>
      </CardContent>
    </Card>
  {/if}
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog bind:open={deleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Project</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone and
        will permanently remove the project and all associated data.
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
        {#if isDeleting}
          Deleting...
        {:else}
          Delete
        {/if}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
