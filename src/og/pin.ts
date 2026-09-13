import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { neutrals } from "@/design-tokens.mjs";
import { OG_WIDTH as W, MASTER_HEIGHT as H, PIN_WIDTH, PIN_HEIGHT } from "./theme";

// Pinterest pin images (1000×1500, 2:3) derived from the OG card masters.
// "Band" layout: the headline in Noto Sans Bold at the top and the master's
// composition scaled into the middle. No site mark: the pin links to the
// claimed domain and Pinterest shows it. Everything stays inside
// Pinterest's 50px safe zone.

const GROUND = neutrals["zmoki-surface"];
const INK = neutrals["zmoki-ink"];

const MARGIN = 80;
const HEADLINE_SIZE = 84;
const HEADLINE_LINE_HEIGHT = 100;
const HEADLINE_TOP = 200; // baseline of the first line
const HEADLINE_MAX_LINES = 3;
const HEADLINE_MAX_CHARS = 19; // per line at 84px Noto Sans Bold, ~840px wide

// The master scaled to fit the pin width minus a small inset; vertically
// centered below the headline block.
const ART_WIDTH = PIN_WIDTH - 2 * 20;
const ART_HEIGHT = (ART_WIDTH * H) / W;
const ART_TOP = 600;

// The font file resvg renders the text with (the site font, OFL licensed).
// Resolved from the project root, not import.meta.url: the bundled module
// lives elsewhere at build time, and resvg silently draws no text when the
// font is missing, so the path is checked here instead.
export const pinFontFile = resolve(process.cwd(), "src/og/fonts/NotoSans-Bold.ttf");
if (!existsSync(pinFontFile)) {
  throw new Error(
    `Pin font not found at ${pinFontFile}; the build must run from the project root.`,
  );
}

// Greedy word wrap for the headline. Explicit newlines are kept as line
// breaks. Throws when the text needs more than three lines, so an
// unreadable pin fails the build instead of shipping.
export const wrapHeadline = (
  text: string,
  maxChars = HEADLINE_MAX_CHARS,
  maxLines = HEADLINE_MAX_LINES,
): string[] => {
  const lines: string[] = [];
  for (const paragraph of text.trim().split(/\n/)) {
    let line = "";
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      if (word.length > maxChars) {
        throw new Error(`Pin headline word "${word}" is longer than ${maxChars} characters.`);
      }
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > maxChars) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  if (lines.length === 0) throw new Error("Pin headline is empty.");
  if (lines.length > maxLines) {
    throw new Error(
      `Pin headline "${text}" wraps to ${lines.length} lines; ${maxLines} is the maximum. ` +
        `Shorten it or break it with explicit newlines.`,
    );
  }
  return lines;
};

const escapeXml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The master's drawing without its outer <svg> element and <desc>, so it can
// be nested at another size. The master's own ground rect stays; it matches
// the pin ground.
const innerOf = (masterSvg: string): string => {
  const open = masterSvg.indexOf(">", masterSvg.indexOf("<svg"));
  const close = masterSvg.lastIndexOf("</svg>");
  if (open === -1 || close === -1) throw new Error("OG card master is not an <svg> document.");
  return masterSvg
    .slice(open + 1, close)
    .replace(/<desc>[\s\S]*?<\/desc>/, "")
    .trim();
};

export const toPinSvg = (masterSvg: string, { headline }: { headline: string }): string => {
  const lines = wrapHeadline(headline);
  const text = lines
    .map(
      (line, i) =>
        `<text x="${MARGIN}" y="${HEADLINE_TOP + i * HEADLINE_LINE_HEIGHT}" ` +
        `font-family="Noto Sans" font-weight="700" font-size="${HEADLINE_SIZE}" ` +
        `fill="${INK}">${escapeXml(line)}</text>`,
    )
    .join("\n  ");
  const artTop = ART_TOP + (lines.length < HEADLINE_MAX_LINES ? 0 : HEADLINE_LINE_HEIGHT / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 ${PIN_WIDTH} ${PIN_HEIGHT}">
  <rect width="${PIN_WIDTH}" height="${PIN_HEIGHT}" fill="${GROUND}" />
  ${text}
  <svg x="${(PIN_WIDTH - ART_WIDTH) / 2}" y="${artTop}" width="${ART_WIDTH}" height="${ART_HEIGHT}" viewBox="0 0 ${W} ${H}">
    ${innerOf(masterSvg)}
  </svg>
</svg>`;
};
