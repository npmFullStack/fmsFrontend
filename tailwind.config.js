/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lexend', 'sans-serif'],
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideUpBounce: {
          '0%': { opacity: 0, transform: 'translateY(100%) translateX(-50%)' },
          '70%': { opacity: 1, transform: 'translateY(-10%) translateX(-50%)' },
          '100%': { opacity: 1, transform: 'translateY(0) translateX(-50%)' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        fadeInUp: 'fadeInUp 0.3s ease-out',
        slideUpBounce: 'slideUpBounce 0.5s ease-out',
      },
    },
  },
 
  plugins: [require('flowbite/plugin')],
};