/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ink navy and warm stone. Existing emerald/slate classes pick this up
        // so the product reads as an editorial atlas instead of a green dashboard.
        emerald: {
          50: '#f4f7fb',
          100: '#e6eef6',
          200: '#c5d5e8',
          300: '#96b0d0',
          400: '#6486b0',
          500: '#3d6494',
          600: '#1e3a5f',
          700: '#172e4c',
          800: '#12243c',
          900: '#0e1c2e',
          950: '#081018',
        },
        slate: {
          50: '#faf7f2',
          100: '#f3eee6',
          200: '#e4dcd0',
          300: '#cfc3b2',
          400: '#a89884',
          500: '#847566',
          600: '#675c50',
          700: '#4c433b',
          800: '#2e2925',
          900: '#1c1815',
          950: '#12100e',
        },
        agro: {
          50: '#f4f7fb',
          100: '#e6eef6',
          200: '#c5d5e8',
          300: '#96b0d0',
          400: '#6486b0',
          500: '#3d6494',
          600: '#1e3a5f',
          700: '#172e4c',
          800: '#12243c',
          900: '#0e1c2e',
          950: '#081018',
        },
        brand: {
          emerald: '#1e3a5f',
          mint: '#3d6494',
          teal: '#1f4f5b',
          cyan: '#1e3a5f',
          amber: '#9a4e1c',
          rose: '#9f1239',
        }
      },
      fontFamily: {
        sans: ['Source Sans 3', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 0 rgba(28, 24, 21, 0.04), 0 16px 32px -24px rgba(28, 24, 21, 0.28)',
        'card-hover': '0 18px 36px -22px rgba(28, 24, 21, 0.32)',
        'emerald-soft': '0 10px 20px -12px rgba(30, 58, 95, 0.45)',
        'amber-soft': '0 10px 20px -12px rgba(154, 78, 28, 0.4)',
      },
      animation: {
        'scan': 'scan 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: '0.85' },
          '50%': { transform: 'translateY(100%)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.02)' },
        },
      }
    },
  },
  plugins: [],
}
