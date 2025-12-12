<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    children?: Snippet;
  };

  let { class: className, children }: Props = $props();
</script>

<AlertDialogPrimitive.Description class={cn('text-sm text-gray-400', className)}>
  {#if children}
    {@render children()}
  {/if}
</AlertDialogPrimitive.Description>
