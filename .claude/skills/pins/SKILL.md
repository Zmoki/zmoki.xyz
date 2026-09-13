---
description: Draft Pinterest pins for a feed post into src/content/pins/{post-id}.yaml, reviewed in code before they reach the Pinterest feed.
---

# Pins — zmoki.xyz

Turn one feed post into several Pinterest pins that Zarema reviews and edits in code. Pinterest reads them from `/pinterest.xml` (auto-publish from RSS) and each pin gets a tall image at `/pin/feed/{post-id}/{n}.png`, rendered at build time from the post's OG card master plus the headline.

Pins live at `src/content/pins/{post-id}.yaml`, one file per post. The schema is in `src/content.config.ts` (`pins` collection).

## 1. Pick the post

Ask for the post id if it is not given (`ls src/content/feed/`). Read the post's frontmatter and body in full. If `src/content/pins/{post-id}.yaml` exists, read it too: new pins are **appended** to the list. Never reorder, renumber, or delete existing pins. The pin number is its position in the list and is baked into the image URL and the feed guid; changing it would make Pinterest pin it again.

## 2. Draft the pins

Default three new pins, each with a distinct angle, so one post yields visibly different pins (the top few pins drive most Pinterest traffic). Typical angles:

- the thing itself (the technique, the list, the map),
- the problem it solves or who it is for,
- a concrete detail, number, or quote from the post,
- a resource inside the post (a template, a video, a download).

Each pin:

```yaml
pins:
  - headline: "Up to 45 chars, reads at thumbnail size"
    title: "Up to 100 chars, shaped like a Pinterest search"
    description: "Up to 800 chars, in Zarema's voice, keywords in natural sentences."
    publishDate: "YYYY-MM-DD" # today
    contentModifiedDate: "YYYY-MM-DD" # today
```

- **headline** is the text on the image. It wraps at about 19 characters per line, three lines maximum, otherwise the build fails. Prefer 2 lines. Short words, the core idea only. A literal newline in the YAML forces a line break.
- **title** is the Pinterest pin title. Think of what someone types into Pinterest search and put those words in, plainly. Numbers and the technique name help. No colons.
- **headline and title share one angle.** Someone sees the headline on the image and the title next to it; they must obviously be about the same thing (the headline is the short form, the title the searchable form). Do not put one angle on the image and another in the title.
- **description** is the pin description. First person, plain, personal, like the post. End with a short run of search terms as a plain sentence fragment (see existing pins files), not hashtags. Mention that the full write-up is on the digital garden so the click makes sense.
- Dates: `publishDate` and `contentModifiedDate` are today for a new pin. When editing an existing pin later, bump only its `contentModifiedDate`.

Do not put the post URL in the description: the feed adds the link, with UTM parameters, from the post id.

## 3. Voice check

Apply the voice guide at `src/pages/-/astro/brand/voice.astro` (rendered at `/-/astro/brand/voice/`): sentence case, say it straight (no "not X, it's Y" framing), go easy on colons and dashes, define terms on the spot, stay honest. Quick scan:

```bash
FILE=src/content/pins/{post-id}.yaml
grep -n "—" "$FILE" || echo "no em-dashes"
grep -niE "isn't .*, it's|not .*, but|n't .*, (it|they)'" "$FILE" || echo "no contrast framing"
```

## 4. Format and verify

```bash
npx prettier --write "src/content/pins/{post-id}.yaml"
npm run check   # astro check — 0 errors expected; schema errors show here
```

Then offer to start the dev server with `/run` and review the pins at `/-/astro/brand/pins/` (image at Pinterest column width, character counts) and the feed at `/pinterest.xml`. A headline that wraps to more than three lines fails when the image is requested; shorten it.

## 5. Do not commit

Leave committing and pushing to the user unless they explicitly ask. Once pushed to `main`, Pinterest picks up new items from `/pinterest.xml` within about a day.
