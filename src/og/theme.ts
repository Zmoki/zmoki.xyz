import { accents, neutrals } from "@/design-tokens.mjs";

// Theme for the abstract OG cards. All colors come from the design tokens.
// The cards draw on the ink ground, so cluster hues use the steps validated
// for the dark surface (jade needs the 700 step there).

const accentScales = accents as Record<string, Record<string, string>>;
const neutralTokens = neutrals as Record<string, string>;

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630; // 1.91:1 Open Graph wide
export const MASTER_HEIGHT = 675; // 16:9 SVG master (src/content/og)
export const SQUARE_SIZE = 1200; // 1:1 Open Graph square

// Creamy light ground (the zmoki surface token). The cluster palette is the
// light-surface set validated by the dataviz checks (jade needs 600+ there).
export const ground = neutralTokens["zmoki-surface"];

export const clusterHex: Record<string, string> = {
  tbilisi: accentScales["zmoki-flame"]["500"],
  garden: accentScales["zmoki-azure"]["500"],
  tech: accentScales["zmoki-jade"]["600"],
  mind: accentScales["zmoki-magenta"]["500"],
  page: neutralTokens["zmoki-muted"],
};

export const particleHex = accentScales["zmoki-azure"]["400"];
