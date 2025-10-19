import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import {
  publishDate as indexPagePublishDate,
  contentModifiedDate as indexPageContentModifiedDate,
} from "./index.astro";

export const GET: APIRoute = async ({ site }) => {
  // Get all posts from the feed collection
  const allFeedIems: CollectionEntry<"feed">[] = await getCollection("feed");

  // Get all resources from the resources collection
  const allResources: CollectionEntry<"resources">[] = await getCollection("resources");

  // Get all legal items from the legal collection
  const allLegalItems: CollectionEntry<"legal">[] = await getCollection("legal");

  // Get the most recent post published date and calc the index page latest date
  const recentPostPublishedDate = allFeedIems
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())[0]
    .data.publishDate.getTime();
  const indexPageLatestDateTimestamp = Math.max(
    recentPostPublishedDate,
    indexPagePublishDate.getTime(),
    indexPageContentModifiedDate.getTime(),
  );
  const indexPageLatestDate = new Date(indexPageLatestDateTimestamp).toISOString().substring(0, 10);

  const sitemapUrl = (path: string, lastmod: string) => `
  <url>
    <loc>${site}${path}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
  `;

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}</loc>
    <lastmod>${indexPageLatestDate}</lastmod>
  </url>
  ${allFeedIems
    .map((post: CollectionEntry<"feed">) =>
      sitemapUrl(
        `feed/${post.slug}/`,
        (post.data.contentModifiedDate ?? post.data.publishDate).toISOString().substring(0, 10),
      ),
    )
    .join("")}
  ${allResources
    .map((resource: CollectionEntry<"resources">) =>
      sitemapUrl(
        `resources/${resource.slug}/`,
        (resource.data.contentModifiedDate ?? resource.data.publishDate)
          .toISOString()
          .substring(0, 10),
      ),
    )
    .join("")}
    ${allLegalItems
      .map((legalItem: CollectionEntry<"legal">) =>
        sitemapUrl(
          `legal/${legalItem.slug}/`,
          legalItem.data.contentModifiedDate.toISOString().substring(0, 10),
        ),
      )
      .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};
