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

function text(
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

function makeClient(x: number, y: number): SVGGElement {
  const g = el("g") as SVGGElement;
  const c = el("circle");
  attrs(c, { cx: x, cy: y, r: 10, fill: "#1a1a1a", stroke: "#3f83f8", "stroke-width": 2 });
  const dot = el("circle");
  attrs(dot, { cx: x, cy: y, r: 3, fill: "#fff", opacity: 0.8 });
  g.appendChild(c);
  g.appendChild(dot);
  return g;
}

function makeServer(
  x: number,
  y: number,
  label: string,
  isAnycast = false
): SVGGElement {
  const g = el("g") as SVGGElement;

  if (isAnycast) {
    const glow = el("circle");
    attrs(glow, {
      cx: x,
      cy: y,
      r: 22,
      fill: "#34d399",
      opacity: 0.15,
    });
    g.appendChild(glow);
  }

  const rect = el("rect");
  attrs(rect, {
    x: x - 14,
    y: y - 14,
    width: 28,
    height: 28,
    rx: 6,
    fill: isAnycast ? "#0a2a1a" : "#1a1a1a",
    stroke: isAnycast ? "#34d399" : "#555555",
    "stroke-width": 1.5,
  });
  const t = text(x, y + 38, label, "12", "#888888");
  g.appendChild(rect);
  g.appendChild(t);
  return g;
}

// ---- Component ----

export function AnycastAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const init = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up previous
    if (cleanupRef.current) cleanupRef.current();
    container.innerHTML = "";

    const svg = el("svg") as SVGSVGElement;
    attrs(svg, { viewBox: "0 0 1200 520", width: "100%", class: "block" });
    container.appendChild(svg);

    const W = 1200;
    const H = 520;
    let running = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Background
    const bg = el("rect");
    attrs(bg, { width: W, height: H, fill: "#0a0a0a" });
    svg.appendChild(bg);

    // Divider
    const divider = el("line");
    attrs(divider, {
      x1: W / 2,
      y1: 40,
      x2: W / 2,
      y2: H - 20,
      stroke: "#1a1a1a",
      "stroke-width": 1,
      "stroke-dasharray": "4,4",
    });
    svg.appendChild(divider);

    // Titles
    svg.appendChild(text(W * 0.25, 45, "Non-Anycast DNS", "16", "#ededed", "middle", "600"));
    svg.appendChild(text(W * 0.75, 45, "Anycast DNS (v.recipes)", "16", "#ededed", "middle", "600"));

    // --- Non-Anycast (left) ---
    const nonAnycastServer = makeServer(W * 0.25, H * 0.78, "Single Server");
    svg.appendChild(nonAnycastServer);

    const seed = (n: number, xMin: number, xMax: number, yMin: number, yMax: number) => {
      const out: { x: number; y: number }[] = [];
      for (let i = 0; i < n; i++) {
        out.push({
          x: xMin + Math.random() * (xMax - xMin),
          y: yMin + Math.random() * (yMax - yMin),
        });
      }
      return out;
    };

    const nonAnycastPositions = seed(5, W * 0.06, W * 0.44, H * 0.15, H * 0.55);
    const nonAnycastClients = nonAnycastPositions.map((p) => {
      const c = makeClient(p.x, p.y);
      svg.appendChild(c);
      return { el: c, x: p.x, y: p.y };
    });

    // --- Anycast (right) ---
    const anycastServerData = [
      { x: W * 0.6, y: H * 0.65, label: "Server A" },
      { x: W * 0.73, y: H * 0.4, label: "Server B" },
      { x: W * 0.9, y: H * 0.7, label: "Server C" },
      { x: W * 0.63, y: H * 0.25, label: "Server D" },
      { x: W * 0.87, y: H * 0.45, label: "Server E" },
    ];
    const anycastServers = anycastServerData.map((s) => {
      const el = makeServer(s.x, s.y, s.label, true);
      svg.appendChild(el);
      return { el, x: s.x, y: s.y };
    });

    const anycastPositions = seed(7, W * 0.55, W * 0.95, H * 0.1, H * 0.35);
    const anycastClients = anycastPositions.map((p) => {
      const c = makeClient(p.x, p.y);
      svg.appendChild(c);
      return { el: c, x: p.x, y: p.y };
    });

    // --- Animation helpers ---

    function animatePacket(
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: string,
      duration: number,
      onDone?: () => void
    ) {
      if (!running) return;

      const line = el("line");
      attrs(line, {
        x1: fromX,
        y1: fromY,
        x2: fromX,
        y2: fromY,
        stroke: color,
        "stroke-width": 1.5,
        "stroke-opacity": 0.5,
      });
      svg.appendChild(line);

      const particle = el("circle");
      attrs(particle, { cx: fromX, cy: fromY, r: 3, fill: color, opacity: 0.9 });
      svg.appendChild(particle);

      const start = performance.now();

      function step(now: number) {
        if (!running) {
          line.remove();
          particle.remove();
          return;
        }
        const t = Math.min((now - start) / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const cx = fromX + (toX - fromX) * ease;
        const cy = fromY + (toY - fromY) * ease;
        particle.setAttribute("cx", String(cx));
        particle.setAttribute("cy", String(cy));
        line.setAttribute("x2", String(cx));
        line.setAttribute("y2", String(cy));

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          line.remove();
          particle.remove();
          onDone?.();
        }
      }
      requestAnimationFrame(step);
    }

    function animateRoundTrip(
      clientX: number,
      clientY: number,
      serverX: number,
      serverY: number,
      duration: number,
      onDone?: () => void
    ) {
      animatePacket(clientX, clientY, serverX, serverY, "#4ade80", duration, () => {
        animatePacket(serverX, serverY, clientX, clientY, "#60a5fa", duration, onDone);
      });
    }

    // --- Non-Anycast loop ---
    function loopNonAnycast() {
      if (!running) return;
      const serverX = W * 0.25;
      const serverY = H * 0.78;

      nonAnycastClients.forEach((client, i) => {
        const t = setTimeout(() => {
          if (!running) return;
          animateRoundTrip(client.x, client.y, serverX, serverY, 2500);
        }, i * 800);
        timeouts.push(t);
      });

      const next = setTimeout(loopNonAnycast, nonAnycastClients.length * 800 + 5000);
      timeouts.push(next);
    }

    // --- Anycast loop ---
    function loopAnycast() {
      if (!running) return;

      const client =
        anycastClients[Math.floor(Math.random() * anycastClients.length)];

      // Find nearest server
      let nearest = anycastServers[0];
      let minDist = Infinity;
      for (const s of anycastServers) {
        const d = Math.hypot(s.x - client.x, s.y - client.y);
        if (d < minDist) {
          minDist = d;
          nearest = s;
        }
      }

      animateRoundTrip(client.x, client.y, nearest.x, nearest.y, 1000, () => {
        const t = setTimeout(loopAnycast, 200 + Math.random() * 400);
        timeouts.push(t);
      });
    }

    loopNonAnycast();
    loopAnycast();

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
