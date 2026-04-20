'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GraphData, GraphNode } from '@/types';

interface GraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  colorMode?: 'layer' | 'folder' | 'churn';
}

const LAYER_COLORS: Record<string, string> = {
  ui: '#38bdf8',
  component: '#22d3ee',
  services: '#818cf8',
  data: '#F17720',
  utils: '#4ade80',
  config: '#fb7185',
  test: '#fbbf24',
  other: '#64748b', // Tambahkan 'other' agar tidak undefined
};

export default function Graph({ data, onNodeClick, colorMode = 'layer' }: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodeColor = useCallback((node: GraphNode): string => {
    if (colorMode === 'layer') {
      return LAYER_COLORS[node.layer || 'other'] || '#64748b';
    }
    if (colorMode === 'folder') {
      const hash = node.folder?.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) || 0;
      return `hsl(${Math.abs(hash) % 360}, 70%, 55%)`;
    }
    return '#F17720';
  }, [colorMode]);

  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Bersihkan SVG setiap kali data atau mode warna berubah
    if (svgRef.current) svgRef.current.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svgRef.current = svg;

    // Setup Defs (Glow & Arrows)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b"/></marker>
    `;
    svg.appendChild(defs);

    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainGroup.appendChild(linkGroup);
    mainGroup.appendChild(nodeGroup);
    svg.appendChild(mainGroup);

    // Initial Physics
    const nodes = data.nodes.map(n => ({ ...n, x: width / 2, y: height / 2, vx: 0, vy: 0 }));
    const validLinks = data.links
      .map(l => ({ ...l, s: nodes.find(n => n.id === l.source), t: nodes.find(n => n.id === l.target) }))
      .filter(l => l.s && l.t);

    const linkElems = validLinks.map(() => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', '#1e293b');
      line.setAttribute('marker-end', 'url(#arrow)');
      linkGroup.appendChild(line);
      return line;
    });

    const nodeElems = nodes.map(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', (node.size || 5).toString());
      c.setAttribute('fill', getNodeColor(node));
      c.setAttribute('fill-opacity', '0.3');
      c.setAttribute('stroke', getNodeColor(node));
      c.setAttribute('stroke-width', '1.5');
      c.setAttribute('filter', 'url(#glow)');
      c.style.cursor = 'pointer';
      
      g.appendChild(c);
      nodeGroup.appendChild(g);
      g.addEventListener('click', () => onNodeClick?.(node));
      return { g, c };
    });

    let alpha = 1;
    const frame = () => {
      if (alpha < 0.01) return;
      alpha *= 0.98;

      nodes.forEach(n => {
        n.vx += (width / 2 - n.x) * 0.01;
        n.vy += (height / 2 - n.y) * 0.01;
        n.x += n.vx; n.y += n.vy;
        n.vx *= 0.8; n.vy *= 0.8;
      });

      validLinks.forEach((l, i) => {
        const dx = l.t!.x - l.s!.x;
        const dy = l.t!.y - l.s!.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (dist - 80) * 0.02;
        l.s!.vx += (dx / dist) * f; l.s!.vy += (dy / dist) * f;
        l.t!.vx -= (dx / dist) * f; l.t!.vy -= (dy / dist) * f;
        linkElems[i].setAttribute('x1', l.s!.x.toString());
        linkElems[i].setAttribute('y1', l.s!.y.toString());
        linkElems[i].setAttribute('x2', l.t!.x.toString());
        linkElems[i].setAttribute('y2', l.t!.y.toString());
      });

      nodes.forEach((n, i) => {
        nodeElems[i].g.setAttribute('transform', `translate(${n.x},${n.y})`);
      });

      requestAnimationFrame(frame);
    };

    frame();
    containerRef.current.appendChild(svg);
    return () => { alpha = 0; };
  }, [data, getNodeColor, onNodeClick]);

  return <div ref={containerRef} className="w-full h-full bg-[#08080A]" />;
}