/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: {
          light: '#f8f8f8',
          dark: '#0a0a0a',
        },
        text: {
          light: '#333333',
          dark: '#e5e5e5',
        },
        accent: {
          light: '#2563eb',
          dark: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
