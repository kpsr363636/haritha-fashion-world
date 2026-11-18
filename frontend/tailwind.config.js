/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#B5476A',
          50: '#fdf2f6',
          100: '#fce7ef',
          200: '#fbcfe0',
          300: '#f9a8c4',
          400: '#f4729a',
          500: '#B5476A',
          600: '#9a3a59',
          700: '#7f2f4a',
          800: '#6b2840',
          900: '#4a1a2c',
          950: '#2d1019'
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#F5E6C8',
          dark: '#9A7B1A'
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F3EBE0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif']
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(181, 71, 106, 0.14)',
        card: '0 12px 40px -12px rgba(0, 0, 0, 0.12)',
        glow: '0 0 48px -12px rgba(181, 71, 106, 0.4)',
        'inner-soft': 'inset 0 2px 8px rgba(0, 0, 0, 0.04)'
      },
      backgroundImage: {
        'page-gradient': 'radial-gradient(ellipse at 0% 0%, rgba(181, 71, 106, 0.09) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(201, 162, 39, 0.07) 0%, transparent 50%)',
        'hero-shimmer': 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%, rgba(255,255,255,0.06) 100%)',
        'card-shine': 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      }
    }
  },
  plugins: []
}
