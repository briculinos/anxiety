/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cloud Dancer inspired palette (Pantone 2026 - soft white)
        warm: {
          50: '#FAFAF8',   // Cloud white background (almost white)
          100: '#F5F5F3',  // Soft gray-white (cards)
          200: '#ECEAE6',  // Light warm gray
          300: '#E0DDD8',  // Warm gray (borders)
          400: '#C9C5BE',  // Medium warm gray
          500: '#8B9A8B',  // Sage green (primary - calming)
          600: '#7A8A7A',  // Darker sage
          700: '#6B8F71',  // Forest green (success)
          800: '#5A7A5F',  // Darker green
          900: '#4A5568',  // Soft dark gray (text)
        },
        calm: {
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
        },
        soothe: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      },
      animation: {
        'breathe-in': 'breatheIn 4s ease-in-out',
        'breathe-out': 'breatheOut 4s ease-in-out',
        'breathe-hold': 'breatheHold 4s ease-in-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        breatheIn: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.3)', opacity: '1' },
        },
        breatheOut: {
          '0%': { transform: 'scale(1.3)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0.6' },
        },
        breatheHold: {
          '0%, 100%': { transform: 'scale(1.3)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
