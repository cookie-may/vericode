// @ts-nocheck
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

export default function VizCluster({ data, onNodeClick, colorMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorMap = useMemo(() => buildColorMap(data), [data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || 800;
    const h = el.clientHeight || 600;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el).append('svg').attr('width', w).attr('height', h);
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', e => g.attr('transform', e.transform.toString()));
    svg.call(zoom as unknown);

    const files = data.files.slice(0, 100);
    const fileIdx: Record<string, number> = {};
    files.forEach((f, i) => { fileIdx[f.path] = i; });

    const folders = [...new Set(files.map(f => f.folder || 'root'))];
    const cols = Math.ceil(Math.sqrt(folders.length));
    const cellW = w / cols;
    const cellH = h / Math.ceil(folders.length / cols);
    const centers: Record<string, { x: number; y: number }> = {};
    folders.forEach((f, i) => {
      centers[f] = { x: (i % cols + 0.5) * cellW, y: (Math.floor(i / cols) + 0.5) * cellH };
    });

    type SimNode = { id: string; name: string; folder: string; fns: number; lines: number; layer: string; cx: number; cy: number; x?: number; y?: number; vx?: number; vy?: number; fx?: number | null; fy?: number | null };
    const nodes: SimNode[] = files.map(f => ({
      id: f.path, name: f.name, folder: f.folder || 'root',
      fns: f.functions.length, lines: f.lines, layer: f.layer,
      cx: centers[f.folder || 'root'].x, cy: centers[f.folder || 'root'].y,
    }));

    const rawLinks: Array<{ source: string; target: string; count: number }> = [];
    data.connections.forEach(c => {
      const src = typeof c.source === 'object' ? (c.source as unknown).id : c.source;
      const tgt = typeof c.target === 'object' ? (c.target as unknown).id : c.target;
      if (fileIdx[src] !== undefined && fileIdx[tgt] !== undefined && src !== tgt)
        rawLinks.push({ source: src, target: tgt, count: c.count || 1 });
    });

    const sim = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, unknown>(rawLinks).id(d => d.id).distance(40).strength(0.3))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('x', d3.forceX<SimNode>(d => d.cx).strength(0.15))
      .force('y', d3.forceY<SimNode>(d => d.cy).strength(0.15))
      .force('collide', d3.forceCollide(15));

    // Cluster backgrounds
    g.selectAll<SVGRectElement, string>('rect.cbg').data(folders).join('rect').attr('class', 'cbg')
      .attr('x', (_, i) => (i % cols) * cellW + 10)
      .attr('y', (_, i) => Math.floor(i / cols) * cellH + 10)
      .attr('width', cellW - 20).attr('height', cellH - 20).attr('rx', 12)
      .attr('fill', (f, i) => colorMap[f] ?? FOLDER_PALETTE[i % FOLDER_PALETTE.length])
      .attr('opacity', 0.08)
      .attr('stroke', (f, i) => colorMap[f] ?? FOLDER_PALETTE[i % FOLDER_PALETTE.length])
      .attr('stroke-width', 1).attr('stroke-opacity', 0.3);

    g.selectAll<SVGTextElement, string>('text.clbl').data(folders).join('text').attr('class', 'clbl')
      .attr('x', (_, i) => (i % cols) * cellW + 20)
      .attr('y', (_, i) => Math.floor(i / cols) * cellH + 28)
      .attr('fill', '#8b8b95').attr('font-size', '11px').attr('font-weight', '600')
      .text(f => f.split('/').pop() || 'root');

    const link = g.selectAll<SVGLineElement, unknown>('line.dl').data(rawLinks).join('line').attr('class', 'dl')
      .attr('stroke', '#2d2d35').attr('stroke-width', 1).attr('stroke-opacity', 0.3);

    const tooltip = d3.select(el).append('div')
      .style('position', 'absolute').style('display', 'none')
      .style('background', '#0f0f12').style('border', '1px solid #2d2d35')
      .style('border-radius', '6px').style('padding', '8px 12px')
      .style('pointer-events', 'none').style('font-size', '10px').style('z-index', '100');

    const node = g.selectAll<SVGGElement, SimNode>('g.cn').data(nodes).join('g').attr('class', 'cn')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', function(e, d) { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', function(e, d) { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }) as unknown);

    node.append('circle').attr('class', 'cc')
      .attr('r', d => Math.max(6, Math.min(14, 4 + d.fns)))
      .attr('fill', d => colorMap[d.folder] ?? FOLDER_PALETTE[0])
      .attr('stroke', '#0A0A0C').attr('stroke-width', 1.5);

    node
      .on('mouseenter', function(e, d) {
        tooltip.html(`<div style="font-weight:600;color:#00ff9d;margin-bottom:4px">${d.name}</div>
          <div style="color:#8b8b95">Lines: <span style="color:#f0f0f2">${d.lines}</span></div>
          <div style="color:#8b8b95">Functions: <span style="color:#f0f0f2">${d.fns}</span></div>
          <div style="color:#8b8b95">Folder: <span style="color:#f0f0f2">${d.folder}</span></div>`)
          .style('display', 'block').style('left', `${e.offsetX + 15}px`).style('top', `${e.offsetY + 15}px`);
        link.attr('stroke-opacity', (l: unknown) => l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.05)
          .attr('stroke', (l: unknown) => l.source.id === d.id || l.target.id === d.id ? '#00ff9d' : '#2d2d35');
        d3.select<SVGGElement, SimNode>(this).select('circle')
          .transition().duration(150).attr('r', 14).attr('stroke', '#00ff9d').attr('stroke-width', 2);
      })
      .on('mousemove', (e) => {
        tooltip.style('left', `${e.offsetX + 15}px`).style('top', `${e.offsetY + 15}px`);
      })
      .on('mouseleave', function(_, d) {
        tooltip.style('display', 'none');
        link.attr('stroke-opacity', 0.3).attr('stroke', '#2d2d35');
        d3.select<SVGGElement, SimNode>(this).select('circle')
          .transition().duration(150)
          .attr('r', Math.max(6, Math.min(14, 4 + d.fns)))
          .attr('stroke', '#0A0A0C').attr('stroke-width', 1.5);
      })
      .on('click', (_, d) => {
        if (onNodeClick) {
          const file = data.files.find(f => f.path === d.id);
          if (file) onNodeClick(file);
        }
      });

    sim.on('tick', () => {
      link.attr('x1', (d: unknown) => d.source.x).attr('y1', (d: unknown) => d.source.y)
        .attr('x2', (d: unknown) => d.target.x).attr('y2', (d: unknown) => d.target.y);
      node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      sim.stop();
      d3.select(el).selectAll('*').remove();
    };
  }, [data, colorMode, colorMap, onNodeClick]);

  return <div ref={containerRef} className="w-full h-full" />;
}
