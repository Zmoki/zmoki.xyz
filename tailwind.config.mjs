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
          light: '#F9FAFF',
          dark: '#051543',
        },
        text: {
          light: '#051543',
          dark: '#F9FAFF',
        },
        accent: {
          light: '#EF1399',
          dark: '#EF1399',
        }
      }
    },
  },
  plugins: [],
}
