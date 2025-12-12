<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
</script>

<div class="space-y-6">
  <!-- Header skeleton -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="space-y-2">
      <!-- Title -->
      <Skeleton class="h-8 w-64 bg-gray-800" />
      <!-- Subtitle -->
      <div class="flex items-center gap-3">
        <Skeleton class="h-5 w-20 rounded-full bg-gray-800" />
        <Skeleton class="h-4 w-32 bg-gray-800" />
      </div>
    </div>
    <!-- Action buttons -->
    <div class="flex gap-2">
      <Skeleton class="h-10 w-24 rounded-md bg-gray-800" />
      <Skeleton class="h-10 w-10 rounded-md bg-gray-800" />
    </div>
  </div>

  <!-- Prompt card skeleton -->
  <Card class="border-gray-800 bg-gray-900">
    <CardContent class="p-6">
      <div class="space-y-3">
        <Skeleton class="h-5 w-24 bg-gray-800" />
        <Skeleton class="h-4 w-full bg-gray-800" />
        <Skeleton class="h-4 w-full bg-gray-800" />
        <Skeleton class="h-4 w-3/4 bg-gray-800" />
      </div>
    </CardContent>
  </Card>

  <!-- Tabs skeleton -->
  <div class="border-b border-gray-800">
    <div class="flex gap-6">
      <Skeleton class="h-10 w-20 bg-gray-800" />
      <Skeleton class="h-10 w-24 bg-gray-800" />
      <Skeleton class="h-10 w-16 bg-gray-800" />
      <Skeleton class="h-10 w-28 bg-gray-800" />
    </div>
  </div>

  <!-- Content area skeleton -->
  <Card class="border-gray-800 bg-gray-900">
    <CardContent class="p-6">
      <div class="space-y-4">
        <!-- Section header -->
        <Skeleton class="h-6 w-32 bg-gray-800" />

        <!-- Content rows -->
        <div class="space-y-3">
          {#each Array(5) as _}
            <div class="flex items-center gap-4">
              <Skeleton class="h-10 w-10 rounded-full bg-gray-800" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-48 bg-gray-800" />
                <Skeleton class="h-3 w-full bg-gray-800" />
              </div>
              <Skeleton class="h-4 w-16 bg-gray-800" />
            </div>
          {/each}
        </div>
      </div>
    </CardContent>
  </Card>
</div>
