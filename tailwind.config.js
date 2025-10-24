/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
        }

      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        fadeInUp: 'fadeInUp 0.3s ease-out',
        slideUpBounce: 'slideUpBounce 0.5s ease-out',

      },
      colors: {
        primary: '#2563eb',
        'dark-bg': '#0f172a',
        'dark-surface': '#1e293b',
        'dark-border': '#334155',
        'dark-content': '#e2e8f0',
        'dark-heading': '#f1f5f9',
        'dark-muted': '#94a3b8',
        'light-bg': '#F0F8FF',
        'light-surface': '#ffffff',
        'light-border': '#e2e8f0',
        'light-content': '#334155',
        'light-heading': '#0f172a',
        'light-muted': '#64748b',
      },
    },
  },
  plugins: [],
};