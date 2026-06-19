---
description: Launch the zmoki.xyz Astro dev server and verify it is working
---

# Run — zmoki.xyz

Astro dev server. No build step needed for local verification.

## Prerequisites

`.env` file must exist at the project root with the following keys (values can be dummy strings for local dev):

| Variable | Required | Notes |
|---|---|---|
| `PUBLIC_PLAUSIBLE_DOMAIN` | Yes | Plausible analytics domain |
| `PUBLIC_POSTHOG_PROJECT_TOKEN` | No | PostHog token (safe to omit locally) |
| `PUBLIC_POSTHOG_HOST` | No | PostHog host |
| `PUBLIC_BREVO_ACCOUNT_ID` | No | Brevo email form |
| `PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | No | Turnstile (forms) |

## Run

Start the dev server in the background:

```bash
npm run dev &> /tmp/zmoki-dev.log &
ZMOKI_PID=$!
```

The server listens on port **4321**. Wait for it to be ready:

```bash
for i in {1..20}; do
  curl -sf http://localhost:4321/ > /dev/null && break
  sleep 1
done
```

Verify it is up:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/
# → 200
```

Open in browser:

```bash
open http://localhost:4321/
```

Logs are at `/tmp/zmoki-dev.log`. Stop with:

```bash
kill $ZMOKI_PID
# or, if the PID is lost:
pkill -f "astro dev"
```

## Key routes to check

| Route | What it tests |
|---|---|
| `http://localhost:4321/` | Homepage — post list |
| `http://localhost:4321/feed/<slug>/` | Individual post (PostLayout) |
| `http://localhost:4321/resources/` | Resources index |
| `http://localhost:4321/now/` | Now page |
| `http://localhost:4321/rss.xml` | RSS feed |
