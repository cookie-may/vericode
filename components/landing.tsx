'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Shield, GitBranch, ArrowRight, Code, Terminal, Activity, FileText, Target, Database, Calculator, BarChart, CheckCircle2, Circle, Clock, ChevronDown, Check, Copy } from 'lucide-react';
import Link from 'next/link';
import BackgroundEffects from './background-effects';

export default function Landing() {
  return (
    <div className="relative overflow-hidden bg-transparent text-slate-200 font-sans selection:bg-brand-orange/30 min-h-screen">
      <BackgroundEffects />
      
      {/* Navigation */}
      <header className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="h-8 w-8 text-brand-orange fill-brand-orange/20" />
              <div className="absolute -inset-1 bg-brand-orange/20 blur-sm rounded-full" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">
              Veri<span className="text-brand-orange">code</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#how" className="hover:text-brand-orange transition-colors">Pipeline</a>
            <a href="#roadmap" className="hover:text-brand-orange transition-colors">Roadmap</a>
            <a href="#faq" className="hover:text-brand-orange transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/analyze">
              <Button className="bg-brand-orange text-[#0A0A0C] font-bold text-xs uppercase tracking-widest hover:bg-white hover:scale-105 transition-all rounded-full px-6">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 space-y-0">
        <Hero />
        <HowItWorks />
        <Roadmap />
        <FAQ />
      </div>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/60 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="text-sm text-slate-500 font-medium">
            © 2026 Vericode Platform. <span className="text-white font-bold">Code Intelligence Engine</span>.
          </div>
          <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-brand-orange transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-orange transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-orange transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Hero() {
  const [copied, setCopied] = useState(false);
  const coreAgentHash = "0xVRC-NODE-992-ALPHA";

  const handleCopy = () => {
    navigator.clipboard.writeText(coreAgentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="pt-24 pb-16 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded-full text-brand-orange text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
            AI-POWERED ARCHITECTURE INTEL
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter">
            <span className="block text-white uppercase">Vericode</span>
            <span className="bg-gradient-to-r from-brand-orange via-orange-400 to-white bg-clip-text text-transparent uppercase">
                Tactical Engine
            </span>
        </h1>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Analyze any GitHub repository architecture instantly. Map dependencies, assess blast radius, and deploy data-driven refactoring intelligence.
        </p>

        {/* ACTION SECTION */}
        <div className="pt-4 max-w-md mx-auto flex flex-col items-center w-full">
            
            <Link href="/analyze" className="w-full">
              <Button size="lg" className="w-full h-14 bg-brand-orange text-[#0A0A0C] text-lg font-black uppercase tracking-widest hover:bg-white hover:shadow-[0_0_30px_rgba(241,119,32,0.3)] transition-all rounded-xl group">
                Initialize Scan
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <div className="flex flex-col gap-6 mt-8 w-full">
                {/* ACTION ROW: Docs & Socials */}
                <div className="flex items-center justify-center gap-4">
                    <Link href="#" className="group inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-lg text-sm font-bold uppercase tracking-widest text-slate-300 transition-all">
                        <FileText className="w-4 h-4 text-brand-orange group-hover:text-white" />
                        <span>Documentation</span>
                    </Link>

                    <a href="https://github.com" target="_blank" className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-orange/50 rounded-lg text-slate-400 hover:text-white transition-all group">
                        <GitBranch className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </a>
                </div>

                {/* CA SECTION */}
                <div className="flex items-center justify-center mt-4">
                    <div onClick={handleCopy} className="group flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full hover:border-brand-orange/40 transition-all cursor-pointer">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-brand-orange transition-colors">HASH:</span>
                        <span className="font-mono text-xs text-slate-300 group-hover:text-white transition-colors">
                            {coreAgentHash}
                        </span>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-400 animate-in zoom-in duration-300" />
                        ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <FeatureCard 
          icon={<GitBranch className="w-6 h-6" />}
          title="Dependency Mapping"
          description="Interactive D3.js force-directed graphs showing exactly how your files interact."
        />
        <FeatureCard 
          icon={<Shield className="w-6 h-6" />}
          title="Security & Risk"
          description="Evaluate deep blast radius, file vulnerability, and hardcoded risk exposures."
        />
        <FeatureCard 
          icon={<Activity className="w-6 h-6" />}
          title="Architecture Score"
          description="Proprietary 0-100 health engine giving you clear, programmatic refactoring signals."
        />
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative p-6 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl transition-colors duration-500 group-hover:border-brand-orange/40 group-hover:bg-brand-orange/5" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="w-12 h-12 mb-4 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 group-hover:scale-110 group-hover:bg-brand-orange/20 group-hover:border-brand-orange/50 transition-all duration-300 shadow-[0_0_15px_rgba(241,119,32,0.1)]">
          <div className="text-brand-orange group-hover:text-white transition-colors duration-300">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2 group-hover:text-brand-orange transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm font-medium text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
          {description}
        </p>
      </div>
    </div>
  );
}

const steps = [
  { icon: Database, title: "1. Repository Sync", desc: "Retrieves full AST history and parses tree structures from connected GitHub paths." },
  { icon: Calculator, title: "2. Metric Calculation", desc: "Computes Cognitive Complexity, Line Densities, and Import/Export metrics." },
  { icon: Activity, title: "3. Layer Extraction", desc: "Evaluates MVC logic, Services, UI, and standardizes architecture boundaries." },
  { icon: Target, title: "4. Health Score", desc: "Aggregates vulnerabilities into a single 0-100 'Health Score' using our AST engine." },
  { icon: FileText, title: "5. Blast Radius", desc: "Generates recursive dependency predictions to calculate structural refactoring impact." },
  { icon: BarChart, title: "6. Gravity Graph", desc: "Transforms data via D3 Layout algorithms for instantaneous spatial visualization." },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24 px-4 bg-transparent relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">
            <span className="bg-gradient-to-r from-brand-orange to-orange-200 bg-clip-text text-transparent">Analysis Pipeline</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Vericode employs a sophisticated multi-stage parsing pipeline to transform raw TypeScript/Python repositories into actionable architectural intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-brand-orange/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-4 group-hover:scale-110 transition-transform">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const milestones = [
  { version: "v1.0", date: "Dec 2025", title: "Engine Core", status: "completed", items: ["AST Parsing Basics", "Gravity Graphs", "Layer Recognition", "GitHub Sync"] },
  { version: "v1.1", date: "Q1 2026", title: "Enhanced Grading", status: "completed", items: ["Numeric Scoring 0-100", "Blast Radius Tool", "Vulnerability Matching"] },
  { version: "v2.0", date: "Q2 2026", title: "AI Tactics", status: "upcoming", items: ["Local LLM Context", "Predictive Refactor", "Automated Diff Generation"] },
  { version: "v3.0", date: "Q4 2026", title: "Enterprise Pipeline", status: "upcoming", items: ["CI/CD Branch Gates", "Multi-Repo Maps", "DevOps Integrations"] }
];

function Roadmap() {
  return (
    <section id="roadmap" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black mb-20 text-center text-white uppercase tracking-tighter">
          Tactical Roadmap
        </h2>
        
        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] md:-translate-x-1/2 z-0">
             <div className="w-full h-full bg-gradient-to-b from-transparent via-[#FF8C00] to-transparent opacity-80 shadow-[0_0_20px_#FF8C00] drop-shadow-[0_0_15px_rgba(241,119,32,0.8)]" />
          </div>

          <div className="space-y-12">
            {milestones.map((m, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex-1 w-full md:w-1/2 pl-20 md:pl-0 md:px-12 mb-4 md:mb-0">
                    <div className={`relative p-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm hover:border-brand-orange/50 transition-all group ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                      <div className={`flex items-center gap-3 mb-2 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                         <span className="font-mono text-xs text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20">{m.version}</span>
                         <span className="text-xs text-slate-500 flex items-center gap-1 font-bold tracking-widest uppercase">
                            {m.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-brand-orange" /> : <Clock className="w-3 h-3" />}
                            {m.date}
                         </span>
                      </div>
                      <h3 className="text-2xl font-black uppercase text-white mb-3 group-hover:text-brand-orange transition-colors">{m.title}</h3>
                      <ul className={`space-y-2 ${isEven ? 'md:items-end' : 'md:items-start'} flex flex-col`}>
                        {m.items.map((item, j) => (
                           <li key={j} className={`flex items-center gap-2 text-slate-400 font-medium text-sm ${isEven ? 'md:flex-row-reverse' : ''}`}>
                             <Circle className="w-1.5 h-1.5 fill-brand-orange text-brand-orange shrink-0" />
                             <span>{item}</span>
                           </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-brand-orange shadow-[0_0_15px_#FF8C00] z-10 mt-6 md:mt-0">
                    <div className="absolute inset-0 bg-brand-orange rounded-full animate-ping opacity-75" />
                  </div>
                  <div className="hidden md:block flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "What is Vericode?", a: "Vericode is a Codebase Intelligence engine that evaluates repositories based on their AST logic and architecture. It provides full dependency graphing, layer clustering, and refactoring scorings." },
  { q: "How is the Health Score calculated?", a: "The Health Score (0-100) evaluates blast radius overlaps, unmanaged complexities, and framework layer accuracy entirely inside your browser memory." },
  { q: "Is it free to use?", a: "Yes, the core analyzer operates directly locally. You just need a public GitHub URL and a standard Personal Access Token for API limits." },
  { q: "Does my code leave my browser?", a: "No. The GitHub API is fetched directly from your client to GitHub servers. Vericode has no backend database to store your code." },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 bg-transparent relative">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black mb-12 text-center text-white uppercase tracking-tighter">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`group border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-brand-orange/50 bg-brand-orange/5' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-4 px-6 font-bold uppercase tracking-widest text-[11px] text-left text-white transition-all"
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-orange' : 'text-slate-500'}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 px-6 ${isOpen ? 'max-h-40 pb-4' : 'max-h-0'}`}>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}