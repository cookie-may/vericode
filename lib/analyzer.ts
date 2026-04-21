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
      'render','componentDidMount','componentWillUnmount','componentDidUpdate',
      'shouldComponentUpdate','getDerivedStateFromProps','getSnapshotBeforeUpdate',
      'handleClick','handleChange','handleSubmit','handleInput','handleKeyDown',
      'handleKeyUp','handleKeyPress','handleBlur','handleFocus','handleScroll',
      'handleMouseEnter','handleMouseLeave','handleDrag','handleDrop',
      'onClick','onChange','onSubmit','onBlur','onFocus','onKeyDown',
      'init','setup','cleanup','destroy','reset','clear','update','refresh',
      'validate','parse','format','transform','convert','process','execute',
      'get','set','fetch','load','save','create','delete','remove','add',
      'find','filter','map','reduce','sort','merge','clone','copy',
      'beforeEach','afterEach','beforeAll','afterAll','describe','it','test',
      'setUp','tearDown','mock',
      'toString','valueOf','equals','hashCode','compare','clone',
      'serialize','deserialize','toJSON','fromJSON',
      'index','show','store','edit',
      '__init__','__str__','__repr__','__len__','__eq__','__hash__',
      '__enter__','__exit__','__getattr__','__setattr__','__delattr__',
      '__getitem__','__setitem__','__contains__','__iter__','__next__',
      '__call__','__bool__','__lt__','__gt__','__le__','__ge__',
      'upgrade','downgrade','setUpClass','tearDownClass',
      'main','create_app','configure','register','on_startup','on_shutdown','lifespan',
      'mounted','created','updated','destroyed','beforeCreate','beforeMount',
      'ngOnInit','ngOnDestroy','ngOnChanges','ngAfterViewInit',
      'onMount','onDestroy',
    ]);

    // --- Phase 1: duplicate names across files ---
    const fnByName: Record<string, CodeFunction[]> = {};
    functions.forEach(fn => {
      if (commonNames.has(fn.name)) return;
      if (fn.name.length < 3) return;
      if (fn.isClassMethod) return;
      if (fn.name.includes('.')) return;
      if (fn.decorators && fn.decorators.length > 0) return;
      if (!fnByName[fn.name]) fnByName[fn.name] = [];
      fnByName[fn.name].push(fn);
    });

    Object.entries(fnByName).forEach(([name, fns]) => {
      const uniqueFiles = [...new Set(fns.map(f => f.file))];
      if (uniqueFiles.length >= 3) {
        const codeSamples = fns.filter(f => f.code && f.code.length > 30);
        if (codeSamples.length >= 2) {
          const sim = Analyzer.codeSimilarity(codeSamples[0].code!, codeSamples[1].code!);
          if (sim > 0.5) {
            duplicates.push({
              type: 'name',
              name,
              count: uniqueFiles.length,
              files: fns.map(f => ({ file: f.file, name: f.name, line: f.line })),
              similarity: Math.round(sim * 100),
              suggestion: `Function "${name}" appears in ${uniqueFiles.length} files with ${Math.round(sim * 100)}% similarity - consider consolidating`,
            });
          }
        }
      }
    });

    // --- Phase 2: similar code blocks via structural fingerprint ---
    const codeGroups: Record<string, CodeFunction[]> = {};
    functions.forEach(fn => {
      if (!fn.code || fn.code.length < 80) return;
      const fp = Analyzer.codeFingerprint(fn.code);
      if (!fp) return;
      if (!codeGroups[fp]) codeGroups[fp] = [];
      codeGroups[fp].push(fn);
    });

    Object.values(codeGroups).forEach(fns => {
      if (fns.length < 2) return;
      const uniqueFiles = [...new Set(fns.map(f => f.file))];
      if (uniqueFiles.length < 2) return;
      const sim = Analyzer.codeSimilarity(fns[0].code!, fns[1].code!);
      if (sim >= 0.7) {
        duplicates.push({
          type: 'code',
          name: fns.map(f => f.name).join(', '),
          count: fns.length,
          files: fns.map(f => ({ file: f.file, name: f.name, line: f.line })),
          similarity: Math.round(sim * 100),
          suggestion: `Similar code blocks (${Math.round(sim * 100)}% match) - consider extracting to a shared utility`,
        });
      }
    });

    return duplicates;
  }

  private static codeSimilarity(code1: string, code2: string): number {
    if (!code1 || !code2) return 0;
    const normalize = (code: string) =>
      code
        .replace(/\/\/.*$/gm, '')
        .replace(/#.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/"""[\s\S]*?"""/g, 'S')
        .replace(/'''[\s\S]*?'''/g, 'S')
        .replace(/['"`][^'"`]*['"`]/g, 'S')
        .replace(/\b\d+\.?\d*\b/g, 'N')
        .replace(/\s+/g, ' ')
        .trim();
    const n1 = normalize(code1);
    const n2 = normalize(code2);
    if (n1 === n2) return 1;
    if (!n1.length || !n2.length) return 0;
    const lcs = Analyzer.lcsLength(n1, n2);
    return lcs / Math.max(n1.length, n2.length);
  }

  private static lcsLength(s1: string, s2: string): number {
    if (s1.length > 500) s1 = s1.substring(0, 500);
    if (s2.length > 500) s2 = s2.substring(0, 500);
    const m = s1.length, n = s2.length;
    let prev = new Array(n + 1).fill(0);
    let curr = new Array(n + 1).fill(0);
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        curr[j] = s1[i - 1] === s2[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);
      }
      [prev, curr] = [curr, prev];
      curr.fill(0);
    }
    return prev[n];
  }

  private static codeFingerprint(code: string): string | null {
    if (!code || code.length < 50) return null;
    const structure = code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/['"`][^'"`]*['"`]/g, '')
      .replace(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g, 'I')
      .replace(/\b\d+\.?\d*\b/g, 'N')
      .replace(/\s+/g, '');
    const loops = (structure.match(/for|while/g) || []).length;
    const conditions = (structure.match(/if|\?/g) || []).length;
    const calls = (structure.match(/I\(/g) || []).length;
    const returns = (structure.match(/return/g) || []).length;
    const len = Math.floor(structure.length / 50) * 50;
    return `L${loops}C${conditions}F${calls}R${returns}S${len}`;
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
      services: 1,
      api: 1,
      data: 2,
      model: 2,
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

    // Determine grade based on calculated score
    let grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
    if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 85) grade = 'A-';
    else if (score >= 80) grade = 'B+';
    else if (score >= 75) grade = 'B';
    else if (score >= 70) grade = 'B-';
    else if (score >= 65) grade = 'C+';
    else if (score >= 60) grade = 'C';
    else if (score >= 55) grade = 'C-';
    else if (score >= 45) grade = 'D';
    else grade = 'F';

    // Randomize score within the grade's range
    const gradeRanges = {
      'A+': [95, 100],
      'A': [90, 94],
      'A-': [85, 89],
      'B+': [80, 84],
      'B': [75, 79],
      'B-': [70, 74],
      'C+': [65, 69],
      'C': [60, 64],
      'C-': [55, 59],
      'D': [45, 54],
      'F': [0, 44]
    };

    const [min, max] = gradeRanges[grade];
    score = Math.floor(Math.random() * (max - min + 1)) + min;

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
