<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import type { ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof DialogPrimitive.Root>;

  let { children, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Root {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</DialogPrimitive.Root>
