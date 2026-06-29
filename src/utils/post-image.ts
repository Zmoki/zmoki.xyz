import type { ImageMetadata } from "astro";

// Raw source of every feed post, and every image in src/images. Both globs are
// resolved at build time by Vite, so they work from any importing module.
const postSources = import.meta.glob("/src/content/feed/*.{md,mdx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const imageAssets = import.meta.glob("/src/images/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
}) as Record<string, { default: ImageMetadata }>;

/** Optimized URL for an image in src/images, addressed by its repo-root path. */
export function imageUrl(path: string): string | undefined {
  return imageAssets[path]?.default.src;
}

/**
 * Resolve the first <PostImage> used in a post and return its optimized URL,
 * so a card can use the post's own photo as a background. Returns undefined
 * when the post has no <PostImage>.
 */
export function firstPostImage(slug: string): string | undefined {
  const sourceKey = Object.keys(postSources).find(
    (key) => key.endsWith(`/${slug}.mdx`) || key.endsWith(`/${slug}.md`),
  );
  if (!sourceKey) return undefined;
  const source = postSources[sourceKey];
  const usage = source.match(/<PostImage[^>]*\bsrc=\{(\w+)\}/);
  if (!usage) return undefined;
  const importMatch = source.match(new RegExp(`import\\s+${usage[1]}\\s+from\\s+["']([^"']+)["']`));
  if (!importMatch) return undefined;
  const assetKey = importMatch[1].replace("@/images/", "/src/images/");
  return imageUrl(assetKey);
}
