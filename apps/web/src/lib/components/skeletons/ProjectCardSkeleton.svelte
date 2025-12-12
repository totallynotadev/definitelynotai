<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
</script>

<Card class="h-full border-gray-800 bg-gray-900">
  <CardContent class="flex h-full flex-col p-5">
    <!-- Header with name and status -->
    <div class="mb-3 flex items-start justify-between gap-3">
      <Skeleton class="h-6 w-32 bg-gray-800" />
      <Skeleton class="h-5 w-16 rounded-full bg-gray-800" />
    </div>

    <!-- Prompt excerpt - two lines -->
    <div class="mb-4 flex-1 space-y-2">
      <Skeleton class="h-4 w-full bg-gray-800" />
      <Skeleton class="h-4 w-3/4 bg-gray-800" />
    </div>

    <!-- Platforms -->
    <div class="mb-4 flex gap-2">
      <Skeleton class="h-8 w-8 rounded-md bg-gray-800" />
      <Skeleton class="h-8 w-8 rounded-md bg-gray-800" />
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between border-t border-gray-800 pt-3">
      <Skeleton class="h-3 w-24 bg-gray-800" />
      <Skeleton class="h-3 w-24 bg-gray-800" />
    </div>
  </CardContent>
</Card>
