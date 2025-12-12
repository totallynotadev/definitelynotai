<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { ChevronDown } from 'lucide-svelte';

  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    disabled?: boolean;
    children?: Snippet;
  };

  const { class: className, disabled, children }: Props = $props();
</script>

<SelectPrimitive.Trigger
  {disabled}
  class={cn(
    'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
    className
  )}
>
  {#if children}
    {@render children()}
  {/if}
  <ChevronDown class="h-4 w-4 opacity-50" />
</SelectPrimitive.Trigger>
