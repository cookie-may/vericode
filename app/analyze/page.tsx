'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Graph from '@/components/graph';
import { CodeAnalyzer } from '@/lib/orchestrator';
import { AnalysisResult, GraphNode, CodeFile } from '@/types';
import { Zap, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function AnalyzePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [colorMode, setColorMode] = useState<'layer' | 'folder' | 'churn'>('layer');

  const handleAnalyze = useCallback(async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const analyzer = new CodeAnalyzer();
      const analysisResult = await analyzer.analyzeGitHubRepo(
        repoUrl,
        token || undefined,
        ['node_modules', '.git', 'dist', 'build', '.next', '.venv', '__pycache__']
      );
      setResult(analysisResult);
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [repoUrl, token]);

  const handleNodeClick = (node: GraphNode) => {
    const file = result?.files.find(f => f.path === node.id);
    if (file) {
      setSelectedFile(file);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-navy/90">
        {/* Header */}
        <header className="border-b border-slate-800 bg-brand-navy/50 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-brand-orange" />
              <h1 className="text-2xl font-bold text-white">Vericode</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-3xl px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Analyze Your Repository
            </h2>
            <p className="text-slate-300 text-lg">
              Paste a GitHub repository URL to visualize its architecture, identify security issues, and measure code quality.
            </p>
          </div>

          <Card className="border-slate-700 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Repository Analysis</CardTitle>
              <CardDescription>Enter your GitHub repository details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Repository URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAnalyze()}
                  className="w-full px-4 py-2 bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-lg focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  GitHub Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-lg focus:outline-none focus:border-brand-orange"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Used to increase GitHub API rate limits. Your token is never stored.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={loading || !repoUrl.trim()}
                className="w-full bg-brand-orange text-brand-navy hover:bg-brand-orange/90 disabled:opacity-50"
                size="lg"
              >
                {loading ? 'Analyzing...' : 'Analyze Repository'}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-brand-orange" />
                  Supported Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  JavaScript, TypeScript, Python, Java, Go, Ruby, PHP, Rust, C/C++, and more
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-brand-orange" />
                  What We Analyze
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Dependencies, security issues, code patterns, complexity, and quality metrics
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-brand-orange" />
                  Privacy First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Your code is analyzed via GitHub API. No data is stored or indexed.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Analysis results view
  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Header */}
      <header className="border-b border-slate-800 bg-brand-navy/50 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-full px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-brand-orange" />
              <h1 className="text-xl font-bold text-white">Vericode</h1>
            </div>
            <Button onClick={() => setResult(null)} variant="outline">
              ← New Analysis
            </Button>
          </div>
          <div className="text-sm text-slate-300">
            {repoUrl} • {result.stats.files} files • {result.stats.functions} functions
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex h-screen flex-col">
        {/* Top section: Stats */}
        <div className="border-b border-slate-800 bg-brand-navy/30 px-6 py-4">
          <div className="grid gap-4 md:grid-cols-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-orange">{result.stats.files}</div>
              <div className="text-xs text-slate-400">Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-orange">{result.stats.functions}</div>
              <div className="text-xs text-slate-400">Functions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-orange">{result.stats.connections}</div>
              <div className="text-xs text-slate-400">Dependencies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-orange">{result.stats.dead}</div>
              <div className="text-xs text-slate-400">Dead Code</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-orange">{result.securityIssues.length}</div>
              <div className="text-xs text-slate-400">Security Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-orange">{result.health.grade}</div>
              <div className="text-xs text-slate-400">Health Score</div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 gap-4 overflow-hidden p-4">
          {/* Left: Graph */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Architecture Map</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setColorMode('layer')}
                  className={`px-3 py-1 text-xs rounded ${
                    colorMode === 'layer'
                      ? 'bg-brand-orange text-brand-navy'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Layer
                </button>
                <button
                  onClick={() => setColorMode('folder')}
                  className={`px-3 py-1 text-xs rounded ${
                    colorMode === 'folder'
                      ? 'bg-brand-orange text-brand-navy'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Folder
                </button>
              </div>
            </div>
            <div className="flex-1 rounded-lg border border-slate-800 overflow-hidden">
              {result.files.length > 0 && (
                <Graph
                  data={(() => {
                    const analyzer = new CodeAnalyzer();
                    // Re-create analyzer with results for graph building
                    return { nodes: [], links: [] };
                  })()}
                  onNodeClick={handleNodeClick}
                  colorMode={colorMode}
                />
              )}
            </div>
          </div>

          {/* Right: Details panel */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto">
            {selectedFile ? (
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-sm">{selectedFile.name}</CardTitle>
                  <CardDescription>{selectedFile.path}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <div className="text-slate-400">Layer</div>
                    <div className="text-white font-medium">{selectedFile.layer}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Functions</div>
                    <div className="text-white font-medium">{selectedFile.functions.length}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Lines of Code</div>
                    <div className="text-white font-medium">{selectedFile.lines}</div>
                  </div>
                  {selectedFile.complexity && (
                    <div>
                      <div className="text-slate-400">Complexity</div>
                      <div className="text-white font-medium">
                        {selectedFile.complexity.level} ({selectedFile.complexity.score})
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Issues summary */}
                {result.securityIssues.length > 0 && (
                  <Card className="border-red-700/50 bg-red-900/10">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Security Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {result.securityIssues.slice(0, 5).map((issue, i) => (
                          <div key={i} className="text-slate-300">
                            • {issue.title}
                          </div>
                        ))}
                        {result.securityIssues.length > 5 && (
                          <div className="text-slate-400 text-xs">
                            +{result.securityIssues.length - 5} more
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <Card className="border-slate-700 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {result.suggestions.slice(0, 3).map((sug, i) => (
                          <div key={i} className="text-slate-300">
                            <div className="font-medium">{sug.icon} {sug.title}</div>
                            <div className="text-xs text-slate-400">{sug.desc}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
