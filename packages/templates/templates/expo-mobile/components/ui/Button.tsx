import { forwardRef } from 'react';
import { Pressable, PressableProps, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary active:bg-primary/90',
        destructive: 'bg-destructive active:bg-destructive/90',
        outline: 'border border-input bg-background active:bg-accent',
        secondary: 'bg-secondary active:bg-secondary/80',
        ghost: 'active:bg-accent',
        link: '',
      },
      size: {
        default: 'h-12 px-4 py-3',
        sm: 'h-10 rounded-md px-3',
        lg: 'h-14 rounded-md px-8',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  className?: string;
}

const Button = forwardRef<View, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <Pressable
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
