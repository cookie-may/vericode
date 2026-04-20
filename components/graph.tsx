'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GraphData, GraphNode, GraphLink } from '@/types';

interface GraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  colorMode?: 'layer' | 'folder' | 'churn';
}

const LAYER_COLORS: Record<string, string> = {
  ui: '#0ea5e9',
  component: '#06b6d4',
  services: '#8b5cf6',
  data: '#f97316',
  utils: '#22c55e',
  config: '#ec4899',
  test: '#f59e0b',
};

export default function Graph({ data, onNodeClick, colorMode = 'layer' }: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getNodeColor = useCallback(
    (node: GraphNode): string => {
      if (colorMode === 'layer' && node.layer) {
        return LAYER_COLORS[node.layer] || '#6366f1';
      }
      if (colorMode === 'folder') {
        const hash = node.folder
          ?.split('')
          .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0) || 0;
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 50%)`;
      }
      // Default: orange for Vericode branding
      return '#F17720';
    },
    [colorMode]
  );

  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous SVG
    if (svgRef.current) {
      svgRef.current.innerHTML = '';
    }

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('class', 'bg-brand-navy');
    svgRef.current = svg;

    // Define markers for arrows
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#F17720');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Create links
    const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    linkGroup.setAttribute('class', 'links');
    data.links.forEach(link => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', '#444');
      line.setAttribute('stroke-width', Math.min(3, link.value).toString());
      line.setAttribute('opacity', '0.3');
      line.setAttribute('marker-end', 'url(#arrowhead)');
      linkGroup.appendChild(line);
    });
    svg.appendChild(linkGroup);

    // Create nodes
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodeGroup.setAttribute('class', 'nodes');
    data.nodes.forEach(node => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', node.size.toString());
      circle.setAttribute('fill', getNodeColor(node));
      circle.setAttribute('stroke', '#F17720');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('cursor', 'pointer');
      circle.setAttribute('opacity', '0.8');

      circle.addEventListener('mouseover', () => {
        circle.setAttribute('opacity', '1');
        circle.setAttribute('stroke-width', '3');
      });

      circle.addEventListener('mouseout', () => {
        circle.setAttribute('opacity', '0.8');
        circle.setAttribute('stroke-width', '2');
      });

      circle.addEventListener('click', () => {
        onNodeClick?.(node);
      });

      nodeGroup.appendChild(circle);

      // Add label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '.3em');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-size', '10');
      text.setAttribute('pointer-events', 'none');
      text.textContent = node.name.substring(0, 15);
      nodeGroup.appendChild(text);
    });
    svg.appendChild(nodeGroup);

    // Simple force simulation
    const simulate = () => {
      const nodes = data.nodes.map(n => ({
        ...n,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
      }));

      const links = data.links.map(l => ({
        ...l,
        source: nodes.find(n => n.id === l.source)!,
        target: nodes.find(n => n.id === l.target)!,
      }));

      let animating = true;
      let iterations = 0;
      const maxIterations = 100;

      const animate = () => {
        iterations++;

        // Apply forces
        nodes.forEach((node, i) => {
          node.vx = 0;
          node.vy = 0;

          // Repulsion from other nodes
          nodes.forEach((other, j) => {
            if (i === j) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (50 * 50) / (dist * dist);
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          });

          // Attraction to linked nodes
          links.forEach(link => {
            if (link.source === node) {
              const dx = link.target.x - node.x;
              const dy = link.target.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const force = (dist * dist) / 100;
              node.vx += (dx / dist) * force;
              node.vy += (dy / dist) * force;
            }
          });

          // Damping
          node.vx *= 0.95;
          node.vy *= 0.95;

          // Update position
          node.x = Math.max(20, Math.min(width - 20, node.x + node.vx));
          node.y = Math.max(20, Math.min(height - 20, node.y + node.vy));
        });

        // Update SVG elements
        const circles = linkGroup.parentElement?.querySelectorAll('circle') || [];
        const texts = nodeGroup.parentElement?.querySelectorAll('text') || [];
        const lines = linkGroup.querySelectorAll('line');

        data.links.forEach((link, i) => {
          const line = lines[i];
          const source = nodes.find(n => n.id === link.source);
          const target = nodes.find(n => n.id === link.target);
          if (source && target && line) {
            line.setAttribute('x1', source.x.toString());
            line.setAttribute('y1', source.y.toString());
            line.setAttribute('x2', target.x.toString());
            line.setAttribute('y2', target.y.toString());
          }
        });

        nodes.forEach((node, i) => {
          const circle = circles[i];
          const text = texts[i * 2 + 1];
          if (circle) {
            circle.setAttribute('cx', node.x.toString());
            circle.setAttribute('cy', node.y.toString());
          }
          if (text) {
            text.setAttribute('x', node.x.toString());
            text.setAttribute('y', node.y.toString());
          }
        });

        if (iterations < maxIterations) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    };

    simulate();
    containerRef.current?.appendChild(svg);
  }, [data, getNodeColor, onNodeClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-brand-navy border border-slate-800 rounded-lg overflow-hidden"
    />
  );
}
