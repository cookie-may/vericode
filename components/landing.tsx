'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Shield, GitBranch, FileText, Activity, Database, Calculator, Target, BarChart, CheckCircle2, Clock, Circle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { InteractiveBackground } from './background-effects';

export default function Landing() {
  return (
    <div className="relative overflow-hidden bg-transparent text-slate-200 font-sans selection:bg-brand-orange/30 min-h-screen">
      <InteractiveBackground />
      
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
              <Button className="relative overflow-hidden bg-gradient-to-r from-brand-orange to-amber-500 hover:from-orange-500 hover:to-amber-400 text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all rounded-full px-8 py-5 shadow-[0_0_15px_rgba(241,119,32,0.4)] hover:shadow-[0_0_25px_rgba(241,119,32,0.6)] group border-none">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative drop-shadow-sm">Launch App</span>
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

import { PrivacyOrbit } from './privacy-orbit';
import { WalletInput } from './wallet-input';

function Hero() {
  const handleAnalyze = async (repoUrl: string) => {
    // Navigate to analyze page with the repo URL
    window.location.href = `/analyze?repo=${encodeURIComponent(repoUrl)}`;
  };

  return (
    <section className="pt-20 pb-16 px-4 relative overflow-hidden">
      {/* Container with Grid Layout for Side-by-Side Effect */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT COLUMN: Text Content & Interaction */}
        <div className="text-center lg:text-left space-y-8 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/10 border border-brand-orange/30 rounded-full text-brand-orange text-xs font-bold shadow-[0_0_15px_rgba(241,119,32,0.2)]">     
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_rgba(241,119,32,0.8)]"></span>
                AI-POWERED ARCHITECTURE INTEL
            </div>

            {/* Main Title - Removed line height clipping by using leading-normal and padding */}
            <h1 className="text-5xl md:text-7xl font-black leading-normal drop-shadow-2xl">
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Vericode</span>
                <span className="block bg-gradient-to-r from-brand-orange via-amber-400 to-orange-600 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(241,119,32,0.6)] mt-2 pb-4">
                    Tactical Engine
                </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed shadow-sm drop-shadow-md">
                Analyze any GitHub repository architecture instantly. Map dependencies, assess blast radius, and deploy data-driven refactoring intelligence.
            </p>
        </div>

        {/* RIGHT COLUMN: placeholder / orbit visual */}
        <div className="hidden lg:flex items-center justify-center relative z-10">
          <PrivacyOrbit />
        </div>
      </div>

      {/* Feature Cards Grid (Below the fold) */}
      <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <FeatureCard
          icon={<GitBranch className="w-6 h-6" />}
          title="Dependency Mapping"
          description="Interactive D3.js force-directed graphs showing exactly how your files interact and connect."
        />
        <FeatureCard
          icon={<Shield className="w-6 h-6" />}
          title="Security & Risk"
          description="Evaluate deep blast radius, file vulnerability, and hardcoded risk exposures instantly."
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

      {/* 1. GLASS BASE */}
      <div className="absolute inset-0 bg-white/3 backdrop-blur-md border border-white/10 rounded-2xl transition-colors duration-500 group-hover:border-brand-orange/40 group-hover:bg-brand-orange/5" />

      {/* 2. HOVER GLOW */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* 3. CONTENT */}
      <div className="relative z-10">
        <div className="w-12 h-12 mb-4 rounded-xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 group-hover:scale-110 group-hover:bg-brand-orange/20 group-hover:border-brand-orange/50 transition-all duration-300 shadow-[0_0_15px_rgba(255,140,0,0.1)]">
          <div className="text-brand-orange group-hover:text-accent transition-colors duration-300">
            {icon}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-orange transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
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
            <div key={i} className="group relative p-8 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-md hover:bg-black/60 hover:border-brand-orange/50 transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_rgba(241,119,32,0.25)] overflow-hidden hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/0 via-brand-orange/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 blur-[50px] rounded-full group-hover:bg-brand-orange/20 transition-colors" />
              
              <div className="relative z-10 w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(241,119,32,0.4)] border border-brand-orange/20 group-hover:border-brand-orange/50">
                <step.icon className="w-7 h-7 drop-shadow-[0_0_8px_rgba(241,119,32,0.8)]" />
              </div>
              <h3 className="relative z-10 text-2xl font-bold text-slate-200 mb-3 group-hover:text-brand-orange transition-colors drop-shadow-sm">{step.title}</h3>
              <p className="relative z-10 text-slate-400 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">{step.desc}</p>
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
              <div key={i} className={`group border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-brand-orange/60 bg-black/60 shadow-[0_0_20px_rgba(241,119,32,0.15)]' : 'border-white/10 bg-black/40 hover:bg-black/60 hover:border-brand-orange/30 hover:shadow-lg backdrop-blur-sm'}`}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-6 px-8 font-bold uppercase tracking-widest text-[12px] text-left text-slate-100 hover:text-brand-orange transition-colors"
                >
                  <span className="drop-shadow-sm">{item.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-orange drop-shadow-[0_0_8px_rgba(241,119,32,0.8)]' : 'text-slate-500'}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-500 px-8 ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed border-l-2 border-brand-orange/30 pl-4">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}