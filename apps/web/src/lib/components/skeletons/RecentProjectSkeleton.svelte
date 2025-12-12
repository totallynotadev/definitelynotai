<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
</script>

<Card class="border-gray-800 bg-gray-900">
  <CardContent class="p-4">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-center gap-3">
          <!-- Name -->
          <Skeleton class="h-5 w-32 bg-gray-800" />
          <!-- Status badge -->
          <Skeleton class="h-5 w-16 rounded-full bg-gray-800" />
        </div>
        <!-- Prompt excerpt -->
        <Skeleton class="h-4 w-full bg-gray-800" />
      </div>
      <!-- Time -->
      <Skeleton class="h-3 w-16 bg-gray-800" />
    </div>
  </CardContent>
</Card>
