/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: {
            "--tw-prose-headings": "#001d2e",
            "--tw-prose-body": "#001d2e",
            "--tw-prose-bold": "#001d2e",
            "--tw-prose-links": "#1a9eec",
            a: {
              "border-color": "currentColor",
              "border-bottom-width": "4px",
              "border-style": "dotted",
            },
          },
        },
      }),
      fontFamily: {
        sans: ["Inter Tight", "system-ui", "sans-serif"],
      },
      colors: {
        myblue: {
          200: "#b7e5ff",
          300: "#7ccfff",
          400: "#42b9ff",
          500: "#07a3ff",
          600: "#0080cb",
          700: "#005b90",
          800: "#003655",
          900: "#001d2e",
          950: "#000407",
        },
        myorange: {
          500: "#ff8035",
        },
        mypink: {
          200: "#ffdefb",
          400: "#ff68ed",
          500: "#ff2de6",
          600: "#f100d5",
          700: "#ca00b2",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
