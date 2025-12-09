import type { Config } from 'tailwindcss';
import tailwindcss_safe_area from 'tailwindcss-safe-area';

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './index.html'],
  prefix: '',
  theme: {
    fontFamily: {
      sans: [
        'Inter',
        'SF Pro Display',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'sans-serif',
      ],
      mono: ['SF Mono', 'Menlo', 'Monaco', 'monospace'],
    },
    extend: {
      colors: {
        // Anxiety Buddy Design Tokens
        'void-blue': '#0A1128',
        'biolum-cyan': '#64FFDA',
        'warm-ember': '#FFB38A',
        'mist-white': '#E2E8F0',

        // Glass morphism
        glass: {
          border: 'rgba(255, 255, 255, 0.1)',
          bg: 'rgba(255, 255, 255, 0.05)',
          'bg-hover': 'rgba(255, 255, 255, 0.08)',
        },

        // States
        success: '#4ECDC4',
        warning: '#FFD93D',
        danger: '#FF6B6B',

        // Glows
        'glow-cyan': 'rgba(100, 255, 218, 0.4)',
        'glow-ember': 'rgba(255, 179, 138, 0.3)',

        // Legacy (keep for existing components)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: '#F5F5F5',
        accent: '#2C4156',
      },
      animation: {
        // Page transitions (viscous)
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-out': 'fadeOut 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slideDown 0.8s cubic-bezier(0.22, 1, 0.36, 1)',

        // Micro-interactions
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        breathe: 'breathe 10s ease-in-out infinite',

        // UI feedback
        'tap-scale': 'tapScale 0.2s ease-out',

        // Legacy
        fadeIn: 'fadeIn 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '0.6',
            transform: 'scale(1)',
            boxShadow: '0 0 20px rgba(100, 255, 218, 0.4)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05)',
            boxShadow: '0 0 40px rgba(100, 255, 218, 0.6)',
          },
        },
        breathe: {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '40%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0.6' },
        },
        tapScale: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        viscous: 'cubic-bezier(0.22, 1, 0.36, 1)',
        elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(100, 255, 218, 0.3)',
        'glow-md': '0 0 20px rgba(100, 255, 218, 0.4)',
        'glow-lg': '0 0 40px rgba(100, 255, 218, 0.5)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(100, 255, 218, 0.2)',
      },
      dropShadow: {
        glow: '0 0 8px rgba(100, 255, 218, 0.6)',
        'glow-strong': '0 0 16px rgba(100, 255, 218, 0.8)',
      },
      backdropBlur: {
        glass: '12px',
        'glass-heavy': '24px',
      },
    },
  },
  plugins: [tailwindcss_safe_area],
} satisfies Config;

export default config;
