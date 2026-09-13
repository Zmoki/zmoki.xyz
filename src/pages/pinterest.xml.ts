import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

// RSS 2.0 feed for Pinterest's "auto-publish Pins from your RSS feed". One
// item per pin (not per post): title and description become the pin's,
// <media:content> points at the tall pin image, and the link goes to the
// post on the claimed domain with UTM parameters so PostHog can attribute
// the visit. Pinterest publishes the oldest items first, so items are
// sorted by publishDate ascending. Everything committed is in the feed; a
// future publishDate is informational only.

export async function GET(context: { site: URL | string | undefined }) {
  const site = String(context.site ?? "https://zmoki.xyz").replace(/\/$/, "");
  const posts = new Map((await getCollection("feed")).map((post) => [post.id, post.data]));
  const pinFiles = await getCollection("pins");

  const items = pinFiles.flatMap((file) => {
    const post = posts.get(file.id);
    if (!post) {
      throw new Error(
        `src/content/pins/${file.id}.yaml has no matching feed post; ` +
          `the pins file name must equal the post id.`,
      );
    }
    return file.data.pins.map((pin, i) => {
      const n = i + 1;
      const link = new URL(`/feed/${file.id}/`, site);
      link.searchParams.set("utm_source", "pinterest");
      link.searchParams.set("utm_medium", "social");
      link.searchParams.set("utm_campaign", file.id);
      link.searchParams.set("utm_content", `pin-${n}`);
      return {
        title: pin.title,
        description: pin.description,
        link: link.toString(),
        pubDate: pin.publishDate,
        modified: pin.contentModifiedDate,
        customData:
          `<guid isPermaLink="false">zmoki.xyz/pin/feed/${file.id}/${n}</guid>` +
          `<media:content type="image/png" medium="image" url="${site}/pin/feed/${file.id}/${n}.png" />`,
      };
    });
  });

  items.sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime());
  const lastBuildDate = items.reduce(
    (latest, item) => (item.modified > latest ? item.modified : latest),
    new Date(0),
  );

  return rss({
    title: "Zarema's Digital Garden on Pinterest",
    description: "Pins from zmoki.xyz, a digital garden of ideas, art, and research.",
    site,
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
      atom: "http://www.w3.org/2005/Atom",
    },
    customData:
      `<atom:link href="${site}/pinterest.xml" rel="self" type="application/rss+xml" />` +
      (items.length ? `<lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>` : ""),
    items: items.map(({ modified: _modified, ...item }) => item),
  });
}
