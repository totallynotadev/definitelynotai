<script lang="ts">
  type Size = 'sm' | 'md' | 'lg' | 'xl';
  type Color = 'purple' | 'blue' | 'green' | 'white' | 'gray';

  interface Props {
    size?: Size;
    color?: Color;
    class?: string;
  }

  const { size = 'md', color = 'purple', class: className = '' }: Props = $props();

  const sizeClasses: Record<Size, string> = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses: Record<Color, string> = {
    purple: 'text-purple-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    white: 'text-white',
    gray: 'text-gray-400',
  };
</script>

<svg
  class="animate-spin {sizeClasses[size]} {colorClasses[color]} {className}"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  aria-label="Loading"
>
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
  <path
    class="opacity-75"
    fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  />
</svg>
