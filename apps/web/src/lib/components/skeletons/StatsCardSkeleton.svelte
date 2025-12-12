<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card/index.js';
  import { Skeleton } from '$lib/components/ui/skeleton/index.js';
</script>

<Card class="border-gray-800 bg-gray-900">
  <CardContent class="p-6">
    <div class="flex items-center gap-4">
      <!-- Icon placeholder -->
      <Skeleton class="h-12 w-12 rounded-lg bg-gray-800" />
      <div class="space-y-2">
        <!-- Value -->
        <Skeleton class="h-8 w-12 bg-gray-800" />
        <!-- Label -->
        <Skeleton class="h-4 w-20 bg-gray-800" />
      </div>
    </div>
  </CardContent>
</Card>
