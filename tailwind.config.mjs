/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  safelist: [
    // Copy button classes added dynamically in rehype plugin
    "relative",
    "absolute",
    "top-2",
    "right-2",
    "px-3",
    "py-1.5",
    "text-xs",
    "font-medium",
    "font-mono",
    "uppercase",
    "tracking-normal",
    "rounded-sm",
    "bg-zmoki-jade-500",
    "text-white",
    "hover:bg-zmoki-jade-500/80",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-zmoki-azure-500",
    "focus:ring-offset-2",
    "transition-colors",
    "duration-200",
  ],
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: {
            "--tw-prose-headings": "#001d2e",
            "--tw-prose-body": "#001d2e",
            "--tw-prose-bold": "#001d2e",
            "--tw-prose-links": "#0098f2",
            a: {
              "border-color": "currentColor",
              "border-bottom-width": "4px",
              "border-style": "dotted",
            },
            "[data-external]": {
              color: "#f24500",
            },
            "[data-resource]": {
              color: "#00f25a",
            },
            "[data-anchor]": {
              color: "#001d2e",
              "border-style": "dashed",
              "border-bottom-width": "2px",
            },
          },
        },
      }),
      fontFamily: {
        sans: ["Noto Sans", "system-ui", "sans-serif"],
        mono: ["Noto Sans Mono", "monospace"],
      },
      colors: {
        // zmoki-azure: primary links, navigation, hero sections
        "zmoki-azure": {
          200: "#b7e5ff",
          300: "#7ccfff",
          400: "#42b9ff",
          500: "#0098f2",
          600: "#0080cb",
          700: "#005b90",
          800: "#003655",
          900: "#001d2e",
          950: "#000407",
        },
        // zmoki-flame: external links, Contact sidebar
        "zmoki-flame": {
          500: "#f24500",
        },
        // zmoki-magenta: primary brand color (favicon, Author sidebar, highlights)
        "zmoki-magenta": {
          200: "#ffd6f3",
          400: "#ff5cc0",
          500: "#f20098",
          600: "#c10079",
          700: "#8f005a",
        },
        // zmoki-jade: resource links, action buttons
        "zmoki-jade": {
          500: "#00f25a",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
