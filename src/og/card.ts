import type { GraphNode, LinkGraph } from "@/lib/link-graph";
import { degree } from "@/lib/link-graph";
import {
  OG_WIDTH as W,
  MASTER_HEIGHT as H,
  OG_HEIGHT,
  SQUARE_SIZE,
  ground,
  clusterHex,
  particleHex,
} from "./theme";

// Abstract OG cards on a creamy ground. Every card is a hand-editable 16:9
// SVG master in src/content/og/{id}.svg (1200×675, viewBox "0 0 1200 675").
// This module keeps only what is derived from the link graph at build time —
// the ego-network fallback for posts without a master and the site
// constellation — plus the viewBox transforms that produce the Open Graph
// ratios from a master.

// Deterministic pseudo-random in [0, 1) from a string. FNV-1a with a
// murmur-style avalanche finalizer, so near-identical seeds still spread.
const rand = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

const circle = (x: number, y: number, r: number, attrs: string): string =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" ${attrs} />`;

const frame = (
  content: string,
): string => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${ground}" />
  ${content}</svg>`;

// ---------------------------------------------------------------------------
// Ratio transforms. They rewrite the master's dimension attributes and
// ground rect, so masters must keep the exact markers frame() emits:
// `height="675" viewBox="0 0 1200 675"` and `<rect width="1200" height="675"`.
// ---------------------------------------------------------------------------

// 1.91:1 (1200×630): crop the master evenly top and bottom.
export const toWideSvg = (svg: string): string => {
  const crop = (H - OG_HEIGHT) / 2;
  return svg.replace(
    `height="${H}" viewBox="0 0 ${W} ${H}"`,
    `height="${OG_HEIGHT}" viewBox="0 ${crop} ${W} ${OG_HEIGHT}"`,
  );
};

// 1:1 (1200×1200): extend the ground evenly above and below the composition.
export const toSquareSvg = (svg: string): string => {
  const pad = (SQUARE_SIZE - H) / 2;
  return svg
    .replace(
      `height="${H}" viewBox="0 0 ${W} ${H}"`,
      `height="${SQUARE_SIZE}" viewBox="0 -${pad} ${W} ${SQUARE_SIZE}"`,
    )
    .replace(
      `<rect width="${W}" height="${H}"`,
      `<rect y="-${pad}" width="${W}" height="${SQUARE_SIZE}"`,
    );
};

const particles = (seed: string, count: number, color: string): string => {
  let out = "";
  for (let i = 0; i < count; i++) {
    const px = W * 0.62 + rand(`${seed}-px${i}`) * W * 0.32;
    const py = H * 0.08 + rand(`${seed}-py${i}`) * H * 0.5;
    const pr = 6 + rand(`${seed}-pr${i}`) * 6;
    out += circle(px, py, pr, `fill="${color}" fill-opacity="0.45"`);
  }
  return out;
};

// ---------------------------------------------------------------------------
// Generic ego-network card (fallback for posts without an SVG master).
// ---------------------------------------------------------------------------

export function egoCardSvg(node: GraphNode, graph: LinkGraph): string {
  const cx = W * 0.42;
  const cy = H * 0.5;
  const centerR = 96;
  const orbit = 215;
  const color = clusterHex[node.cluster];

  const neighborMap = new Map<string, { other: GraphNode; outW: number; inW: number }>();
  const touch = (id: string) => {
    if (!neighborMap.has(id)) neighborMap.set(id, { other: graph.byId[id], outW: 0, inW: 0 });
    return neighborMap.get(id)!;
  };
  graph.edges.forEach((e) => {
    if (e.from === node.id) touch(e.to).outW += e.weight;
    if (e.to === node.id) touch(e.from).inW += e.weight;
  });
  const neighbors = Array.from(neighborMap.values());

  let edgesSvg = "";
  let nodesSvg = "";
  const start = rand(`${node.id}-start`) * Math.PI * 2;
  neighbors.forEach((n, i) => {
    const angle =
      start + (i / neighbors.length) * Math.PI * 2 + (rand(`${node.id}-a${i}`) - 0.5) * 0.3;
    const dist = orbit + (rand(`${node.id}-d${i}`) - 0.5) * 60;
    const nx = cx + Math.cos(angle) * dist;
    const ny = cy + Math.sin(angle) * dist;
    const nr = 30 + Math.min(degree(n.other), 8) * 2.5;
    const nColor = clusterHex[n.other.cluster];

    const arc = (weight: number, edgeColor: string, bend: number) => {
      const mx = (cx + nx) / 2 + (cy - ny) * bend;
      const my = (cy + ny) / 2 + (nx - cx) * bend;
      edgesSvg += `<path d="M ${cx} ${cy} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}"
        fill="none" stroke="${edgeColor}" stroke-width="${4 + (weight - 1) * 2}" stroke-opacity="0.6" />`;
    };
    if (n.outW > 0) arc(n.outW, color, 0.16);
    if (n.inW > 0) arc(n.inW, nColor, -0.16);
    nodesSvg += circle(nx, ny, nr, `fill="${nColor}" fill-opacity="0.92"`);
  });

  const orphanRing =
    degree(node) === 0
      ? circle(
          cx,
          cy,
          centerR + 30,
          `fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="8 14" stroke-opacity="0.6"`,
        )
      : "";

  return frame(`
  ${particles(node.id, node.ext, particleHex)}
  ${edgesSvg}
  ${nodesSvg}
  ${circle(cx, cy, centerR + 18, `fill="none" stroke="${color}" stroke-width="4" stroke-opacity="0.4"`)}
  ${circle(cx, cy, centerR, `fill="${color}"`)}
  ${orphanRing}`);
}

// ---------------------------------------------------------------------------
// Site card: the whole link-graph constellation.
// ---------------------------------------------------------------------------

export function constellationSvg(graph: LinkGraph): string {
  const anchors: Record<string, [number, number]> = {
    garden: [W * 0.38, H * 0.34],
    mind: [W * 0.72, H * 0.3],
    tbilisi: [W * 0.28, H * 0.7],
    tech: [W * 0.68, H * 0.72],
    page: [W * 0.5, H * 0.52],
  };
  const pos: Record<string, { x: number; y: number; r: number }> = {};
  graph.nodes.forEach((n, i) => {
    const [ax, ay] = anchors[n.cluster];
    pos[n.id] = {
      x: ax + Math.cos(i * 2.4) * (60 + rand(`c-${n.id}x`) * 60),
      y: ay + Math.sin(i * 2.4) * (46 + rand(`c-${n.id}y`) * 50),
      r: n.cluster === "page" ? 9 : 14 + Math.min(degree(n), 12) * 2.2,
    };
  });

  let edgesSvg = "";
  graph.edges.forEach((e) => {
    const a = pos[e.from];
    const b = pos[e.to];
    const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.15;
    const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.15;
    edgesSvg += `<path d="M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}"
      fill="none" stroke="${clusterHex[graph.byId[e.from].cluster]}" stroke-width="${3 + (e.weight - 1)}" stroke-opacity="0.5" />`;
  });

  let nodesSvg = "";
  graph.nodes.forEach((n) => {
    const p = pos[n.id];
    nodesSvg += circle(
      p.x,
      p.y,
      p.r,
      `fill="${clusterHex[n.cluster]}" fill-opacity="${n.cluster === "page" ? 0.45 : 0.92}"`,
    );
  });

  return frame(`${edgesSvg}${nodesSvg}`);
}
