'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GraphData, GraphNode } from '@/types';

interface GraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  colorMode?: 'layer' | 'folder' | 'churn';
}

export const LAYER_COLORS: Record<string, string> = {
  ui:        '#38bdf8',
  component: '#22d3ee',
  services:  '#818cf8',
  data:      '#F17720',
  utils:     '#4ade80',
  config:    '#fb7185',
  test:      '#fbbf24',
  other:     '#64748b',
};

// Sector positions for each layer — spread around the canvas
const LAYER_SECTORS: Record<string, { ax: number; ay: number }> = {
  ui:        { ax: 0.5,  ay: 0.15 },
  component: { ax: 0.82, ay: 0.30 },
  services:  { ax: 0.85, ay: 0.65 },
  data:      { ax: 0.5,  ay: 0.85 },
  utils:     { ax: 0.18, ay: 0.65 },
  config:    { ax: 0.15, ay: 0.30 },
  test:      { ax: 0.5,  ay: 0.5  },
  other:     { ax: 0.5,  ay: 0.5  },
};

function getFolderColor(folder: string): string {
  const h = folder.split('').reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);
  return `hsl(${Math.abs(h) % 360}, 65%, 55%)`;
}

export default function Graph({ data, onNodeClick, colorMode = 'layer' }: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getColor = useCallback((node: GraphNode): string => {
    if (colorMode === 'layer') return LAYER_COLORS[node.layer || 'other'] ?? '#64748b';
    return getFolderColor(node.folder || '');
  }, [colorMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !data.nodes.length) return;

    const W = container.clientWidth;
    const H = container.clientHeight;
    container.replaceChildren();

    // ── SVG ────────────────────────────────────────────────────────────
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.overflow = 'hidden';
    svg.style.cursor = 'grab';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="areaBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="18"/>
      </filter>
      <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5"
        markerWidth="4" markerHeight="4" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b"/>
      </marker>
    `;
    svg.appendChild(defs);

    // Camera group — render order: areas → links → labels → nodes
    const camera    = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const areaGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const lblGroup  = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const nodeGroupNS = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    camera.appendChild(areaGroup);
    camera.appendChild(linkGroup);
    camera.appendChild(lblGroup);
    camera.appendChild(nodeGroupNS);
    svg.appendChild(camera);
    container.appendChild(svg);

    // ── Zoom & Pan ─────────────────────────────────────────────────────
    let tx = 0, ty = 0, sc = 1;
    let panning = false, px0 = 0, py0 = 0;

    const applyCamera = () =>
      camera.setAttribute('transform', `translate(${tx},${ty}) scale(${sc})`);

    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const f = e.deltaY < 0 ? 1.12 : 0.88;
      const r = svg.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      tx = mx - (mx - tx) * f;
      ty = my - (my - ty) * f;
      sc = Math.max(0.08, Math.min(6, sc * f));
      applyCamera();
    }, { passive: false });

    svg.addEventListener('mousedown', e => {
      if ((e.target as Element).closest('circle')) return;
      panning = true; px0 = e.clientX - tx; py0 = e.clientY - ty;
      svg.style.cursor = 'grabbing';
    });
    const onMove = (e: MouseEvent) => { if (!panning) return; tx = e.clientX - px0; ty = e.clientY - py0; applyCamera(); };
    const onUp   = () => { panning = false; svg.style.cursor = 'grab'; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // ── Physics nodes ──────────────────────────────────────────────────
    type P = GraphNode & { x: number; y: number; vx: number; vy: number };

    const nodes: P[] = data.nodes.map((n) => {
      const sector = colorMode === 'layer'
        ? (LAYER_SECTORS[n.layer || 'other'] ?? LAYER_SECTORS.other)
        : LAYER_SECTORS.other;
      const jitter = 80;
      return {
        ...n,
        x: sector.ax * W + (Math.random() - 0.5) * jitter,
        y: sector.ay * H + (Math.random() - 0.5) * jitter,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
      };
    });

    const byId = new Map(nodes.map(n => [n.id, n]));
    const links = data.links
      .map(l => ({ ...l, s: byId.get(l.source as string)!, t: byId.get(l.target as string)! }))
      .filter(l => l.s && l.t);

    // ── Area halos (one ellipse per layer) ────────────────────────────
    // We'll update them each tick based on actual node positions
    const layerKeys = colorMode === 'layer'
      ? [...new Set(nodes.map(n => n.layer || 'other'))]
      : [...new Set(nodes.map(n => n.folder || '/'))];

    const areaElems = new Map<string, SVGEllipseElement>();
    const areaLabelElems = new Map<string, SVGTextElement>();

    layerKeys.forEach(key => {
      const color = colorMode === 'layer'
        ? (LAYER_COLORS[key] ?? '#64748b')
        : getFolderColor(key);

      const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      ellipse.setAttribute('fill', color);
      ellipse.setAttribute('fill-opacity', '0.06');
      ellipse.setAttribute('stroke', color);
      ellipse.setAttribute('stroke-opacity', '0.15');
      ellipse.setAttribute('stroke-width', '1');
      ellipse.setAttribute('filter', 'url(#areaBlur)');
      areaGroup.appendChild(ellipse);
      areaElems.set(key, ellipse);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('font-size', '9');
      txt.setAttribute('font-weight', 'bold');
      txt.setAttribute('fill', color);
      txt.setAttribute('fill-opacity', '0.5');
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('pointer-events', 'none');
      txt.setAttribute('letter-spacing', '2');
      txt.textContent = key.toUpperCase();
      lblGroup.appendChild(txt);
      areaLabelElems.set(key, txt);
    });

    // ── Link elements ──────────────────────────────────────────────────
    const linkElems = links.map(() => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', '#1e293b');
      line.setAttribute('stroke-width', '0.7');
      line.setAttribute('marker-end', 'url(#arrow)');
      linkGroup.appendChild(line);
      return line;
    });

    // ── Node elements ──────────────────────────────────────────────────
    let selectedCircle: SVGCircleElement | null = null;

    const nodeElems = nodes.map(node => {
      const color = getColor(node);
      const r = Math.max(4, Math.min(14, node.size || 6));

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', r.toString());
      circle.setAttribute('fill', color);
      circle.setAttribute('fill-opacity', '0.25');
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-width', '1.5');
      circle.setAttribute('filter', 'url(#glow)');

      const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl.textContent = node.name;
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('dy', `${r + 9}`);
      lbl.setAttribute('font-size', '7');
      lbl.setAttribute('fill', '#334155');
      lbl.setAttribute('pointer-events', 'none');

      g.appendChild(circle);
      g.appendChild(lbl);
      nodeGroupNS.appendChild(g);

      g.addEventListener('mouseenter', () => {
        if (circle !== selectedCircle) {
          circle.setAttribute('fill-opacity', '0.55');
          circle.setAttribute('stroke-width', '2');
        }
        lbl.setAttribute('fill', '#94a3b8');
      });
      g.addEventListener('mouseleave', () => {
        if (circle !== selectedCircle) {
          circle.setAttribute('fill-opacity', '0.25');
          circle.setAttribute('stroke-width', '1.5');
        }
        lbl.setAttribute('fill', '#334155');
      });
      g.addEventListener('click', e => {
        e.stopPropagation();
        // deselect old
        if (selectedCircle && selectedCircle !== circle) {
          selectedCircle.setAttribute('fill-opacity', '0.25');
          selectedCircle.setAttribute('stroke-width', '1.5');
        }
        selectedCircle = circle;
        circle.setAttribute('fill-opacity', '0.75');
        circle.setAttribute('stroke-width', '3');
        onNodeClick?.(node);
      });

      return { g, circle, lbl };
    });

    // ── Force constants (NOT scaled by alpha so repulsion stays strong) ─
    const K_REPEL   = 1200;   // repulsion between all node pairs
    const K_LINK    = 0.03;   // spring attraction along edges
    const LINK_LEN  = 100;    // ideal edge length (px)
    const K_CLUSTER = 0.012;  // pull each node toward its layer sector centroid
    const K_CENTER  = 0.001;  // very weak global center gravity
    const DAMP      = 0.82;   // velocity damping per tick

    let alpha = 1;
    let rafId = 0;

    const tick = () => {
      // Cool down — stop when settled
      if (alpha < 0.003) {
        // keep area labels updated then stop
        updateAreas();
        return;
      }
      alpha *= 0.992;

      // 1. Repulsion (constant — not scaled by alpha)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y;
          if (dx === 0 && dy === 0) { dx = 0.1; dy = 0.1; }
          const d2 = dx * dx + dy * dy;
          const d  = Math.sqrt(d2);
          const f  = K_REPEL / d2;
          const fx = (dx / d) * f, fy = (dy / d) * f;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        }
      }

      // 2. Link spring
      links.forEach(l => {
        const dx = l.t.x - l.s.x, dy = l.t.y - l.s.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = (d - LINK_LEN) * K_LINK;
        l.s.vx += (dx / d) * f; l.s.vy += (dy / d) * f;
        l.t.vx -= (dx / d) * f; l.t.vy -= (dy / d) * f;
      });

      // 3. Cluster attraction — pull toward layer sector
      if (colorMode === 'layer') {
        nodes.forEach(n => {
          const sec = LAYER_SECTORS[n.layer || 'other'] ?? LAYER_SECTORS.other;
          n.vx += (sec.ax * W - n.x) * K_CLUSTER;
          n.vy += (sec.ay * H - n.y) * K_CLUSTER;
        });
      }

      // 4. Weak global center gravity
      nodes.forEach(n => {
        n.vx += (W / 2 - n.x) * K_CENTER;
        n.vy += (H / 2 - n.y) * K_CENTER;
      });

      // 5. Integrate + dampen
      nodes.forEach(n => {
        n.vx *= DAMP; n.vy *= DAMP;
        n.x  += n.vx; n.y  += n.vy;
      });

      // 6. Update DOM
      links.forEach((l, i) => {
        linkElems[i].setAttribute('x1', l.s.x.toFixed(1));
        linkElems[i].setAttribute('y1', l.s.y.toFixed(1));
        linkElems[i].setAttribute('x2', l.t.x.toFixed(1));
        linkElems[i].setAttribute('y2', l.t.y.toFixed(1));
      });
      nodes.forEach((n, i) =>
        nodeElems[i].g.setAttribute('transform', `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`));

      updateAreas();
      rafId = requestAnimationFrame(tick);
    };

    const updateAreas = () => {
      layerKeys.forEach(key => {
        const group = colorMode === 'layer'
          ? nodes.filter(n => (n.layer || 'other') === key)
          : nodes.filter(n => (n.folder || '/') === key);
        if (group.length === 0) return;

        const xs = group.map(n => n.x), ys = group.map(n => n.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
        const rx = Math.max(40, (maxX - minX) / 2 + 48);
        const ry = Math.max(40, (maxY - minY) / 2 + 48);

        const ellipse = areaElems.get(key);
        if (ellipse) {
          ellipse.setAttribute('cx', cx.toFixed(1));
          ellipse.setAttribute('cy', cy.toFixed(1));
          ellipse.setAttribute('rx', rx.toFixed(1));
          ellipse.setAttribute('ry', ry.toFixed(1));
        }
        const lbl = areaLabelElems.get(key);
        if (lbl) {
          lbl.setAttribute('x', cx.toFixed(1));
          lbl.setAttribute('y', (cy - ry + 14).toFixed(1));
        }
      });
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      // Use replaceChildren() so React never sees a removeChild on our native nodes
      if (container) container.replaceChildren();
    };
  }, [data, getColor, colorMode, onNodeClick]);

  // ── Legend ────────────────────────────────────────────────────────────
  const legend = colorMode === 'layer' ? Object.entries(LAYER_COLORS) : null;

  return (
    <div className="w-full h-full bg-[#08080A] relative">
      <div ref={containerRef} className="absolute inset-0" />
      {legend && (
        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
          {legend.map(([layer, color]) => (
            <div key={layer} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}88` }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
                {layer}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
