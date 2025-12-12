import { tv, type VariantProps } from 'tailwind-variants';

import Description from './alert-description.svelte';
import Title from './alert-title.svelte';
import Root from './alert.svelte';


const alertVariants = tv({
  base: 'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      destructive:
        'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type Variant = VariantProps<typeof alertVariants>['variant'];

type Props = {
  variant?: Variant;
};

export {
  Root,
  Description,
  Title,
  Root as Alert,
  Description as AlertDescription,
  Title as AlertTitle,
  alertVariants,
  type Props,
  type Props as AlertProps,
};
