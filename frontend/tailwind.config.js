/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#090d16', // Deep luxury twilight carbon
          900: '#0f172a', // Midnight slate surface
          850: '#141e33', // Elevated card surface
          800: '#1e293b', // Translucent card border
          700: '#334155', // Subtle divider
        },
        brand: {
          emerald: '#10b981', // Clean vivid emerald
          mint: '#34d399',    // Soft glowing mint
          teal: '#14b8a6',    // Andean teal
          cyan: '#06b6d4',    // Data cyan
          amber: '#f59e0b',   // Andean solar amber
          rose: '#f43f5e',    // Alert crimson
          indigo: '#6366f1',  // Tech accent
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'brand-emerald': '0 0 30px rgba(16, 185, 129, 0.25)',
        'brand-cyan': '0 0 30px rgba(6, 182, 212, 0.25)',
        'brand-amber': '0 0 30px rgba(245, 158, 11, 0.25)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
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
