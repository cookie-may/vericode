import {
  CodeFile,
  CodeFunction,
  Dependency,
  AnalysisResult,
  GraphData,
  GraphNode,
  GraphLink,
} from '@/types';
import { Parser } from './parser';
import { Analyzer } from './analyzer';
import { GitHubClient } from './github';

export class CodeAnalyzer {
  private files: CodeFile[] = [];
  private functions: CodeFunction[] = [];
  private connections: Dependency[] = [];

  async analyzeGitHubRepo(
    repoUrl: string,
    token?: string,
    excludePatterns: string[] = ['node_modules', '.git', 'dist', 'build'],
    onProgress?: (message: string) => void
  ): Promise<AnalysisResult> {
    const github = new GitHubClient(token);
    const { owner, repo } = github.parseRepoUrl(repoUrl);

    try {
      if (onProgress) onProgress("Initializing GitHub Engine...");
      this.files = await github.analyzeRepository(owner, repo, 'main', excludePatterns, onProgress);
    } catch (err: any) {
      if (err?.message?.includes('404') || err?.message?.includes('not found')) {
        this.files = await github.analyzeRepository(owner, repo, 'master', excludePatterns, onProgress);
      } else {
        throw err;
      }
    }
    if (onProgress) onProgress("Finalizing Architecture Graph...");
    return this.performAnalysis();
  }

  analyzeLocalFiles(files: Array<{ path: string; content: string }>): AnalysisResult {
    this.files = files.map(f => {
      const parts = f.path.split('/');
      const name = parts[parts.length - 1];
      const folder = parts.slice(0, -1).join('/');

      const functions = Parser.extractFunctions(f.content, name);
      const complexityResult = Analyzer.calcComplexity(f.content);
      const complexity = {
        score: complexityResult.score,
        level: (complexityResult.level as 'low' | 'medium' | 'high' | 'critical'),
      };

      return {
        path: f.path,
        name,
        folder: folder || '/',
        content: f.content,
        functions,
        lines: f.content.split('\n').length,
        layer: Parser.detectLayer(f.path),
        churn: 0,
        isCode: Parser.isCodeFile(name),
        complexity,
        language: this.detectLanguage(name),
      };
    });

    return this.performAnalysis();
  }

  private performAnalysis(): AnalysisResult {
    // Extract all functions
    this.functions = this.files.flatMap(f => f.functions);

    // Build dependency graph
    this.buildDependencyGraph();

    // Run analyses
    const securityIssues = Analyzer.detectSecurity(this.files);
    const patterns = Analyzer.detectPatterns(this.files);
    const duplicates = Analyzer.detectDuplicates(this.files, this.functions);
    const layerViolations = Analyzer.detectLayerViolations(
      this.files,
      this.connections
    );
    const suggestions = Analyzer.generateSuggestions(
      this.files,
      securityIssues,
      patterns,
      duplicates,
      layerViolations
    );
    const health = Analyzer.calcHealth(this.files, securityIssues);

    // Build issues
    const issues = this.buildIssues(securityIssues, duplicates, layerViolations);

    // Build function stats
    const fnStats = this.buildFunctionStats();

    // Build folder tree
    const tree = this.buildFolderTree();

    // Calculate statistics
    const stats = this.calculateStats();

    return {
      files: this.files,
      functions: this.functions,
      connections: this.connections,
      fnStats,
      folders: [...new Set(this.files.map(f => f.folder))],
      tree,
      issues,
      patterns,
      securityIssues,
      duplicates,
      layerViolations,
      suggestions,
      stats,
      health,
    };
  }

  private buildDependencyGraph() {
    const fileNameToPath = new Map(this.files.map(f => [f.name, f.path]));
    const allFunctionNames = new Set(this.functions.map(f => f.name));

    this.connections = [];

    this.files.forEach(file => {
      if (!file.content) return;

      const calledFunctions = Parser.findCalls(file.content, allFunctionNames);

      calledFunctions.forEach(fnName => {
        const definers = this.functions.filter(f => f.name === fnName);

        definers.forEach(definer => {
          if (definer.file !== file.path) {
            const existing = this.connections.find(
              c => c.source === definer.file && c.target === file.path && c.fn === fnName
            );

            if (existing) {
              existing.count++;
            } else {
              this.connections.push({
                source: definer.file,
                target: file.path,
                fn: fnName,
                count: 1,
              });
            }
          }
        });
      });
    });
  }

  private buildFunctionStats() {
    const stats: Record<string, any> = {};

    this.functions.forEach(fn => {
      if (!stats[fn.name]) {
        stats[fn.name] = {
          defs: 0,
          calls: 0,
          called: false,
          callers: [],
          usage: 0,
        };
      }
      stats[fn.name].defs++;
    });

    this.connections.forEach(conn => {
      if (stats[conn.fn!]) {
        stats[conn.fn!].calls++;
        stats[conn.fn!].called = true;
        if (!stats[conn.fn!].callers.includes(conn.target)) {
          stats[conn.fn!].callers.push(conn.target);
        }
        stats[conn.fn!].usage += conn.count;
      }
    });

    return stats;
  }

  private buildIssues(securityIssues: any[], duplicates: any[], violations: any[]) {
    const issues: Array<{
      type: 'critical' | 'warning' | 'info';
      title: string;
      desc: string;
      count?: number;
    }> = [];

    if (securityIssues.length > 0) {
      issues.push({
        type: 'critical',
        title: 'Security Issues',
        desc: `${securityIssues.length} security vulnerabilities found`,
        count: securityIssues.length,
      });
    }

    if (duplicates.length > 0) {
      issues.push({
        type: 'warning',
        title: 'Code Duplication',
        desc: `${duplicates.length} duplicate code patterns found`,
        count: duplicates.length,
      });
    }

    if (violations.length > 0) {
      issues.push({
        type: 'warning',
        title: 'Architecture Violations',
        desc: `${violations.length} layer violations detected`,
        count: violations.length,
      });
    }

    const deadFunctions = Object.entries(this.buildFunctionStats()).filter(
      ([name, stat]: [string, any]) => !stat.called
    );
    if (deadFunctions.length > 0) {
      issues.push({
        type: 'info',
        title: 'Dead Code',
        desc: `${deadFunctions.length} unused functions found`,
        count: deadFunctions.length,
      });
    }

    return issues;
  }

  private buildFolderTree() {
    const tree: Record<string, any> = { _count: 0 };

    this.files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;

      parts.forEach((part, idx) => {
        if (!current[part]) {
          current[part] = { _count: 0 };
        }
        current = current[part];
        current._count = (current._count || 0) + 1;
      });
    });

    return tree;
  }

  private calculateStats() {
    const languages: Record<string, number> = {};

    this.files.forEach(f => {
      const lang = f.language || 'Unknown';
      if (!languages[lang]) languages[lang] = 0;
      languages[lang] += f.lines;
    });

    const totalLoc = Object.values(languages).reduce((a, b) => a + b, 0);
    const langArray = Object.entries(languages)
      .map(([ext, lines]) => ({
        ext,
        lines,
        pct: Math.round((lines / totalLoc) * 100),
      }))
      .sort((a, b) => b.lines - a.lines);

    const fnStats = this.buildFunctionStats();
    const dead = Object.values(fnStats).filter((s: any) => !s.called).length;

    return {
      files: this.files.length,
      functions: this.functions.length,
      connections: this.connections.length,
      dead,
      patterns: 0,
      security: Object.values(this.buildFunctionStats()).filter((s: any) => !s.called).length,
      duplicates: 0,
      violations: 0,
      loc: totalLoc,
      languages: langArray,
    };
  }

  private detectLanguage(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'JavaScript';
    if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'TypeScript';
    if (lower.endsWith('.py')) return 'Python';
    if (lower.endsWith('.java')) return 'Java';
    if (lower.endsWith('.go')) return 'Go';
    if (lower.endsWith('.rb')) return 'Ruby';
    if (lower.endsWith('.php')) return 'PHP';
    if (lower.endsWith('.rs')) return 'Rust';
    return 'Other';
  }

  buildGraphData(): GraphData {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeIds = new Set<string>();

    // Add file nodes
    this.files.forEach(file => {
      nodeIds.add(file.path);
      nodes.push({
        id: file.path,
        name: file.name,
        folder: file.folder,
        layer: file.layer,
        churn: file.churn,
        size: Math.max(10, Math.sqrt(file.functions.length) * 5),
      });
    });

    // Add dependency links
    this.connections.forEach(conn => {
      if (nodeIds.has(conn.source) && nodeIds.has(conn.target)) {
        links.push({
          source: conn.source,
          target: conn.target,
          value: conn.count,
          label: conn.fn,
        });
      }
    });

    return { nodes, links };
  }
}
