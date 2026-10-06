/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agro: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        brand: {
          emerald: '#059669', // Rich Forest Emerald
          mint: '#10b981',    // Vibrant Andean Mint
          teal: '#0d9488',    // Deep Teal
          cyan: '#0284c7',    // Precision Sky
          amber: '#d97706',   // Warm Alert Amber
          rose: '#e11d48',    // Critical Alert Rose
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 28px -4px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'emerald-soft': '0 8px 24px -4px rgba(5, 150, 105, 0.20)',
        'amber-soft': '0 8px 24px -4px rgba(217, 119, 6, 0.20)',
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
