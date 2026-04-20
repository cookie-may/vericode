/* Core Data Structures for Code Analysis */

export interface CodeFile {
  path: string;
  name: string;
  folder: string;
  content?: string;
  functions: CodeFunction[];
  lines: number;
  layer: string;
  churn: number;
  isCode: boolean;
  complexity?: { score: number; level: 'low' | 'medium' | 'high' | 'critical' };
  language?: string;
}

export interface CodeFunction {
  name: string;
  file: string;
  line: number;
  code?: string;
  isTopLevel: boolean;
  isExported: boolean;
  type: 'function' | 'arrow' | 'method' | 'class';
  folder?: string;
  layer?: string;
  decorators?: string[];
  isClassMethod?: boolean;
  isGetter?: boolean;
  isSetter?: boolean;
}

export interface Dependency {
  source: string;
  target: string;
  fn?: string;
  count: number;
}

export interface Pattern {
  name: string;
  icon: string;
  desc: string;
  severity: 'info' | 'warning' | 'critical';
  isAnti?: boolean;
  files: Array<{ name: string; path: string; fns?: number; lines?: number }>;
  metrics: Record<string, number>;
}

export interface SecurityIssue {
  severity: 'high' | 'medium' | 'low';
  title: string;
  file: string;
  path: string;
  line?: number;
  desc: string;
  code?: string;
}

export interface Duplicate {
  type: 'name' | 'code';
  name: string;
  count: number;
  files: Array<{ file: string; name?: string; line: number }>;
  similarity: number;
  suggestion: string;
}

export interface LayerViolation {
  from: string;
  to: string;
  fromLayer: string;
  toLayer: string;
  fn?: string;
  suggestion: string;
}

export interface CodeIssue {
  type: 'critical' | 'warning' | 'info';
  title: string;
  desc: string;
  count?: number;
  items?: unknown[];
}

export interface Suggestion {
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  desc: string;
  action: string;
  impact: string;
}

export interface BlastRadius {
  affected: string[];
  transitive: string[];
  count: number;
  transitiveCount: number;
  percent: number;
  level: 'critical' | 'high' | 'medium' | 'low';
  depth: number;
  fnsUsed: number;
  totalCalls: number;
  dependencies: string[];
  impactScore: number;
  centrality: number;
}

export interface HealthScore {
  score: number;
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
}

export interface PRRisk {
  score: number;
  level: 'critical' | 'high' | 'medium' | 'low';
  factors: string[];
  totalBlast: number;
  hotspots: Array<{ file: string; blast: number }>;
}

export interface AnalysisResult {
  files: CodeFile[];
  functions: CodeFunction[];
  connections: Dependency[];
  fnStats: Record<
    string,
    {
      calls: number;
      defs: number;
      called: boolean;
      callers: string[];
      usage: number;
    }
  >;
  folders: string[];
  tree: Record<string, unknown>;
  issues: CodeIssue[];
  patterns: Pattern[];
  securityIssues: SecurityIssue[];
  duplicates: Duplicate[];
  layerViolations: LayerViolation[];
  suggestions: Suggestion[];
  stats: {
    files: number;
    functions: number;
    connections: number;
    dead: number;
    patterns: number;
    security: number;
    duplicates: number;
    violations: number;
    loc: number;
    languages: Array<{ ext: string; lines: number; pct: number }>;
  };
  health: HealthScore;
}

export interface GraphNode {
  id: string;
  name: string;
  folder?: string;
  layer?: string;
  churn?: number;
  size: number;
  color?: string;
  value?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
