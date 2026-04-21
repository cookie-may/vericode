import Image from 'next/image';
import { Activity, Zap } from 'lucide-react';

export function PrivacyOrbit() {
  return (
    <div className="relative w-full max-w-[600px] aspect-square mx-auto perspective-[1000px]">

      {/* 1. THE ORBITAL RINGS */}

      {/* Outer Ring (Slow Clockwise) */}
      <div className="absolute inset-4 sm:inset-8 border border-brand-orange/20 rounded-full animate-spin-slow">
         {/* Satellite Dot 1 */}
         <div className="absolute top-0 left-1/2 w-3 h-3 bg-brand-orange rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(255,140,0,1)]"></div>
         {/* Satellite Dot 2 (Gold) */}
         <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-amber-500 rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_10px_rgba(255,215,0,1)]"></div>
      </div>

      {/* Inner Ring (Reverse Counter-Clockwise) */}
      <div className="absolute inset-16 sm:inset-24 border border-brand-orange/30 rounded-full animate-spin-reverse-slow">
         {/* Satellite Dot */}
         <div className="absolute top-1/2 right-0 w-2 h-2 bg-amber-500 rounded-full translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,215,0,1)]"></div>
      </div>

      {/* Dashed Radar Ring (Fast Spin) */}
      <svg className="absolute inset-0 w-full h-full animate-spin-slower opacity-50" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="140" fill="none" stroke="url(#orbitGrad)" strokeWidth="1" strokeDasharray="20 10" />
      </svg>

      <svg className="absolute inset-0 w-full h-full animate-spin-reverse-slower opacity-30" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="110" fill="none" stroke="#FFD700" strokeWidth="1" strokeDasharray="4 8" />
      </svg>


      {/* 2. THE NUCLEUS (Center Logo) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative animate-float">
            {/* Core Glow */}
            <div className="absolute inset-0 bg-brand-orange/20 blur-[60px] rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-amber-500/10 blur-[40px] rounded-full"></div>

            {/* The Logo Icon */}
            <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-void/50 backdrop-blur-xl border border-brand-orange/50 rounded-full shadow-[0_0_30px_rgba(255,140,0,0.3)] overflow-hidden">
                <Image src="/logo.jpeg" alt="Vericode Logo" width={128} height={128} className="w-full h-full object-cover p-1 rounded-full drop-shadow-[0_0_10px_rgba(255,140,0,0.8)]" />
            </div>
        </div>
      </div>


      {/* 3. ORBITING FEATURE NODES (Static Positions + Float Animation) */}

      {/* Node: Accuracy */}
      <div className="absolute top-[15%] left-[80%] animate-float" style={{ animationDelay: '0.5s' }}>
        <div className="group cursor-pointer">
            <div className="w-3 h-3 bg-brand-orange rounded-full shadow-[0_0_15px_rgba(255,140,0,0.8)] group-hover:scale-150 transition-transform duration-300"></div>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs text-brand-orange/80 font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ACCURACY
            </span>
        </div>
      </div>

      {/* Node: Speed */}
      <div className="absolute top-[75%] left-[85%] animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="group cursor-pointer">
            <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.8)] group-hover:scale-150 transition-transform duration-300"></div>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs text-amber-500/80 font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                SPEED
            </span>
        </div>
      </div>

       {/* Node: Risk */}
       <div className="absolute top-[20%] left-[15%] animate-float" style={{ animationDelay: '2.5s' }}>
        <div className="group cursor-pointer">
            <div className="w-3 h-3 bg-brand-orange rounded-full shadow-[0_0_15px_rgba(255,140,0,0.8)] group-hover:scale-150 transition-transform duration-300"></div>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs text-brand-orange/80 font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                RISK_MGMT
            </span>
        </div>
      </div>


      {/* 4. FLOATING STATS CARDS (Glassmorphism) */}

      {/* Card 1: Bottom Left */}
      <div className="absolute bottom-4 left-0 sm:bottom-10 sm:-left-4 animate-float" style={{ animationDelay: '1s' }}>
        <div className="glass-panel px-4 py-3 rounded-xl border border-brand-orange/30 bg-gray-900/30 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <div className="p-2 bg-brand-orange/10 rounded-lg shrink-0 border border-brand-orange/20">
                <Activity className="w-5 h-5 text-brand-orange" />
            </div>
            <div>
                <p className="text-xl font-bold text-white leading-none">94%</p>
                <p className="text-[10px] text-brand-orange font-mono uppercase tracking-wider opacity-80 mt-0.5">Win Rate</p>
            </div>
        </div>
      </div>

      {/* Card 2: Top Right */}
      <div className="absolute -top-2 right-4 sm:-top-12 sm:right-0 animate-float" style={{ animationDelay: '2s' }}>
        <div className="glass-panel px-4 py-3 rounded-xl border border-amber-500/30 bg-gray-900/30 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg shrink-0 border border-amber-500/20">
                <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
                <p className="text-xl font-bold text-white leading-none">Live</p>
                <p className="text-[10px] text-amber-500 font-mono uppercase tracking-wider opacity-80 mt-0.5">Analysis</p>
            </div>
        </div>
      </div>

    </div>
  );
}