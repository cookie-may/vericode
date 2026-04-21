'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { AnalysisResult, CodeFile } from '@/types';
import { buildColorMap, FOLDER_PALETTE } from './viz-colors';

interface Props {
  data: AnalysisResult;
  onNodeClick?: (file: CodeFile) => void;
  colorMode: 'layer' | 'folder' | 'churn';
}

type BNode = {
  id: string; name: string; folder: string; angle: number;
  x: number; y: number; layer: string; fns: number; lines: number;
};
type BLink = { source: BNode; target: BNode; count: number };

export default function VizBundle({ data, onNodeClick, colorMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorMap = useMemo(() => buildColorMap(data), [data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || 800;
    const h = el.clientHeight || 600;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el).append('svg').attr('width', w).attr('height', h);
    const mainG = svg.append('g').attr('transform', `translate(${w / 2},${h / 2})`);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .on('zoom', e => mainG.attr('transform', `translate(${w / 2 + e.transform.x},${h / 2 + e.transform.y}) scale(${e.transform.k})`));
    svg.call(zoom as any);

    const radius = Math.min(w, h) / 2 - 100;
    const files = data.files.slice(0, 70);

    const folderGroups: Record<string, typeof files> = {};
    files.forEach(f => {
      const folder = f.folder || 'root';
      if (!folderGroups[folder]) folderGroups[folder] = [];
      folderGroups[folder].push(f);
    });

    const sortedFolders = Object.entries(folderGroups).sort((a, b) => b[1].length - a[1].length);
    const nodes: BNode[] = [];
    let angle = 0;

    sortedFolders.forEach(([folder, fls]) => {
      const step = 2 * Math.PI * fls.length / files.length;
      fls.forEach(f => {
        nodes.push({
          id: f.path, name: f.name, folder,
          angle, x: Math.cos(angle - Math.PI / 2) * radius,
          y: Math.sin(angle - Math.PI / 2) * radius,
          layer: f.layer, fns: f.functions.length, lines: f.lines,
        });
        angle += step / fls.length;
      });
    });

    const nodeMap: Record<string, BNode> = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const links: BLink[] = [];
    data.connections.forEach(c => {
      const src = typeof c.source === 'object' ? (c.source as any).id : c.source;
      const tgt = typeof c.target === 'object' ? (c.target as any).id : c.target;
      if (nodeMap[src] && nodeMap[tgt] && src !== tgt)
        links.push({ source: nodeMap[src], target: nodeMap[tgt], count: c.count || 1 });
    });

    const getLinkColor = (l: BLink) => colorMap[l.source.folder] ?? '#00ff9d';

    const link = mainG.selectAll<SVGPathElement, BLink>('path.bl').data(links).join('path').attr('class', 'bl')
      .attr('d', d => {
        const a1 = d.source.angle, a2 = d.target.angle;
        const x1 = Math.cos(a1 - Math.PI / 2) * (radius - 15);
        const y1 = Math.sin(a1 - Math.PI / 2) * (radius - 15);
        const x2 = Math.cos(a2 - Math.PI / 2) * (radius - 15);
        const y2 = Math.sin(a2 - Math.PI / 2) * (radius - 15);
        const mid = (a1 + a2) / 2;
        const t = 0.3 * radius;
        return `M${x1},${y1}Q${Math.cos(mid - Math.PI / 2) * t},${Math.sin(mid - Math.PI / 2) * t} ${x2},${y2}`;
      })
      .attr('fill', 'none').attr('stroke', getLinkColor)
      .attr('stroke-width', 1.8).attr('stroke-opacity', 0.35);

    const tooltip = d3.select(el).append('div')
      .style('position', 'absolute').style('display', 'none')
      .style('background', '#0f0f12').style('border', '1px solid #2d2d35')
      .style('border-radius', '6px').style('padding', '8px 12px')
      .style('pointer-events', 'none').style('font-size', '10px').style('z-index', '100');

    const node = mainG.selectAll<SVGGElement, BNode>('g.bn').data(nodes).join('g').attr('class', 'bn')
      .style('cursor', 'pointer')
      .attr('transform', d =>
        `rotate(${d.angle * 180 / Math.PI - 90}) translate(${radius},0)${d.angle > Math.PI ? ' rotate(180)' : ''}`);

    node.append('circle').attr('class', 'bc').attr('r', 6)
      .attr('fill', d => colorMap[d.folder] ?? FOLDER_PALETTE[0])
      .attr('stroke', '#0A0A0C').attr('stroke-width', 1.5)
      .attr('transform', d => d.angle > Math.PI ? 'translate(-6,0)' : 'translate(6,0)');

    node.append('text')
      .attr('dy', '0.31em').attr('x', d => d.angle > Math.PI ? -14 : 14)
      .attr('text-anchor', d => d.angle > Math.PI ? 'end' : 'start')
      .attr('fill', '#8b8b95').attr('font-size', '9px')
      .text(d => {
        const n = d.name.replace(/\.[^.]+$/, '');
        return n.length > 16 ? n.slice(0, 13) + '…' : n;
      });

    const resetState = () => {
      link.transition().duration(200)
        .attr('stroke-opacity', 0.35).attr('stroke-width', 1.8).attr('stroke', getLinkColor);
      node.selectAll<SVGCircleElement, BNode>('.bc').transition().duration(200)
        .attr('fill', d => colorMap[d.folder] ?? FOLDER_PALETTE[0])
        .attr('opacity', 1).attr('r', 6).attr('stroke', '#0A0A0C').attr('stroke-width', 1.5);
    };

    const hoverState = (id: string) => {
      const connected = new Set<string>([id]);
      links.forEach(l => { if (l.source.id === id || l.target.id === id) { connected.add(l.source.id); connected.add(l.target.id); } });
      link.transition().duration(200)
        .attr('stroke-opacity', l => l.source.id === id || l.target.id === id ? 0.88 : 0.04)
        .attr('stroke-width', l => l.source.id === id || l.target.id === id ? 3.1 : 1)
        .attr('stroke', l => l.source.id === id || l.target.id === id ? '#00ff9d' : getLinkColor(l));
      node.selectAll<SVGCircleElement, BNode>('.bc').transition().duration(200)
        .attr('opacity', d => connected.has(d.id) ? 1 : 0.22)
        .attr('r', d => d.id === id ? 9 : 6)
        .attr('stroke', d => d.id === id ? '#00ff9d' : '#0A0A0C')
        .attr('stroke-width', d => d.id === id ? 2 : 1.5);
    };

    node
      .on('mouseenter', function(e, d) {
        const rect = el.getBoundingClientRect();
        tooltip.html(`<div style="font-weight:600;color:#00ff9d;margin-bottom:4px">${d.name}</div>
          <div style="color:#8b8b95">Lines: <span style="color:#f0f0f2">${d.lines}</span></div>
          <div style="color:#8b8b95">Functions: <span style="color:#f0f0f2">${d.fns}</span></div>
          <div style="color:#8b8b95">Folder: <span style="color:#f0f0f2">${d.folder}</span></div>`)
          .style('display', 'block')
          .style('left', `${e.clientX - rect.left + 15}px`)
          .style('top', `${e.clientY - rect.top + 15}px`);
        hoverState(d.id);
      })
      .on('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        tooltip.style('left', `${e.clientX - rect.left + 15}px`).style('top', `${e.clientY - rect.top + 15}px`);
      })
      .on('mouseleave', () => { tooltip.style('display', 'none'); resetState(); })
      .on('click', (_, d) => {
        if (onNodeClick) {
          const file = data.files.find(f => f.path === d.id);
          if (file) onNodeClick(file);
        }
      });

    // Folder arc segments
    const arcGen = d3.arc<any>().innerRadius(radius + 20).outerRadius(radius + 30);
    let arcStart = 0;
    sortedFolders.forEach(([folder, fls], i) => {
      const span = 2 * Math.PI * fls.length / files.length;
      mainG.append('path')
        .attr('d', arcGen({ startAngle: arcStart, endAngle: arcStart + span }))
        .attr('fill', colorMap[folder] ?? FOLDER_PALETTE[i % FOLDER_PALETTE.length])
        .attr('opacity', 0.5);
      if (span > 0.15) {
        const mid = arcStart + span / 2 - Math.PI / 2;
        mainG.append('text')
          .attr('x', Math.cos(mid) * (radius + 40)).attr('y', Math.sin(mid) * (radius + 40))
          .attr('text-anchor', 'middle').attr('fill', '#8b8b95').attr('font-size', '8px')
          .attr('transform', `rotate(${mid * 180 / Math.PI + 90},${Math.cos(mid) * (radius + 40)},${Math.sin(mid) * (radius + 40)})`)
          .text(folder.split('/').pop() || 'root');
      }
      arcStart += span;
    });

    svg.on('click', resetState);

    return () => { d3.select(el).selectAll('*').remove(); };
  }, [data, colorMode, colorMap, onNodeClick]);

  return <div ref={containerRef} className="w-full h-full" />;
}
