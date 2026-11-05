import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        night: {
          950: '#030409',
          900: '#05070f',
          850: '#070b18',
          800: '#0b1022',
          700: '#111735',
        },
      },
      boxShadow: {
        'glow-blue': '0 0 24px -4px rgba(59, 130, 246, 0.45)',
        'glow-purple': '0 0 24px -4px rgba(139, 92, 246, 0.45)',
        'glow-soft': '0 0 60px -12px rgba(99, 102, 241, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
