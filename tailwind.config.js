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
      colors: {
        // Shared primary color 
        primary: '#2563eb',
        
        // Dark theme
        'dark-bg': '#0f172a',        // slate-900
        'dark-surface': '#1e293b',   // slate-800
        'dark-border': '#334155',    // slate-700
        'dark-content': '#e2e8f0',   // slate-200
        'dark-heading': '#f1f5f9',   // slate-100
        'dark-muted': '#94a3b8',     // slate-400
        
        // Light theme
        'light-bg': '#f8fafc',       // slate-50
        'light-surface': '#ffffff',  // white
        'light-border': '#334155',   // slate-200
        'light-content': '#334155',  // slate-700
        'light-heading': '#0f172a',  // slate-900
        'light-muted': '#64748b',    // slate-500
      },
    },
  },
 
  plugins: [require('flowbite/plugin')],
};

