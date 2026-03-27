"use client";

import { useEffect, useRef, useCallback } from "react";

// ---- SVG helpers ----
const NS = "http://www.w3.org/2000/svg";

function el(tag: string): SVGElement {
  return document.createElementNS(NS, tag);
}

function attrs(e: SVGElement, a: Record<string, string | number>) {
  for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
}

function svgText(
  x: number,
  y: number,
  content: string,
  size = "14",
  fill = "#ededed",
  anchor = "middle",
  weight = "normal"
): SVGTextElement {
  const t = el("text") as SVGTextElement;
  attrs(t, {
    x,
    y,
    "text-anchor": anchor,
    fill,
    "font-size": size,
    "font-weight": weight,
    "font-family":
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  });
  t.textContent = content;
  return t;
}

// ---- Data structures ----

interface MeshNode {
  x: number;
  y: number;
  congestion: number;
  el: SVGCircleElement;
}

interface MeshEdge {
  a: number; // index into nodes
  b: number;
  congestion: number;
  el: SVGLineElement;
}

interface UpstreamServer {
  x: number;
  y: number;
  label: string;
  congestion: number;
  connectedNodes: number[]; // indices into meshNodes
}

// ---- A* pathfinding ----

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(bx - ax, by - ay);
}

function astar(
  startIdx: number,
  endIdx: number,
  nodes: MeshNode[],
  edges: MeshEdge[]
): number[] | null {
  const gScore = new Map<number, number>();
  const fScore = new Map<number, number>();
  const cameFrom = new Map<number, number>();
  const openSet = new Set<number>();

  for (let i = 0; i < nodes.length; i++) {
    gScore.set(i, Infinity);
    fScore.set(i, Infinity);
  }

  gScore.set(startIdx, 0);
  fScore.set(
    startIdx,
    dist(nodes[startIdx].x, nodes[startIdx].y, nodes[endIdx].x, nodes[endIdx].y)
  );
  openSet.add(startIdx);

  // Build adjacency
  const adj = new Map<number, { neighbor: number; edgeIdx: number }[]>();
  for (let i = 0; i < nodes.length; i++) adj.set(i, []);
  edges.forEach((e, ei) => {
    adj.get(e.a)!.push({ neighbor: e.b, edgeIdx: ei });
    adj.get(e.b)!.push({ neighbor: e.a, edgeIdx: ei });
  });

  while (openSet.size > 0) {
    let current = -1;
    let best = Infinity;
    for (const n of openSet) {
      const f = fScore.get(n)!;
      if (f < best) {
        best = f;
        current = n;
      }
    }
    if (current === endIdx) {
      // Reconstruct
      const path = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current)!;
        path.unshift(current);
      }
      return path;
    }

    openSet.delete(current);

    for (const { neighbor, edgeIdx } of adj.get(current)!) {
      const edgeCongestion = edges[edgeIdx].congestion;
      const nodeCongestion = nodes[neighbor].congestion;
      const tentative =
        gScore.get(current)! +
        dist(
          nodes[current].x,
          nodes[current].y,
          nodes[neighbor].x,
          nodes[neighbor].y
        ) +
        nodeCongestion * 100 +
        edgeCongestion * 60;

      if (tentative < gScore.get(neighbor)!) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentative);
        fScore.set(
          neighbor,
          tentative +
            dist(
              nodes[neighbor].x,
              nodes[neighbor].y,
              nodes[endIdx].x,
              nodes[endIdx].y
            ) +
            nodeCongestion * 50
        );
        openSet.add(neighbor);
      }
    }
  }

  return null;
}

// ---- Component ----

export function AIMLAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const init = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (cleanupRef.current) cleanupRef.current();
    container.innerHTML = "";

    const svg = el("svg") as SVGSVGElement;
    attrs(svg, { viewBox: "0 0 1200 560", width: "100%", class: "block" });
    container.appendChild(svg);

    const W = 1200;
    const H = 560;
    let running = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Background
    const bg = el("rect");
    attrs(bg, { width: W, height: H, fill: "#0a0a0a" });
    svg.appendChild(bg);

    // Title
    svg.appendChild(
      svgText(
        W / 2,
        40,
        "Congestion Control & Optimal Path Routing",
        "16",
        "#ededed",
        "middle",
        "600"
      )
    );

    // --- Client ---
    const clientX = W * 0.08;
    const clientY = H * 0.5;
    const clientG = el("g");
    const clientCircle = el("circle");
    attrs(clientCircle, {
      cx: clientX,
      cy: clientY,
      r: 12,
      fill: "#1a1a1a",
      stroke: "#3f83f8",
      "stroke-width": 2,
    });
    const clientDot = el("circle");
    attrs(clientDot, { cx: clientX, cy: clientY, r: 4, fill: "#fff", opacity: 0.8 });
    clientG.appendChild(clientCircle);
    clientG.appendChild(clientDot);
    svg.appendChild(clientG);
    svg.appendChild(svgText(clientX, clientY + 28, "Client", "12", "#888888"));

    // --- Mesh Nodes ---
    const meshNodes: MeshNode[] = [];
    const numNodes = 12;
    const meshCX = W * 0.4;
    const meshCY = H * 0.5;
    const meshRadius = 180;

    // Use seeded-ish positions for determinism
    const angles = Array.from({ length: numNodes }, (_, i) =>
      (i / numNodes) * 2 * Math.PI + ((i % 3) * 0.3)
    );
    const radii = angles.map(
      (_, i) => meshRadius * (0.3 + 0.7 * ((i * 7 + 3) % 11) / 11)
    );

    for (let i = 0; i < numNodes; i++) {
      const nx = meshCX + radii[i] * Math.cos(angles[i]);
      const ny = meshCY + radii[i] * Math.sin(angles[i]);
      const c = el("circle") as SVGCircleElement;
      attrs(c, {
        cx: nx,
        cy: ny,
        r: 5,
        fill: "#1a1a1a",
        stroke: "#3f83f8",
        "stroke-width": 1.5,
      });
      svg.appendChild(c);
      meshNodes.push({ x: nx, y: ny, congestion: 0, el: c });
    }

    // --- Mesh Edges (connect nearby nodes) ---
    const meshEdges: MeshEdge[] = [];

    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const d = dist(meshNodes[i].x, meshNodes[i].y, meshNodes[j].x, meshNodes[j].y);
        // Connect if close enough, with some randomness for variety
        if (d < meshRadius * 0.9 && ((i * 3 + j * 7) % 5 !== 0)) {
          const line = el("line") as SVGLineElement;
          attrs(line, {
            x1: meshNodes[i].x,
            y1: meshNodes[i].y,
            x2: meshNodes[j].x,
            y2: meshNodes[j].y,
            stroke: "#3f83f8",
            "stroke-width": 1,
            "stroke-opacity": 0.2,
          });
          svg.appendChild(line);
          meshEdges.push({ a: i, b: j, congestion: 0, el: line });
        }
      }
    }

    // --- Upstream Servers ---
    const upstreamData = [
      { x: W * 0.72, y: H * 0.25, label: "DNS A" },
      { x: W * 0.85, y: H * 0.5, label: "DNS B" },
      { x: W * 0.72, y: H * 0.75, label: "DNS C" },
      { x: W * 0.9, y: H * 0.3, label: "DNS D" },
      { x: W * 0.88, y: H * 0.72, label: "DNS E" },
    ];

    const upstreamServers: UpstreamServer[] = upstreamData.map((s) => {
      // Draw server
      const g = el("g");
      const glow = el("circle");
      attrs(glow, { cx: s.x, cy: s.y, r: 20, fill: "#3f83f8", opacity: 0.1 });
      const rect = el("rect");
      attrs(rect, {
        x: s.x - 14,
        y: s.y - 14,
        width: 28,
        height: 28,
        rx: 6,
        fill: "#0a0a0a",
        stroke: "#3f83f8",
        "stroke-width": 1.5,
      });
      g.appendChild(glow);
      g.appendChild(rect);
      g.appendChild(svgText(s.x, s.y + 35, s.label, "11", "#888888"));
      svg.appendChild(g);

      // Connect to 2-3 random mesh nodes
      const connectedNodes: number[] = [];
      const shuffled = [...Array(numNodes).keys()].sort(
        () => Math.random() - 0.5
      );
      const count = 2 + Math.floor(Math.random() * 2);
      for (let k = 0; k < count && k < shuffled.length; k++) {
        connectedNodes.push(shuffled[k]);
        const line = el("line") as SVGLineElement;
        attrs(line, {
          x1: s.x,
          y1: s.y,
          x2: meshNodes[shuffled[k]].x,
          y2: meshNodes[shuffled[k]].y,
          stroke: "#3f83f8",
          "stroke-width": 1,
          "stroke-opacity": 0.15,
        });
        svg.appendChild(line);
        // Also add to meshEdges so A* can route through them
        // We treat the upstream server as a virtual node
      }

      return { ...s, congestion: 0, connectedNodes };
    });

    // --- Animation ---

    function animateAlongPath(
      points: { x: number; y: number }[],
      color: string,
      duration: number,
      onDone?: () => void
    ) {
      if (!running || points.length < 2) {
        onDone?.();
        return;
      }

      // Compute total length
      let totalLen = 0;
      const segLens: number[] = [0];
      for (let i = 1; i < points.length; i++) {
        const d = dist(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
        totalLen += d;
        segLens.push(totalLen);
      }

      const particle = el("circle");
      attrs(particle, {
        cx: points[0].x,
        cy: points[0].y,
        r: 3.5,
        fill: color,
        opacity: 0.9,
      });
      svg.appendChild(particle);

      // Trail line
      const trail = el("line");
      attrs(trail, {
        x1: points[0].x,
        y1: points[0].y,
        x2: points[0].x,
        y2: points[0].y,
        stroke: color,
        "stroke-width": 1.5,
        "stroke-opacity": 0.4,
      });
      svg.appendChild(trail);

      const start = performance.now();

      function step(now: number) {
        if (!running) {
          particle.remove();
          trail.remove();
          return;
        }

        const t = Math.min((now - start) / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const traveled = ease * totalLen;

        // Find which segment we're on
        let segIdx = 0;
        for (let i = 1; i < segLens.length; i++) {
          if (segLens[i] >= traveled) {
            segIdx = i - 1;
            break;
          }
          segIdx = i - 1;
        }

        const segStart = segLens[segIdx];
        const segEnd = segLens[segIdx + 1] || totalLen;
        const segT = segEnd > segStart ? (traveled - segStart) / (segEnd - segStart) : 0;

        const p0 = points[segIdx];
        const p1 = points[segIdx + 1] || points[segIdx];
        const cx = p0.x + (p1.x - p0.x) * segT;
        const cy = p0.y + (p1.y - p0.y) * segT;

        particle.setAttribute("cx", String(cx));
        particle.setAttribute("cy", String(cy));

        // Trail shows last segment
        trail.setAttribute("x1", String(p0.x));
        trail.setAttribute("y1", String(p0.y));
        trail.setAttribute("x2", String(cx));
        trail.setAttribute("y2", String(cy));

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          particle.remove();
          trail.remove();
          onDone?.();
        }
      }

      requestAnimationFrame(step);
    }

    function updateCongestionVisuals() {
      for (const edge of meshEdges) {
        if (edge.congestion > 0.5) {
          const intensity = Math.min(edge.congestion / 5, 1);
          // Lerp from blue to red
          const r = Math.round(63 + (255 - 63) * intensity);
          const g = Math.round(131 - 131 * intensity);
          const b = Math.round(248 - 248 * intensity);
          edge.el.setAttribute("stroke", `rgb(${r},${g},${b})`);
          edge.el.setAttribute(
            "stroke-width",
            String(1 + intensity * 3)
          );
          edge.el.setAttribute(
            "stroke-opacity",
            String(0.2 + intensity * 0.6)
          );
        } else {
          edge.el.setAttribute("stroke", "#3f83f8");
          edge.el.setAttribute("stroke-width", "1");
          edge.el.setAttribute("stroke-opacity", "0.2");
        }
      }

      for (const node of meshNodes) {
        if (node.congestion > 0.5) {
          const intensity = Math.min(node.congestion / 4, 1);
          const r = Math.round(26 + (100) * intensity);
          node.el.setAttribute("fill", `rgb(${r}, ${Math.round(26 - 10 * intensity)}, ${Math.round(26 - 10 * intensity)})`);
          node.el.setAttribute("r", String(5 + intensity * 3));
        } else {
          node.el.setAttribute("fill", "#1a1a1a");
          node.el.setAttribute("r", "5");
        }
      }
    }

    function decayCongestion() {
      for (const edge of meshEdges) edge.congestion *= 0.85;
      for (const node of meshNodes) node.congestion *= 0.9;
      for (const s of upstreamServers) s.congestion *= 0.9;
    }

    function animateRequest() {
      if (!running) return;

      // 1. Find closest mesh node to client
      let entryIdx = 0;
      let minD = Infinity;
      for (let i = 0; i < meshNodes.length; i++) {
        const d = dist(clientX, clientY, meshNodes[i].x, meshNodes[i].y);
        if (d < minD) {
          minD = d;
          entryIdx = i;
        }
      }
      meshNodes[entryIdx].congestion++;

      // 2. Pick random upstream and one of its connected nodes as exit
      const server =
        upstreamServers[Math.floor(Math.random() * upstreamServers.length)];
      const exitIdx =
        server.connectedNodes[
          Math.floor(Math.random() * server.connectedNodes.length)
        ];
      server.congestion++;

      // 3. A* path
      const pathIndices = astar(entryIdx, exitIdx, meshNodes, meshEdges);

      if (!pathIndices || pathIndices.length === 0) {
        // No path -- just do a direct animation
        const points = [
          { x: clientX, y: clientY },
          { x: meshNodes[entryIdx].x, y: meshNodes[entryIdx].y },
          { x: server.x, y: server.y },
        ];
        animateAlongPath(points, "#4ade80", 2000, () => {
          const rev = [...points].reverse();
          animateAlongPath(rev, "#60a5fa", 2000, () => {
            decayCongestion();
            updateCongestionVisuals();
            const t = setTimeout(animateRequest, 300);
            timeouts.push(t);
          });
        });
        return;
      }

      // Mark congestion on used edges
      for (let i = 1; i < pathIndices.length; i++) {
        const a = pathIndices[i - 1];
        const b = pathIndices[i];
        for (const edge of meshEdges) {
          if ((edge.a === a && edge.b === b) || (edge.a === b && edge.b === a)) {
            edge.congestion++;
            break;
          }
        }
      }

      // 4. Build point list: client -> entry -> path -> exit -> server
      const fwdPoints: { x: number; y: number }[] = [
        { x: clientX, y: clientY },
      ];
      for (const idx of pathIndices) {
        fwdPoints.push({ x: meshNodes[idx].x, y: meshNodes[idx].y });
      }
      fwdPoints.push({ x: server.x, y: server.y });

      const totalPathLen = fwdPoints.reduce((sum, p, i) => {
        if (i === 0) return 0;
        return sum + dist(fwdPoints[i - 1].x, fwdPoints[i - 1].y, p.x, p.y);
      }, 0);

      const duration = 1500 + (totalPathLen / 100) * 150;

      updateCongestionVisuals();

      // Forward (request)
      animateAlongPath(fwdPoints, "#4ade80", duration, () => {
        // Reverse (response)
        const revPoints = [...fwdPoints].reverse();
        animateAlongPath(revPoints, "#60a5fa", duration, () => {
          decayCongestion();
          updateCongestionVisuals();
          const t = setTimeout(animateRequest, 200 + Math.random() * 300);
          timeouts.push(t);
        });
      });
    }

    animateRequest();

    cleanupRef.current = () => {
      running = false;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    init();
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [init]);

  return <div ref={containerRef} className="w-full" />;
}
