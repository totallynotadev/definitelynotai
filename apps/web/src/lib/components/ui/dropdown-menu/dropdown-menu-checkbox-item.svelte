<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';
  import { Check } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    checked?: boolean;
    disabled?: boolean;
    children?: Snippet;
  };

  let { class: className, checked = $bindable(false), disabled = false, children }: Props = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
  bind:checked
  disabled={disabled}
  class={cn(
    'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    className
  )}
>
  <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    {#if checked}
      <Check class="h-4 w-4" />
    {/if}
  </span>
  {#if children}
    {@render children()}
  {/if}
</DropdownMenuPrimitive.CheckboxItem>
