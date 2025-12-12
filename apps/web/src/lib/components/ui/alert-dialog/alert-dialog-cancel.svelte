<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
  import { buttonVariants } from '$lib/components/ui/button/index.js';
  import { cn } from '$lib/utils.js';
  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children }: Props = $props();
</script>

<AlertDialogPrimitive.Cancel class={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}>
  {#if children}
    {@render children()}
  {/if}
</AlertDialogPrimitive.Cancel>
