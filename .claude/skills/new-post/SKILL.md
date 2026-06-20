---
description: Draft a new feed post (blog post) for zmoki.xyz with correct frontmatter, link conventions, and a voice-guide check before it is done.
---

# New post — zmoki.xyz

Create a new post in the `feed` content collection and make sure it sounds like Zarema.

Posts live at `src/content/feed/{order}-{slug}.mdx` (`.mdx` for most, `.md` for plain ones). The schema is in `src/content/config.ts`.

## 1. Get the content

Ask where the content comes from if it is not already clear: pasted/dictated text, a topic to draft from, or existing notes / a file / a URL. If drafting from scratch, write in the voice described in step 4 from the start, not after.

## 2. Pick order and slug

- **Order** — the next post is `(highest existing order) + 1`. Check with:
  ```bash
  ls src/content/feed/
  ```
  Order drives sort position and prev/next nav, so the newest post gets the highest number.
- **Slug** — a short, lowercase, hyphenated noun phrase. No leading "the" (match existing slugs like `freedom-manifesto`, `power-of-questions`, `day-themes-system`). The URL becomes `/feed/{order}-{slug}/`.

## 3. Write the frontmatter and body

Frontmatter (all fields required by the `feed` schema):

```yaml
---
title: "Sentence case title, quoted if it contains a comma or colon"
description: "One or two sentences. This is the meta description and OG description."
publishDate: "YYYY-MM-DD" # today
contentModifiedDate: "YYYY-MM-DD" # today
order: N
---
```

Body rules:

- **Do not repeat the title as an `# H1`** and do not repeat the description as the first paragraph. `PostLayout` renders both from frontmatter. Start the body with the first real section (`##`) or an intro paragraph.
- **Internal links** use relative paths: `https://zmoki.xyz/feed/7-foo/` becomes `[text](/feed/7-foo/)`. The rehype pipeline styles internal, external, resource, and anchor links automatically from the path, so never hand-write target/rel attributes.
- **External links** stay absolute (`https://goodinp.com/`).
- **Images** go through the `src/images/tmp/` optimization pipeline, then `import PostImage from "@/components/PostImage.astro"` and use `<PostImage src={...} alt="...">caption</PostImage>`. See `16-power-of-questions.mdx` for the pattern. Skip images unless the user has them ready.

## 4. Check it against the voice guide (do this before calling it done)

The voice guide is `src/pages/-/astro/brand/voice.astro` (rendered at `/-/astro/brand/voice/`). Read it and apply the pre-publish checklist. The easy-to-miss mechanical rules:

- **Say it straight.** No "not this, but that" framing. Rewrite `isn't X, it's Y`, `not a hunch, a spreadsheet`, `it's not a blog, it's a garden` into a plain statement.
- **Go easy on colons and dashes.** Prefer two short sentences over `clause: clause`. Avoid em-dashes; a comma or full stop usually reads better.
- **Sentence case** for the title and every heading.
- **Define any term** a newcomer might not know, on the spot.
- **Links describe their destination** (never "click here").
- **Stay honest** about pace and anything unfinished. Do not claim something is built or shipped if it is not.

Quick mechanical scan (run, then read and fix anything it flags):

```bash
FILE=src/content/feed/{order}-{slug}.mdx
# colons in prose (ignores markdown links)
awk 'NR>7' "$FILE" | grep -n ":" | grep -v "](/" || echo "no prose colons"
# em-dashes
grep -n "—" "$FILE" || echo "no em-dashes"
# contrast framing
grep -niE "isn't .*, it's|not .*, but|n't .*, (it|they)'" "$FILE" || echo "no contrast framing"
```

The grep is a hint, not the whole job — still read the post and judge it against the full guide.

## 5. Format and verify

```bash
npx prettier --write "src/content/feed/{order}-{slug}.mdx"
npm run check   # astro check — 0 errors expected
```

Then offer to start the dev server with `/run` and confirm the post renders at `/feed/{order}-{slug}/` (200) and shows on the homepage.

## 6. Do not commit

Leave committing and pushing to the user unless they explicitly ask.
