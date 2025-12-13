import { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  className?: string;
}

const Input = forwardRef<TextInput, InputProps>(
  ({ className, placeholderTextColor = '#64748b', ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          'h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground',
          'focus:border-ring',
          className
        )}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
