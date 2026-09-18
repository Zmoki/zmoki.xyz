// Cloudflare Pages Function: GET /api/crux?origin=example.com
//
// Proxies the Chrome UX Report History API so the API key stays server-side
// and every origin is cached for a day. Returns the weekly INP p75 series for
// the origin, or a small error object the page can render a fallback for.
//
// The same handler is mounted on the Astro dev server by the `cruxDevProxy`
// Vite plugin in astro.config.mjs, so the page works locally without wrangler.
//
// Env: CRUX_API_KEY — a Google Cloud API key with the Chrome UX Report API
// enabled. Set it as a Pages secret in production and in .env locally.

const CRUX_HISTORY_URL = "https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord";
const CACHE_TTL_SECONDS = 60 * 60 * 24;
const COLLECTION_PERIOD_COUNT = 25; // ~6 months of weekly collection periods

const HOST_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
      ...extraHeaders,
    },
  });
}

/** Accepts "example.com", "www.example.com/path", "https://example.com" → "example.com". */
export function normalizeHost(raw) {
  if (typeof raw !== "string") return null;
  let value = raw.trim().toLowerCase();
  value = value.replace(/^[a-z]+:\/\//, "");
  value = value.split(/[/?#]/)[0];
  value = value.replace(/^\.+|\.+$/g, "");
  if (!value || value.length > 253 || !HOST_PATTERN.test(value)) return null;
  return value;
}

function formatDate({ year, month, day }) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

async function queryHistory(host, apiKey) {
  const response = await fetch(`${CRUX_HISTORY_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin: `https://${host}`,
      metrics: ["interactions_to_next_paint"],
      collectionPeriodCount: COLLECTION_PERIOD_COUNT,
    }),
  });

  if (response.status === 404) return { status: "no-data" };
  if (!response.ok) {
    return { status: "upstream-error", httpStatus: response.status };
  }

  const payload = await response.json();
  const record = payload.record ?? {};
  const metric = record.metrics?.interactions_to_next_paint;
  const periods = record.collectionPeriods ?? [];
  if (!metric || periods.length === 0) return { status: "no-data" };

  const p75s = metric.percentilesTimeseries?.p75s ?? [];
  const series = periods.map((period, index) => {
    const value = p75s[index];
    return {
      start: formatDate(period.firstDate),
      end: formatDate(period.lastDate),
      p75: value == null ? null : Number(value),
    };
  });

  return { status: "ok", origin: `https://${host}`, series };
}

export async function handleCruxRequest(request, env) {
  const url = new URL(request.url);
  const host = normalizeHost(url.searchParams.get("origin"));
  if (!host) return json({ error: "invalid-origin" }, 400, { "Cache-Control": "no-store" });

  const apiKey = env?.CRUX_API_KEY;
  if (!apiKey) return json({ error: "not-configured" }, 503, { "Cache-Control": "no-store" });

  // Try the host as given, then the www (or bare) variant: CrUX records are
  // per origin and many sites only have data on one of the two.
  const candidates = host.startsWith("www.") ? [host, host.slice(4)] : [host, `www.${host}`];

  let lastResult = { status: "no-data" };
  for (const candidate of candidates) {
    const result = await queryHistory(candidate, apiKey);
    if (result.status === "ok") {
      return json({ requested: host, origin: result.origin, series: result.series });
    }
    lastResult = result;
    if (result.status === "upstream-error") break;
  }

  if (lastResult.status === "upstream-error") {
    return json({ error: "upstream-error", status: lastResult.httpStatus }, 502, {
      "Cache-Control": "no-store",
    });
  }
  return json({ error: "no-data", requested: host }, 404);
}

/** Cloudflare Pages Function entry point. */
export async function onRequestGet(context) {
  const { request, env } = context;
  const cache = globalThis.caches?.default;
  const cacheKey = new Request(request.url, { method: "GET" });

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  const response = await handleCruxRequest(request, env);

  if (cache && response.status === 200) {
    context.waitUntil?.(cache.put(cacheKey, response.clone()));
  }
  return response;
}
