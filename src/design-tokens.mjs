// Single source of truth for zmoki.xyz brand color tokens.
// Imported by tailwind.config.mjs (to generate utilities) and by the
// brand reference page at /-/brand/ (to document them). Keep this file
// free of Node-only APIs (no require) so it is safe to import anywhere.

export const colors = {
  // zmoki-azure: primary links, navigation, hero sections, ink (900)
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
  },
  // zmoki-flame: external links, Contact panel
  "zmoki-flame": {
    500: "#f24500",
  },
};
