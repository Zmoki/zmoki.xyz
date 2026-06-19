# AGENTS.md — zmoki.xyz technical spec

> Canonical AI instructions for this project. CLAUDE.md imports this. Cursor and other tools read it directly.

---

## Project overview

Personal digital garden at `https://zmoki.xyz` — a living collection of posts, resources, and a now page by Zarema Khalilova (software engineer, contemporary artist, neurodivergent researcher).

---

## Tech stack

| Layer | Tool | Version |
|-------|------|---------|
| Framework | Astro | ^5.16 |
| Language | TypeScript | via Astro |
| Styling | Tailwind CSS + @tailwindcss/typography | ^3 |
| Content | MDX via @astrojs/mdx | — |
| Fonts | Noto Sans, Noto Sans Mono | Google Fonts |
| Analytics | PostHog + Plausible | posthog-js, @plausible-analytics/tracker |
| Email/Forms | Brevo | — |
| OG images | Puppeteer (script) | — |
| RSS | @astrojs/rss | — |
| Syntax highlighting | Shiki, theme: `catppuccin-latte` | — |
| Performance | Lighthouse CI (@lhci/cli) | — |
| Formatting | Prettier + prettier-plugin-astro + prettier-plugin-tailwindcss | — |

Dev server runs on port **4321**.

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
```

---

## Content collections (`src/content/config.ts`)

### `feed` — blog posts

```ts
{
  order: number           // sort order (higher = newer), used for prev/next nav
  title: string
  description: string
  publishDate: Date
  contentModifiedDate: Date
}
```

Files: `src/content/feed/{order}-{slug}.mdx` (most) or `.md`

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
  title: string
  description: string
  publishDate: Date
  contentModifiedDate: Date
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

Sets `<html lang="en">`, loads Google Fonts, meta/OG tags, PostHog, Plausible, canonical URL. OG images are served from `/og-images{pathname}wide.jpg` (or `/og-images/wide.jpg` for non-articles).

### `PostLayout.astro`

Wraps `BaseLayout` with `accentColor="blue"`. Props: `title`, `description`, `publishDate`, `contentModifiedDate`, `prevPost?`, `nextPost?`. Shows article header with publish/modified dates, prose content, author bio, prev/next navigation.

### `ResourceLayout.astro`, `LegalLayout.astro`, `NowLayout.astro`

Exist but follow the same `BaseLayout` wrapper pattern.

---

## Color system (actual values)

These are the real colors used in the codebase — not the brand blueprint colors:

| Name | Hex | Used for |
|------|-----|----------|
| myblue-900 | #001d2e | primary text, prose headings/body |
| brand blue | #0098f2 | header bg, hero bg, accent borders |
| hot pink | #f20098 | Author sidebar, post author bio (md+) |
| orange | #f24500 | Contact sidebar, external link text color |
| green | #00cb4b | Copy button, resource link text color |
| green alt | #00f25a | Resource link color in sidebar |
| prose link | #1a9eec | in-content link color |
| slate-200 | — | body background |
| slate-700 | — | Resources / Recent posts sidebars |
| slate-50 | — | post content bg, article header bg |

### Tailwind custom colors

```js
myblue: { 200, 300, 400, 500 (#07a3ff), 600, 700, 800, 900 (#001d2e), 950 }
myorange: { 500: "#ff8035" }
mypink: { 200, 400, 500, 600, 700 }
```

### Prose typography overrides

- Headings/body/bold: #001d2e
- Links: #1a9eec, dotted bottom border 4px
- `[data-external]` links: #f24500
- `[data-resource]` links: #00cb4b
- `[data-anchor]` links: #001d2e, dashed bottom border 2px

---

## Custom Astro/Markdown pipeline (`astro.config.mjs`)

Three custom rehype plugins applied to all MDX/Markdown content:

1. **`rehypeDefinitionListIds`** — adds `id` attribute (slugified text) to every `<dt>` element, enabling anchor links to glossary terms.

2. **`rehypeExternalLinks`** — adds `target="_blank"` + `rel="noopener noreferrer"` + `data-external="true"` to `http://`, `https://`, and `mailto:` links; adds `data-resource="true"` to `/resources/` links; adds `data-anchor="true"` to `#` anchor links. These attributes drive Tailwind prose color overrides.

3. **`rehypeCodeBlockCopy`** — wraps every `<pre><code>` block in a `<div class="relative">` and injects a "Copy" button (`data-copy-button="true"`). Button copy logic is in `PostLayout.astro` client script.

Also uses `remark-definition-list` for `<dl>`/`<dt>`/`<dd>` support in MDX.

---

## Analytics events (PostHog)

| Event | Where fired | Properties |
|-------|-------------|------------|
| `contact_email_clicked` | BaseLayout inline script | `email` |
| `post_navigation_clicked` | PostLayout inline script | `direction`, `destination_slug` |
| `code_block_copied` | PostLayout inline script | `snippet_length` |

Plausible captures pageviews, outbound link clicks, and form submissions automatically.

Env var required: `PUBLIC_PLAUSIBLE_DOMAIN`

---

## Components

| Component | Purpose |
|-----------|---------|
| `BaseLayout.astro` | Shell: grid, meta, sidebars, analytics |
| `PostLayout.astro` | Blog post wrapper |
| `PostCard.astro` | Post list item on index page |
| `PostImage.astro` | Image with caption in posts |
| `RawVideo.astro` | Video embed |
| `Video.astro` | Video with controls |
| `BrevoForm.astro` | Email signup form (Brevo) |
| `ResourceLink.astro` | Renders a resource link in sidebar/resource pages |
| `ThemeToggle.astro` | (present but may be unused/wip) |
| `Time.astro` | Renders `<time>` element with formatted date |
| `posthog.astro` | PostHog init script (injected in `<head>`) |

---

## Deploy & infrastructure

**Hosting:** Cloudflare Pages, connected to the GitHub repo `Zmoki/zmoki.xyz`.

**Production branch:** `main` — every push to `main` triggers a Cloudflare Pages deploy. No preview branches.

**Infrastructure as code:** Cloudflare account, DNS zones (including `zmoki.xyz`), and Pages config are managed via Terraform in a separate repo:
- GitHub: `https://github.com/Zmoki/my-infrastructure`
- Local path: `~/Projects/Zmoki/my-infrastructure/`

If DNS, redirect rules, headers, zone settings, or Cloudflare Pages config need changing, edit the Terraform config in that repo — not the Cloudflare dashboard directly.

---

## Content images

Images for posts and pages live in `src/images/`.

**Optimization workflow (macOS Automator):** Drop an image into `src/images/tmp/` → ImageOptim picks it up automatically, optimizes it, and saves the result to `src/images/`. Never commit images directly to `src/images/` without going through this pipeline first.

Do not commit anything from `src/images/tmp/` — it's a staging folder.

---

## OG image generation

`scripts/generate-og-images.mjs` uses Puppeteer to screenshot pages at 1200×675 and save to `public/og-images/`. Run after build: `npm run og:generate` or `npm run build:full`.

OG images are wide JPEGs (1200×675). BaseLayout constructs the URL as `/og-images{pathname}wide.jpg`.
