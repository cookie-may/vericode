'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { AnalysisResult, CodeFile } from '@/types';
import { buildColorMap } from './viz-colors';

interface Props {
  data: AnalysisResult;
  onNodeClick?: (file: CodeFile) => void;
  colorMode: 'layer' | 'folder' | 'churn';
}

export default function VizTree({ data, onNodeClick, colorMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorMap = useMemo(() => buildColorMap(data), [data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || 800;
    const h = el.clientHeight || 600;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el).append('svg').attr('width', w).attr('height', h);
    const g = svg.append('g').attr('transform', 'translate(80,20)');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', e => g.attr('transform', `translate(${80 + e.transform.x},${20 + e.transform.y}) scale(${e.transform.k})`));
    svg.call(zoom as any);

    const folderMap: Record<string, { name: string; fullPath: string; children: unknown[] }> = {};
    data.files.slice(0, 80).forEach(f => {
      const folder = f.folder || 'root';
      if (!folderMap[folder]) folderMap[folder] = {
        name: folder.split('/').pop() || 'root', fullPath: folder, children: [],
      };
      (folderMap[folder].children as unknown[]).push({
        name: f.name, path: f.path, fns: f.functions.length,
        lines: f.lines, folder, layer: f.layer,
      });
    });

    const hierData = { name: 'root', children: Object.values(folderMap) };
    const root = d3.hierarchy<any>(hierData);
    d3.cluster<any>().size([h - 60, w - 200])(root);

    const tooltip = d3.select(el).append('div')
      .style('position', 'absolute').style('display', 'none')
      .style('background', '#0f0f12').style('border', '1px solid #2d2d35')
      .style('border-radius', '6px').style('padding', '8px 12px')
      .style('pointer-events', 'none').style('font-size', '10px').style('z-index', '100');

    g.selectAll<SVGPathElement, d3.HierarchyPointLink<any>>('path.dl')
      .data(root.links() as d3.HierarchyPointLink<any>[])
      .join('path').attr('class', 'dl')
      .attr('d', (d: any) =>
        `M${d.source.y},${d.source.x}C${(d.source.y + d.target.y) / 2},${d.source.x} ${(d.source.y + d.target.y) / 2},${d.target.x} ${d.target.y},${d.target.x}`)
      .attr('fill', 'none').attr('stroke', '#2d2d35').attr('stroke-width', 1.5).attr('stroke-opacity', 0.6);

    const node = g.selectAll<SVGGElement, d3.HierarchyPointNode<any>>('g.dn')
      .data(root.descendants() as d3.HierarchyPointNode<any>[])
      .join('g').attr('class', 'dn')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer');

    node.append('circle')
      .attr('r', d => d.children ? 6 : 8)
      .attr('fill', d => {
        if (d.children) return '#252529';
        return colorMap[d.data.folder] ?? '#64748b';
      })
      .attr('stroke', d => d.children ? '#5c5c66' : '#0A0A0C')
      .attr('stroke-width', 2);

    node.filter(d => !d.children).append('text')
      .attr('x', 12).attr('dy', '0.35em')
      .attr('fill', '#c8c8cd').attr('font-size', '9px')
      .text(d => {
        const n = d.data.name.replace(/\.[^.]+$/, '');
        return n.length > 20 ? n.slice(0, 18) + '…' : n;
      });

    node.filter(d => !!d.children && d.depth > 0).append('text')
      .attr('x', -10).attr('dy', '0.35em').attr('text-anchor', 'end')
      .attr('fill', '#8b8b95').attr('font-size', '10px').attr('font-weight', '600')
      .text(d => d.data.name);

    node
      .on('mouseenter', function(e, d) {
        if (!d.data.path) return;
        tooltip.html(`<div style="font-weight:600;color:#00ff9d;margin-bottom:4px">${d.data.name}</div>
          <div style="color:#8b8b95">Lines: <span style="color:#f0f0f2">${d.data.lines ?? 0}</span></div>
          <div style="color:#8b8b95">Functions: <span style="color:#f0f0f2">${d.data.fns ?? 0}</span></div>
          <div style="color:#8b8b95">Layer: <span style="color:#f0f0f2">${d.data.layer ?? '—'}</span></div>`)
          .style('display', 'block')
          .style('left', `${e.offsetX + 15}px`).style('top', `${e.offsetY + 15}px`);
        d3.select<SVGGElement, any>(this).select('circle').transition().duration(150)
          .attr('r', 12).attr('stroke', '#00ff9d').attr('stroke-width', 3);
      })
      .on('mousemove', (e) => {
        tooltip.style('left', `${e.offsetX + 15}px`).style('top', `${e.offsetY + 15}px`);
      })
      .on('mouseleave', function(_, d) {
        tooltip.style('display', 'none');
        d3.select<SVGGElement, any>(this).select('circle').transition().duration(150)
          .attr('r', d.children ? 6 : 8)
          .attr('stroke', d.children ? '#5c5c66' : '#0A0A0C')
          .attr('stroke-width', 2);
      })
      .on('click', (_, d) => {
        if (d.data.path && onNodeClick) {
          const file = data.files.find(f => f.path === d.data.path);
          if (file) onNodeClick(file);
        }
      });

    return () => { d3.select(el).selectAll('*').remove(); };
  }, [data, colorMode, colorMap, onNodeClick]);

  return <div ref={containerRef} className="w-full h-full" />;
}
