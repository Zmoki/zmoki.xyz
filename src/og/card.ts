import { getCollection } from "astro:content";
import { OG_WIDTH as W, MASTER_HEIGHT as H, OG_HEIGHT, SQUARE_SIZE } from "./theme";

// Abstract OG cards on a creamy ground. Every card is a hand-editable 16:9
// SVG master in src/content/og/{id}.svg (1200×675, viewBox "0 0 1200 675");
// pages without their own master share the hand-designed fallback master
// (fallback.svg). This module keeps the viewBox transforms that produce the
// Open Graph ratios from a master.

// ---------------------------------------------------------------------------
// Ratio transforms. They rewrite the master's dimension attributes and
// ground rect, so masters must keep the exact markers
// `height="675" viewBox="0 0 1200 675"` and `<rect width="1200" height="675"`.
// A master that lost a marker (e.g. re-saved by a vector editor that
// reordered attributes) fails the build instead of shipping a wrong-sized
// card.
// ---------------------------------------------------------------------------

const mustReplace = (svg: string, marker: string, replacement: string): string => {
  if (!svg.includes(marker)) {
    throw new Error(
      `OG card master is missing the expected marker \`${marker}\` — ` +
        `keep the dimension attributes and ground rect exactly as the other masters have them.`,
    );
  }
  return svg.replace(marker, replacement);
};

// 1.91:1 (1200×630): crop the master evenly top and bottom.
export const toWideSvg = (svg: string): string => {
  const crop = (H - OG_HEIGHT) / 2;
  return mustReplace(
    svg,
    `height="${H}" viewBox="0 0 ${W} ${H}"`,
    `height="${OG_HEIGHT}" viewBox="0 ${crop} ${W} ${OG_HEIGHT}"`,
  );
};

// 1:1 (1200×1200): extend the ground evenly above and below the composition.
export const toSquareSvg = (svg: string): string => {
  const pad = (SQUARE_SIZE - H) / 2;
  return mustReplace(
    mustReplace(
      svg,
      `height="${H}" viewBox="0 0 ${W} ${H}"`,
      `height="${SQUARE_SIZE}" viewBox="0 -${pad} ${W} ${SQUARE_SIZE}"`,
    ),
    `<rect width="${W}" height="${H}"`,
    `<rect y="-${pad}" width="${W}" height="${SQUARE_SIZE}"`,
  );
};

// All card masters as id → svg ("index", "now", "fallback", "feed/{id}").
export async function cardMap(): Promise<Map<string, string>> {
  const cards = await getCollection("og");
  return new Map(cards.map((card) => [card.id, card.data.svg]));
}
