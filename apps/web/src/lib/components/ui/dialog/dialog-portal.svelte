<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';

  import type { Snippet } from 'svelte';

  type Props = {
    children?: Snippet;
  };

  const { children }: Props = $props();
</script>

<DialogPrimitive.Portal>
  {#if children}
    {@render children()}
  {/if}
</DialogPrimitive.Portal>
