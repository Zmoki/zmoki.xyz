import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  // Get all posts from the feed collection
  const allPosts = await getCollection("feed");

  // Sort posts by publish date (newest first)
  const sortedPosts = allPosts.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${site}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>

  <!-- Feed posts -->
  ${sortedPosts
    .map(
      (post) => `
  <url>
    <loc>${site}feed/${post.slug}</loc>
    <lastmod>${post.data.publishDate.toISOString()}</lastmod>
  </url>`,
    )
    .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
};
