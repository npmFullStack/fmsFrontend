/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
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
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        fadeInUp: 'fadeInUp 0.3s ease-out',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      // Luxury Gold Themes
      {
        "luxury-gold-light": {
          "primary": "#b8860b", // Rich gold
          "primary-content": "#ffffff",
          "secondary": "#1e3a8a", // Deep navy
          "secondary-content": "#ffffff",
          "accent": "#d4af37", // Metallic gold
          "accent-content": "#000000",
          "neutral": "#2d3748",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f8f9fa",
          "base-300": "#e9ecef",
          "base-content": "#1f2937",
          "info": "#3abff8",
          "info-content": "#000000",
          "success": "#16a34a",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#000000",
          "error": "#dc2626",
          "error-content": "#ffffff",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
        },
        "luxury-gold-dark": {
          "primary": "#d4af37", // Bright gold
          "primary-content": "#000000",
          "secondary": "#2d4fa1", // Lighter navy
          "secondary-content": "#ffffff",
          "accent": "#b8860b", // Darker gold
          "accent-content": "#ffffff",
          "neutral": "#1a202c",
          "neutral-content": "#ffffff",
          "base-100": "#0f1419", // Dark charcoal
          "base-200": "#1a202c",
          "base-300": "#2d3748",
          "base-content": "#e2e8f0",
          "info": "#3abff8",
          "info-content": "#000000",
          "success": "#16a34a",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#000000",
          "error": "#dc2626",
          "error-content": "#ffffff",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
        }
      },
      // Corporate Blue Themes
      {
        "corporate-blue-light": {
          "primary": "#1e40af", // Royal blue
          "primary-content": "#ffffff",
          "secondary": "#6b7280", // Silver gray
          "secondary-content": "#ffffff",
          "accent": "#0369a1", // Deep blue
          "accent-content": "#ffffff",
          "neutral": "#374151",
          "neutral-content": "#ffffff",
          "base-100": "#f8fafc", // Ice white
          "base-200": "#f1f5f9",
          "base-300": "#e2e8f0",
          "base-content": "#1f2937",
          "info": "#0ea5e9",
          "info-content": "#000000",
          "success": "#059669",
          "success-content": "#ffffff",
          "warning": "#d97706",
          "warning-content": "#000000",
          "error": "#dc2626",
          "error-content": "#ffffff",
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.25rem",
          "--rounded-badge": "1.9rem",
        },
        "corporate-blue-dark": {
          "primary": "#3b82f6", // Bright blue
          "primary-content": "#ffffff",
          "secondary": "#9ca3af", // Light gray
          "secondary-content": "#000000",
          "accent": "#0ea5e9", // Cyan blue
          "accent-content": "#ffffff",
          "neutral": "#1f2937",
          "neutral-content": "#ffffff",
          "base-100": "#0f172a", // Dark blue
          "base-200": "#1e293b",
          "base-300": "#334155",
          "base-content": "#e2e8f0",
          "info": "#0ea5e9",
          "info-content": "#000000",
          "success": "#059669",
          "success-content": "#ffffff",
          "warning": "#d97706",
          "warning-content": "#000000",
          "error": "#dc2626",
          "error-content": "#ffffff",
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.25rem",
          "--rounded-badge": "1.9rem",
        }
      },
      // Emerald Luxury Themes
      {
        "emerald-luxury-light": {
          "primary": "#047857", // Deep emerald
          "primary-content": "#ffffff",
          "secondary": "#92400e", // Rich bronze
          "secondary-content": "#ffffff",
          "accent": "#10b981", // Vibrant green
          "accent-content": "#000000",
          "neutral": "#365314", // Forest green
          "neutral-content": "#ffffff",
          "base-100": "#f0fdf4", // Mint cream
          "base-200": "#dcfce7",
          "base-300": "#bbf7d0",
          "base-content": "#1f2937",
          "info": "#0d9488",
          "info-content": "#ffffff",
          "success": "#16a34a",
          "success-content": "#ffffff",
          "warning": "#ca8a04",
          "warning-content": "#000000",
          "error": "#dc2626",
          "error-content": "#ffffff",
          "--rounded-box": "1.5rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "1.9rem",
        },
        "emerald-luxury-dark": {
          "primary": "#10b981", // Bright emerald
          "primary-content": "#000000",
          "secondary": "#b45309", // Light bronze
          "secondary-content": "#ffffff",
          "accent": "#047857", // Dark emerald
          "accent-content": "#ffffff",
          "neutral": "#1a2e05", // Dark forest
          "neutral-content": "#ffffff",
          "base-100": "#052e16", // Deep green
          "base-200": "#065f46",
          "base-300": "#047857",
          "base-content": "#d1fae5",
          "info": "#0d9488",
          "info-content": "#ffffff",
          "success": "#16a34a",
          "success-content": "#ffffff",
          "warning": "#ca8a04",
          "warning-content": "#000000",
          "error": "#dc2626",
          "error-content": "#ffffff",
          "--rounded-box": "1.5rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "1.9rem",
        }
      }
    ],
  },
}