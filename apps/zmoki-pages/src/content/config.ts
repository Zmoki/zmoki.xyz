import { defineCollection, z } from "astro:content";

const feed = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    contentModifiedDate: z.coerce.date(),
  }),
});

const resources = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    contentModifiedDate: z.coerce.date(),
    form: z.object({
      brevoFormId: z.string(),
      buttonText: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  }),
});

const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    contentModifiedDate: z.coerce.date(),
  }),
});

export const collections = {
  feed,
  resources,
  legal,
};
