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

**Before starting, ask the user:** "Do you want analytics (PostHog + Plausible) enabled or disabled for this session?"

- **Enabled** (default) — real events will be sent to PostHog and Plausible
- **Disabled** — set `PUBLIC_ANALYTICS_ENABLED=false` to keep dev traffic out of production data

Derive a stable port from the working directory so multiple worktrees can run simultaneously without conflict:

```bash
PORT=$(( 4300 + $(echo "$PWD" | cksum | cut -d' ' -f1) % 100 ))
```

Start the dev server in the background:

```bash
# analytics enabled (default):
npm run dev -- --port $PORT &> /tmp/zmoki-dev.log &
ZMOKI_PID=$!

# analytics disabled:
PUBLIC_ANALYTICS_ENABLED=false npm run dev -- --port $PORT &> /tmp/zmoki-dev.log &
ZMOKI_PID=$!
```

Wait for it to be ready and verify via the health endpoint:

```bash
for i in {1..20}; do
  curl -sf http://localhost:$PORT/-/astro/health > /dev/null && break
  sleep 1
done
curl -s http://localhost:$PORT/-/astro/health
# → ok
# → <short commit hash>
```

Open in browser:

```bash
open http://localhost:$PORT/
```

Logs are at `/tmp/zmoki-dev.log`. Stop with:

```bash
kill $ZMOKI_PID
# or, if the PID is lost — kills only what's on this port:
lsof -ti :$PORT | xargs kill
```

## Key routes to check

| Route | What it tests |
|---|---|
| `http://localhost:$PORT/-/astro/health` | Health check — returns "ok" + commit hash |
| `http://localhost:$PORT/` | Homepage — post list |
| `http://localhost:$PORT/feed/<slug>/` | Individual post (PostLayout) |
| `http://localhost:$PORT/resources/` | Resources index |
| `http://localhost:$PORT/now/` | Now page |
| `http://localhost:$PORT/rss.xml` | RSS feed |
