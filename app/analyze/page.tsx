'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { CodeAnalyzer } from '@/lib/orchestrator';
import { AnalysisResult, CodeFile } from '@/types';
import Graph from '@/components/graph';
import FileTree from '@/components/file-tree';
import { 
  Zap, Copy, Download, Settings, X, Search, 
  Activity, Shield, Layout, Terminal, BarChart3, 
  AlertTriangle, Radio, GitPullRequest, Layers, 
  KeyRound, Loader2, CheckCircle2, Globe 
} from 'lucide-react';

// Langkah-langkah untuk loading dialog
const LOADING_STEPS = [
  "Validating Repository URL...",
  "Initializing GitHub Engine...",
  "Fetching File Tree Structure...",
  "Analyzing Code Complexity...",
  "Detecting Security Vulnerabilities...",
  "Mapping Neural Dependencies...",
  "Finalizing Architecture Graph..."
];

export default function AnalyzePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [colorMode, setColorMode] = useState<'layer' | 'folder'>('layer');
  const [rightPanel, setRightPanel] = useState<'details' | 'security' | 'blast'>('details');

  // Simulasi progress loading dialog
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && loadingStep < LOADING_STEPS.length - 1) {
      interval = setInterval(() => {
        setLoadingStep(prev => prev + 1);
      }, 1200); // Berganti langkah setiap 1.2 detik
    }
    return () => clearInterval(interval);
  }, [loading, loadingStep]);

  const handleSelectFile = useCallback((file: CodeFile | { id: string }) => {
    if (!result) return;
    const fullFile = result.files.find(f => f.path === ('path' in file ? file.path : file.id));
    if (fullFile) {
      setSelectedFile(fullFile);
      setRightPanel('details');
    }
  }, [result]);

  const blastRadius = useMemo(() => {
    if (!result || !selectedFile) return { count: 0, percentage: 0, files: [] as string[] };
    const affectedFiles = new Set<string>();
    const checkImpact = (filePath: string) => {
      result.connections.forEach(conn => {
        if (conn.target === filePath && !affectedFiles.has(conn.source)) {
          affectedFiles.add(conn.source);
          checkImpact(conn.source);
        }
      });
    };
    checkImpact(selectedFile.path);
    return {
      count: affectedFiles.size,
      percentage: Math.round((affectedFiles.size / result.files.length) * 100),
      files: Array.from(affectedFiles)
    };
  }, [result, selectedFile]);

  const graphData = useMemo(() => {
    if (!result) return { nodes: [], links: [] };
    const ids = new Set(result.files.map(f => f.path));
    return {
      nodes: result.files.map(f => ({
        id: f.path,
        name: f.name,
        folder: f.folder,
        layer: f.layer,
        size: Math.max(5, Math.sqrt(f.functions.length) * 4),
      })),
      links: result.connections
        .filter(c => ids.has(c.source) && ids.has(c.target))
        .map(c => ({ source: c.source, target: c.target, value: c.count }))
    };
  }, [result]);

  const handleAnalyze = useCallback(async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a valid GitHub URL');
      return;
    }
    setLoading(true);
    setLoadingStep(0);
    setError('');
    try {
      const analyzer = new CodeAnalyzer();
      const analysisResult = await analyzer.analyzeGitHubRepo(
        repoUrl,
        token.trim() || undefined,
        ['node_modules', '.git', 'dist', 'build', '.next', 'package-lock.json']
      );
      setResult(analysisResult);
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Check your token/URL.');
    } finally {
      setLoading(false);
    }
  }, [repoUrl, token]);

  return (
    <div className="h-screen bg-[#0A0A0C] flex flex-col overflow-hidden text-slate-300 font-sans selection:bg-brand-orange/30">
      
      {/* LOADING OVERLAY DIALOG */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-[#0A0A0C]/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#111114] border border-white/5 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
            <div className="relative mb-8">
              <Loader2 className="w-16 h-16 text-brand-orange animate-spin opacity-20" />
              <Zap className="w-8 h-8 text-brand-orange absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-white font-black text-lg uppercase tracking-widest mb-2">Analyzing Repository</h3>
            <div className="w-full space-y-3 mt-6">
              {LOADING_STEPS.map((step, i) => (
                <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i <= loadingStep ? 'opacity-100' : 'opacity-20'}`}>
                  {i < loadingStep ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : i === loadingStep ? (
                    <Activity className="w-4 h-4 text-brand-orange animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700" />
                  )}
                  <span className={`text-[11px] font-bold uppercase tracking-tight ${i === loadingStep ? 'text-white' : 'text-slate-500'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-14 border-b border-white/5 bg-[#0D0D10] flex items-center px-4 gap-4 flex-shrink-0 z-40">
        <div className="flex items-center gap-2 pr-4 border-r border-white/5">
          <Zap className="h-5 w-5 text-brand-orange fill-brand-orange/20 shadow-[0_0_10px_rgba(241,119,32,0.3)]" />
          <span className="text-sm font-black text-white uppercase tracking-tighter">Vericode</span>
        </div>

        <div className="flex-1 flex items-center gap-3 max-w-3xl">
          <div className="flex-1 relative group">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-brand-orange transition-colors" />
            <input
              type="text"
              placeholder="github.com/owner/repo"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              className="w-full pl-9 pr-4 py-1.5 bg-black/40 border border-white/5 rounded-lg text-[11px] font-mono text-white focus:outline-none focus:border-brand-orange/50 transition-all"
            />
          </div>
          <div className="w-48 relative group">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 group-focus-within:text-brand-orange transition-colors" />
            <input
              type="password"
              placeholder="Access Token"
              value={token}
              onChange={e => setToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              className="w-full pl-9 pr-4 py-1.5 bg-black/40 border border-white/5 rounded-lg text-[11px] font-mono text-white focus:outline-none focus:border-brand-orange/50 transition-all"
            />
          </div>
          <button 
            onClick={handleAnalyze}
            className="px-4 py-1.5 bg-brand-orange text-black text-[10px] font-black rounded uppercase tracking-widest hover:bg-white transition-all active:scale-95"
          >
            Scan
          </button>
        </div>

        <div className="flex gap-2 ml-auto items-center">
          <div className="h-8 w-px bg-white/5 mx-2" />
          <button className="p-2 hover:text-brand-orange transition-colors"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* PANEL 1: File Tree & Health */}
        <aside className="w-64 border-r border-white/5 bg-[#0D0D10] flex flex-col flex-shrink-0 overflow-hidden">
          {result ? (
            <>
              <div className="p-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Health</span>
                  <div className="px-2 py-0.5 rounded bg-brand-orange/10 text-brand-orange text-[9px] font-black uppercase">Alpha</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{result.health.grade}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Architecture Score</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                <FileTree 
                  tree={result.tree} 
                  files={result.files} 
                  onSelect={handleSelectFile} 
                  selectedPath={selectedFile?.path} 
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-20">
              <Terminal className="w-8 h-8 mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">Waiting for <br/> repository scan...</p>
            </div>
          )}
        </aside>

        {/* PANEL 2: Visualization */}
        <main className="flex-1 flex flex-col bg-[#08080A] relative">
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4">
              <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg text-red-400 text-[10px] font-bold flex items-center gap-2 uppercase tracking-wider backdrop-blur-md">
                <AlertTriangle className="w-3.5 h-3.5" />
                {error}
                <button onClick={() => setError('')} className="ml-2 hover:text-white"><X className="w-3 h-3" /></button>
              </div>
            </div>
          )}

          <div className="h-12 border-b border-white/5 flex items-center px-6 justify-between bg-[#0D0D10]/50 backdrop-blur-sm z-10">
            <div className="flex bg-black/60 rounded-lg p-0.5 border border-white/5">
                {(['layer', 'folder'] as const).map(mode => (
                    <button 
                        key={mode}
                        onClick={() => setColorMode(mode)}
                        className={`px-4 py-1 text-[9px] font-black rounded uppercase tracking-widest transition-all ${colorMode === mode ? 'bg-brand-orange text-black' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
          </div>

          <div className="flex-1">
            {result ? (
              <Graph 
                data={graphData} 
                onNodeClick={handleSelectFile} 
                colorMode={colorMode} 
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <Layout className="w-20 h-20 mb-6" />
                <h2 className="text-2xl font-black uppercase tracking-[0.4em]">Dashboard Idle</h2>
              </div>
            )}
          </div>
        </main>

        {/* PANEL 3: Intelligence */}
        <aside className="w-80 border-l border-white/5 bg-[#0D0D10] flex flex-col flex-shrink-0 overflow-hidden">
          <div className="flex border-b border-white/5">
            <TabButton active={rightPanel === 'details'} onClick={() => setRightPanel('details')} icon={<BarChart3 className="w-3.5 h-3.5" />} label="Specs" />
            <TabButton active={rightPanel === 'blast'} onClick={() => setRightPanel('blast')} icon={<Radio className="w-3.5 h-3.5" />} label="Blast" />
            <TabButton active={rightPanel === 'security'} onClick={() => setRightPanel('security')} icon={<Shield className="w-3.5 h-3.5" />} label="Security" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            {selectedFile ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* SPECS */}
                    {rightPanel === 'details' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                                <div className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">Static Metrics</div>
                                <MetricRow label="Lines" value={selectedFile.lines.toString()} />
                                <MetricRow label="Complexity" value={selectedFile.complexity?.level || 'LOW'} />
                                <MetricRow label="Exports" value={selectedFile.functions.length.toString()} />
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="w-3 h-3" />
                                    Function Trace
                                </div>
                                <div className="grid gap-1">
                                    {selectedFile.functions.slice(0, 20).map((fn, i) => (
                                        <div key={i} className="px-3 py-2 bg-black/40 border border-white/5 rounded text-[10px] font-mono text-slate-400 truncate">
                                            {fn.name}()
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BLAST */}
                    {rightPanel === 'blast' && (
                        <div className="space-y-6">
                            <div className="p-6 bg-brand-orange/5 border border-brand-orange/20 rounded-2xl text-center relative overflow-hidden">
                                <div className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-4">Blast Radius</div>
                                <div className="text-6xl font-black text-white mb-1">{blastRadius.percentage}%</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase">Impact Intensity</div>
                            </div>
                            <div className="space-y-3">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <GitPullRequest className="w-3 h-3 text-brand-orange" />
                                    Affected Nodes ({blastRadius.count})
                                </div>
                                <div className="space-y-1">
                                    {blastRadius.files.slice(0, 10).map((f, i) => (
                                        <div key={i} className="text-[10px] font-mono text-slate-600 pl-3 border-l border-white/10">{f.split('/').pop()}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY */}
                    {rightPanel === 'security' && (
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Risk Profile</div>
                            {result?.securityIssues.filter(si => si.file === selectedFile.path).length ? (
                                result.securityIssues.filter(si => si.file === selectedFile.path).map((issue, i) => (
                                    <div key={i} className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                        <div className="text-[10px] font-black text-red-400 uppercase mb-1">[{issue.severity}] {issue.title}</div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">{issue.desc}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-30">
                                    <Shield className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Code is Sanitized</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                  <Activity className="w-12 h-12 mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Select Node for <br/> Intelligence Stream</p>
                </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- HELPERS ---

function StatBox({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
  return (
    <div className="bg-black/60 border border-white/5 rounded-xl p-3 text-center">
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-4 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 ${
        active ? 'border-brand-orange text-brand-orange bg-brand-orange/5' : 'border-transparent text-slate-600 hover:text-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MetricRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
            <span className="text-[9px] font-bold text-slate-500 uppercase">{label}</span>
            <span className="text-[10px] font-black text-white uppercase tracking-tight">{value}</span>
        </div>
    );
}