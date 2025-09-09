import { defineCollection, z } from 'astro:content';

const feed = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
  }),
});

export const collections = {
  feed,
};
