import { colors as brandColors } from "./src/design-tokens.mjs";
import plugin from "tailwindcss/plugin";

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
            "--tw-prose-headings": brandColors["zmoki-ink"],
            "--tw-prose-body": brandColors["zmoki-ink"],
            "--tw-prose-bold": brandColors["zmoki-ink"],
            "--tw-prose-links": brandColors["zmoki-azure"][500],
            a: {
              "text-decoration": "none",
              "border-color": "currentColor",
              "border-bottom-width": "4px",
              "border-style": "dotted",
            },
            "[data-external]": {
              color: brandColors["zmoki-flame"][500],
            },
            "[data-resource]": {
              color: brandColors["zmoki-jade"][500],
            },
            "[data-anchor]": {
              color: brandColors["zmoki-ink"],
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
      // Brand color tokens live in src/design-tokens.mjs (single source
      // of truth, also consumed by the /-/astro/brand/ reference page).
      colors: brandColors,
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // Strip the default underline from links site-wide; per-context link
    // styling (prose colors, bento cards) is handled where it's used.
    plugin(({ addBase }) => {
      addBase({
        a: {
          "text-decoration": "none",
        },
      });
    }),
  ],
};
