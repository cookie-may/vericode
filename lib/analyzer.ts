import {
  CodeFile,
  CodeFunction,
  Dependency,
  SecurityIssue,
  Pattern,
  Duplicate,
  BlastRadius,
  HealthScore,
  LayerViolation,
  Suggestion,
} from '@/types';

export class Analyzer {
  static detectSecurity(files: CodeFile[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    files.forEach(file => {
      const content = file.content || '';
      if (!content) return;

      const lines = content.split('\n');

      // Hardcoded secrets
      if (content.match(/(?:password|passwd|pwd|secret|api_key|apikey|token|auth)\s*[=:]\s*['"][^'"]{4,}['"]/i)) {
        issues.push({
          severity: 'high',
          title: 'Hardcoded Secret',
          file: file.name,
          path: file.path,
          desc: 'Credentials should never be hardcoded. Use environment variables.',
        });
      }

      // SQL injection
      if (
        content.match(/query\s*\(\s*['"`][^'"`]*\s*\+/) ||
        content.match(/execute\s*\(\s*['"`][^'"`]*\$\{/)
      ) {
        issues.push({
          severity: 'high',
          title: 'SQL Injection Risk',
          file: file.name,
          path: file.path,
          desc: 'String concatenation in SQL queries. Use parameterized queries.',
        });
      }

      // XSS vulnerabilities
      if (
        content.includes('innerHTML =') ||
        content.includes('dangerouslySetInnerHTML')
      ) {
        issues.push({
          severity: 'high',
          title: 'XSS Vulnerability',
          file: file.name,
          path: file.path,
          desc: 'Direct HTML injection can lead to XSS attacks. Sanitize user input.',
        });
      }

      // eval() usage
      if (content.match(/\beval\s*\(/)) {
        const evalLine = lines.findIndex(l => l.includes('eval('));
        issues.push({
          severity: 'high',
          title: 'Code Execution Risk',
          file: file.name,
          path: file.path,
          line: evalLine >= 0 ? evalLine + 1 : undefined,
          desc: 'eval() executes arbitrary code. Avoid if possible.',
        });
      }

      // Debug statements
      const debugMatches = content.match(/console\.(log|debug|info)\(/g);
      if (debugMatches && debugMatches.length > 3) {
        issues.push({
          severity: 'low',
          title: 'Debug Statements',
          file: file.name,
          path: file.path,
          desc: `${debugMatches.length} console statements found. Remove before production.`,
        });
      }
    });

    return issues.sort((a, b) => {
      const sev = { high: 0, medium: 1, low: 2 };
      return sev[a.severity as keyof typeof sev] - sev[b.severity as keyof typeof sev];
    });
  }

  static detectPatterns(files: CodeFile[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Singleton pattern
    const singletons = files.filter(
      f =>
        f.content &&
        (f.content.includes('getInstance') ||
          f.content.match(/let\s+instance\s*=/) ||
          f.content.match(/private\s+static\s+instance/))
    );
    if (singletons.length > 0) {
      patterns.push({
        name: 'Singleton',
        icon: '🔒',
        desc: 'Ensures a class has only one instance.',
        severity: 'info',
        files: singletons.map(f => ({ name: f.name, path: f.path })),
        metrics: { instances: singletons.length },
      });
    }

    // Factory pattern
    const factories = files.filter(
      f =>
        f.content &&
        (f.name.toLowerCase().includes('factory') ||
          f.content.match(/create[A-Z]\w*\s*\(/) ||
          f.content.includes('return new'))
    );
    if (factories.length > 0) {
      patterns.push({
        name: 'Factory',
        icon: '🏭',
        desc: 'Creates objects without specifying exact class.',
        severity: 'info',
        files: factories.map(f => ({ name: f.name, path: f.path })),
        metrics: { factories: factories.length },
      });
    }

    // Observer pattern
    const observers = files.filter(
      f =>
        f.content &&
        (f.content.includes('subscribe') ||
          f.content.includes('addEventListener') ||
          f.content.includes('.on(') ||
          f.content.includes('emit('))
    );
    if (observers.length > 0) {
      patterns.push({
        name: 'Observer/Event',
        icon: '👁️',
        desc: 'Subscription mechanism for event-driven architecture.',
        severity: 'info',
        files: observers.map(f => ({ name: f.name, path: f.path })),
        metrics: { emitters: observers.length },
      });
    }

    // React hooks
    const hooks = files.filter(
      f => f.content && f.content.match(/export\s+(?:const|function)\s+use[A-Z]/)
    );
    if (hooks.length > 0) {
      patterns.push({
        name: 'Custom Hooks',
        icon: '🪝',
        desc: 'React hooks for reusable stateful logic.',
        severity: 'info',
        files: hooks.map(f => ({ name: f.name, path: f.path })),
        metrics: { hooks: hooks.length },
      });
    }

    // God object (too many functions)
    const godFiles = files.filter(f => f.functions && f.functions.length > 15);
    if (godFiles.length > 0) {
      patterns.push({
        name: 'God Object',
        icon: '⚠️',
        desc: 'Files with too many responsibilities. Consider splitting.',
        severity: 'critical',
        isAnti: true,
        files: godFiles.map(f => ({
          name: f.name,
          path: f.path,
          fns: f.functions.length,
        })),
        metrics: {
          files: godFiles.length,
          avgFns: Math.round(
            godFiles.reduce((s, f) => s + f.functions.length, 0) / godFiles.length
          ),
        },
      });
    }

    // Long files
    const longFiles = files.filter(f => f.lines && f.lines > 500);
    if (longFiles.length > 0) {
      patterns.push({
        name: 'Long File',
        icon: '📜',
        desc: 'Files over 500 lines are harder to maintain.',
        severity: 'critical',
        isAnti: true,
        files: longFiles.map(f => ({
          name: f.name,
          path: f.path,
          lines: f.lines,
        })),
        metrics: {
          files: longFiles.length,
          avgLines: Math.round(
            longFiles.reduce((s, f) => s + f.lines, 0) / longFiles.length
          ),
        },
      });
    }

    return patterns;
  }

  static calcComplexity(content: string): { score: number; level: string } {
    if (!content) return { score: 0, level: 'low' };

    let complexity = 1;
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*[^:]+\s*:/g,
      /&&/g,
      /\|\|/g,
    ];

    patterns.forEach(p => {
      const matches = content.match(p);
      if (matches) complexity += matches.length;
    });

    let level = 'low';
    if (complexity > 30) level = 'critical';
    else if (complexity > 20) level = 'high';
    else if (complexity > 10) level = 'medium';

    return { score: complexity, level };
  }

  static detectDuplicates(files: CodeFile[], functions: CodeFunction[]): Duplicate[] {
    const duplicates: Duplicate[] = [];
    const commonNames = new Set([
      'render',
      'componentDidMount',
      'handleClick',
      'handleChange',
      'init',
      'setup',
      'cleanup',
      'validate',
      'parse',
      'get',
      'set',
      'create',
      'delete',
    ]);

    const fnByName: Record<string, CodeFunction[]> = {};

    functions.forEach(fn => {
      if (commonNames.has(fn.name) || fn.name.length < 3) return;
      if (!fnByName[fn.name]) fnByName[fn.name] = [];
      fnByName[fn.name].push(fn);
    });

    Object.entries(fnByName).forEach(([name, fns]) => {
      const uniqueFiles = [...new Set(fns.map(f => f.file))];
      if (uniqueFiles.length >= 3) {
        duplicates.push({
          type: 'name',
          name,
          count: uniqueFiles.length,
          files: fns.map(f => ({ file: f.file, line: f.line })),
          similarity: 100,
          suggestion: `Function "${name}" appears in ${uniqueFiles.length} files - consider consolidating`,
        });
      }
    });

    return duplicates;
  }

  static detectLayerViolations(
    files: CodeFile[],
    connections: Dependency[]
  ): LayerViolation[] {
    const violations: LayerViolation[] = [];
    const layerOrder = {
      ui: 0,
      component: 0,
      page: 0,
      service: 1,
      api: 1,
      data: 2,
      model: 2,
      util: 3,
      utils: 3,
      config: 4,
      test: 5,
    };

    connections.forEach(c => {
      const srcFile = files.find(f => f.path === c.source);
      const tgtFile = files.find(f => f.path === c.target);
      if (!srcFile || !tgtFile) return;

      const srcLevel = (layerOrder as any)[srcFile.layer] ?? 3;
      const tgtLevel = (layerOrder as any)[tgtFile.layer] ?? 3;

      if (srcLevel > tgtLevel && srcLevel - tgtLevel > 1) {
        violations.push({
          from: srcFile.path,
          to: tgtFile.path,
          fromLayer: srcFile.layer,
          toLayer: tgtFile.layer,
          fn: c.fn,
          suggestion: `${srcFile.layer} should not import from ${tgtFile.layer}`,
        });
      }
    });

    return violations;
  }

  static calcBlastRadius(
    fileId: string,
    connections: Dependency[]
  ): BlastRadius {
    const affected = new Set<string>();
    const visited = new Set<string>();
    const queue = [fileId];
    let depth = 0;
    const maxDepth = 3;

    while (queue.length > 0 && depth < maxDepth) {
      const levelSize = queue.length;
      for (let i = 0; i < levelSize; i++) {
        const current = queue.shift();
        if (!current || visited.has(current)) continue;
        visited.add(current);

        const dependents = connections
          .filter(c => c.target === current)
          .map(c => c.source);

        dependents.forEach(d => {
          if (!visited.has(d)) {
            affected.add(d);
            queue.push(d);
          }
        });
      }
      depth++;
    }

    return {
      affected: Array.from(affected),
      transitive: Array.from(affected),
      count: Array.from(affected).length,
      transitiveCount: Array.from(affected).length,
      percent: 0,
      level: Array.from(affected).length > 10 ? 'critical' : 'medium',
      depth,
      fnsUsed: 0,
      totalCalls: connections.filter(
        c => c.source === fileId || affected.has(c.source)
      ).length,
      dependencies: connections
        .filter(c => c.source === fileId)
        .map(c => c.target),
      impactScore: Array.from(affected).length * 0.5,
      centrality: connections.filter(c => c.source === fileId).length,
    };
  }

  static calcHealth(files: CodeFile[], issues: SecurityIssue[]): HealthScore {
    let score = 100;

    // Penalize for large files
    const longFiles = files.filter(f => f.lines > 500).length;
    score -= longFiles * 5;

    // Penalize for high complexity
    const complexFiles = files.filter(f => f.complexity?.level === 'critical').length;
    score -= complexFiles * 3;

    // Penalize for security issues
    const highSecIssues = issues.filter(i => i.severity === 'high').length;
    score -= highSecIssues * 10;

    // Penalize for many functions
    const godFiles = files.filter(f => f.functions.length > 15).length;
    score -= godFiles * 5;

    score = Math.max(0, Math.min(100, score));

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
    if (score < 60) grade = 'F';
    else if (score < 70) grade = 'D';
    else if (score < 80) grade = 'C';
    else if (score < 90) grade = 'B';

    return { score, grade };
  }

  static generateSuggestions(
    files: CodeFile[],
    issues: SecurityIssue[],
    patterns: Pattern[],
    duplicates: Duplicate[],
    violations: LayerViolation[]
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    const longFiles = files.filter(f => f.lines > 500).length;
    if (longFiles > 0) {
      suggestions.push({
        priority: 'high',
        icon: '✂️',
        title: 'Split Large Files',
        desc: `${longFiles} files exceed 500 lines. Break into smaller modules.`,
        action: 'Group related functions and extract to separate modules',
        impact: 'Improves code navigation and testability',
      });
    }

    const highSecIssues = issues.filter(i => i.severity === 'high').length;
    if (highSecIssues > 0) {
      suggestions.push({
        priority: 'critical',
        icon: '🔐',
        title: 'Fix Security Issues',
        desc: `${highSecIssues} high-severity security issues found.`,
        action: 'Address hardcoded secrets and injection risks immediately',
        impact: 'Prevents potential security breaches',
      });
    }

    if (duplicates.length > 0) {
      suggestions.push({
        priority: 'high',
        icon: '📋',
        title: 'Extract Duplicated Code',
        desc: `${duplicates.length} instances of duplicated code found.`,
        action: 'Create shared utility functions',
        impact: 'Reduces maintenance burden',
      });
    }

    if (violations.length > 0) {
      suggestions.push({
        priority: 'high',
        icon: '🏗️',
        title: 'Fix Architecture Violations',
        desc: `${violations.length} layer violations found.`,
        action: 'Invert dependencies or use dependency injection',
        impact: 'Improves architecture and testability',
      });
    }

    return suggestions.sort((a, b) => {
      const p = { critical: 0, high: 1, medium: 2, low: 3 };
      return (p as any)[a.priority] - (p as any)[b.priority];
    });
  }
}
