import { getCollection } from "astro:content";

// Shared link-graph extraction for the brand links page and the OG image
// cards. Parses every feed post body for internal links, ResourceLink
// components, and external URLs, so consumers can never drift from content.

export type GraphNode = {
  id: string;
  num: number | null;
  cluster: string;
  url: string;
  ext: number;
  out: number;
  in: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight: number;
};

export type LinkGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  byId: Record<string, GraphNode>;
};

// Editorial layer: cluster assignment per post order. New posts fall back to
// the neutral "page" bucket until they are assigned here.
export const clusterOf: Record<number, string> = {
  1: "garden",
  2: "garden",
  14: "garden",
  3: "mind",
  4: "mind",
  5: "mind",
  8: "mind",
  10: "mind",
  11: "mind",
  15: "mind",
  6: "tbilisi",
  9: "tbilisi",
  12: "tbilisi",
  7: "tech",
  13: "tech",
  16: "tech",
  17: "tech",
  18: "tech",
};

export async function buildLinkGraph(): Promise<LinkGraph> {
  const posts = (await getCollection("feed")).sort((a, b) => a.data.order - b.data.order);

  const nodes: GraphNode[] = [];
  const byId: Record<string, GraphNode> = {};
  const addNode = (node: GraphNode) => {
    nodes.push(node);
    byId[node.id] = node;
  };

  for (const post of posts) {
    const num = parseInt(post.id, 10);
    addNode({
      id: post.id,
      num,
      cluster: clusterOf[num] ?? "page",
      url: `/feed/${post.id}/`,
      ext: 0,
      out: 0,
      in: 0,
    });
  }

  const edgeWeights: Record<string, number> = {};
  for (const post of posts) {
    const source = byId[post.id];
    const body = post.body ?? "";
    source.ext = (body.match(/\]\(https?:\/\/[^)]+\)/g) ?? []).length;

    const targets: string[] = [];
    for (const match of body.matchAll(/\]\((\/[^)\s#]+?)\/?(?:#[^)]*)?\)/g)) {
      targets.push(match[1]);
    }
    for (const match of body.matchAll(/<ResourceLink\s+slug="([^"]+)"/g)) {
      targets.push(`/resources/${match[1]}`);
    }

    for (const target of targets) {
      let targetId: string;
      const feedMatch = target.match(/^\/feed\/(.+)$/);
      if (feedMatch) {
        targetId = feedMatch[1];
      } else {
        targetId = target;
        if (!byId[targetId]) {
          addNode({
            id: targetId,
            num: null,
            cluster: "page",
            url: `${target}/`,
            ext: 0,
            out: 0,
            in: 0,
          });
        }
      }
      if (!byId[targetId]) continue;
      const key = `${source.id}→${targetId}`;
      edgeWeights[key] = (edgeWeights[key] ?? 0) + 1;
    }
  }

  const edges = Object.entries(edgeWeights).map(([key, weight]) => {
    const [from, to] = key.split("→");
    return { from, to, weight };
  });
  edges.forEach((edge) => {
    byId[edge.from].out += edge.weight;
    byId[edge.to].in += edge.weight;
  });

  return { nodes, edges, byId };
}

export const degree = (node: GraphNode) => node.out + node.in;
