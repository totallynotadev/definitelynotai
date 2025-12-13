<script lang="ts">
  import { cn } from '$lib/utils.js';

  type Props = {
    class?: string;
  };

  const { class: className }: Props = $props();
</script>

<!-- Custom separator since bits-ui 2.x Select doesn't export Separator -->
<div role="separator" class={cn('-mx-1 my-1 h-px bg-muted', className)} />
