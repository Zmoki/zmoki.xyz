import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import type { Loader } from "astro/loaders";

// Loads the hand-editable OG card masters (src/content/og/**/*.svg) as a
// collection. The folder mirrors the pages tree (index.svg, now.svg,
// feed/{id}.svg), so ids are the relative path without extension:
// "index", "now", "feed/1-about-me". The alt text comes from the master's
// <desc> element. The glob and file loaders don't parse .svg, hence the
// custom loader.
const svgLoader = (dir: string): Loader => ({
  name: "svg-loader",
  load: async ({ store, generateDigest, watcher, config, logger }) => {
    const dirUrl = new URL(dir, config.root);
    const dirPath = fileURLToPath(dirUrl);
    const sync = async () => {
      const entries = await fs.readdir(dirPath, { recursive: true });
      const files = entries.filter((f) => f.endsWith(".svg"));
      store.clear();
      for (const file of files) {
        const svg = await fs.readFile(new URL(file, dirUrl), "utf-8");
        const alt = svg.match(/<desc>([\s\S]*?)<\/desc>/)?.[1].trim();
        store.set({
          id: file.replace(/\.svg$/, ""),
          data: { svg, alt },
          digest: generateDigest(svg),
        });
      }
      logger.info(`Loaded ${files.length} SVG cards`);
    };
    await sync();
    if (watcher) {
      watcher.add(dirPath);
      watcher.on("all", (_event, path) => {
        if (path.startsWith(dirPath) && path.endsWith(".svg")) void sync();
      });
    }
  },
});

const feed = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/feed" }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    contentModifiedDate: z.coerce.date(),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/resources" }),
  schema: z.object({
    type: z.enum(["page", "link"]),
    name: z.string(),
    title: z.string(),
    description: z.string(),
    url: z.string().optional(),
    publishDate: z.coerce.date(),
    contentModifiedDate: z.coerce.date(),
    order: z.number(),
    form: z
      .object({
        brevoFormId: z.string(),
        buttonText: z.string(),
        title: z.string(),
        description: z.string(),
      })
      .optional(),
    platform: z
      .object({
        name: z.string(),
        title: z.string(),
        description: z.string(),
      })
      .optional(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    contentModifiedDate: z.coerce.date(),
  }),
});

const og = defineCollection({
  loader: svgLoader("./src/content/og/"),
  schema: z.object({ svg: z.string(), alt: z.string().optional() }),
});

// Pinterest pins, one YAML file per feed post (src/content/pins/{post id}.yaml)
// holding a list of pins. The pin number is its 1-based position in the list
// and is baked into /pin/feed/{post}/{n}.png and the pinterest.xml guid, so
// pins are appended, never reordered or removed. Limits are Pinterest's:
// title 100, description 800; the headline goes on the image (3 lines max).
const pins = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/pins" }),
  schema: z.object({
    pins: z
      .array(
        z.object({
          headline: z.string().max(45),
          title: z.string().max(100),
          description: z.string().max(800),
          publishDate: z.coerce.date(),
          contentModifiedDate: z.coerce.date(),
          layout: z.enum(["band"]).default("band"),
        }),
      )
      .min(1),
  }),
});

export const collections = {
  feed,
  resources,
  legal,
  og,
  pins,
};
