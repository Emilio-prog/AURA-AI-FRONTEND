import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brutal: {
          teal: '#2DD4BF',
          purple: '#A855F7',
          coral: '#FB7185',
          black: '#000000',
          white: '#FFFFFF',
          ink: '#0A0A0A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F5F5F5',
          soft: '#FAFAFA',
        },
        ink: {
          DEFAULT: '#000000',
          muted: '#555555',
          subtle: '#888888',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'display-xl': [
          'clamp(2.25rem, 6vw, 4.5rem)',
          { lineHeight: '1', letterSpacing: '-0.03em' },
        ],
        'display-lg': [
          'clamp(1.75rem, 4vw, 3rem)',
          { lineHeight: '1.05', letterSpacing: '-0.02em' },
        ],
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '6': '6px',
      },
      boxShadow: {
        brutal: '8px 8px 0 0 #000',
        'brutal-sm': '4px 4px 0 0 #000',
        'brutal-lg': '12px 12px 0 0 #000',
        'brutal-coral': '8px 8px 0 0 #FB7185',
        'brutal-purple': '8px 8px 0 0 #A855F7',
        'brutal-teal': '8px 8px 0 0 #2DD4BF',
        sos: '0 8px 40px rgba(251, 113, 133, 0.5)',
        modal: '0 24px 80px rgba(168, 85, 247, 0.25)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(0.65)', opacity: '0.7' },
          '50%': { transform: 'scale(1)', opacity: '1' },
        },
        ring: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.8)', opacity: '0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
          '70%': { transform: 'translateY(-3px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        breathe: 'breathe 14s ease-in-out infinite',
        ring: 'ring 2.5s ease-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 0.6s ease-in-out infinite',
        marquee: 'marquee 22s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
      },
      backdropBlur: {
        brutal: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
