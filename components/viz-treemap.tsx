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

export default function VizTreemap({ data, onNodeClick, colorMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorMap = useMemo(() => buildColorMap(data), [data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || 800;
    const h = el.clientHeight || 600;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el).append('svg')
      .attr('width', w).attr('height', h).style('cursor', 'grab');
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', e => g.attr('transform', e.transform.toString()));
    svg.call(zoom as any);

    // Build hierarchy
    const folderMap: Record<string, { name: string; children: unknown[] }> = {};
    data.files.forEach(f => {
      const folder = f.folder || 'root';
      if (!folderMap[folder]) folderMap[folder] = { name: folder, children: [] };
      (folderMap[folder].children as unknown[]).push({
        name: f.name, value: f.lines || 1, path: f.path,
        layer: f.layer, fns: f.functions.length, folder, churn: f.churn,
      });
    });
    const hier = { name: 'root', children: Object.values(folderMap) };

    const root = d3.hierarchy<any>(hier)
      .sum(d => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    d3.treemap<any>().size([w - 20, h - 20]).padding(3).round(true)(root);

    const getColor = (d: any) => {
      if (colorMode === 'layer') {
        const LAYER: Record<string, string> = {
          ui: '#38bdf8', component: '#22d3ee', services: '#818cf8',
          data: '#F17720', utils: '#4ade80', config: '#fb7185',
          test: '#fbbf24', other: '#64748b',
        };
        return LAYER[d.data.layer] ?? '#64748b';
      }
      if (colorMode === 'churn') {
        const c = d.data.churn ?? 0;
        return c >= 7 ? '#ff5f5f' : c >= 4 ? '#ff9f43' : '#22c55e';
      }
      const idx = Object.values(folderMap).findIndex(fm => fm.name === d.parent?.data.name);
      return colorMap[d.parent?.data.name] ?? FOLDER_PALETTE[Math.max(0, idx) % FOLDER_PALETTE.length];
    };

    // d3.treemap() mutates root in place to add x0/y0/x1/y1 — cast leaves to any
    const leaves = root.leaves() as any[];
    const cells = g.selectAll<SVGGElement, any>('g.tcell')
      .data(leaves)
      .join('g').attr('class', 'tcell')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    cells.append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d: any) => getColor(d)).attr('opacity', 0.85)
      .attr('rx', 3).attr('stroke', '#0A0A0C').attr('stroke-width', 1)
      .style('cursor', 'pointer');

    cells.filter((d: any) => d.x1 - d.x0 > 45 && d.y1 - d.y0 > 22)
      .append('text').attr('x', 4).attr('y', 14)
      .attr('fill', 'white').attr('font-size', '10px').attr('font-weight', '500')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)').style('pointer-events', 'none')
      .text((d: any) => {
        const n = d.data.name.replace(/\.[^.]+$/, '');
        const max = Math.floor((d.x1 - d.x0 - 8) / 6);
        return n.length > max ? n.slice(0, max - 1) + '…' : n;
      });

    cells.filter((d: any) => d.x1 - d.x0 > 60 && d.y1 - d.y0 > 35)
      .append('text').attr('x', 4).attr('y', 26)
      .attr('fill', 'rgba(255,255,255,0.6)').attr('font-size', '8px')
      .style('pointer-events', 'none')
      .text((d: any) => `${d.data.value} lines`);

    const tooltip = d3.select(el).append('div')
      .style('position', 'absolute').style('display', 'none')
      .style('background', '#0f0f12').style('border', '1px solid #2d2d35')
      .style('border-radius', '6px').style('padding', '8px 12px')
      .style('pointer-events', 'none').style('font-size', '10px').style('z-index', '100');

    cells
      .on('mouseenter', function(e, d) {
        tooltip.html(`<div style="font-weight:600;color:#00ff9d;margin-bottom:4px">${d.data.name}</div>
          <div style="color:#8b8b95">Lines: <span style="color:#f0f0f2">${d.data.value}</span></div>
          <div style="color:#8b8b95">Functions: <span style="color:#f0f0f2">${d.data.fns ?? 0}</span></div>
          <div style="color:#8b8b95">Layer: <span style="color:#f0f0f2">${d.data.layer ?? '—'}</span></div>`)
          .style('display', 'block')
          .style('left', `${e.offsetX + 15}px`).style('top', `${e.offsetY + 15}px`);
        d3.select(this).select('rect').transition().duration(150)
          .attr('opacity', 1).attr('stroke', '#00ff9d').attr('stroke-width', 2);
      })
      .on('mousemove', (e) => {
        tooltip.style('left', `${e.offsetX + 15}px`).style('top', `${e.offsetY + 15}px`);
      })
      .on('mouseleave', function() {
        tooltip.style('display', 'none');
        d3.select(this).select('rect').transition().duration(150)
          .attr('opacity', 0.85).attr('stroke', '#0A0A0C').attr('stroke-width', 1);
      })
      .on('click', (_, d) => {
        if (d.data.path && onNodeClick) {
          const file = data.files.find(f => f.path === d.data.path);
          if (file) onNodeClick(file);
        }
      });

    svg.on('dblclick.zoom', e => {
      e.preventDefault();
      svg.transition().duration(300).call((zoom as any).scaleTo, 1);
    });

    return () => { d3.select(el).selectAll('*').remove(); };
  }, [data, colorMode, colorMap, onNodeClick]);

  return <div ref={containerRef} className="w-full h-full" />;
}
