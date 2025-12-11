<script lang="ts">
  const projects = [
    {
      id: '1',
      name: 'E-commerce App',
      description: 'Full-featured online store with cart and checkout',
      status: 'deployed',
      lastUpdated: '2 hours ago',
    },
    {
      id: '2',
      name: 'Dashboard Template',
      description: 'Analytics dashboard with charts and data tables',
      status: 'building',
      lastUpdated: '5 minutes ago',
    },
    {
      id: '3',
      name: 'Landing Page',
      description: 'Marketing landing page with hero and CTA sections',
      status: 'deployed',
      lastUpdated: '1 day ago',
    },
    {
      id: '4',
      name: 'Blog Platform',
      description: 'Content management system with markdown support',
      status: 'draft',
      lastUpdated: '3 days ago',
    },
  ];

  function getStatusColor(status: string): string {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-700';
      case 'building':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
    <button class="btn-primary">New Project</button>
  </div>

  <div class="grid gap-4">
    {#each projects as project}
      <a href="/projects/{project.id}" class="card transition-shadow hover:shadow-md">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold text-gray-900">{project.name}</h3>
            <p class="mt-1 text-sm text-gray-500">{project.description}</p>
          </div>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {getStatusColor(project.status)}"
          >
            {project.status}
          </span>
        </div>
        <p class="mt-4 text-xs text-gray-400">Last updated {project.lastUpdated}</p>
      </a>
    {/each}
  </div>
</div>
