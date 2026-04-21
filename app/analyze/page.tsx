'use client';

import { useState, useCallback, useMemo } from 'react';
import { CodeAnalyzer } from '@/lib/orchestrator';
import { AnalysisResult, CodeFile } from '@/types';
import Graph, { LAYER_COLORS } from '@/components/graph';
import FileTree from '@/components/file-tree';
import VizTreemap from '@/components/viz-treemap';
import VizTree from '@/components/viz-tree';
import VizFlow from '@/components/viz-flow';
import VizCluster from '@/components/viz-cluster';
import VizBundle from '@/components/viz-bundle';
import {
  Zap, Settings, Search,
  Activity, Shield, Layout, Terminal, BarChart3,
  AlertTriangle, Layers,
  Loader2, CheckCircle2, Globe,
  GitBranch, Lightbulb, ChevronRight,
} from 'lucide-react';

export default function AnalyzePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [colorMode, setColorMode] = useState<'layer' | 'folder' | 'churn'>('layer');
  const [activeVizTab, setActiveVizTab] = useState<'graph' | 'treemap' | 'tree' | 'flow' | 'cluster' | 'bundle'>('graph');
  const [rightPanel, setRightPanel] = useState<'issues' | 'pattern' | 'security' | 'actions'>('issues');
  const [drillDown, setDrillDown] = useState<{ type: 'duplicate'; data: import('@/types').Duplicate } | null>(null);

  const handleSelectFile = useCallback((nodeOrFile: any) => {
    if (!result) return;
    const path = nodeOrFile.path ?? nodeOrFile.id;
    if (!path) return;
    const fullFileData = result.files.find(f => f.path === path);
    if (fullFileData) setSelectedFile(fullFileData);
  }, [result]);

  const handleAnalyze = useCallback(async () => {
    if (!repoUrl.trim()) { setError('Please enter a GitHub repository URL'); return; }
    setLoading(true);
    setLoadingMessage('Validating Repository URL...');
    setError('');
    try {
      const analyzer = new CodeAnalyzer();
      const analysisResult = await analyzer.analyzeGitHubRepo(
        repoUrl,
        process.env.NEXT_PUBLIC_GITHUB_TOKEN || undefined,
        ['node_modules', '.git', 'dist', 'build', '.next', 'package-lock.json'],
        (msg) => setLoadingMessage(msg)
      );
      setResult(analysisResult);
      setSelectedFile(null);
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Check your URL.');
    } finally {
      setLoading(false);
    }
  }, [repoUrl]);

  const graphData = useMemo(() => {
    if (!result) return { nodes: [], links: [] };
    const nodeIds = new Set(result.files.map(f => f.path));
    return {
      nodes: result.files.map(f => ({
        id: f.path, name: f.name, folder: f.folder,
        layer: f.layer || 'other', size: Math.max(6, Math.sqrt(f.functions.length) * 4),
      })),
      links: result.connections
        .filter(c => nodeIds.has(c.source) && nodeIds.has(c.target))
        .map(c => ({ source: c.source, target: c.target, value: c.count }))
    };
  }, [result]);

  return (
    <div className="h-screen bg-[#0A0A0C] flex flex-col overflow-hidden text-slate-300 font-sans selection:bg-brand-orange/30">

      {/* HEADER */}
      <header className="h-14 border-b border-white/5 bg-[#0D0D10] flex items-center px-4 gap-4 flex-shrink-0 z-40">
        <div className="flex items-center gap-2 pr-4 border-r border-white/5">
          <img src="/logo.jpeg" alt="Vericode Logo" className="h-5 w-5 object-contain" />
          <span className="text-sm font-black text-white uppercase tracking-tighter">Vericode</span>
        </div>
        <div className="flex-1 flex items-center gap-3 max-w-3xl">
          <div className="flex-1 relative group">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-brand-orange transition-colors" />
            <input
              type="text"
              placeholder="github.com/owner/repository"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              className="w-full pl-9 pr-4 py-1.5 bg-black/40 border border-white/5 rounded-lg text-[11px] font-mono text-white focus:outline-none focus:border-brand-orange/50 transition-all placeholder:text-slate-700"
            />
          </div>
          <button
            onClick={handleAnalyze}
            className="px-5 py-1.5 bg-brand-orange text-black text-[10px] font-black rounded uppercase tracking-widest hover:bg-white transition-all active:scale-95 shadow-[0_0_15px_rgba(241,119,32,0.2)]"
          >
            Scan
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="h-8 w-px bg-white/5 mx-2" />
          <button className="p-2 text-slate-500 hover:text-brand-orange transition-colors"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LOADING OVERLAY */}
        {loading && (
          <div className="absolute inset-0 z-[100] bg-[#0A0A0C]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="w-full max-w-sm bg-[#0D0D10] border border-white/10 rounded-2xl p-8 shadow-[0_0_80px_rgba(241,119,32,0.15)] flex flex-col items-center">
              <div className="relative mb-6">
                <Loader2 className="w-12 h-12 text-brand-orange animate-spin opacity-20" />
                <Zap className="w-6 h-6 text-brand-orange absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-6">Deep Scanning</h3>
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-brand-orange animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">{loadingMessage}</span>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 1: File Tree */}
        <aside className="w-64 border-r border-white/5 bg-[#0D0D10] flex flex-col flex-shrink-0">
          {result ? (
            <>
              <div className="p-4 border-b border-white/5 bg-[#0D0D10] flex flex-col gap-4">
                {/* Color By */}
                <div>
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Color By</div>
                  <div className="flex bg-black/60 rounded-lg p-0.5 border border-white/5">
                    {(['folder', 'layer', 'churn'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setColorMode(mode)}
                        className={`flex-1 py-1 text-[9px] font-black rounded uppercase tracking-widest transition-all ${colorMode === mode ? 'bg-brand-orange text-black' : 'text-slate-500 hover:text-slate-200'}`}
                      >
                        {mode === 'folder' ? '📁 Folder' : mode === 'layer' ? '🏗️ Layer' : '🔥 Churn'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: result.stats.files, l: 'Files' },
                    { v: result.stats.functions, l: 'Functions' },
                    { v: result.stats.connections, l: 'Links' },
                    { v: result.stats.dead, l: 'Unused' },
                  ].map(({ v, l }) => (
                    <div key={l} className="p-2 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                      <div className="text-lg font-black text-white">{v}</div>
                      <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{l}</div>
                    </div>
                  ))}
                </div>

                {/* Health Score */}
                <HealthScoreWidget score={result.health.score} grade={result.health.grade} />

                <div className="p-2 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                  <div className="text-xl font-black text-brand-orange">{result.stats.loc.toLocaleString()}</div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Lines of Code</div>
                </div>

                {/* Language bar */}
                <div className="space-y-1.5">
                  <div className="flex h-1.5 rounded-full overflow-hidden">
                    {result.stats.languages.map((lang, idx) => (
                      <div key={idx} style={{ width: `${lang.pct}%`, backgroundColor: Object.values(LAYER_COLORS)[idx % 10] }} className="h-full" />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {result.stats.languages.slice(0, 4).map((lang, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: Object.values(LAYER_COLORS)[idx % 10] }} />
                        <span className="text-[9px] font-mono text-slate-400">{lang.ext} {Math.round(lang.pct)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                <FileTree tree={result.tree} files={result.files} onSelect={handleSelectFile} selectedPath={selectedFile?.path} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-10">
              <Terminal className="w-8 h-8 mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Engine Standby...</p>
            </div>
          )}
        </aside>

        {/* PANEL 2: Visualization Canvas */}
        <main className="flex-1 flex flex-col bg-[#08080A] relative">
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
              <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg text-red-400 text-[10px] font-bold flex items-center gap-2 uppercase tracking-wider backdrop-blur-md">
                <AlertTriangle className="w-3.5 h-3.5" />{error}
              </div>
            </div>
          )}

          <div className="h-12 border-b border-white/5 flex items-center px-6 justify-between bg-[#0D0D10]/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <div className="flex bg-black/60 rounded-lg p-0.5 border border-white/5">
                {(['graph', 'treemap', 'tree', 'flow', 'cluster', 'bundle'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveVizTab(mode)}
                    className={`px-4 py-1 text-[9px] font-black rounded uppercase tracking-widest transition-all ${activeVizTab === mode ? 'bg-brand-orange text-black' : 'text-slate-500 hover:text-slate-200'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {result && (
                <div className="flex items-center gap-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                  <span>{result.files.length} nodes</span>
                  <span className="text-white/10">·</span>
                  <span>{result.connections.length} edges</span>
                </div>
              )}
            </div>
            {selectedFile && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Object</span>
                <div className="px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded text-brand-orange text-[10px] font-mono font-bold">
                  {selectedFile.name}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative">
            {result ? (
              <>
                {activeVizTab === 'graph' && (
                  <Graph key={colorMode} data={graphData} onNodeClick={handleSelectFile} colorMode={colorMode} />
                )}
                {activeVizTab === 'treemap' && (
                  <VizTreemap data={result} onNodeClick={handleSelectFile} colorMode={colorMode} />
                )}
                {activeVizTab === 'tree' && (
                  <VizTree data={result} onNodeClick={handleSelectFile} colorMode={colorMode} />
                )}
                {activeVizTab === 'flow' && (
                  <VizFlow data={result} onNodeClick={handleSelectFile} colorMode={colorMode} />
                )}
                {activeVizTab === 'cluster' && (
                  <VizCluster data={result} onNodeClick={handleSelectFile} colorMode={colorMode} />
                )}
                {activeVizTab === 'bundle' && (
                  <VizBundle data={result} onNodeClick={handleSelectFile} colorMode={colorMode} />
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale">
                <Layout className="w-20 h-20 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em]">Dashboard Offline</h2>
              </div>
            )}
          </div>
        </main>

        {/* PANEL 3: Intelligence Panel */}
        <aside className="w-80 border-l border-white/5 bg-[#0D0D10] flex flex-col flex-shrink-0">
          <div className="flex border-b border-white/5">
            <TabButton active={rightPanel === 'issues'} onClick={() => setRightPanel('issues')} icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Issues" badge={result?.issues.length} />
            <TabButton active={rightPanel === 'pattern'} onClick={() => setRightPanel('pattern')} icon={<Layers className="w-3.5 h-3.5" />} label="Pattern" badge={result?.patterns.length} />
            <TabButton active={rightPanel === 'security'} onClick={() => setRightPanel('security')} icon={<Shield className="w-3.5 h-3.5" />} label="Security" badge={result?.stats.security} badgeDanger />
            <TabButton active={rightPanel === 'actions'} onClick={() => setRightPanel('actions')} icon={<Lightbulb className="w-3.5 h-3.5" />} label="Actions" badge={result?.suggestions.length} />
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {result ? (
              <div className="space-y-3 animate-in fade-in duration-300">

                {/* ── ISSUES TAB ── */}
                {rightPanel === 'issues' && (
                  selectedFile ? (
                    <FileDetailView file={selectedFile} result={result} />
                  ) : (
                    <IssuesListView result={result} />
                  )
                )}

                {/* ── PATTERN TAB ── */}
                {rightPanel === 'pattern' && (
                  <PatternsView result={result} />
                )}

                {/* ── SECURITY TAB ── */}
                {rightPanel === 'security' && (
                  <SecurityView result={result} selectedFile={selectedFile} />
                )}

                {/* ── ACTIONS TAB ── */}
                {rightPanel === 'actions' && (
                  <ActionsView result={result} onDuplicateClick={d => setDrillDown({ type: 'duplicate', data: d })} />
                )}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                <Activity className="w-12 h-12 mb-4 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest">Scan a repo<br/>to start analysis</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Duplicate detail modal ── */}
      {drillDown && drillDown.type === 'duplicate' && (
        <DuplicateModal
          dup={drillDown.data}
          onClose={() => setDrillDown(null)}
          onSelectFile={(path) => { handleSelectFile({ path }); setDrillDown(null); }}
        />
      )}
    </div>
  );
}

// ─── RIGHT PANEL SUBVIEWS ─────────────────────────────────────────────────────

function IssuesListView({ result }: { result: AnalysisResult }) {
  if (result.issues.length === 0) {
    return (
      <div className="py-16 text-center opacity-40">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
        <p className="text-[10px] font-black uppercase tracking-widest text-green-400">No issues detected!</p>
      </div>
    );
  }
  return (
    <>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
        Architecture Issues ({result.issues.length})
      </div>
      {result.issues.map((issue, i) => (
        <div key={i} className={`p-3 rounded-xl border ${issue.type === 'critical' ? 'bg-red-500/5 border-red-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
          <div className={`flex items-center gap-2 text-[10px] font-black uppercase mb-1.5 ${issue.type === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-current/10">{issue.type}</span>
            {issue.title}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{issue.desc}</p>
          {issue.items && issue.items.length > 0 && (
            <p className="text-[9px] text-slate-600 mt-1.5 font-mono">{issue.items.length} items affected</p>
          )}
        </div>
      ))}
    </>
  );
}

function FileDetailView({ file, result }: { file: CodeFile; result: AnalysisResult }) {
  return (
    <>
      {/* File header */}
      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: LAYER_COLORS[file.layer] ?? '#64748b', boxShadow: `0 0 6px ${LAYER_COLORS[file.layer] ?? '#64748b'}88` }} />
          <span className="text-[11px] font-mono font-bold text-white truncate">{file.name}</span>
        </div>
        <p className="text-[9px] font-mono text-slate-600 truncate">{file.path}</p>
      </div>

      {/* Metrics */}
      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
        <div className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] mb-3">Metrics</div>
        <MetricRow label="Lines" value={file.lines.toLocaleString()} />
        <MetricRow label="Language" value={file.language || 'Unknown'} />
        <MetricRow
          label="Complexity"
          value={file.complexity?.level?.toUpperCase() || 'LOW'}
          accent={
            file.complexity?.level === 'critical' ? '#f43f5e' :
            file.complexity?.level === 'high' ? '#fb923c' :
            file.complexity?.level === 'medium' ? '#fbbf24' : '#4ade80'
          }
        />
        <MetricRow label="Score" value={file.complexity?.score?.toString() || '0'} />
        <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Layer</span>
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded"
            style={{ color: LAYER_COLORS[file.layer] ?? '#64748b', backgroundColor: `${LAYER_COLORS[file.layer] ?? '#64748b'}18` }}>
            {file.layer || 'other'}
          </span>
        </div>
        <MetricRow label="Functions" value={file.functions.length.toString()} />
      </div>

      {/* Exported Symbols */}
      {file.functions.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-3 h-3 text-brand-orange" />Exported Symbols
          </div>
          <div className="grid gap-1">
            {file.functions.slice(0, 15).map((fn, i) => (
              <div key={i} className="px-3 py-1.5 bg-black/40 border border-white/5 rounded text-[10px] font-mono text-slate-400 flex items-center gap-2">
                <span className="text-slate-700 text-[8px]">{fn.type}</span>
                <span>{fn.name}()</span>
                {fn.isExported && <span className="ml-auto text-[8px] text-brand-orange/60 font-bold">export</span>}
              </div>
            ))}
            {file.functions.length > 15 && (
              <div className="text-[9px] text-slate-600 font-bold px-2">+{file.functions.length - 15} more</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PatternsView({ result }: { result: AnalysisResult }) {
  if (result.patterns.length === 0) {
    return (
      <div className="py-16 text-center opacity-40">
        <Search className="w-10 h-10 mx-auto mb-3" />
        <p className="text-[10px] font-black uppercase tracking-widest">No patterns detected</p>
        <p className="text-[9px] text-slate-600 mt-1">Patterns are detected based on code structure</p>
      </div>
    );
  }
  return (
    <>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
        Design Patterns ({result.patterns.length})
      </div>
      {result.patterns.map((p, i) => (
        <div key={i} className={`p-3 rounded-xl border-l-2 bg-white/[0.02] border border-white/5 ${p.isAnti ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">{p.icon}</span>
            <span className="text-[11px] font-bold text-white flex-1">{p.name}</span>
            {p.isAnti && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[8px] font-black rounded uppercase">Anti</span>}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{p.desc}</p>
          {p.files.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {p.files.slice(0, 3).map((f, j) => (
                <span key={j} className="px-1.5 py-0.5 bg-black/40 text-slate-600 text-[8px] rounded font-mono">{f.name}</span>
              ))}
              {p.files.length > 3 && <span className="text-[8px] text-slate-700 self-center">+{p.files.length - 3}</span>}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function SecurityView({ result, selectedFile }: { result: AnalysisResult; selectedFile: CodeFile | null }) {
  const issues = selectedFile
    ? result.securityIssues.filter(si => si.path === selectedFile.path)
    : result.securityIssues;

  const high = issues.filter(i => i.severity === 'high').length;
  const med = issues.filter(i => i.severity === 'medium').length;
  const low = issues.filter(i => i.severity === 'low').length;

  if (issues.length === 0) {
    return (
      <div className="py-16 text-center opacity-30">
        <Shield className="w-10 h-10 mx-auto mb-3" />
        <p className="text-[10px] font-black uppercase tracking-widest">No threats detected</p>
        <p className="text-[9px] text-slate-600 mt-1">{selectedFile ? 'This file looks clean' : 'Codebase passed all checks'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-3">
        {high > 0 && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-black rounded uppercase">{high} High</span>}
        {med > 0 && <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] font-black rounded uppercase">{med} Medium</span>}
        {low > 0 && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black rounded uppercase">{low} Low</span>}
      </div>
      {issues.map((issue, i) => (
        <div key={i} className={`p-3 rounded-xl border cursor-pointer ${
          issue.severity === 'high' ? 'bg-red-500/5 border-red-500/20' :
          issue.severity === 'medium' ? 'bg-orange-500/5 border-orange-500/20' :
          'bg-blue-500/5 border-blue-500/20'
        }`}>
          <div className={`flex items-center gap-2 text-[10px] font-black uppercase mb-1.5 ${
            issue.severity === 'high' ? 'text-red-400' :
            issue.severity === 'medium' ? 'text-orange-400' : 'text-blue-400'
          }`}>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-current/10">{issue.severity}</span>
            {issue.title}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{issue.desc}</p>
          {issue.path && <p className="text-[9px] text-slate-600 font-mono mt-1.5 truncate">{issue.path}</p>}
          {issue.line && <p className="text-[9px] text-slate-600 font-mono mt-0.5">Line {issue.line}</p>}
          {issue.code && (
            <pre className="mt-2 p-2 bg-black/40 rounded text-[9px] font-mono text-orange-400 overflow-x-auto whitespace-pre">{issue.code}</pre>
          )}
        </div>
      ))}
    </>
  );
}

function ActionsView({
  result,
  onDuplicateClick,
}: {
  result: AnalysisResult;
  onDuplicateClick: (d: import('@/types').Duplicate) => void;
}) {
  const hasSuggestions = result.suggestions && result.suggestions.length > 0;
  const hasDuplicates = result.duplicates && result.duplicates.length > 0;

  if (!hasSuggestions && !hasDuplicates) {
    return (
      <div className="py-16 text-center opacity-30">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
        <p className="text-[10px] font-black uppercase tracking-widest text-green-400">No issues to address!</p>
        <p className="text-[9px] text-slate-600 mt-1">Your codebase looks healthy</p>
      </div>
    );
  }

  return (
    <>
      {hasSuggestions && (
        <>
          <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-3 font-bold">
            Prioritized recommendations
          </div>
          {result.suggestions.map((s, i) => (
            <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl"
              style={{ borderLeftWidth: 2, borderLeftColor: s.priority === 'critical' ? '#f43f5e' : s.priority === 'high' ? '#fb923c' : '#F17720' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{s.icon}</span>
                <span className="text-[11px] font-bold text-white flex-1">{s.title}</span>
                <span className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase ${
                  s.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  s.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-brand-orange/20 text-brand-orange'
                }`}>{s.priority}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{s.desc}</p>
              <div className="flex items-center gap-2 text-[9px]">
                <ChevronRight className="w-3 h-3 text-brand-orange flex-shrink-0" />
                <span className="text-slate-500">{s.action}</span>
              </div>
              {s.impact && (
                <div className="mt-1.5 text-[9px] text-green-500/70 font-mono">Impact: {s.impact}</div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Duplicate Functions section */}
      {hasDuplicates && (
        <div className={hasSuggestions ? 'mt-5' : undefined}>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>📋 Duplicate Functions</span>
            <span className="px-1.5 py-0.5 bg-white/10 rounded text-[8px] font-black text-slate-400">
              {result.duplicates.length}
            </span>
          </div>
          <div className="space-y-2">
            {result.duplicates.slice(0, 10).map((d, i) => {
              const isCode = d.type === 'code';
              const accentColor = isCode ? '#a78bfa' : '#ff9f43';
              return (
                <button
                  key={i}
                  onClick={() => onDuplicateClick(d)}
                  className="w-full text-left p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                  style={{ borderLeftWidth: 2, borderLeftColor: accentColor }}
                >
                  {/* Type badge */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded"
                      style={{ color: accentColor, background: `${accentColor}20` }}>
                      {isCode ? 'Similar Code' : 'Same Name'}
                    </span>
                    {isCode && d.similarity > 0 && (
                      <span className="text-[8px] font-mono text-slate-500">
                        {Math.round(d.similarity * 100)}% match
                      </span>
                    )}
                  </div>
                  {/* Names — truncated with ellipsis */}
                  <div className="text-[10px] font-mono leading-relaxed mb-2 line-clamp-2"
                    style={{ color: accentColor }}>
                    {d.name}
                  </div>
                  {/* Footer row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-600 font-mono">{d.files.length} locations</span>
                    <span className="text-[9px] text-brand-orange group-hover:text-white transition-colors">
                      Click for details →
                    </span>
                  </div>
                </button>
              );
            })}
            {result.duplicates.length > 10 && (
              <div className="text-[9px] text-slate-600 font-bold text-center py-1">
                +{result.duplicates.length - 10} more duplicates
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── SHARED SUB-COMPONENTS ────────────────────────────────────────────────────

// ─── HEALTH SCORE ────────────────────────────────────────────────────────────

const GRADE_RANGES: Record<string, { min: number; max: number; color: string }> = {
  'A+': { min: 96, max: 100, color: '#4ade80' },
  'A':  { min: 91, max: 95,  color: '#4ade80' },
  'A-': { min: 86, max: 90,  color: '#86efac' },
  'B+': { min: 81, max: 85,  color: '#a3e635' },
  'B':  { min: 76, max: 80,  color: '#facc15' },
  'B-': { min: 71, max: 75,  color: '#fbbf24' },
  'C+': { min: 66, max: 70,  color: '#fb923c' },
  'C':  { min: 61, max: 65,  color: '#f97316' },
  'C-': { min: 56, max: 60,  color: '#ef4444' },
  'D':  { min: 41, max: 55,  color: '#dc2626' },
  'F':  { min: 0,  max: 40,  color: '#991b1b' },
};

function HealthScoreWidget({ score, grade }: { score: number; grade: string }) {
  const info = GRADE_RANGES[grade] ?? { min: 0, max: 100, color: '#64748b' };
  const color = info.color;
  // SVG ring parameters
  const r = 18, cx = 24, cy = 24, circumference = 2 * Math.PI * r;
  const progress = Math.min(1, Math.max(0, score / 100));
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3">
      {/* Ring */}
      <div className="relative flex-shrink-0" style={{ width: 48, height: 48 }}>
        <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="3.5" />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-black" style={{ color }}>{score}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black leading-none" style={{ color }}>{grade}</span>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Health</span>
        </div>
        <div className="text-[8px] text-slate-600 font-mono mt-1">
          Range {info.min}–{info.max} pts
        </div>
        <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress * 100}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active, onClick, icon, label, badge, badgeDanger,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode;
  label: string; badge?: number; badgeDanger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-4 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 relative ${
        active ? 'border-brand-orange text-brand-orange bg-brand-orange/5' : 'border-transparent text-slate-600 hover:text-slate-300'
      }`}
    >
      {icon}{label}
      {badge !== undefined && badge > 0 && (
        <span className={`absolute top-2 right-1 text-[7px] font-black px-1 rounded-full ${badgeDanger ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MetricRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
      <span className="text-[9px] font-bold text-slate-500 uppercase">{label}</span>
      <span className="text-[10px] font-black uppercase" style={{ color: accent ?? '#ffffff' }}>{value}</span>
    </div>
  );
}

// ─── DUPLICATE DETAIL MODAL ───────────────────────────────────────────────────

function DuplicateModal({
  dup,
  onClose,
  onSelectFile,
}: {
  dup: import('@/types').Duplicate;
  onClose: () => void;
  onSelectFile: (path: string) => void;
}) {
  const isCode = dup.type === 'code';
  const accentColor = isCode ? '#a78bfa' : '#ff9f43';
  const icon = isCode ? '📋' : '📛';
  const typeLabel = isCode ? 'Similar Code' : 'Duplicate Name';

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0D0D10] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.7)] flex flex-col"
        style={{ maxHeight: '82vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-white/5 gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: accentColor }}>
              {icon} {typeLabel}
            </div>
            {/* Show ALL names exactly like the prototype — wraps naturally */}
            <div className="text-[11px] font-mono text-white leading-relaxed break-words">
              {dup.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all text-lg leading-none mt-0.5"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* ── Suggestion / match info ── */}
          <div className="px-5 pt-4 pb-2">
            <div className="p-3 rounded-xl border border-white/5 flex items-start gap-3"
              style={{ background: `${accentColor}10` }}>
              {dup.similarity > 0 && (
                <div className="flex-shrink-0 px-2 py-1 rounded-lg text-center"
                  style={{ background: `${accentColor}25`, border: `1px solid ${accentColor}40` }}>
                  <div className="text-[16px] font-black leading-none" style={{ color: accentColor }}>
                    {dup.similarity}%
                  </div>
                  <div className="text-[7px] font-black uppercase tracking-wider text-slate-500 mt-0.5">match</div>
                </div>
              )}
              <p className="text-[10px] text-slate-300 leading-relaxed">{dup.suggestion}</p>
            </div>
          </div>

          {/* ── All Locations ── */}
          <div className="px-5 pb-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              All Locations
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-white/10 text-slate-400">
                {dup.files.length}
              </span>
            </div>
            <div className="space-y-0 rounded-xl overflow-hidden border border-white/5">
              {dup.files.map((f, i) => {
                const fnName = f.name || dup.name;
                const fileName = f.file.split('/').pop() ?? f.file;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.04] transition-colors group"
                    style={{ borderLeftWidth: 2, borderLeftColor: accentColor }}
                  >
                    {/* Left: fn name + path */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[11px] font-bold cursor-pointer group-hover:text-white transition-colors truncate"
                        style={{ color: accentColor }}
                        onClick={() => onSelectFile(f.file)}
                      >
                        {fnName}
                      </div>
                      <div
                        className="text-[9px] font-mono text-slate-600 mt-0.5 truncate cursor-pointer hover:text-slate-400 transition-colors"
                        onClick={() => onSelectFile(f.file)}
                      >
                        {f.file}
                      </div>
                      {f.line && (
                        <div className="text-[9px] font-mono mt-0.5" style={{ color: '#F17720' }}>
                          Line {f.line}
                        </div>
                      )}
                    </div>

                    {/* Right: View button */}
                    <button
                      onClick={() => onSelectFile(f.file)}
                      className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-white/5 border border-white/10 text-slate-400 hover:bg-brand-orange/20 hover:border-brand-orange/40 hover:text-brand-orange transition-all"
                    >
                      👁️ View
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Suggested Action ── */}
          <div className="px-5 pb-5 pt-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Suggested Action</div>
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed">
              {isCode
                ? 'Extract the similar code into a shared utility function. This reduces maintenance burden and ensures consistent behavior.'
                : 'Consider renaming these functions to be more specific, or consolidate them into a single shared function if they serve the same purpose.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
