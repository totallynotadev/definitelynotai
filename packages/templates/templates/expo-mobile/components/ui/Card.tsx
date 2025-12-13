import { forwardRef } from 'react';
import { View, ViewProps, Text, TextProps } from 'react-native';
import { cn } from '@/lib/utils';

const Card = forwardRef<View, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        'rounded-lg border border-border bg-card shadow-sm',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<View, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<Text, TextProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(
        'text-xl font-semibold leading-none tracking-tight text-card-foreground',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<Text, TextProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<View, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn('p-4 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<View, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn('flex flex-row items-center p-4 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
