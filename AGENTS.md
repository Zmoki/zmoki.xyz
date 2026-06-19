# AGENTS.md — zmoki.xyz technical spec

> Canonical AI instructions for this project. CLAUDE.md imports this. Cursor and other tools read it directly.

---

## Project overview

Personal digital garden at `https://zmoki.xyz` — a living collection of posts, resources, and a now page by Zarema Khalilova (software engineer, contemporary artist, neurodivergent researcher).

---

## Tech stack

| Layer               | Tool                                                           | Version      |
| ------------------- | -------------------------------------------------------------- | ------------ |
| Framework           | Astro                                                          | ^5.16        |
| Language            | TypeScript                                                     | via Astro    |
| Styling             | Tailwind CSS + @tailwindcss/typography                         | ^3           |
| Content             | MDX via @astrojs/mdx                                           | —            |
| Fonts               | Noto Sans, Noto Sans Mono                                      | Google Fonts |
| Analytics           | PostHog                                                        | posthog-js   |
| Email/Forms         | Brevo                                                          | —            |
| OG images           | Puppeteer (script)                                             | —            |
| RSS                 | @astrojs/rss                                                   | —            |
| Syntax highlighting | Shiki, theme: `catppuccin-latte`                               | —            |
| Performance         | Lighthouse CI (@lhci/cli)                                      | —            |
| Formatting          | Prettier + prettier-plugin-astro + prettier-plugin-tailwindcss | —            |

Dev server default port is **4321**. When running multiple worktrees simultaneously, derive a stable per-worktree port with:

```bash
PORT=$(( 4300 + $(echo "$PWD" | cksum | cut -d' ' -f1) % 100 ))
```

A project run skill is at `.claude/skills/run/SKILL.md` — use `/run` to launch the app.

---

## Scripts

```
npm run dev              # dev server
npm run build            # production build
npm run og:generate      # generate OG images via Puppeteer
npm run build:full       # build + og:generate
npm run timeline:feed    # generate feed-timeline.csv
npm run lhci:mobile      # Lighthouse CI mobile
npm run lhci:desktop     # Lighthouse CI desktop
npm run format           # Prettier format all files
npm run format:check     # Prettier check (used in CI)
npm run check            # TypeScript type check (astro check)
npm run lint             # ESLint
```

## CI

GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push and PR to `main`:

1. **Format check** — `npm run format:check`
2. **Type check** — `npm run check`
3. **Lint** — `npm run lint`
4. **Build** — `npm run build`

Required GitHub secrets for the build step: `PUBLIC_POSTHOG_PROJECT_TOKEN`, `PUBLIC_POSTHOG_HOST`, `PUBLIC_BREVO_ACCOUNT_ID`, `PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`.

A separate `lighthouse.yml` workflow runs Lighthouse CI after every push to `main`.

---

## Type checking & linting

**Type check** — `npm run check` runs `astro check`, which wraps the TypeScript language server and handles `.astro` files correctly (plain `tsc` does not).

**Linting** — `npm run lint` runs ESLint with:

- `eslint-plugin-astro` — Astro-specific rules
- `@typescript-eslint` — TypeScript rules

Config: `eslint.config.mjs`. Ignores: `dist/`, `.astro/`, `node_modules/`, `.claude/`.

Conventions:

- Prefix intentionally unused function params/vars with `_` to satisfy `no-unused-vars`
- Vendor scripts (e.g. `posthog.astro`) use `/* eslint-disable */` inline

---

## Formatting

Prettier is configured in `.prettierrc` with two plugins:

- **`prettier-plugin-astro`** — parses `.astro` files
- **`prettier-plugin-tailwindcss`** — sorts Tailwind classes automatically

Key rules:

- `.md` / `.mdx` files: `proseWrap: preserve` (don't reflow markdown prose)
- `.astro` files: use the `astro` parser

Run formatter:

```bash
npm run format
```

**Always format before committing.** Tailwind class order is enforced by the plugin — do not reorder classes manually.

---

## Content collections (`src/content/config.ts`)

### `feed` — blog posts

```ts
{
  order: number; // sort order (higher = newer), used for prev/next nav
  title: string;
  description: string;
  publishDate: Date;
  contentModifiedDate: Date;
}
```

Files: `src/content/feed/{order}-{slug}.mdx` (most) or `.md`

> **Rule:** whenever you edit content in any collection file (`feed`, `resources`, `legal`), bump `contentModifiedDate` to today's date.

### `resources` — downloadable resources and external links

```ts
{
  type: "page" | "link"
  name: string            // short display name
  title: string
  description: string
  url?: string            // for type: "link"
  publishDate: Date
  contentModifiedDate: Date
  order: number
  form?: {                // optional Brevo email form
    brevoFormId: string
    buttonText: string
    title: string
    description: string
  }
  platform?: {
    name: string
    title: string
    description: string
  }
}
```

### `legal` — privacy, terms

```ts
{
  title: string;
  description: string;
  publishDate: Date;
  contentModifiedDate: Date;
}
```

---

## URL structure

```
/                        # index: all feed posts
/feed/{slug}/            # individual post (PostLayout)
/resources/{slug}/       # resource page (ResourceLayout)
/legal/{slug}/           # privacy, terms (LegalLayout)
/now/                    # now page (NowLayout)
/thank-you/{slug}/       # post-form confirmation pages
/rss.xml                 # RSS feed
/sitemap.xml             # sitemap
/og-images/              # generated OG images (public/)
/-/astro/health          # health check — returns "ok" + short commit hash
/-/astro/brand/          # brand design system home (internal, noindex)
/-/astro/brand/color/    # color palette reference (BrandLayout)
```

---

## Layouts

### `BaseLayout.astro`

Props:

```ts
{
  title: string
  description?: string        // default: "A digital garden of ideas, art, and research"
  publishDate?: Date
  contentModifiedDate?: Date
  showRecentPosts?: boolean   // default: true — shows 3 latest posts in sidebar
  accentColor?: "gray" | "blue" | "green" | "orange" | "pink"
}
```

Two-column desktop grid (`lg:grid-cols-[29%_71%]`), 7 rows. Left column: header → Author sidebar → Resources sidebar → Contact sidebar → Recent posts sidebar → accent bar → footer. Right column: `<main>` spans all 7 rows.

Sets `<html lang="en">`, loads Google Fonts, meta/OG tags, PostHog, canonical URL. OG images are served from `/og-images{pathname}wide.jpg` (or `/og-images/wide.jpg` for non-articles).

### `PostLayout.astro`

Wraps `BaseLayout` with `accentColor="blue"`. Props: `title`, `description`, `publishDate`, `contentModifiedDate`, `prevPost?`, `nextPost?`. Shows article header with publish/modified dates, prose content, author bio, prev/next navigation.

### `ResourceLayout.astro`, `LegalLayout.astro`, `NowLayout.astro`

Exist but follow the same `BaseLayout` wrapper pattern.

### `BrandLayout.astro`

Standalone layout for the internal brand pages under `/-/astro/brand/`. Like `BaseLayout` but **without** the sidebars/header/footer chrome — a single-column canvas. Sets `noindex`, loads the same fonts, uses `bg-zmoki-bg` / `text-zmoki-ink`. Props: `title`, `description?`.

---

## Color system

All colors are tokens defined in **`src/design-tokens.mjs`** — the single source of truth, imported by both `tailwind.config.mjs` (to generate utilities) and the brand reference page. Templates use `zmoki-*` utility classes only; **no inline hex**. Live reference: `/-/astro/brand/color/`.

### Accent families (`zmoki-*`)

| Token           | Base    | Role                                                                |
| --------------- | ------- | ------------------------------------------------------------------- |
| `zmoki-azure`   | #0098f2 | Primary — links, nav, hero. Full 200–950 scale; 900 (#001d2e) = ink |
| `zmoki-magenta` | #f20098 | Brand signature — favicon, Author panel, highlights (200/400–700)   |
| `zmoki-jade`    | #00f25a | Resources & actions — resource links, form/copy buttons             |
| `zmoki-flame`   | #f24500 | External — outbound links, Contact panel                            |
| `zmoki-lemon`   | #fde047 | Highlight — marker behind headings (404, callouts)                  |

### Neutrals (single-value tokens)

| Token           | Hex     | Role                                   |
| --------------- | ------- | -------------------------------------- |
| `zmoki-bg`      | #e2e8f0 | Page background                        |
| `zmoki-surface` | #f8fafc | Cards & panels (the one surface color) |
| `zmoki-ink`     | #001d2e | Primary text (mirrors zmoki-azure-900) |
| `zmoki-muted`   | #475569 | Meta / secondary text                  |

Supporting greys use Tailwind `slate-*` directly: borders, dark panels (`slate-700`), code-block bg (`slate-900`), and inverse light text (`slate-50` on colored panels). The header logo scrim keeps `bg-white/10`.

### `accentColor` prop

`BaseLayout` accepts `accentColor: "gray" | "blue" | "green" | "orange" | "pink"`, mapping to `slate` / `zmoki-azure` / `zmoki-jade` / `zmoki-flame` / `zmoki-magenta` for the article accent bar and go-to-top hover.

### Prose typography overrides

Set in `tailwind.config.mjs`, referencing the design tokens:

- Headings/body/bold: `zmoki-ink`
- Links: `zmoki-azure-500`, dotted bottom border 4px
- `[data-external]` links: `zmoki-flame-500`
- `[data-resource]` links: `zmoki-jade-500`
- `[data-anchor]` links: `zmoki-ink`, dashed bottom border 2px

---

## Custom Astro/Markdown pipeline (`astro.config.mjs`)

Three custom rehype plugins applied to all MDX/Markdown content:

1. **`rehypeDefinitionListIds`** — adds `id` attribute (slugified text) to every `<dt>` element, enabling anchor links to glossary terms.

2. **`rehypeExternalLinks`** — adds `target="_blank"` + `rel="noopener noreferrer"` + `data-external="true"` to `http://`, `https://`, and `mailto:` links; adds `data-resource="true"` to `/resources/` links; adds `data-anchor="true"` to `#` anchor links. These attributes drive Tailwind prose color overrides.

3. **`rehypeCodeBlockCopy`** — wraps every `<pre><code>` block in a `<div class="relative">` and injects a "Copy" button (`data-copy-button="true"`). Button copy logic is in `PostLayout.astro` client script.

Also uses `remark-definition-list` for `<dl>`/`<dt>`/`<dd>` support in MDX.

---

## Analytics events (PostHog)

| Event                     | Where fired              | Properties                      |
| ------------------------- | ------------------------ | ------------------------------- |
| `contact_email_clicked`   | BaseLayout inline script | `email`                         |
| `post_navigation_clicked` | PostLayout inline script | `direction`, `destination_slug` |
| `code_block_copied`       | PostLayout inline script | `snippet_length`                |

PostHog captures all listed events plus pageviews automatically.

---

## Components

| Component            | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `BaseLayout.astro`   | Shell: grid, meta, sidebars, analytics            |
| `PostLayout.astro`   | Blog post wrapper                                 |
| `PostCard.astro`     | Post list item on index page                      |
| `PostImage.astro`    | Image with caption in posts                       |
| `RawVideo.astro`     | Video embed                                       |
| `Video.astro`        | Video with controls                               |
| `BrevoForm.astro`    | Email signup form (Brevo)                         |
| `ResourceLink.astro` | Renders a resource link in sidebar/resource pages |
| `Time.astro`         | Renders `<time>` element with formatted date      |
| `posthog.astro`      | PostHog init script (injected in `<head>`)        |

---

## Deploy & infrastructure

**Hosting:** Cloudflare Pages, connected to the GitHub repo `Zmoki/zmoki.xyz`.

**Production branch:** `main` — every push to `main` triggers a Cloudflare Pages deploy. No preview branches.

**Infrastructure as code:** Cloudflare account, DNS zones (including `zmoki.xyz`), and Pages config are managed via Terraform in a separate repo:

- GitHub: `https://github.com/Zmoki/my-infrastructure`
- Local path: `~/Projects/Zmoki/my-infrastructure/`

If DNS, zone settings, or Cloudflare Pages project config need changing, edit the Terraform config in that repo — not the Cloudflare dashboard directly.

**`public/_headers`** — HTTP response headers applied by Cloudflare Pages per URL pattern. Current rules:

- `/-/astro/*` and `/thank-you/*` — `X-Robots-Tag: noindex`
- `/*` — `Content-Security-Policy` and `Permissions-Policy`

Edit this file directly for header changes (not Terraform).

**`public/_redirects`** — URL redirects handled by Cloudflare Pages. Format: `<from> <to> <status>`. Current entries are legacy slug redirects (301) and one external resource redirect (302).

Edit this file directly for redirect changes (not Terraform).

---

## Environment variables

**Source of truth: `src/env.d.ts`** — all `PUBLIC_*` env vars must be declared here first. `.env.example` must mirror it (same keys, no values).

Current variables:

| Variable                               | Required | Purpose                                    |
| -------------------------------------- | -------- | ------------------------------------------ |
| `PUBLIC_POSTHOG_PROJECT_TOKEN`         | No       | PostHog analytics token                    |
| `PUBLIC_POSTHOG_HOST`                  | No       | PostHog host URL                           |
| `PUBLIC_ANALYTICS_ENABLED`             | No       | Set to `"false"` to disable PostHog in dev |
| `PUBLIC_BREVO_ACCOUNT_ID`              | No       | Brevo email form integration               |
| `PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | No       | Cloudflare Turnstile bot protection        |

When adding a new env var: add it to `src/env.d.ts` first, then add it to `.env.example` with an empty value and a comment.

---

## Content images

Images for posts and pages live in `src/images/`.

**Optimization workflow (macOS Automator):** Drop an image into `src/images/tmp/` → ImageOptim picks it up automatically, optimizes it, and saves the result to `src/images/`. Never commit images directly to `src/images/` without going through this pipeline first.

Do not commit anything from `src/images/tmp/` — it's a staging folder.

---

## OG image generation

`scripts/generate-og-images.mjs` uses Puppeteer to screenshot pages at 1200×675 and save to `public/og-images/`. Run after build: `npm run og:generate` or `npm run build:full`.

OG images are wide JPEGs (1200×675). BaseLayout constructs the URL as `/og-images{pathname}wide.jpg`.
