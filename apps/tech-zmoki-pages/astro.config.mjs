import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import remarkDefinitionList from "remark-definition-list";
import { defListHastHandlers } from "remark-definition-list";
import { visit } from "unist-util-visit";

// Rehype plugin to add IDs to definition list terms
function rehypeDefinitionListIds() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "dt") {
        // Generate slug from term text
        const text = node.children
          .map((child) => {
            if (child.type === "text") return child.value;
            if (child.type === "element" && child.children) {
              return child.children
                .map((grandChild) => (grandChild.type === "text" ? grandChild.value : ""))
                .join("");
            }
            return "";
          })
          .join("")
          .trim();

        if (text) {
          const slug = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim();

          // Add ID to the definition term
          node.properties = {
            ...node.properties,
            id: slug,
          };
        }
      }
    });
  };
}

// Rehype plugin to add target="_blank" to external links
function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "a" && node.properties?.href) {
        const href = node.properties.href;

        // Check if it's an absolute URL (starts with http:// or https://)
        if (
          typeof href === "string" &&
          (href.startsWith("http://") || href.startsWith("https://"))
        ) {
          node.properties = {
            ...node.properties,
            target: "_blank",
            rel: "noopener noreferrer", // Security best practice for external links
          };
        }
      }
    });
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  site: "https://tech.zmoki.xyz",
  server: {
    port: 4322,
  },
  markdown: {
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
    remarkPlugins: [remarkDefinitionList],
    remarkRehype: { handlers: defListHastHandlers },
    rehypePlugins: [rehypeDefinitionListIds, rehypeExternalLinks],
  },
});
