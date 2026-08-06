import { Resvg } from "@resvg/resvg-js";
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { buildLinkGraph } from "@/lib/link-graph";
import { egoCardSvg, constellationSvg, customCards, toCoverSvg } from "@/og/card";
import { OG_WIDTH } from "@/og/theme";

// Build-time OG card endpoint. /og/site.png is the whole constellation;
// /og/feed/{slug}.png is that post's ego-network. Rendered on request in
// dev, emitted to dist/og/ at build.

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("feed");
  const base = ["site", ...posts.map((post) => `feed/${post.id}`)];
  return base.flatMap((path) => [{ params: { path } }, { params: { path: `cover/${path}` } }]);
};

const graphPromise = buildLinkGraph();

export const GET: APIRoute = async ({ params }) => {
  const graph = await graphPromise;
  const isCover = (params.path ?? "").startsWith("cover/");
  const path = (params.path ?? "site").replace(/^cover\//, "");

  let svg: string;
  if (path === "site") {
    svg = constellationSvg(graph);
  } else {
    const node = graph.byId[path.replace(/^feed\//, "")];
    if (!node) return new Response("Not found", { status: 404 });
    const custom = node.num !== null ? customCards[node.num] : undefined;
    svg = custom ? custom() : egoCardSvg(node, graph);
  }

  if (isCover) svg = toCoverSvg(svg);

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
  })
    .render()
    .asPng();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
