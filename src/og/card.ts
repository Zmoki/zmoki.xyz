import type { GraphNode, LinkGraph } from "@/lib/link-graph";
import { degree } from "@/lib/link-graph";
import {
  OG_WIDTH as W,
  OG_HEIGHT as H,
  ground,
  clusterHex,
  wordmarkInk,
  particleHex,
  muted,
  tokenHex,
} from "./theme";

// Abstract OG cards on a creamy ground. Each post gets a bespoke composition
// that reflects its content; posts without one fall back to the ego-network
// card. Elements stay large so the card reads at feed-thumbnail size. No
// titles — platforms render those next to the image.

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

// 16:9 cover variant (1200×675) of a rendered card: same composition, the
// ground extended evenly above and below.
export const toCoverSvg = (svg: string): string => {
  const extra = (W * 9) / 16 - H;
  return svg
    .replace(
      `height="${H}" viewBox="0 0 ${W} ${H}"`,
      `height="${H + extra}" viewBox="0 -${extra / 2} ${W} ${H + extra}"`,
    )
    .replace(
      `<rect width="${W}" height="${H}"`,
      `<rect y="-${extra / 2}" width="${W}" height="${H + extra}"`,
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
// Generic ego-network card (fallback for posts without a bespoke card).
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
// Per-post bespoke cards.
// ---------------------------------------------------------------------------

// #1 "Start here: a map of me". Migration route from the grey world to the
// bright one: Norilsk → Caucasus → St. Petersburg → Cyprus → Tbilisi, sized
// by how much life each place held, with a "you are here" ring on Tbilisi.
function card1(): string {
  // X marks the spot on the map of me: two wide brush strokes crossing,
  // one from each of my worlds, tapered to narrow tips at the ends.
  const brush = (points: [number, number][], maxHalf: number, color: string): string => {
    const steps = 48;
    const pts: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let x = 0;
      let y = 0;
      if (points.length === 3) {
        const [p0, p1, p2] = points;
        const a = (1 - t) ** 2;
        const b = 2 * t * (1 - t);
        const c = t ** 2;
        x = a * p0[0] + b * p1[0] + c * p2[0];
        y = a * p0[1] + b * p1[1] + c * p2[1];
      } else {
        const [p0, p1, p2, p3] = points;
        const a = (1 - t) ** 3;
        const b = 3 * t * (1 - t) ** 2;
        const c = 3 * t ** 2 * (1 - t);
        const d = t ** 3;
        x = a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0];
        y = a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1];
      }
      pts.push([x, y]);
    }
    const upper: string[] = [];
    const lower: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const half = maxHalf * Math.sin(Math.PI * t) ** 0.7 + 1;
      const prev = pts[Math.max(0, i - 1)];
      const next = pts[Math.min(steps, i + 1)];
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * half;
      const ny = (dx / len) * half;
      upper.push(`${(pts[i][0] + nx).toFixed(1)} ${(pts[i][1] + ny).toFixed(1)}`);
      lower.unshift(`${(pts[i][0] - nx).toFixed(1)} ${(pts[i][1] - ny).toFixed(1)}`);
    }
    return `<path d="M ${upper.join(" L ")} L ${lower.join(" L ")} Z" fill="${color}" fill-opacity="0.8" />`;
  };

  return frame(`
  <g transform="rotate(15 ${W / 2} ${H / 2})">
  ${brush(
    [
      [150, 590],
      [450, 550],
      [700, 275],
      [990, 60],
    ],
    50,
    tokenHex("magenta", "200"),
  )}
  ${brush(
    [
      [155, 162],
      [570, 263],
      [865, 572],
    ],
    50,
    tokenHex("azure", "200"),
  )}
  </g>`);
}

// #2 "Why I'm building a digital garden". One box is not enough: a grey box
// with colored dots spilling out and taking root as a loose constellation.
function card2(): string {
  const bx = W * 0.14;
  const by = H * 0.3;
  const bw = 230;
  const bh = 260;
  const seeds = [
    { color: tokenHex("magenta", "200"), x: 510, y: 130, r: 56 },
    { color: tokenHex("magenta", "400"), x: 645, y: 430, r: 44 },
    { color: tokenHex("magenta", "500"), x: 850, y: 380, r: 48 },
    { color: tokenHex("magenta", "700"), x: 1010, y: 135, r: 46 },
  ];

  const inside = circle(bx + bw / 2 - 20, by + bh / 2, 34, `fill="${muted}" fill-opacity="0.6"`);

  let flight = "";
  seeds.forEach((seed) => {
    // Dots above the box mouth get a rising quarter-arc; lower dots keep the
    // lofted control point.
    const rising = seed.y < by + bh / 2 - 60;
    const mx = rising ? seed.x : (bx + bw + seed.x) / 2;
    const my = rising ? by + bh / 2 : (by + bh / 2 + seed.y) / 2 - 90;
    flight += `<path d="M ${bx + bw - 10} ${by + bh / 2} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${seed.x} ${seed.y}"
      fill="none" stroke="${seed.color}" stroke-width="3.5" stroke-opacity="0.35" />`;
    flight += circle(seed.x, seed.y, seed.r, `fill="${seed.color}"`);
  });

  return frame(`
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="18" fill="none" stroke="${muted}" stroke-width="5" stroke-opacity="0.7"
    stroke-dasharray="0 0" />
  <rect x="${bx + bw - 6}" y="${by + 30}" width="12" height="${bh - 60}" fill="${ground}" />
  ${inside}
  ${flight}`);
}

// #3 "5-4-3-2-1 grounding". Five concentric rings carrying 5, 4, 3, 2, 1
// dots — the senses counting down to a calm center.
function card3(): string {
  const cy = H * 0.5;
  const senses = [
    { r: 104, color: tokenHex("jade", "200") },
    { r: 78, color: tokenHex("jade", "400") },
    { r: 56, color: tokenHex("jade", "500") },
    { r: 38, color: tokenHex("jade", "600") },
    { r: 24, color: tokenHex("jade", "700") },
  ];

  let x = 194;
  let dots = "";
  senses.forEach((sense, i) => {
    x += sense.r;
    dots += circle(x, cy, sense.r, `fill="${sense.color}"`);
    x += sense.r + 62 - i * 6;
  });

  return frame(dots);
}

// #4 "A personal glossary". Dictionary entries as a scatter of magenta-family
// dots with entry dashes, a few joined by the glossary's cross-reference arcs.
function card4(): string {
  const shades = ["700", "500", "600", "400", "500", "600", "700"];
  const count = 7;
  const pts: { x: number; y: number; r: number }[] = [];
  let dots = "";
  for (let i = 0; i < count; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = W * (row === 0 ? 0.17 : 0.29) + col * W * 0.19 + (rand(`gl-x${i}`) - 0.5) * 50;
    const y = H * 0.26 + row * H * 0.36 + (rand(`gl-y${i}`) - 0.5) * 44;
    const r = 32 + rand(`gl-r${i}`) * 12;
    pts.push({ x, y, r });
    dots += circle(x, y, r, `fill="${tokenHex("magenta", shades[i])}"`);
    dots += `<rect x="${(x - 40).toFixed(1)}" y="${(y + r + 16).toFixed(1)}" width="80" height="9" rx="4.5" fill="${muted}" fill-opacity="0.55" />`;
  }

  let links = "";
  [
    [0, 5],
    [2, 4],
  ].forEach(([a, b]) => {
    const p = pts[a];
    const q = pts[b];
    const mx = (p.x + q.x) / 2 + (p.y - q.y) * 0.25;
    const my = (p.y + q.y) / 2 + (q.x - p.x) * 0.25;
    links += `<path d="M ${p.x.toFixed(1)} ${p.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}"
      fill="none" stroke="${tokenHex("magenta", "300")}" stroke-width="5" stroke-opacity="0.55" />`;
  });

  // Center the scatter's bounding box on the canvas.
  const xs = pts.flatMap((p) => [p.x - p.r, p.x + p.r]);
  const ys = pts.flatMap((p) => [p.y - p.r, p.y + p.r + 55]);
  const shiftX = W / 2 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const shiftY = H / 2 - (Math.min(...ys) + Math.max(...ys)) / 2;

  return frame(
    `<g transform="translate(${shiftX.toFixed(1)} ${shiftY.toFixed(1)})">${links}${dots}</g>`,
  );
}

// #5 "Day Themes system". Seven day-bands, one theme circle each; the first
// band still carries the old to-do chaos settling into order.
function card5(): string {
  const bandW = 118;
  const gap = 22;
  const total = 7 * bandW + 6 * gap;
  const x0 = (W - total) / 2;
  const bandH = H * 0.62;
  const bandY = (H - bandH) / 2;
  // Dot height encodes the day's rhythm; the azure shade is bound to the
  // position, so the same shade always sits at the same height (top 400,
  // middle 500, bottom 600).
  const slots: Record<string, number> = { top: 0.22, middle: 0.5, bottom: 0.78 };
  const slotShade: Record<string, string> = { top: "400", middle: "500", bottom: "600" };
  const week = ["middle", "top", "middle", "bottom", "top", "middle", "bottom"];

  let bands = "";
  week.forEach((slot, i) => {
    const x = x0 + i * (bandW + gap);
    bands += `<rect x="${x}" y="${bandY}" width="${bandW}" height="${bandH}" rx="16" fill="${tokenHex("magenta", i % 2 === 0 ? "100" : "50")}" />`;
    bands += circle(
      x + bandW / 2,
      bandY + bandH * slots[slot],
      36,
      `fill="${tokenHex("azure", slotShade[slot])}"`,
    );
  });

  return frame(bands);
}

// #6 "Tbilisi swaps". A closed ring of varied circles with the flow
// circulating between them — clothes and community going around.
function card6(): string {
  const cx = W * 0.5;
  const cy = H * 0.52;
  const ringR = 195;
  const count = 7;
  const colors = [
    tokenHex("magenta", "500"),
    tokenHex("magenta", "300"),
    tokenHex("magenta", "600"),
    tokenHex("magenta", "400"),
    tokenHex("magenta", "700"),
    tokenHex("magenta", "500"),
    tokenHex("magenta", "200"),
  ];

  let flow = "";
  let members = "";
  for (let i = 0; i < count; i++) {
    const a1 = (i / count) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 1) / count) * Math.PI * 2 - Math.PI / 2;
    const gapA = 0.34;
    const sx = cx + Math.cos(a1 + gapA) * ringR;
    const sy = cy + Math.sin(a1 + gapA) * ringR;
    const ex = cx + Math.cos(a2 - gapA) * ringR;
    const ey = cy + Math.sin(a2 - gapA) * ringR;
    flow += `<path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${ringR} ${ringR} 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)}"
      fill="none" stroke="${tokenHex("magenta", "300")}" stroke-width="6" stroke-opacity="0.85" stroke-linecap="round" />`;
    members += circle(
      cx + Math.cos(a1) * ringR,
      cy + Math.sin(a1) * ringR,
      28 + rand(`sw-r${i}`) * 14,
      `fill="${colors[i]}"`,
    );
  }

  const ripples = [
    { r: 300, opacity: 0.4 },
    { r: 385, opacity: 0.28 },
    { r: 480, opacity: 0.18 },
    { r: 590, opacity: 0.1 },
  ]
    .map((ripple) =>
      circle(
        cx,
        cy,
        ripple.r,
        `fill="none" stroke="${tokenHex("magenta", "500")}" stroke-width="3" stroke-opacity="${ripple.opacity}"`,
      ),
    )
    .join("");

  return frame(`${ripples}${flow}${members}`);
}

// #7 "Nerdy curiosity". The rabbit hole: dots spiraling inward, getting
// brighter and bigger the deeper they go, proof shining at the bottom.
function card7(): string {
  const cx = W * 0.5;
  const cy = H * 0.5;
  const turns = 2.2;
  const count = 7;
  const shades = [
    tokenHex("magenta", "200"),
    tokenHex("magenta", "300"),
    tokenHex("magenta", "400"),
    tokenHex("magenta", "500"),
    tokenHex("magenta", "600"),
    tokenHex("magenta", "700"),
    tokenHex("magenta", "700"),
  ];

  const point = (t: number): [number, number] => {
    const angle = -Math.PI / 2 + t * turns * Math.PI * 2;
    const dist = 350 * (1 - t * 0.82) + 16;
    return [cx + Math.cos(angle) * dist * 1.12, cy + Math.sin(angle) * dist * 0.72];
  };

  // Faint guide path so the spiral reads as one motion, then the dots.
  let guide = "";
  for (let i = 0; i <= 80; i++) {
    const [x, y] = point(i / 80);
    guide += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }

  let spiral = `<path d="${guide}" fill="none" stroke="${muted}" stroke-width="3" stroke-opacity="0.3" />`;
  let last: [number, number] = [cx, cy];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const [x, y] = point(t);
    const color = shades[i];
    spiral += circle(x, y, 18 + t * 24, `fill="${color}"`);
    last = [x, y];
  }
  spiral += circle(
    last[0],
    last[1],
    62,
    `fill="none" stroke="${tokenHex("magenta", "700")}" stroke-width="5" stroke-opacity="0.55"`,
  );

  return frame(spiral);
}

// #8 "1-for-1 sprints". A wall of grey blocks broken through by an
// alternating magenta/azure path — one torture task, one joy task.
function card8(): string {
  // Row spans the same full width as the AQI bar on the air quality card.
  const gap = 24;
  const rowW = W * 0.76;
  const blockW = (rowW - 4 * gap) / 5;
  const blockH = 138;
  const x0 = W * 0.12;
  const rowY = (H - blockH) / 2;

  let path = "";
  for (let i = 0; i < 5; i++) {
    const x = x0 + i * (blockW + gap);
    const color = i % 2 === 0 ? tokenHex("magenta", "600") : tokenHex("magenta", "300");
    path += `<rect x="${x}" y="${rowY}" width="${blockW}" height="${blockH}" rx="16" fill="${color}" />`;
  }

  return frame(path);
}

// #9 "Tbilisi art map". Flame map-pins scattered like a city at night, a
// dotted exploration route visiting them one pin at a time.
function card9(): string {
  // A wide magenta brush stroke drawn as a sine wave through the city, with
  // three classic flame pins marking art places on its slopes and crest.
  const waveY = (x: number): number => 360 + 120 * Math.sin(((x + 80) * Math.PI * 2) / 900);
  let roadPath = "";
  for (let x = -80; x <= 1280; x += 20) {
    roadPath += `${x === -80 ? "M" : "L"} ${x} ${waveY(x).toFixed(1)} `;
  }
  const road = `<path d="${roadPath}"
    fill="none" stroke="${tokenHex("magenta", "100")}" stroke-width="160" stroke-linecap="round" />`;

  const pin = (x: number, tipY: number, r: number, shade: string): string => {
    const color = tokenHex("flame", shade);
    const shape = (radius: number, tip: number, fill: string): string => {
      const y = tipY - r * 1.9;
      return `${circle(x, y, radius, `fill="${fill}"`)}
      <path d="M ${(x - radius * 0.62).toFixed(1)} ${(y + radius * 0.74).toFixed(1)} L ${x} ${tip.toFixed(1)} L ${(x + radius * 0.62).toFixed(1)} ${(y + radius * 0.74).toFixed(1)} Z" fill="${fill}" />`;
    };
    return `${shape(r + 9, tipY + 14, ground)}${shape(r, tipY, color)}
    ${circle(x, tipY - r * 1.9, r * 0.38, `fill="${ground}"`)}`;
  };

  return frame(`
  ${road}
  <g transform="rotate(-15 185 ${(waveY(185) - 80).toFixed(1)})">${pin(185, waveY(185) - 80, 56, "400")}</g>
  <g transform="rotate(5 625 ${(waveY(625) + 30).toFixed(1)})">${pin(625, waveY(625) + 30, 78, "500")}</g>
  <g transform="rotate(10 1005 ${(waveY(1005) - 55).toFixed(1)})">${pin(1005, waveY(1005) - 55, 50, "600")}</g>`);
}

// #10 "Reading list". A fanned stack of books like the notebooks card but
// cascading vertically, with title lines: light jade on top, darker
// underneath, dashed deepest.
function card10(): string {
  const cx = W * 0.44;
  const cy = H * 0.47;
  const nw = 300;
  const nh = 400;

  const ghost = `<g transform="rotate(16 ${cx + 110} ${cy + 20 + nh / 2})">
    <rect x="${cx + 110 - nw / 2}" y="${cy + 20 - nh / 2}" width="${nw}" height="${nh}" rx="24"
      fill="none" stroke="${muted}" stroke-width="4" stroke-opacity="0.45" stroke-dasharray="10 12" /></g>`;

  const books = [
    { angle: 6, dx: 45, dy: 30, shade: "700", centered: false },
    { angle: -6, dx: -30, dy: -15, shade: "400", centered: true },
  ].map((book) => {
    const lineY = book.centered ? cy + book.dy - 28 : cy + book.dy - nh / 2 + 46;
    const line1X = book.centered ? cx + book.dx - (nw - 80) / 2 : cx + book.dx - nw / 2 + 40;
    const line2X = book.centered ? cx + book.dx - (nw - 140) / 2 : cx + book.dx - nw / 2 + 40;
    return `<g transform="rotate(${book.angle} ${cx + book.dx} ${cy + book.dy + nh / 2})">
      <rect x="${cx + book.dx - nw / 2}" y="${cy + book.dy - nh / 2}" width="${nw}" height="${nh}" rx="24" fill="${tokenHex("jade", book.shade)}" />
      <rect x="${line1X}" y="${lineY}" width="${nw - 80}" height="16" rx="8" fill="${ground}" fill-opacity="0.85" />
      <rect x="${line2X}" y="${lineY + 34}" width="${nw - 140}" height="16" rx="8" fill="${ground}" fill-opacity="0.6" />
    </g>`;
  });

  return frame(`${ghost}${books.join("")}`);
}

// #11 "My notebooks". The 3-notebook system fanned out, with ghost outlines
// of the formats it evolved through.
function card11(): string {
  const cx = W * 0.45;
  const cy = H * 0.5;
  const nw = 300;
  const nh = 400;

  // Stack from top: light magenta, darker underneath, dashed outline deepest.
  const ghost = `<g transform="rotate(16 ${cx + 150} ${cy + nh / 2})">
    <rect x="${cx + 150 - nw / 2}" y="${cy - nh / 2}" width="${nw}" height="${nh}" rx="24"
      fill="none" stroke="${muted}" stroke-width="4" stroke-opacity="0.45" stroke-dasharray="10 12" /></g>`;

  const notebooks = [
    { angle: 6, dx: 65, shade: "600" },
    { angle: -6, dx: -30, shade: "400" },
  ].map(
    (nb) => `<g transform="rotate(${nb.angle} ${cx + nb.dx} ${cy + nh / 2})">
      <rect x="${cx + nb.dx - nw / 2}" y="${cy - nh / 2}" width="${nw}" height="${nh}" rx="24" fill="${tokenHex("magenta", nb.shade)}" />
      <rect x="${cx + nb.dx + nw / 2 - 46}" y="${cy - nh / 2}" width="16" height="${nh}" fill="${ground}" fill-opacity="0.35" />
    </g>`,
  );

  return frame(`${ghost}${notebooks.join("")}`);
}

// #12 "Air quality". The AQI scale from aqi.in: six zones from good to
// hazardous, with the marker where Tbilisi usually sits.
function card12(): string {
  const barX = W * 0.08;
  const barW = W * 0.84;
  const barH = 84;
  const barY = H * 0.5 - barH / 2;
  const zones = [
    tokenHex("jade", "600"),
    tokenHex("lemon", "600"),
    tokenHex("flame", "400"),
    tokenHex("flame", "500"),
  ];
  const segW = barW / zones.length;

  const segments = zones
    .map(
      (color, i) =>
        `<rect x="${(barX + i * segW).toFixed(1)}" y="${barY}" width="${segW.toFixed(1)}" height="${barH}" fill="${color}" />`,
    )
    .join("");

  const markerX = barX + segW * 3;
  return frame(`
  <clipPath id="aqi-clip"><rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" /></clipPath>
  <g clip-path="url(#aqi-clip)">${segments}</g>
  ${circle(markerX, barY + barH / 2, 78, `fill="${tokenHex("flame", "400")}" stroke="${ground}" stroke-width="10"`)}
  ${circle(markerX, barY + barH / 2, 36, `fill="${ground}"`)}`);
}

// #13 "SEO checklist". Ordered checklist rows, most done, a few open, with
// the post's actual external links as a star field.
function card13(): string {
  // Geometry synced with the GoodINP bars card: dot diameter = bar width,
  // same x as the first bar, dot-to-line gap = bar gap.
  const azure = tokenHex("azure", "500");
  const barW = 108;
  const gap = 72;
  const x = (W - 5 * barW - 4 * gap) / 2 + barW / 2;
  let list = "";
  for (let i = 0; i < 3; i++) {
    const y = 145 + i * 170;
    const open = i === 2;
    list += open
      ? circle(x, y, 42, `fill="none" stroke="${azure}" stroke-width="8"`)
      : circle(x, y, 46, `fill="${azure}"`);
    list += `<rect x="${x + barW / 2 + gap}" y="${y - 15}" width="${i === 0 ? 620 : 380 + rand(`seo-w${i}`) * 180}" height="30" rx="15" fill="${muted}" fill-opacity="${open ? 0.35 : 0.55}" />`;
  }

  return frame(list);
}

// #14 "The Freedom Manifesto". A rigid grid of muted dots; one bright node
// has broken past the grid's edge, trailing light.
// #14 "The Freedom Manifesto". The three pillars freedom stands on: Create,
// Time, Connection.
function card14(): string {
  const baseline = H * 0.8;
  const pillars = [
    { h: 350, color: tokenHex("magenta", "300") },
    { h: 430, color: tokenHex("magenta", "500") },
    { h: 300, color: tokenHex("magenta", "700") },
  ];
  const pw = 148;
  const gap = 96;
  const x0 = (W - pillars.length * pw - (pillars.length - 1) * gap) / 2;

  return frame(
    pillars
      .map(
        (p, i) =>
          `<rect x="${x0 + i * (pw + gap)}" y="${baseline - p.h}" width="${pw}" height="${p.h}" rx="${pw / 2}" fill="${p.color}" />`,
      )
      .join(""),
  );
}

// #15 "Safety food list". Pantry shelves with jars: calm, orderly
// preparedness.
function card15(): string {
  const shelves = [H * 0.42, H * 0.75];
  const jars = [
    [
      { x: W * 0.3, r: 54, color: tokenHex("jade", "300") },
      { x: W * 0.5, r: 46, color: tokenHex("jade", "500") },
      { x: W * 0.68, r: 56, color: tokenHex("jade", "700") },
    ],
    [
      { x: W * 0.38, r: 58, color: tokenHex("jade", "600") },
      { x: W * 0.61, r: 50, color: tokenHex("jade", "400") },
    ],
  ];

  let pantry = "";
  shelves.forEach((sy, s) => {
    pantry += `<rect x="${W * 0.08}" y="${sy}" width="${W * 0.84}" height="7" rx="3.5" fill="${muted}" fill-opacity="0.6" />`;
    jars[s].forEach((jar) => {
      pantry += circle(jar.x, sy - jar.r, jar.r, `fill="${jar.color}"`);
    });
  });

  return frame(pantry);
}

// #16 "The power of questions". The biggest open question there is, drawn
// as three stroke-letters: WHY.
function card16(): string {
  const top = 185;
  const bottom = 445;
  const mid = (top + bottom) / 2;
  const stroke = (d: string, color: string) =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" />`;

  return frame(`
  ${stroke(`M 155 ${top} L 204 ${bottom} L 253 ${mid} L 301 ${bottom} L 350 ${top}`, tokenHex("azure", "700"))}
  ${stroke(`M 435 ${top} L 435 ${bottom} M 573 ${top} L 573 ${bottom} M 435 ${mid} L 573 ${mid}`, tokenHex("azure", "600"))}
  ${stroke(`M 655 ${top} L 740 ${mid} L 825 ${top} M 740 ${mid} L 740 ${bottom}`, tokenHex("azure", "500"))}
  ${stroke(`M 902 257 A 72 72 0 1 1 974 329 L 974 362`, tokenHex("azure", "400"))}
  ${circle(974, 443, 23, `fill="${tokenHex("azure", "400")}"`)}`);
}

// #17 "Site speed work that became GoodINP". A performance waterfall calming
// down: slow flame bars shrinking into fast jade ones under the threshold.
function card17(): string {
  const baseline = H * 0.76;
  const threshold = baseline - 120;
  const bars = [300, 228, 158, 92, 48];
  const barW = 108;
  const gap = 72;
  const x0 = (W - bars.length * barW - (bars.length - 1) * gap) / 2;

  let chart = `<line x1="${W * 0.08}" y1="${threshold}" x2="${W * 0.92}" y2="${threshold}"
    stroke="${wordmarkInk}" stroke-width="3" stroke-opacity="0.5" stroke-dasharray="4 14" stroke-linecap="round" />`;
  bars.forEach((height, i) => {
    const over = baseline - height < threshold;
    const color = over ? tokenHex("flame", "500") : tokenHex("jade", "600");
    chart += `<rect x="${x0 + i * (barW + gap)}" y="${baseline - height}" width="${barW}" height="${height}" rx="14" fill="${color}" />`;
  });
  chart += `<rect x="${W * 0.08}" y="${baseline}" width="${W * 0.84}" height="7" rx="3.5" fill="${muted}" fill-opacity="0.6" />`;

  return frame(chart);
}

// #18 "The technical half". Two interlocking halves, technical and
// marketing, forming one whole with a visible seam.
function card18(): string {
  const cx = W * 0.5;
  const cy = H * 0.5;
  const r = 210;
  const seam = 18;

  const ripples = [
    { r: 300, opacity: 0.4 },
    { r: 385, opacity: 0.28 },
    { r: 480, opacity: 0.18 },
    { r: 590, opacity: 0.1 },
  ]
    .map((ripple) =>
      circle(
        cx,
        cy,
        ripple.r,
        `fill="none" stroke="${tokenHex("azure", "500")}" stroke-width="3" stroke-opacity="${ripple.opacity}"`,
      ),
    )
    .join("");

  // Each part is a circular segment (the seam strip is cut out of one shared
  // circle), so both parts plus the gap silhouette a perfect circle.
  const h = Math.sqrt(r * r - seam * seam);
  return frame(`
  ${ripples}
  <g transform="rotate(15 ${cx} ${cy})">
    <path d="M ${cx - seam} ${(cy - h).toFixed(1)} A ${r} ${r} 0 0 0 ${cx - seam} ${(cy + h).toFixed(1)} Z" fill="${tokenHex("azure", "700")}" />
    <path d="M ${cx + seam} ${(cy - h).toFixed(1)} A ${r} ${r} 0 0 1 ${cx + seam} ${(cy + h).toFixed(1)} Z" fill="${tokenHex("azure", "400")}" />
  </g>`);
}

// Per-post bespoke cards, keyed by post order. Posts without one fall back
// to the generic ego-network card.
export const customCards: Record<number, () => string> = {
  1: card1,
  2: card2,
  3: card3,
  4: card4,
  5: card5,
  6: card6,
  7: card7,
  8: card8,
  9: card9,
  10: card10,
  11: card11,
  12: card12,
  13: card13,
  14: card14,
  15: card15,
  16: card16,
  17: card17,
  18: card18,
};

// ---------------------------------------------------------------------------
// Site-wide card: the whole constellation, laid out with the same cluster
// anchors as the brand links page, scaled to the card canvas.
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
