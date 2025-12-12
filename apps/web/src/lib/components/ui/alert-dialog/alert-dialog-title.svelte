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

<AlertDialogPrimitive.Title class={cn('text-lg font-semibold text-white', className)}>
  {#if children}
    {@render children()}
  {/if}
</AlertDialogPrimitive.Title>
