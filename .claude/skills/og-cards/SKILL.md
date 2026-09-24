---
name: og-cards
description: Create or edit an OG card master SVG in src/content/og/ — the hand-editable 16:9 masters behind Open Graph PNGs, post covers, and the homepage masonry. Use when adding a card for a new post or page, or changing an existing one.
---

# OG card masters

Every card is a hand-editable 16:9 SVG master (1200×675, `viewBox="0 0 1200 675"`), exposed as the `og` content collection via a custom loader in `src/content.config.ts`. The `src/content/og/` folder mirrors the pages tree: `index.svg` (homepage card, served as `/og/site.png`), `now.svg`, `contact.svg`, `404.svg`, `legal/{page}.svg`, and `feed/{id}.svg` per post — plus `fallback.svg`, the shared card (served as `/og/fallback.png`) for any page or post without its own master.

A page without its own master shares `fallback.svg` (its own design — the build only fails if `fallback.svg` itself is missing). `index.svg` started as a materialized snapshot of the link-graph constellation; the generator code is gone, so it is now hand-kept like every other master.

## Design rules

- 3, 5, or 7 elements
- One accent family per card, in 200–700 shades
- No text
- Colors only from design tokens

Each master carries a `<desc>` element describing the composition — the loader surfaces it as `data.alt` and it becomes `og:image:alt`, `twitter:image:alt`, and the cover images' alt text, so keep it accurate when editing a card.

## One master, three outputs

1. **Inline SVG** — the homepage masonry and `/-/astro/brand/og/` inline the master directly (`set:html`), so cards can get CSS hover animations.
2. **Open Graph PNGs** — the static endpoint `src/pages/og/[...path].png.ts` derives `/og/{feed/{id}|now|site}.png` (1200×630, top/bottom crop) and `/og/square/...png` (1200×1200, ground extended — never cropped) via `toWideSvg`/`toSquareSvg` from `src/og/card.ts`, rasterized with `@resvg/resvg-js`. `BaseLayout` lists both ratios in the meta tags.
3. **Post/now covers** — `PostLayout`/`NowLayout` feed the master to `<Image format="webp" widths sizes>`; sharp rasterizes it (`image.dangerouslyProcessSVG: true` in `astro.config.mjs` — safe, only self-authored SVGs) into responsive webp for Google Discover.

## Required markers

The ratio transforms rewrite the master's dimension attributes, so **masters must keep the exact markers** `height="675" viewBox="0 0 1200 675"` and `<rect width="1200" height="675"` (the ground rect). Break these and the transforms silently produce wrong output.

Posts without a master use `fallback.svg` in the masonry and OG PNGs, and have no post cover. `/og/site.png` is always emitted (legacy redirects point at it) — from `index.svg`, or `fallback.svg` if that snapshot is ever deleted.

Preview everything at `/-/astro/brand/og/`.
