import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GitBranch, Loader2 } from 'lucide-react';

interface WalletInputProps {
  onAnalyze: (repoUrl: string) => Promise<void>;
  isLoading: boolean;
}

export function WalletInput({ onAnalyze, isLoading }: WalletInputProps) {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      await onAnalyze(repoUrl.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-orange/20 to-amber-500/20 blur opacity-30 group-hover:opacity-70 transition duration-500 rounded-xl"></div>
        <div className="relative">
          <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-orange/60 group-focus-within:text-brand-orange transition-colors" />
          <Input
            type="text"
            placeholder="github.com/owner/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-black/60 border border-brand-orange/30 rounded-xl text-white placeholder:text-slate-500 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all font-mono text-sm hover:bg-black/80"
            disabled={isLoading}
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={isLoading || !repoUrl.trim()}
        className="relative w-full overflow-hidden bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange/90 hover:to-amber-500/90 text-black font-black uppercase tracking-widest py-6 rounded-xl transition-all shadow-[0_0_20px_rgba(241,119,32,0.4)] hover:shadow-[0_0_30px_rgba(241,119,32,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <div className="relative flex items-center justify-center">
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-black" />
              <span className="drop-shadow-md">Analyzing Repository...</span>
            </>
          ) : (
            <>
              <GitBranch className="w-5 h-5 mr-2" />
              <span className="drop-shadow-md">Analyze Architecture</span>
            </>
          )}
        </div>
      </Button>
    </form>
  );
}