import { CodeFile } from '@/types';
import { Parser } from './parser';

interface GitHubFile {
  path: string;
  name: string;
  type: 'blob' | 'tree';
  url?: string;
  size?: number;
}

export class GitHubClient {
  private token: string;

  constructor(token?: string) {
    this.token = token || '';
    console.log('GitHubClient initialized with token:', token ? 'present' : 'none');
  }

  setToken(token: string) {
    this.token = token;
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': this.token ? `token ${this.token}` : '',
    };

    const cleanHeaders = Object.fromEntries(
      Object.entries(headers).filter(([, v]) => v !== '')
    );

    console.log('Making GitHub API request to:', url);
    console.log('Using authorization:', this.token ? 'yes' : 'no');

    const response = await fetch(url, { ...options, headers: cleanHeaders });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found');
      }
      if (response.status === 401) {
        throw new Error('Invalid token');
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText || 'Unknown error'}`);
    }

    return response;
  }

  async getRepository(owner: string, repo: string) {
    const response = await this.fetch(
      `https://api.github.com/repos/${owner}/${repo}`
    );
    return response.json();
  }

  async getFileTree(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<GitHubFile[]> {
    const response = await this.fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );
    const data = await response.json();
    return data.tree || [];
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string = 'main'
  ): Promise<string | null> {
    try {
      const response = await this.fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
      );
      const data = await response.json();

      // Check if response is an array (directory listing)
      if (Array.isArray(data)) {
        return null;
      }

      // Handle empty files - return empty string
      if (data.size === 0) {
        return '';
      }

      // Handle symlinks or special files
      if (data.type === 'symlink' || data.target) {
        return null;
      }

      // Handle large files (>1MB) - GitHub API doesn't include content
      if (data.size && data.size > 1000000) {
        return null;
      }

      // Handle API errors
      if (data.message) {
        return null;
      }

      // Try to get content
      if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  async analyzeRepository(
    owner: string,
    repo: string,
    branch: string = 'main',
    excludePatterns: string[] = ['node_modules', '.git', 'dist', 'build']
  ): Promise<CodeFile[]> {
    const files: CodeFile[] = [];

    try {
      // Get file tree
      const tree = await this.getFileTree(owner, repo, branch);

      // Filter files
      const codeFiles = tree.filter(
        file => {
          const name = file.path?.split('/').pop() || '';
          return (
            file.type === 'blob' &&
            Parser.isCodeFile(name) &&
            !this.shouldExclude(file.path, excludePatterns)
          );
        }
      );

      // Fetch content for each file
      for (const file of codeFiles.slice(0, 500)) {
        const name = file.path?.split('/').pop() || file.path || '';
        if (!name) continue;
        // Limit to 500 files for performance
        try {
          const content = await this.getFileContent(owner, repo, file.path, branch);

          // Skip files that couldn't be fetched
          if (content === null) continue;

          const parts = file.path.split('/');
          const folder = parts.slice(0, -1).join('/');

          const functions = Parser.extractFunctions(content, name);
          const complexityResult = this.calcComplexity(content);
          const complexity = {
            score: complexityResult.score,
            level: (complexityResult.level as 'low' | 'medium' | 'high' | 'critical'),
          };

          files.push({
            path: file.path,
            name: name,
            folder: folder || '/',
            content,
            functions,
            lines: content.split('\n').length,
            layer: Parser.detectLayer(file.path),
            churn: 0,
            isCode: true,
            complexity,
            language: this.detectLanguage(name),
          });
        } catch (err) {
          console.error(`Failed to fetch ${file.path}:`, err);
          continue;
        }
      }
    } catch (err) {
      console.error('Repository analysis failed:', err);
      throw err;
    }

    return files;
  }

  private shouldExclude(path: string, patterns: string[]): boolean {
    const lower = path.toLowerCase();
    return patterns.some(pattern => {
      const p = pattern.toLowerCase();
      return (
        lower.includes(p) ||
        lower.endsWith(p) ||
        lower.startsWith(p)
      );
    });
  }

  private calcComplexity(content: string): { score: number; level: string } {
    let complexity = 1;
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if/g,
      /\bwhile/g,
      /\bfor\s*\(/g,
      /\bcatch/g,
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
    if (lower.endsWith('.cpp') || lower.endsWith('.cc')) return 'C++';
    if (lower.endsWith('.c') || lower.endsWith('.h')) return 'C';
    return 'Unknown';
  }

  async searchRepository(
    owner: string,
    repo: string,
    query: string
  ): Promise<unknown[]> {
    const response = await this.fetch(
      `https://api.github.com/search/code?q=${encodeURIComponent(
        query
      )}+repo:${owner}/${repo}`
    );
    const data = await response.json();
    return data.items || [];
  }

  parseRepoUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    return { owner: match[1], repo: match[2].replace('.git', '') };
  }
}
