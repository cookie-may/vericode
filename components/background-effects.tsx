"use client";

import { useEffect, useRef } from 'react';

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Config: Reduced count for a cleaner "Data Dust" look
    const PARTICLE_COUNT = 40;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      growing: boolean;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        // Very slow, ambient drift
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 2 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.growing = Math.random() > 0.5;

        // Palette: Tactical Orange or Luminous Gold
        this.color = Math.random() > 0.6
          ? '255, 215, 0' // Gold (RGB)
          : '255, 140, 0'; // Orange (RGB)
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges smoothly
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;

        // Subtle twinkling effect (changing opacity)
        if (this.growing) {
            this.alpha += 0.002;
            if (this.alpha >= 0.8) this.growing = false;
        } else {
            this.alpha -= 0.002;
            if (this.alpha <= 0.2) this.growing = true;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Using rgba to control opacity individually
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        // Add a tiny glow to each particle
        ctx.shadowBlur = 4;
        ctx.shadowColor = `rgba(${this.color}, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for performance
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
        // REMOVED: The logic that drew lines connecting particles
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#02040a] pointer-events-none">

      {/* 1. The Deep Grid Pattern (SVG Overlay) - Matching QELVA style */}
      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 140, 0, 0.15) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 140, 0, 0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, transparent, black, transparent)' // Fades grid at top/bottom edges
        }}
      />

      {/* 2. QELVA-Style Distributed Ambient Orbs (Mapped to Orange/Gold) */}

      {/* Top Left: Main Orange Glow (Original was Orange) */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow"
           style={{ transform: 'translate(-20%, -20%)' }} />

      {/* Top Right: Secondary Gold Glow (Original was Teal) */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]"
           style={{ transform: 'translate(20%, -10%)' }} />

      {/* Bottom Left: Deep Orange/Red Glow (Original was Orange-600) */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-700/10 rounded-full blur-[80px]"
           style={{ transform: 'translate(-10%, 20%)' }} />

      {/* 3. The Independent Particles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}