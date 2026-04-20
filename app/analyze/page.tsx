'use client';

import { useState, useCallback, useMemo } from 'react';
import { CodeAnalyzer } from '@/lib/orchestrator';
import { AnalysisResult, GraphNode, CodeFile } from '@/types';
import Graph from '@/components/graph';
import { Zap, Menu, Copy, Download, Settings, X } from 'lucide-react';

export default function AnalyzePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [colorMode, setColorMode] = useState<'layer' | 'folder'>('layer');
  const [rightPanel, setRightPanel] = useState<'details' | 'issues' | 'patterns' | 'security'>('details');

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
        ['node_modules', '.git', 'dist', 'build', '.next', '.venv', '__pycache__', '.env']
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
      setRightPanel('details');
    }
  };

  // Input screen
  if (!result) {
    return (
      <div className="h-screen bg-gradient-to-br from-brand-navy via-brand-navy to-slate-900 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-800 bg-brand-navy/80 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center gap-3">
            <Zap className="h-7 w-7 text-brand-orange" />
            <h1 className="text-xl font-bold text-white">Vericode</h1>
            <span className="text-xs text-slate-400 ml-auto">Architecture Intelligence</span>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl">
            <div className="mb-12 text-center">
              <h2 className="text-5xl font-bold text-white mb-4">Analyze Your Code</h2>
              <p className="text-slate-300 text-lg">
                Paste a GitHub repository URL to visualize its architecture
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAnalyze()}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="GitHub Token (optional, for higher rate limits)"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAnalyze()}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange transition"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || !repoUrl.trim()}
                className="w-full py-3 bg-brand-orange text-brand-navy font-bold rounded hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Analyzing...' : 'Analyze Repository'}
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-brand-orange text-2xl font-bold mb-1">30+</div>
                <div className="text-xs text-slate-400">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-brand-orange text-2xl font-bold mb-1">20+</div>
                <div className="text-xs text-slate-400">Vulns</div>
              </div>
              <div className="text-center">
                <div className="text-brand-orange text-2xl font-bold mb-1">∞</div>
                <div className="text-xs text-slate-400">Repos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen - CodeFlow layout
  return (
    <div className="h-screen bg-brand-navy flex flex-col overflow-hidden">
      {/* Header - CodeFlow style */}
      <header className="h-12 border-b border-slate-800 bg-brand-navy/90 flex items-center px-4 gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-fit">
          <Zap className="h-5 w-5 text-brand-orange" />
          <span className="text-sm font-bold text-white">Vericode</span>
        </div>

        <div className="flex-1 flex gap-2 min-w-0">
          <input
            type="text"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            className="flex-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
            placeholder="Repository URL"
          />
          <button onClick={() => setResult(null)} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:text-brand-orange transition">
            New
          </button>
        </div>

        <div className="flex gap-1">
          <button className="w-7 h-7 flex items-center justify-center bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-brand-orange hover:border-brand-orange transition">
            <Copy className="w-3 h-3" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-brand-orange hover:border-brand-orange transition">
            <Download className="w-3 h-3" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 hover:text-brand-orange hover:border-brand-orange transition">
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - File tree */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/40 flex flex-col overflow-hidden flex-shrink-0">
          <div className="border-b border-slate-800 p-3 space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/50 rounded p-2 text-center">
                <div className="font-bold text-brand-orange">{result.stats.files}</div>
                <div className="text-slate-400">Files</div>
              </div>
              <div className="bg-slate-800/50 rounded p-2 text-center">
                <div className="font-bold text-brand-orange">{result.stats.functions}</div>
                <div className="text-slate-400">Functions</div>
              </div>
              <div className="bg-slate-800/50 rounded p-2 text-center">
                <div className="font-bold text-brand-orange">{result.stats.connections}</div>
                <div className="text-slate-400">Deps</div>
              </div>
              <div className="bg-slate-800/50 rounded p-2 text-center">
                <div className="font-bold text-brand-orange">{result.health.grade}</div>
                <div className="text-slate-400">Grade</div>
              </div>
            </div>
          </div>

          {/* File tree */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Files ({result.files.length})</div>
            {result.files.slice(0, 30).map(file => (
              <div
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`text-xs px-2 py-1.5 rounded cursor-pointer truncate ${
                  selectedFile?.path === file.path
                    ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
                title={file.path}
              >
                {file.name}
              </div>
            ))}
            {result.files.length > 30 && (
              <div className="text-xs text-slate-500 px-2 py-1">+{result.files.length - 30} more</div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="h-10 border-b border-slate-800 bg-slate-900/40 flex items-center px-4 gap-3 flex-shrink-0">
            <div className="flex gap-1">
              <button
                onClick={() => setColorMode('layer')}
                className={`px-2 py-1 text-xs rounded ${
                  colorMode === 'layer'
                    ? 'bg-brand-orange text-brand-navy font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🏗️ Layer
              </button>
              <button
                onClick={() => setColorMode('folder')}
                className={`px-2 py-1 text-xs rounded ${
                  colorMode === 'folder'
                    ? 'bg-brand-orange text-brand-navy font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                📁 Folder
              </button>
            </div>

            {selectedFile && (
              <div className="flex-1 flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
                <span className="text-xs text-slate-300">Selected:</span>
                <span className="text-xs font-mono text-brand-orange">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="ml-auto w-4 h-4 flex items-center justify-center text-slate-500 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Graph Canvas */}
          <div className="flex-1 overflow-hidden relative">
            <Graph
              data={useMemo(
                () => ({
                  nodes: result.files.map(f => ({
                    id: f.path,
                    name: f.name,
                    folder: f.folder,
                    layer: f.layer,
                    size: Math.max(5, Math.sqrt(f.functions.length) * 3),
                  })),
                  links: result.connections.map(c => ({
                    source: c.source,
                    target: c.target,
                    value: c.count,
                    label: c.fn,
                  })),
                }),
                [result]
              )}
              onNodeClick={handleNodeClick}
              colorMode={colorMode}
            />
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/40 flex flex-col overflow-hidden flex-shrink-0">
          {/* Tabs */}
          <div className="border-b border-slate-800 flex gap-1 px-2 pt-2 flex-shrink-0 bg-slate-800/20">
            {(['details', 'issues', 'patterns', 'security'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRightPanel(tab)}
                className={`px-3 py-2 text-xs font-medium rounded-t transition ${
                  rightPanel === tab
                    ? 'bg-brand-orange text-brand-navy'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'details' && 'Details'}
                {tab === 'issues' && `Issues (${result.issues.length})`}
                {tab === 'patterns' && `Patterns (${result.patterns.length})`}
                {tab === 'security' && `Security (${result.securityIssues.length})`}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {rightPanel === 'details' && selectedFile && (
              <>
                <div className="bg-slate-800/50 rounded p-3 space-y-2">
                  <div className="text-xs font-bold text-brand-orange truncate">{selectedFile.name}</div>
                  <div className="text-xs text-slate-400 font-mono truncate">{selectedFile.path}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-slate-400">Layer</div>
                    <div className="text-white font-bold">{selectedFile.layer}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-slate-400">Functions</div>
                    <div className="text-white font-bold">{selectedFile.functions.length}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-slate-400">Lines</div>
                    <div className="text-white font-bold">{selectedFile.lines}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <div className="text-slate-400">Complexity</div>
                    <div className={`font-bold ${
                      selectedFile.complexity?.level === 'critical' ? 'text-red-400' :
                      selectedFile.complexity?.level === 'high' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {selectedFile.complexity?.level}
                    </div>
                  </div>
                </div>

                {selectedFile.functions.length > 0 && (
                  <div className="text-xs">
                    <div className="font-bold text-slate-300 mb-2">Functions:</div>
                    <div className="space-y-1">
                      {selectedFile.functions.slice(0, 10).map((fn, i) => (
                        <div key={i} className="text-slate-400 font-mono text-xs truncate">
                          • {fn.name}
                        </div>
                      ))}
                      {selectedFile.functions.length > 10 && (
                        <div className="text-slate-500 text-xs">+{selectedFile.functions.length - 10} more</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {rightPanel === 'issues' && (
              <div className="space-y-2">
                {result.issues.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-8">No issues detected</div>
                ) : (
                  result.issues.map((issue, i) => (
                    <div key={i} className="bg-slate-800/50 rounded p-2">
                      <div className={`text-xs font-bold ${
                        issue.type === 'critical' ? 'text-red-400' :
                        issue.type === 'warning' ? 'text-orange-400' :
                        'text-blue-400'
                      }`}>
                        {issue.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{issue.desc}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {rightPanel === 'patterns' && (
              <div className="space-y-2">
                {result.patterns.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-8">No patterns detected</div>
                ) : (
                  result.patterns.map((pattern, i) => (
                    <div key={i} className="bg-slate-800/50 rounded p-2">
                      <div className="text-xs font-bold text-white">
                        {pattern.icon} {pattern.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{pattern.desc}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {pattern.files.length} file{pattern.files.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {rightPanel === 'security' && (
              <div className="space-y-2">
                {result.securityIssues.length === 0 ? (
                  <div className="text-xs text-green-400 text-center py-8">✓ No security issues</div>
                ) : (
                  result.securityIssues.map((issue, i) => (
                    <div key={i} className={`rounded p-2 ${
                      issue.severity === 'high' ? 'bg-red-900/30 border border-red-700/30' :
                      issue.severity === 'medium' ? 'bg-orange-900/30 border border-orange-700/30' :
                      'bg-blue-900/30 border border-blue-700/30'
                    }`}>
                      <div className={`text-xs font-bold ${
                        issue.severity === 'high' ? 'text-red-400' :
                        issue.severity === 'medium' ? 'text-orange-400' :
                        'text-blue-400'
                      }`}>
                        {issue.title}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">{issue.desc}</div>
                      <div className="text-xs text-slate-500 mt-1 font-mono">{issue.file}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
