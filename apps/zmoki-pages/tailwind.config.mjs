/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Tight", "system-ui", "sans-serif"],
        serif: ["Noto Serif", "serif"],
      },
      colors: {
        background: {
          light: "#F9FAFF",
          dark: "#051543",
        },
        text: {
          light: "#002027",
          dark: "#F9FAFF",
        },
        accent: {
          light: "#00c0eb",
          dark: "#00c0eb",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
