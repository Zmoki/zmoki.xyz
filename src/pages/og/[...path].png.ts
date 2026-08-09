import { Resvg } from "@resvg/resvg-js";
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { buildLinkGraph } from "@/lib/link-graph";
import { cardMap, egoCardSvg, constellationSvg, toWideSvg, toSquareSvg } from "@/og/card";
import { OG_WIDTH } from "@/og/theme";

// Build-time OG card endpoint. Sources are the 16:9 SVG masters in
// src/content/og (via the og collection); posts without a master fall back
// to their ego-network card, and /og/site.png is the whole constellation.
// Each card ships in two ratios: /og/{path}.png is 1200×630 (1.91:1) and
// /og/square/{path}.png is 1200×1200. Rendered on request in dev, emitted
// to dist/og/ at build.

export const getStaticPaths: GetStaticPaths = async () => {
  const cards = await cardMap();
  const posts = await getCollection("feed");
  // Every master plus ego fallbacks for posts without one; the index card
  // is served as /og/site.png.
  const ids = new Set([...cards.keys(), ...posts.map((post) => `feed/${post.id}`)]);
  const base = [...ids].map((id) => (id === "index" ? "site" : id));
  return base.flatMap((path) => [{ params: { path } }, { params: { path: `square/${path}` } }]);
};

const graphPromise = buildLinkGraph();

export const GET: APIRoute = async ({ params }) => {
  const graph = await graphPromise;
  // Fetched per request (not module scope) so dev picks up master edits.
  const cards = await cardMap();
  const isSquare = (params.path ?? "").startsWith("square/");
  const path = (params.path ?? "site").replace(/^square\//, "");
  // Card ids mirror the pages tree; the site-wide card is index.svg.
  const cardId = path === "site" ? "index" : path;

  let svg: string | undefined = cards.get(cardId);
  if (!svg) {
    if (path === "site") {
      svg = constellationSvg(graph);
    } else {
      const node = graph.byId[path.replace(/^feed\//, "")];
      if (!node) return new Response("Not found", { status: 404 });
      svg = egoCardSvg(node, graph);
    }
  }

  svg = isSquare ? toSquareSvg(svg) : toWideSvg(svg);

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
  })
    .render()
    .asPng();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
