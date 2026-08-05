// Single source of truth for zmoki.xyz brand color tokens.
// Imported by tailwind.config.mjs (to generate utilities) and by the
// brand reference page at /-/astro/brand/ (to document them). Keep this file
// free of Node-only APIs (no require) so it is safe to import anywhere.

// Accent families — the expressive brand colors. Each has a -500 base.
export const accents = {
  // zmoki-azure: primary links, navigation, hero sections, ink (900)
  "zmoki-azure": {
    50: "#f2fbff",
    100: "#def3ff",
    200: "#a4ddff",
    300: "#69c8ff",
    400: "#2eb2ff",
    500: "#0099f2",
    600: "#0074b7",
    700: "#005b90",
    800: "#003655",
    900: "#001d2e",
    950: "#000407",
  },
  // zmoki-magenta: brand signature (favicon, Author panel, highlights)
  "zmoki-magenta": {
    50: "#fff2fb",
    100: "#ffdef6",
    200: "#ffa4e5",
    300: "#ff69d4",
    400: "#ff2ec3",
    500: "#f200ad",
    600: "#b70083",
    700: "#7c0059",
    800: "#41002f",
    900: "#2e0021",
    950: "#070005",
  },
  // zmoki-jade: resource links, action buttons
  "zmoki-jade": {
    50: "#f3fef6",
    100: "#e0fee8",
    200: "#95fab2",
    300: "#5df889",
    400: "#25f660",
    500: "#0ae949",
    600: "#08c33d",
    700: "#068b2c",
    800: "#034014",
    900: "#022d0e",
    950: "#181b19ff",
  },
  // zmoki-flame: external links, Contact panel
  "zmoki-flame": {
    50: "#fff6f2",
    100: "#ffe8de",
    200: "#ffbea4",
    300: "#ff9469",
    400: "#ff692e",
    500: "#f24500",
    600: "#de3f00",
    700: "#a42f00",
    800: "#551800",
    900: "#2e0d00",
    950: "#070200",
  },
  // zmoki-lemon: highlight / marker behind headings (404, callouts)
  "zmoki-lemon": {
    50: "#fff6f2",
    100: "#fffae2",
    200: "#fef4bb",
    300: "#feed95",
    400: "#fde76e",
    500: "#fde047",
    600: "#fdd920",
    700: "#dfbc02",
    800: "#927b02",
    900: "#312901",
    950: "#0a0800",
  },
};

// Neutrals — the structural palette. Flat single values, one per role.
export const neutrals = {
  "zmoki-bg": "#ff692e", // page background (mirrors zmoki-azure-200)
  "zmoki-surface": "#fff2ed", // cards & panels (55% opacity of zmoki-flame-100)
  "zmoki-ink": "#001d2e", // primary text (mirrors zmoki-azure-900)
  "zmoki-muted": "#475569", // muted / meta text
};

// Merged map consumed by Tailwind.
export const colors = {
  ...accents,
  ...neutrals,
};
