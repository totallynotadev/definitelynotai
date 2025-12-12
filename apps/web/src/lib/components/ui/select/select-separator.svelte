<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';

  type Props = {
    class?: string;
  };

  let { class: className }: Props = $props();
</script>

<SelectPrimitive.Separator class={cn('-mx-1 my-1 h-px bg-muted', className)} />
