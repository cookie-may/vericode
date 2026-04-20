'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Zap, Shield, GitBranch } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-navy/90">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-brand-orange" />
            <h1 className="text-2xl font-bold text-white">Vericode</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" className="text-foreground hover:text-brand-orange">
              <Code className="h-4 w-4 mr-2" />
              Docs
            </Button>
            <Button className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90">
              Start Analysis
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Understand Your Codebase Instantly
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
            Visualize architecture, spot security issues, detect patterns, and measure code quality—all in seconds.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a href="/analyze">
              <Button size="lg" className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90">
                Analyze Your Code
              </Button>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">
                <Code className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h3 className="text-center text-3xl font-bold text-white mb-12">
          Powerful Features
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <GitBranch className="h-8 w-8 text-brand-orange mb-2" />
              <CardTitle>Dependency Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize how your files connect and interact with interactive force-directed graphs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <Shield className="h-8 w-8 text-brand-orange mb-2" />
              <CardTitle>Security Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detect hardcoded secrets, injection vulnerabilities, and dangerous patterns automatically.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <Zap className="h-8 w-8 text-brand-orange mb-2" />
              <CardTitle>Blast Radius</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See exactly how many files would be affected if you change a specific file.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-900/50">
            <CardHeader>
              <Code className="h-8 w-8 text-brand-orange mb-2" />
              <CardTitle>Code Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get instant health scores, dead code detection, and architectural insights.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-800 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h3 className="text-3xl font-bold text-white">Ready to analyze?</h3>
          <p className="mt-4 text-muted-foreground">
            Paste a GitHub URL or upload your local files. No installation needed.
          </p>
          <a href="/analyze" className="mt-8 inline-block">
            <Button size="lg" className="bg-brand-orange text-brand-navy hover:bg-brand-orange/90">
              Get Started
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>Privacy-first code analysis. Your code never leaves your machine.</p>
        </div>
      </footer>
    </div>
  );
}
