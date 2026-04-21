import { CodeFunction, CodeFile } from '@/types';

const CODE_EXTS = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.pyw', '.pyi',
  '.java', '.go', '.rb', '.php', '.vue', '.svelte', '.rs',
  '.c', '.cpp', '.cc', '.h', '.hpp', '.cs', '.swift', '.kt', '.kts',
  '.scala', '.clj', '.ex', '.exs', '.erl', '.hs', '.lua', '.r', '.R',
  '.jl', '.dart', '.elm', '.fs', '.fsx', '.ml', '.pl', '.pm',
  '.sh', '.bash', '.zsh', '.fish', '.ps1', '.psm1',
];

const BINARY_EXTS = [
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.pdf',
  '.zip', '.tar', '.gz', '.exe', '.dll', '.so', '.dylib',
];

export class Parser {
  static isCodeFile(name: string): boolean {
    return CODE_EXTS.some(ext => name.toLowerCase().endsWith(ext));
  }

  static isBinaryFile(name: string): boolean {
    return BINARY_EXTS.some(ext => name.toLowerCase().endsWith(ext));
  }

  static extractFunctions(content: string, filename: string): CodeFunction[] {
    const fns: CodeFunction[] = [];

    if (!content || content.length === 0) return fns;

    const ext = filename.toLowerCase();
    const lines = content.split('\n');

    // JavaScript/TypeScript extraction
    if (ext.endsWith('.js') || ext.endsWith('.jsx') || ext.endsWith('.ts') || ext.endsWith('.tsx')) {
      fns.push(...this.extractJavaScript(content, filename, lines));
    }
    // Python extraction
    else if (ext.endsWith('.py') || ext.endsWith('.pyw') || ext.endsWith('.pyi')) {
      fns.push(...this.extractPython(content, filename, lines));
    }
    // Java extraction
    else if (ext.endsWith('.java')) {
      fns.push(...this.extractJava(content, filename, lines));
    }
    // Go extraction
    else if (ext.endsWith('.go')) {
      fns.push(...this.extractGo(content, filename, lines));
    }
    // Ruby extraction
    else if (ext.endsWith('.rb')) {
      fns.push(...this.extractRuby(content, filename, lines));
    }
    // PHP extraction
    else if (ext.endsWith('.php')) {
      fns.push(...this.extractPHP(content, filename, lines));
    }
    // C/C++ extraction
    else if (ext.endsWith('.c') || ext.endsWith('.cpp') || ext.endsWith('.cc') || ext.endsWith('.h') || ext.endsWith('.hpp')) {
      fns.push(...this.extractC(content, filename, lines));
    }
    // Rust extraction
    else if (ext.endsWith('.rs')) {
      fns.push(...this.extractRust(content, filename, lines));
    }
    // Generic regex fallback
    else {
      fns.push(...this.extractGeneric(content, filename, lines));
    }

    return fns;
  }


  private static extractCode(lines: string[], startLine: number, endLine?: number): string {
    const code: string[] = [];
    const start = Math.max(0, startLine - 1);
    const end = Math.min(lines.length, endLine || startLine + 20);
    for (let i = start; i < end && code.length < 15; i++) {
        code.push(lines[i]);
    }
    if (code.length >= 15) code.push('  // ...');
    return code.join('\n');
  }

  private static extractJavaScript(content: string, filename: string, lines: string[]): CodeFunction[] {
    const fns: CodeFunction[] = [];
    const seen = new Set<string>();

    // Function declarations: function foo() {}
    const funcDeclRegex = /^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/gm;
    let match;
    while ((match = funcDeclRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@func`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel: true,
          isExported: content.substring(Math.max(0, match.index - 50), match.index).includes('export'),
          code: this.extractCode(lines, line),
          type: 'function',
        });
      }
    }

    // Arrow functions: const foo = () => or const foo = async () =>
    const arrowRegex = /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/gm;
    while ((match = arrowRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@arrow`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel: true,
          isExported: content.substring(Math.max(0, match.index - 50), match.index).includes('export'),
          code: this.extractCode(lines, line),
          type: 'arrow',
        });
      }
    }

    // Class methods: methodName() {}
    const methodRegex = /^\s*(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*{/gm;
    while ((match = methodRegex.exec(content)) !== null) {
      const name = match[1];
      if (!name.match(/^(if|for|while|switch|catch|constructor)$/)) {
        const key = `${name}@method`;
        if (!seen.has(key)) {
          seen.add(key);
          const line = content.substring(0, match.index).split('\n').length;
          fns.push({
            name,
            file: filename,
            line,
            isTopLevel: false,
            isExported: false,
          code: this.extractCode(lines, line),
            type: 'method',
          });
        }
      }
    }

    return fns;
  }

  private static extractPython(content: string, filename: string, lines: string[]): CodeFunction[] {
    const fns: CodeFunction[] = [];
    const seen = new Set<string>();

    // Python function definitions: def foo():
    const funcRegex = /^(?:async\s+)?def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const name = match[1];
      if (!name.startsWith('_')) {
        const key = `${name}@func`;
        if (!seen.has(key)) {
          seen.add(key);
          const line = content.substring(0, match.index).split('\n').length;
          const isTopLevel = !content.substring(0, match.index).split('\n').pop()?.match(/^\s{4,}/);
          fns.push({
            name,
            file: filename,
            line,
            isTopLevel,
            isExported: false,
          code: this.extractCode(lines, line),
            type: 'function',
          });
        }
      }
    }

    // Python classes: class Foo:
    const classRegex = /^class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[\(:]?/gm;
    while ((match = classRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@class`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel: true,
          isExported: false,
          code: this.extractCode(lines, line),
          type: 'class',
        });
      }
    }

    return fns;
  }

  private static extractJava(content: string, filename: string, lines: string[]): CodeFunction[] {
    const fns: CodeFunction[] = [];
    const seen = new Set<string>();

    // Java methods and classes
    const methodRegex = /(?:public|private|protected)?\s+(?:static\s+)?(?:void|[\w<>[\]]+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{/gm;
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@method`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel: false,
          isExported: content.substring(Math.max(0, match.index - 100), match.index).includes('public'),
          code: this.extractCode(lines, line),
          type: 'method',
        });
      }
    }

    return fns;
  }

  private static extractGo(content: string, filename: string, lines: string[]): CodeFunction[] {
    const fns: CodeFunction[] = [];
    const seen = new Set<string>();

    // Go functions: func foo()
    const funcRegex = /^func\s+(?:\([^)]+\)\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@func`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel: !match[0].includes('('),
          isExported: name[0] === name[0].toUpperCase(),
          code: this.extractCode(lines, line),
          type: 'function',
        });
      }
    }

    return fns;
  }

  private static extractRuby(content: string, filename: string, lines: string[]): CodeFunction[] {
    const fns: CodeFunction[] = [];
    const seen = new Set<string>();

    // Ruby methods: def foo
    const methodRegex = /^\s*def\s+([a-z_][a-z0-9_?!]*)\b/gim;
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@func`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        const isTopLevel = !content.substring(0, match.index).split('\n').pop()?.match(/^\s{2,}/);
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel,
          isExported: false,
          code: this.extractCode(lines, line),
          type: 'function',
        });
      }
    }

    return fns;
  }

  private static extractPHP(content: string, filename: string, lines: string[]): CodeFunction[] {
    const fns: CodeFunction[] = [];
    const seen = new Set<string>();

    // PHP functions: function foo()
    const funcRegex = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@func`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel: !content.substring(0, match.index).includes('class '),
          isExported: true,
          code: this.extractCode(lines, line),
          type: 'function',
        });
      }
    }

    return fns;
  }

  private static extractC(content: string, filename: string, lines: string[]): CodeFunction[] {
    const fns: CodeFunction[] = [];
    const seen = new Set<string>();

    // C/C++ functions: returnType funcName()
    const funcRegex = /^(?:static\s+)?(?:inline\s+)?(?:\w+(?:<[^>]+>)?(?:\s+\*)?)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{/gm;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@func`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel: true,
          isExported: !content.substring(Math.max(0, match.index - 50), match.index).includes('static'),
          code: this.extractCode(lines, line),
          type: 'function',
        });
      }
    }

    return fns;
  }

  private static extractRust(content: string, filename: string, lines: string[]): CodeFunction[] {
    const fns: CodeFunction[] = [];
    const seen = new Set<string>();

    // Rust functions: fn foo()
    const funcRegex = /(?:pub\s+)?(?:async\s+)?fn\s+([a-z_][a-z0-9_]*)\s*(?:<[^>]*>)?\s*\(/gm;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@func`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel: true,
          isExported: match[0].includes('pub'),
          code: this.extractCode(lines, line),
          type: 'function',
        });
      }
    }

    return fns;
  }

  private static extractGeneric(content: string, filename: string, lines: string[]): CodeFunction[] {
    const fns: CodeFunction[] = [];
    const seen = new Set<string>();

    // Generic function pattern: word followed by parentheses
    const genericRegex = /(?:function|def|fn|func|method)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
    let match;
    while ((match = genericRegex.exec(content)) !== null) {
      const name = match[1];
      const key = `${name}@func`;
      if (!seen.has(key)) {
        seen.add(key);
        const line = content.substring(0, match.index).split('\n').length;
        fns.push({
          name,
          file: filename,
          line,
          isTopLevel: true,
          isExported: false,
          code: this.extractCode(lines, line),
          type: 'function',
        });
      }
    }

    return fns;
  }

  static findCalls(content: string, functionNames: Set<string>): string[] {
    const calls: string[] = [];

    for (const name of functionNames) {
      const regex = new RegExp(`\\b${this.escapeRegex(name)}\\s*\\(`, 'g');
      const matches = content.match(regex);
      if (matches) {
        calls.push(name);
      }
    }

    return calls;
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Tambahkan/Update fungsi ini di lib/parser.ts
  static detectLayer(path: string): string {
    const lower = path.toLowerCase();
    // Specific folder patterns checked before broad src/ catch-all
    if (lower.match(/(^|\/)(components|widgets)\//)) return 'component';
    if (lower.match(/(^|\/)(services|api|controllers|routes)\//)) return 'services';
    if (lower.match(/(^|\/)(lib|utils|helpers|core|hooks)\//)) return 'utils';
    if (lower.match(/(^|\/)(models|data|db|store|types|interfaces)\//)) return 'data';
    if (lower.match(/(^|\/)(config|env|constants)\//)) return 'config';
    if (lower.match(/(^|\/)(test|__tests__|tests)\//) || lower.includes('.test.') || lower.includes('.spec.')) return 'test';
    // UI layer: explicit app/pages folders or root-level files
    if (lower.match(/(^|\/)(app|pages|ui|views|templates)\//)) return 'ui';
    if (lower.match(/^src\//) && lower.endsWith('.tsx')) return 'ui';
    if (!lower.includes('/') && (lower.endsWith('.tsx') || lower.endsWith('.ts') || lower.endsWith('.js'))) return 'ui';
    return 'other';
  }
}
