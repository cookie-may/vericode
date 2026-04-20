"use client";

import { useEffect, useRef } from "react";

// Robotics symbols representing mechanical components
const ROBOTICS_SYMBOLS = ['⚙️', '🤖', '🔧', '⚡', '🔌', '⟲', '⟳', '⟱', '⟰', '⟶', '⟵', '⟷', '⟺', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼'];

export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId: number;

    let mouse = { x: width / 2, y: height / 2 };
    let time = 0;

    // Professional particle count for robotics visualization
    const particleCount = 120;
    const particles: Array<{
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      symbol: string;
      baseOpacity: number;
      pulseSpeed: number;
      isConnection: boolean;
      connectionStrength: number;
    }> = [];

    // Connection lines between particles
    const connections: Array<{from: number, to: number, strength: number}> = [];

    for (let i = 0; i < particleCount; i++) {
      const isConnection = Math.random() > 0.7; // 30% are connection nodes
      const symbol = ROBOTICS_SYMBOLS[Math.floor(Math.random() * ROBOTICS_SYMBOLS.length)];

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3, // Slower, more deliberate movement
        vy: (Math.random() - 0.5) * 0.3,
        size: isConnection ? Math.random() * 3 + 2 : Math.random() * 2 + 1,
        symbol,
        baseOpacity: Math.random() * 0.3 + 0.1, // More subtle opacity
        pulseSpeed: Math.random() * 0.02 + 0.01,
        isConnection,
        connectionStrength: Math.random() * 0.8 + 0.2
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const render = () => {
      // Subtle fade effect for smooth animation
      ctx.fillStyle = "rgba(10, 10, 12, 0.05)";
      ctx.fillRect(0, 0, width, height);

      time += 0.008; // Slower animation pace
      const dynamicMouseRadius = 150 + Math.sin(time) * 20;

      // Draw connection lines first (behind particles)
      ctx.strokeStyle = "rgba(241, 119, 32, 0.08)";
      ctx.lineWidth = 0.5;

      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((p2, j) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Robotics connection logic
          if (dist < 120 && (p.isConnection || p2.isConnection)) {
            const connectionOpacity = (1 - dist / 120) * 0.15 * (p.connectionStrength + p2.connectionStrength) / 2;
            ctx.strokeStyle = `rgba(241, 119, 32, ${connectionOpacity})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Draw particles
      particles.forEach((p, i) => {
        // Update position with subtle bounds
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen edges smoothly
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Subtle pulsing effect
        const currentOpacity = p.baseOpacity + Math.sin(time * p.pulseSpeed * 8) * 0.1;
        const safeOpacity = Math.max(0.05, Math.min(0.4, currentOpacity));

        // Color based on particle type
        const particleColor = p.isConnection
          ? `rgba(241, 119, 32, ${safeOpacity})` // Orange for connections
          : `rgba(148, 163, 184, ${safeOpacity * 0.6})`; // Muted gray for regular particles

        ctx.fillStyle = particleColor;
        ctx.font = `${p.size * 3}px 'Geist Mono', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.symbol, p.x, p.y);

        // Mouse interaction - subtle attraction
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < dynamicMouseRadius && distMouse > 30) {
          // Gentle attraction to mouse
          p.x += dxMouse * 0.002;
          p.y += dyMouse * 0.002;

          // Highlight near mouse
          if (distMouse < 80) {
            ctx.fillStyle = `rgba(241, 119, 32, ${safeOpacity * 1.5})`;
            ctx.fillText(p.symbol, p.x, p.y);
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[0] w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
}