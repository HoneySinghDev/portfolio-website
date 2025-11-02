import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        honey: {
          50: '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#ffee58',
          500: '#ffeb3b',
          600: '#fdd835',
          700: '#fbc02d',
          800: '#f9a825',
          900: '#f57f17',
          950: '#8B4513',
        },
        neon: {
          yellow: '#FFFF00',
          pink: '#FF00FF',
          blue: '#00FFFF',
          green: '#00FF00',
          purple: '#9D00FF',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        glow: {
          '0%, 100%': {
            textShadow:
              '0 0 10px rgba(255, 255, 0, 0.8), 0 0 20px rgba(255, 255, 0, 0.5), 0 0 30px rgba(255, 255, 0, 0.3)',
          },
          '50%': {
            textShadow:
              '0 0 20px rgba(255, 255, 0, 1), 0 0 30px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 255, 0, 0.6)',
          },
        },
        neonPulse: {
          '0%': {
            boxShadow:
              '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #FFFF00, 0 0 20px #FFFF00, 0 0 25px #FFFF00',
          },
          '50%': {
            boxShadow:
              '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #FFFF00, 0 0 40px #FFFF00, 0 0 50px #FFFF00',
          },
          '100%': {
            boxShadow:
              '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #FFFF00, 0 0 20px #FFFF00, 0 0 25px #FFFF00',
          },
        },
        colorCycle: {
          '0%': { color: '#FFFF00', textShadow: '0 0 10px #FFFF00' },
          '25%': { color: '#FF00FF', textShadow: '0 0 10px #FF00FF' },
          '50%': { color: '#00FFFF', textShadow: '0 0 10px #00FFFF' },
          '75%': { color: '#00FF00', textShadow: '0 0 10px #00FF00' },
          '100%': { color: '#FFFF00', textShadow: '0 0 10px #FFFF00' },
        },
        backgroundShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 6s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        'neon-pulse': 'neonPulse 2s infinite',
        'color-cycle': 'colorCycle 8s infinite',
        'bg-shift': 'backgroundShift 15s ease infinite',
      },
      backgroundImage: {
        'neon-grid':
          'linear-gradient(rgba(33, 33, 33, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(33, 33, 33, 0.8) 1px, transparent 1px)',
        'neon-gradient':
          'linear-gradient(-45deg, #FFFF00, #FF00FF, #00FFFF, #00FF00, #9D00FF)',
      },
      backgroundSize: {
        grid: '50px 50px',
        'gradient-size': '400% 400%',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
