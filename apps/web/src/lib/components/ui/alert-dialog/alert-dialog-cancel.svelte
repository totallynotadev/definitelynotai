<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';

  import { buttonVariants } from '$lib/components/ui/button/index.js';
  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Props = HTMLButtonAttributes & {
    class?: string;
    children?: Snippet;
  };

  const { class: className, children, ...restProps }: Props = $props();
</script>

<AlertDialogPrimitive.Cancel class={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</AlertDialogPrimitive.Cancel>
