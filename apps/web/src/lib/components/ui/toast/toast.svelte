<script lang="ts">
  import { tv, type VariantProps } from 'tailwind-variants';

  import { cn } from '$lib/utils.js';

  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  const toastVariants = tv({
    base: 'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  });

  type Variant = VariantProps<typeof toastVariants>['variant'];

  type Props = HTMLAttributes<HTMLDivElement> & {
    class?: string;
    variant?: Variant;
    children?: Snippet;
  };

  const { class: className, variant = 'default', children, ...restProps }: Props = $props();
</script>

<div class={cn(toastVariants({ variant }), className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
