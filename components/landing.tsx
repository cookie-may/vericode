'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Shield, GitBranch, ArrowRight, Code, Terminal, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Landing() {
  return (
    <div className="relative overflow-hidden bg-[#0A0A0C] text-slate-200">
      {/* Background Ornaments - Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-brand-orange/10 to-transparent blur-[120px] pointer-events-none" />
      
      {/* Navigation */}
      <header className="relative z-50 border-b border-white/5 bg-[#0A0A0C]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
               {/* Icon terinspirasi dari logo V/C K1 */}
              <Zap className="h-8 w-8 text-brand-orange fill-brand-orange/20" />
              <div className="absolute -inset-1 bg-brand-orange/20 blur-sm rounded-full" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">
              Veri<span className="text-brand-orange">code</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-orange-200">
            <a href="#features" className="hover:text-brand-orange transition-colors">Features</a>
            <a href="#security" className="hover:text-brand-orange transition-colors">Security</a>
            <Link href="https://github.com" className="hover:text-brand-orange transition-colors">GitHub</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/analyze">
              <Button className="bg-brand-orange text-[#0A0A0C] font-bold hover:bg-white hover:scale-105 transition-all rounded-full px-6">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold mb-8 animate-pulse">
            <Activity className="w-3 h-3" />
            ENGINE V2.0 LIVE
          </div>
          
          <h2 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[0.9]">
            VISUALIZE CODE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-orange-400 to-white">
              BEYOND TEXT
            </span>
          </h2>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Analyze your GitHub repositories instantly. Map dependencies, detect vulnerabilities, 
            and measure architecture health with our proprietary <span className="text-white">Architecture Intelligence</span>.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/analyze">
              <Button size="lg" className="h-14 px-10 bg-brand-orange text-[#0A0A0C] text-lg font-black hover:bg-white hover:shadow-[0_0_30px_rgba(241,119,32,0.3)] transition-all rounded-xl group">
                Start Analysis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-10 border-slate-800 bg-transparent text-white hover:bg-white/5 rounded-xl font-bold">
              <Terminal className="mr-2 h-5 w-5 text-brand-orange" />
              View Docs
            </Button>
          </div>
        </div>
      </section>

      {/* Stats / Proof */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Analysis Speed', value: '< 2s' },
            { label: 'Vulns Detected', value: '24+' },
            { label: 'Language Support', value: '15+' },
            { label: 'Architecture Patterns', value: '∞' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard 
            icon={<GitBranch className="h-6 w-6" />}
            title="Dependency Graph"
            desc="Interactive D3.js force-directed graphs showing exactly how your files interact."
          />
          <FeatureCard 
            icon={<Shield className="h-6 w-6" />}
            title="Security Scanner"
            desc="Automatic detection of hardcoded secrets and dangerous injection patterns."
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6" />}
            title="Blast Radius"
            desc="Predict the impact of code changes across your entire architectural stack."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-slate-500 font-medium">
            © 2026 Vericode. Privacy-first analysis. <span className="text-white">Your code never leaves your browser.</span>
          </div>
          <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-brand-orange transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-orange transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-orange transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-8 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 hover:border-brand-orange/30 transition-all">
      <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}