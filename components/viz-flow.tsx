// @ts-nocheck
'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { AnalysisResult, CodeFile } from '@/types';
import { buildColorMap, FOLDER_PALETTE } from './viz-colors';

interface Props {
  data: AnalysisResult;
  onNodeClick?: (file: CodeFile) => void;
  colorMode: 'layer' | 'folder' | 'churn';
}

export default function VizFlow({ data, onNodeClick, colorMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorMap = useMemo(() => buildColorMap(data), [data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || 800;
    const h = el.clientHeight || 600;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el).append('svg').attr('width', w).attr('height', h);
    const g = svg.append('g').attr('transform', 'translate(20,20)');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', e => g.attr('transform', `translate(${20 + e.transform.x},${20 + e.transform.y}) scale(${e.transform.k})`));
    svg.call(zoom as unknown);

    const folders = [...new Set(data.files.map(f => f.folder || 'root'))].slice(0, 15);
    const folderIdx: Record<string, number> = {};
    folders.forEach((f, i) => { folderIdx[f] = i; });

    const flowMap: Record<string, number> = {};
    data.connections.forEach(c => {
      const src = typeof c.source === 'object' ? (c.source as unknown).id : c.source;
      const tgt = typeof c.target === 'object' ? (c.target as unknown).id : c.target;
      const sf = data.files.find(f => f.path === src);
      const tf = data.files.find(f => f.path === tgt);
      if (sf && tf && sf.folder !== tf.folder) {
        const key = `${sf.folder}|${tf.folder}`;
        flowMap[key] = (flowMap[key] ?? 0) + (c.count || 1);
      }
    });

    const linkMap: Record<string, { a: number; b: number; ab: number; ba: number }> = {};
    Object.entries(flowMap).forEach(([key, val]) => {
      const [src, tgt] = key.split('|');
      const si = folderIdx[src], ti = folderIdx[tgt];
      if (si === undefined || ti === undefined || si === ti) return;
      const k = `${Math.min(si, ti)}|${Math.max(si, ti)}`;
      if (!linkMap[k]) linkMap[k] = { a: Math.min(si, ti), b: Math.max(si, ti), ab: 0, ba: 0 };
      if (si < ti) linkMap[k].ab += val; else linkMap[k].ba += val;
    });

    const rawLinks: Array<{ source: number; target: number; value: number }> = [];
    Object.values(linkMap).forEach(l => {
      const net = l.ab - l.ba;
      if (net > 0) rawLinks.push({ source: l.a, target: l.b, value: net });
      else if (net < 0) rawLinks.push({ source: l.b, target: l.a, value: -net });
      else if (l.ab > 0) rawLinks.push({ source: l.a, target: l.b, value: l.ab });
    });

    if (rawLinks.length === 0) {
      g.append('text').attr('x', w / 2 - 20).attr('y', h / 2)
        .attr('fill', '#5c5c66').attr('font-size', '12px').attr('text-anchor', 'middle')
        .text('No cross-folder dependencies to visualize');
      return;
    }

    const fileCounts: Record<string, number> = {};
    data.files.forEach(f => {
      const folder = f.folder || 'root';
      fileCounts[folder] = (fileCounts[folder] ?? 0) + 1;
    });

    const sankeyNodes = folders.map((f, i) => ({
      id: i, name: f.split('/').pop() || 'root', fullPath: f,
      fileCount: fileCounts[f] ?? 0,
    }));

    const sk = sankey<unknown, unknown>()
      .nodeId((d: unknown) => d.id)
      .nodeWidth(20).nodePadding(15)
      .extent([[0, 0], [w - 60, h - 60]]);

    let graph: unknown;
    try {
      graph = sk({
        nodes: sankeyNodes.map(d => ({ ...d })),
        links: rawLinks.map(d => ({ ...d })),
      });
    } catch {
      g.append('text').attr('x', w / 2 - 20).attr('y', h / 2)
        .attr('fill', '#5c5c66').attr('font-size', '12px').attr('text-anchor', 'middle')
        .text('Flow diagram unavailable: circular references detected. Use Force Graph view.');
      return;
    }

    const tooltip = d3.select(el).append('div')
      .style('position', 'absolute').style('display', 'none')
      .style('background', '#0f0f12').style('border', '1px solid #2d2d35')
      .style('border-radius', '6px').style('padding', '8px 12px')
      .style('pointer-events', 'none').style('font-size', '10px').style('z-index', '100');

    g.selectAll<SVGPathElement, unknown>('path.sl')
      .data(graph.links).join('path').attr('class', 'sl')
      .attr('d', sankeyLinkHorizontal() as unknown)
      .attr('fill', 'none')
      .attr('stroke', (d: unknown) => colorMap[d.source.fullPath] ?? FOLDER_PALETTE[d.source.id % FOLDER_PALETTE.length])
      .attr('stroke-width', (d: unknown) => Math.max(2, d.width))
      .attr('stroke-opacity', 0.4)
      .on('mouseenter', function(e, d: unknown) {
        d3.select(this).attr('stroke-opacity', 0.8);
        tooltip.html(`<div style="font-weight:600;color:#00ff9d;margin-bottom:4px">${d.source.name} → ${d.target.name}</div>
          <div style="color:#8b8b95">Connections: <span style="color:#f0f0f2">${d.value}</span></div>`)
          .style('display', 'block').style('left', `${e.offsetX + 15}px`).style('top', `${e.offsetY + 15}px`);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('stroke-opacity', 0.4);
        tooltip.style('display', 'none');
      });

    const nodeG = g.selectAll<SVGGElement, unknown>('g.sn')
      .data(graph.nodes).join('g').attr('class', 'sn').style('cursor', 'pointer');

    nodeG.append('rect')
      .attr('x', (d: unknown) => d.x0).attr('y', (d: unknown) => d.y0)
      .attr('width', (d: unknown) => d.x1 - d.x0).attr('height', (d: unknown) => Math.max(4, d.y1 - d.y0))
      .attr('fill', (d: unknown) => colorMap[d.fullPath] ?? FOLDER_PALETTE[d.id % FOLDER_PALETTE.length])
      .attr('rx', 3);

    nodeG.append('text')
      .attr('x', (d: unknown) => d.x0 < w / 2 ? d.x1 + 8 : d.x0 - 8)
      .attr('y', (d: unknown) => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: unknown) => d.x0 < w / 2 ? 'start' : 'end')
      .attr('fill', '#c8c8cd').attr('font-size', '10px').attr('font-weight', '500')
      .text((d: unknown) => `${d.name} (${d.fileCount})`);

    nodeG
      .on('mouseenter', function(e, d: unknown) {
        tooltip.html(`<div style="font-weight:600;color:#00ff9d;margin-bottom:4px">${d.fullPath}</div>
          <div style="color:#8b8b95">Files: <span style="color:#f0f0f2">${d.fileCount}</span></div>`)
          .style('display', 'block').style('left', `${e.offsetX + 15}px`).style('top', `${e.offsetY + 15}px`);
        g.selectAll<SVGPathElement, unknown>('path.sl')
          .attr('stroke-opacity', (l: unknown) => l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.1);
      })
      .on('mouseleave', () => {
        tooltip.style('display', 'none');
        g.selectAll('path.sl').attr('stroke-opacity', 0.4);
      });

    return () => { d3.select(el).selectAll('*').remove(); };
  }, [data, colorMode, colorMap, onNodeClick]);

  return <div ref={containerRef} className="w-full h-full" />;
}
