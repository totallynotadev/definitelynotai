<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui';
  import { Check } from 'lucide-svelte';

  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    value: string;
    label?: string;
    disabled?: boolean;
    children?: Snippet;
  };

  const { class: className, value, label, disabled = false, children }: Props = $props();
</script>

<SelectPrimitive.Item
  {value}
  {label}
  disabled={disabled}
  class={cn(
    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-accent',
    className
  )}
>
  <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <Check class="h-4 w-4 opacity-0 data-[state=checked]:opacity-100" />
  </span>
  {#if children}
    {@render children()}
  {/if}
</SelectPrimitive.Item>
