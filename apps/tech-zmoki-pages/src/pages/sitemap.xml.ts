import type { APIRoute } from "astro";
import { type CollectionEntry, getCollection } from "astro:content";
import {
  publishDate as indexPagePublishDate,
  contentModifiedDate as indexPageContentModifiedDate,
} from "./index.astro";

export const GET: APIRoute = async ({ site }) => {
  // Get all posts from the feed collection
  const allFeedIems = await getCollection("feed");

  // Sort posts by publish date (newest first)
  const sortedFeedItems = allFeedIems.sort(
    (a: CollectionEntry<"feed">, b: CollectionEntry<"feed">) =>
      b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );

  const recentPostPublishedDate = sortedFeedItems[0].data.publishDate.getTime();

  const indexPageLatestDateTimestamp = Math.max(
    recentPostPublishedDate,
    indexPagePublishDate.getTime(),
    indexPageContentModifiedDate.getTime(),
  );
  const indexPageLatestDate = new Date(indexPageLatestDateTimestamp).toISOString().substring(0, 10);

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}</loc>
    <lastmod>${indexPageLatestDate}</lastmod>
  </url>
  ${sortedFeedItems
    .map(
      (post: CollectionEntry<"feed">) => `
  <url>
    <loc>${site}feed/${post.slug}/</loc>
    <lastmod>${(post.data.contentModifiedDate ?? post.data.publishDate)
      .toISOString()
      .substring(0, 10)}</lastmod>
  </url>`,
    )
    .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
