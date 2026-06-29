// Single source of truth for zmoki.xyz brand color tokens.
// Imported by tailwind.config.mjs (to generate utilities) and by the
// brand reference page at /-/astro/brand/ (to document them). Keep this file
// free of Node-only APIs (no require) so it is safe to import anywhere.

// Accent families — the expressive brand colors. Each has a -500 base.
export const accents = {
  // zmoki-azure: primary links, navigation, hero sections, ink (900)
  "zmoki-azure": {
    50: "#f2faff",
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
  // zmoki-magenta: brand signature (favicon, Author panel, highlights)
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
    600: "#00cb4b",
  },
  // zmoki-flame: external links, Contact panel
  "zmoki-flame": {
    500: "#f24500",
  },
  // zmoki-lemon: highlight / marker behind headings (404, callouts)
  "zmoki-lemon": {
    500: "#fde047",
  },
};

// Neutrals — the structural palette. Flat single values, one per role.
export const neutrals = {
  "zmoki-bg": "#b7e5ff", // page background (mirrors zmoki-azure-200)
  "zmoki-surface": "#f2faff", // cards & panels (mirrors zmoki-azure-50)
  "zmoki-ink": "#001d2e", // primary text (mirrors zmoki-azure-900)
  "zmoki-muted": "#475569", // muted / meta text
};

// Merged map consumed by Tailwind.
export const colors = {
  ...accents,
  ...neutrals,
};
