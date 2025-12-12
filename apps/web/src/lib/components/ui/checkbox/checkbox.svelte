<script lang="ts">
  import { Checkbox as CheckboxPrimitive } from 'bits-ui';
  import { Check, Minus } from 'lucide-svelte';

  import { cn } from '$lib/utils.js';

  type Props = {
    class?: string;
    checked?: boolean | 'indeterminate';
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
  };

  let { class: className, checked = $bindable(false), disabled = false, required = false, name, value }: Props = $props();
</script>

<CheckboxPrimitive.Root
  bind:checked
  disabled={disabled}
  required={required}
  {name}
  {value}
  class={cn(
    'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
    className
  )}
>
  <CheckboxPrimitive.Indicator class="flex items-center justify-center text-current">
    {#if checked === 'indeterminate'}
      <Minus class="h-4 w-4" />
    {:else}
      <Check class="h-4 w-4" />
    {/if}
  </CheckboxPrimitive.Indicator>
</CheckboxPrimitive.Root>
