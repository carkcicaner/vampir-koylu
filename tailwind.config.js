/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fog': 'fog 20s infinite ease-in-out alternate',
        'float': 'float 6s infinite ease-in-out',
      },
      keyframes: {
        fog: {
          '0%': { transform: 'translateX(-10%) translateY(0) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translateX(10%) translateY(-20px) scale(1.1)', opacity: '0.5' },
          '100%': { transform: 'translateX(-10%) translateY(0) scale(1)', opacity: '0.3' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        }
      }
    },
  },
  plugins: [],
}