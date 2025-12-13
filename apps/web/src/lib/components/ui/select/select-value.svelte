<script lang="ts">
  /**
   * SelectValue - Display placeholder or selected value
   * In bits-ui 2.x, Value is not a separate component.
   * This component provides a compatible API by accepting a placeholder.
   * The actual selected value should be passed as children or the parent should handle display.
   */
  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    placeholder?: string;
    children?: Snippet;
  };

  const { class: className, placeholder = 'Select...', children }: Props = $props();
</script>

<span class={className}>
  {#if children}
    {@render children()}
  {:else}
    <span class="text-muted-foreground">{placeholder}</span>
  {/if}
</span>
