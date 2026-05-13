/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        neon: {
          DEFAULT: '#00ff9d',
          dim: '#00c77a',
        },
        pitch: {
          bg: '#0a0a0f',
          panel: '#12121a',
          glass: 'rgba(18, 18, 26, 0.72)',
        },
      },
      boxShadow: {
        neon: '0 0 24px rgba(0, 255, 157, 0.25)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
