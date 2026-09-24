# AGENTS.md — zmoki.xyz technical spec

> Canonical AI instructions for this project. CLAUDE.md imports this. Cursor and other tools read it directly.

---

## Project overview

Personal digital garden at `https://zmoki.xyz` — a living collection of posts, resources, and a now page by Zarema Khalilova (software engineer, contemporary artist, neurodivergent researcher).

Stack, scripts, and dependency versions: read `package.json`. CI steps: read `.github/workflows/ci.yml`.

Dev server default port is **4321**. When running multiple worktrees simultaneously, derive a stable per-worktree port with:

```bash
PORT=$(( 4300 + $(echo "$PWD" | cksum | cut -d' ' -f1) % 100 ))
```

Project skills in `.claude/skills/`: `/run` launches the app, `/new-post` drafts a feed post, `/pins` drafts Pinterest pins for a post, `/og-cards` creates or edits an OG card master.

---

## Type checking & linting

**Type check** — `npm run check` runs `astro check`, which wraps the TypeScript language server and handles `.astro` files correctly. **Plain `tsc` does not** — don't reach for it.

Conventions beyond what `eslint.config.mjs` enforces:

- Prefix intentionally unused function params/vars with `_` to satisfy `no-unused-vars`
- Vendor scripts (e.g. `posthog.astro`) use `/* eslint-disable */` inline

---

## Formatting

**Always format before committing** (`npm run format`). Tailwind class order is enforced by `prettier-plugin-tailwindcss` — **do not reorder classes manually**.

Markdown prose is never reflowed (`proseWrap: preserve` for `.md`/`.mdx`).

---

## Tailwind setup

Tailwind 4 runs through the `@tailwindcss/vite` plugin (configured in `astro.config.mjs`; **there is no `@astrojs/tailwind` integration** — don't add one or look for its config). The CSS entry is `src/styles/global.css`, imported by `BaseLayout.astro` and `BrandLayout.astro`; it pulls in Tailwind and loads the legacy-format JS config via `@config "../../tailwind.config.mjs"`. Theme values, plugins (`@tailwindcss/typography`, custom prose overrides), and the `zmoki-*` palette stay in `tailwind.config.mjs`, fed by `src/design-tokens.mjs`.

---

## Content collections (`src/content.config.ts`)

Schemas live in `src/content.config.ts` — read them there. Collections: `feed` (blog posts), `resources`, `legal`, `pins`, and `og` (OG card SVG masters).

Gotchas the schemas don't tell you:

- Collections use the Astro Content Layer API. Entry identifiers are **`entry.id`** (filename without extension) and rendering uses **`render(entry)`** from `astro:content` — there is **no `entry.slug` / `entry.render()`**.
- Feed post files are `src/content/feed/{order}-{slug}.mdx` (most) or `.md`. `order` doubles as the sort key (higher = newer).
- **Whenever you edit content in any collection file (`feed`, `resources`, `legal`), bump `contentModifiedDate` to today's date.**
- `pins` is one YAML file per feed post, `src/content/pins/{post id}.yaml`. A pin's number is its 1-based position in the list and is baked into `/pin/feed/{post id}/{n}.png` and the `pinterest.xml` guid. **Append only**: never reorder, renumber, or delete pins, or Pinterest will re-publish them. Draft pins with `/pins`.
- The `og` collection loads `src/content/og/**/*.svg` through a custom loader (`{ id, data: { svg, alt } }`); ids are relative paths without extension (`index`, `now`, `feed/1-about-me`). See `/og-cards`.

---

## URL structure

Routes are in `src/pages/`. Two that aren't obvious from the tree:

- `/-/astro/*` — internal brand/design-system pages (`color`, `links`, `og`, `pins`) plus `/-/astro/health`. Noindexed via `public/_headers`.
- Removed URLs redirect via `public/_redirects`: `/tech/` → post 18, `/garden/` → `/`.

---

## Layouts

Props are in each layout file. What the source won't tell you:

- `BaseLayout.astro` — body is `TopNav` → `<slot />` → `Footer`. **No sidebars.** OG images mirror the pathname: `/og/{trimmed pathname}.png` when the page has its own card master, `/og/site.png` for the homepage, `/og/fallback.png` otherwise — each listed in both the wide and `/og/square/` ratio.
- `PostLayout.astro` — split header, left-aligned prose at `max-w-2xl`. **No cards, no prev/next navigation** (deliberate; don't add them back).
- `LegalLayout.astro` / `NowLayout.astro` follow the same de-carded pattern. `ResourceLayout.astro` still follows the older card style.
- `BrandLayout.astro` — standalone single-column canvas for `/-/astro/brand/`, no chrome, sets `noindex`.

### Post content layout helpers

Defined in a global style in `PostLayout`, active from the `xl` breakpoint:

- `post-right` — floats an element into a 28rem right rail beside the text (e.g. `<PostImage class="post-right" ...>`); consecutive ones stack.
- `post-full` — stretches an element across text column + rail (72rem), for wide tables/images.
- `Split.astro` — 50/50 two-column block at the `post-full` width, via `<Fragment slot="left">` / `<Fragment slot="right">`; stacks below `xl`.

See post 16 for both patterns.

---

## Color system

All colors are tokens defined in **`src/design-tokens.mjs`** — the single source of truth, imported by both `tailwind.config.mjs` (to generate utilities) and the brand reference page. Templates use `zmoki-*` utility classes only; **no inline hex**. Live reference: `/-/astro/brand/color/`.

Roles, so you pick the right family: `zmoki-azure` primary (links, nav, hero), `zmoki-magenta` brand signature, `zmoki-jade` resources & actions, `zmoki-flame` external links, `zmoki-lemon` highlight. Neutrals: `zmoki-bg`, `zmoki-surface`, `zmoki-ink`, `zmoki-muted`. Supporting greys use Tailwind `slate-*` directly.

Prose typography overrides are set in `tailwind.config.mjs` and keyed off the data attributes the rehype plugins add (`[data-external]` → flame, `[data-resource]` → jade, `[data-anchor]` → ink).

---

## Custom Astro/Markdown pipeline (`astro.config.mjs`)

**Astro 7's default markdown processor is Sätteri (Rust); this project deliberately stays on the unified (remark/rehype) pipeline** via `markdown.processor: unified({...})` from `@astrojs/markdown-remark` so the custom rehype plugins keep working. Don't "modernize" this away.

The three custom plugins (`rehypeDefinitionListIds`, `rehypeExternalLinks`, `rehypeCodeBlockCopy`) are defined inline in `astro.config.mjs`. `rehypeExternalLinks` adds the `data-external` / `data-resource` / `data-anchor` attributes that drive the prose color overrides above. Copy-button click logic lives in the `PostLayout.astro` client script, not in the plugin.

Also uses `remark-definition-list` for `<dl>`/`<dt>`/`<dd>` support in MDX.

---

## Deploy & infrastructure

**Hosting:** Cloudflare Pages, connected to the GitHub repo `Zmoki/zmoki.xyz`.

**Production branch:** `main` — every push to `main` triggers a Cloudflare Pages deploy. No preview branches.

**Infrastructure as code:** Cloudflare account, DNS zones (including `zmoki.xyz`), and Pages config are managed via Terraform in a separate repo:

- GitHub: `https://github.com/Zmoki/my-infrastructure`
- Local path: `~/Projects/Zmoki/my-infrastructure/`

**If DNS, zone settings, or Cloudflare Pages project config need changing, edit the Terraform config in that repo — not the Cloudflare dashboard directly.**

Two exceptions, both edited directly in this repo (**not** Terraform):

- **`public/_headers`** — HTTP response headers per URL pattern (noindex rules, CSP, Permissions-Policy).
- **`public/_redirects`** — URL redirects. Format: `<from> <to> <status>`.

---

## Environment variables

**Source of truth: `src/env.d.ts`** — all `PUBLIC_*` env vars must be declared there first. `.env.example` must mirror it (same keys, no values).

When adding a new env var: add it to `src/env.d.ts` first, then add it to `.env.example` with an empty value and a comment. The CI build step needs the corresponding GitHub secrets set.

---

## Content images

Images for posts and pages live in `src/images/`.

**Optimization workflow (macOS Automator):** Drop an image into `src/images/tmp/` → ImageOptim picks it up automatically, optimizes it, and saves the result to `src/images/`. **Never commit images directly to `src/images/` without going through this pipeline first.**

Do not commit anything from `src/images/tmp/` — it's a staging folder.

---

## OG images and Pinterest pins

Both are build-time rendered from the hand-editable SVG masters in `src/content/og/`.

- Creating or editing a card master: use `/og-cards`. Masters must keep the exact markers `height="675" viewBox="0 0 1200 675"` and `<rect width="1200" height="675"` or the ratio transforms break.
- Drafting pins: use `/pins`. Append only — see the `pins` note under Content collections.
