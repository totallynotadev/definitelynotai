<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();
</script>

<AlertDialogPrimitive.Portal>
  {#if children}
    {@render children()}
  {/if}
</AlertDialogPrimitive.Portal>
