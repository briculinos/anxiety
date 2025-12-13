/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mocha Mousse (Pantone 2025) background with soft pastel UI
        warm: {
          50: '#A47551',   // Mocha Mousse - MAIN BACKGROUND
          100: '#FFF8F0',  // Cream white (cards background)
          200: '#F5EDE6',  // Soft cream (card borders)
          300: '#E8DFD5',  // Light cream
          400: '#3D3D3D',  // Dark text for cards
          500: '#B8E0D2',  // Soft mint green (primary - "I feel anxious")
          600: '#95D5B2',  // Mint hover
          700: '#DDD5F3',  // Soft lavender (secondary buttons)
          800: '#C8BDE8',  // Lavender hover
          900: '#FFFFFF',  // White text (on mocha background)
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
