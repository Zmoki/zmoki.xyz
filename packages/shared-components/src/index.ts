// Export shared components
export { default as Time } from "./components/Time.astro";
export { default as RawVideo } from "./components/RawVideo.astro";
export { default as PostCard } from "./components/PostCard.astro";

// Type declarations for TypeScript
export interface TimeProps {
  datetime: Date;
}

export interface RawVideoProps {
  src: string;
  type?: string;
  poster?: string;
  width?: number;
  height?: number;
}

export interface PostCardProps {
  slug: string;
  data: {
    title: string;
    description: string;
    publishDate: Date;
  };
}
