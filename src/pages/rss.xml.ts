import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

// Configure markdown-it to allow HTML (needed for our converted components)
const parser = new MarkdownIt({
  html: true, // Enable HTML tags in source
  linkify: true, // Automatically convert URLs to links
  breaks: true, // Convert '\n' in paragraphs into <br>
});

/**
 * Strips import statements from MDX content
 */
function stripImports(content: string): string {
  // Remove import statements (single line imports)
  let processed = content.replace(/^import\s+.*?from\s+["'][^"']+["'];?\s*$/gm, "");

  // Also handle multi-line imports if any
  processed = processed.replace(/^import\s+.*?from\s+["'][^"']+["'];?\s*$/gm, "");

  return processed.trim();
}

/**
 * Converts MDX components to HTML for RSS feed
 * Handles <Image> and <Video> components using regex parsing
 */
function convertMdxComponentsToHtml(content: string, siteUrl: string, postSlug: string): string {
  let processed = content;

  // First, handle <figure> tags with Image components - process them as a unit
  // This needs to happen before individual Image processing
  processed = processed.replace(
    /<figure[^>]*>[\s\S]*?<Image\s+([^>]+)\s*\/?>[\s\S]*?<figcaption[^>]*>([\s\S]*?)<\/figcaption>[\s\S]*?<\/figure>/g,
    (match, imageAttrs, caption) => {
      const altMatch = imageAttrs.match(/alt=["']([^"']+)["']/);
      const alt = altMatch ? altMatch[1] : "Image";

      // Create a proper figure with image placeholder and caption
      return `<figure><p><em>[Image: ${alt}]</em></p><figcaption>${caption.trim()}</figcaption></figure>`;
    },
  );

  // Convert standalone <Image> components (not in figures) to placeholders
  processed = processed.replace(/<Image\s+([^>]+)\s*\/?>/g, (match, attrs) => {
    const altMatch = attrs.match(/alt=["']([^"']+)["']/);
    const alt = altMatch ? altMatch[1] : "Image";

    // Create a placeholder for the image
    return `<p><em>[Image: ${alt}]</em></p>`;
  });

  // Convert <Video> components to <video> tags
  // Matches: <Video src="..." poster="..." width="..." height="..." />
  processed = processed.replace(/<Video\s+([^>]+)\s*\/?>/g, (match, attrs) => {
    // Extract attributes
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    const posterMatch = attrs.match(/poster=["']([^"']+)["']/);
    const widthMatch = attrs.match(/width=["']?(\d+)["']?/);
    const heightMatch = attrs.match(/height=["']?(\d+)["']?/);

    const src = srcMatch ? srcMatch[1] : "";
    const poster = posterMatch ? posterMatch[1] : "";
    const width = widthMatch ? widthMatch[1] : "";
    const height = heightMatch ? heightMatch[1] : "";

    if (!src) return "";

    // Build video tag with proper attributes
    let videoTag = `<video controls`;
    if (width) videoTag += ` width="${width}"`;
    if (height) videoTag += ` height="${height}"`;
    if (poster) videoTag += ` poster="${poster}"`;
    videoTag += `><source src="${src}" type="video/mp4" />Your browser does not support the video tag.</video>`;

    return videoTag;
  });

  return processed;
}

export async function GET(context: { site: string | undefined }) {
  const siteUrl = context.site || "https://zmoki.xyz";

  // Get all posts from the feed collection
  const allPosts: CollectionEntry<"feed">[] = await getCollection("feed");

  // Sort posts by publishDate (newest first, matching the site's ordering)
  const sortedPosts = allPosts.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );

  // Render and sanitize each post's content
  const items = await Promise.all(
    sortedPosts.map(async (post: CollectionEntry<"feed">) => {
      // First, strip import statements
      let processedContent = stripImports(post.body);

      // Then convert MDX components to HTML
      processedContent = convertMdxComponentsToHtml(processedContent, siteUrl, post.slug);

      // Then render the Markdown to HTML using markdown-it
      const contentHtml = parser.render(processedContent);

      // Use the OG image for this post (already generated for each post)
      // This follows the pattern from https://webreaper.dev/posts/astro-rss-feed-blog-post-images/
      const ogImagePath = `/og-images/feed/${post.slug}/wide.png`;
      const ogImageUrl = `${siteUrl}${ogImagePath}`;

      // Sanitize the HTML to ensure safe RSS output
      // Allow video tags and their attributes
      const sanitizedContent = sanitizeHtml(contentHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          "img",
          "video",
          "source",
          "figure",
          "figcaption",
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          video: [
            "controls",
            "width",
            "height",
            "poster",
            "playsinline",
            "loop",
            "autoplay",
            "muted",
          ],
          source: ["src", "type"],
          img: ["src", "alt", "width", "height", "loading", "class"],
        },
      });

      // Build customData for media namespace (RSS image support)
      // Following the pattern from https://webreaper.dev/posts/astro-rss-feed-blog-post-images/
      const imageType = ogImageUrl.endsWith(".png") ? "png" : "jpeg";
      const customData = `<media:content
        type="image/${imageType}"
        medium="image"
        url="${ogImageUrl}" />`;

      return {
        title: post.data.title,
        description: post.data.description,
        link: `/feed/${post.slug}/`,
        pubDate: post.data.publishDate,
        content: sanitizedContent,
        customData: customData,
      };
    }),
  );

  return rss({
    title: "Zarema's Digital Garden",
    description:
      "A personal collection of art, research, and creative projects from a neurodivergent developer and artist. A space for curiosity, not a niche.",
    site: siteUrl,
    // Add media namespace for image support
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
    },
    items: items,
  });
}
