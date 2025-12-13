/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a7ea4',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#687076',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#0a7ea4',
        background: '#ffffff',
        foreground: '#0f172a',
      },
    },
  },
  plugins: [],
};
