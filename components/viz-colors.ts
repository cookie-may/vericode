import { AnalysisResult } from '@/types';
import { LAYER_COLORS } from '@/components/graph';

export const FOLDER_PALETTE = [
  '#00ff9d','#4d9fff','#a78bfa','#ff9f43','#22d3ee',
  '#ec4899','#22c55e','#f59e0b','#8b5cf6','#06b6d4',
  '#f97316','#84cc16','#14b8a6','#e879f9','#fb7185',
];

export function buildColorMap(data: AnalysisResult): Record<string, string> {
  const map: Record<string, string> = {};
  data.folders.forEach((f, i) => {
    map[f] = FOLDER_PALETTE[i % FOLDER_PALETTE.length];
  });
  return map;
}

export function nodeColor(
  colorMode: 'layer' | 'folder' | 'churn',
  layer: string,
  folder: string,
  churn: number,
  colorMap: Record<string, string>,
): string {
  if (colorMode === 'layer') return LAYER_COLORS[layer] ?? '#64748b';
  if (colorMode === 'churn') {
    if (churn >= 7) return '#ff5f5f';
    if (churn >= 4) return '#ff9f43';
    return '#22c55e';
  }
  return colorMap[folder] ?? '#64748b';
}
