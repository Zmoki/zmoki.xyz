import { Resvg } from "@resvg/resvg-js";
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { cardMap } from "@/og/card";
import { pinFontFile, toPinSvg } from "@/og/pin";
import { PIN_WIDTH } from "@/og/theme";

// Build-time Pinterest pin images: /pin/feed/{post id}/{n}.png, one per pin
// in the pins collection (n = 1-based position in the post's pins file).
// Each is the post's OG card master (or the fallback master) in the tall
// 2:3 "band" layout with the pin headline rendered on top. Rendered on
// request in dev, emitted to dist/pin/ at build.

export const getStaticPaths: GetStaticPaths = async () => {
  const pinFiles = await getCollection("pins");
  return pinFiles.flatMap((file) =>
    file.data.pins.map((_pin, i) => ({ params: { path: `feed/${file.id}/${i + 1}` } })),
  );
};

export const GET: APIRoute = async ({ params }) => {
  const match = (params.path ?? "").match(/^feed\/(.+)\/(\d+)$/);
  if (!match) return new Response("Not found", { status: 404 });
  const [, postId, n] = match;

  // Fetched per request (not module scope) so dev picks up edits.
  const pins = (await getCollection("pins")).find((file) => file.id === postId)?.data.pins;
  const pin = pins?.[Number(n) - 1];
  if (!pin) return new Response("Not found", { status: 404 });

  const cards = await cardMap();
  const master = cards.get(`feed/${postId}`) ?? cards.get("fallback");
  if (!master) return new Response("Not found", { status: 404 });

  const png = new Resvg(toPinSvg(master, { headline: pin.headline }), {
    fitTo: { mode: "width", value: PIN_WIDTH },
    font: { fontFiles: [pinFontFile], loadSystemFonts: false, defaultFontFamily: "Noto Sans" },
  })
    .render()
    .asPng();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
