'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { MockCodeExample } from '@/lib/mockCodeGenerator';

interface MockCodeModalProps {
  examples: MockCodeExample[];
  functionName: string;
  filePath: string;
  onClose: () => void;
}

export default function MockCodeModal({
  examples,
  functionName,
  filePath,
  onClose,
}: MockCodeModalProps) {
  const [activeExample, setActiveExample] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = examples[activeExample];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(current.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0D0D10] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-r from-brand-orange/10 to-transparent">
          <div className="flex-1">
            <div className="text-[9px] font-black uppercase tracking-widest text-brand-orange mb-1">
              💡 Mock Code Examples
            </div>
            <div className="text-[13px] font-bold text-white truncate">
              {functionName}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
              {filePath}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-white/5 bg-black/50">
            {examples.map((example, idx) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(idx)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                  activeExample === idx
                    ? 'bg-brand-orange/30 border border-brand-orange/40 text-brand-orange'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>

          {/* Code Display */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#050507]">
            <div className="flex items-start justify-between mb-3">
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-600">
                {current.language}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto p-3 bg-black/60 rounded-lg border border-white/5 whitespace-pre-wrap break-words">
              <code>{current.code}</code>
            </pre>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/5 bg-black/80 flex items-center justify-between text-[9px] text-slate-500">
            <div>
              Example {activeExample + 1} of {examples.length}
            </div>
            <div className="text-[8px] text-slate-600">
              Use the tabs above to explore different implementations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
