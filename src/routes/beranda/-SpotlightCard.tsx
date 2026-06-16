import { useState } from "react";
import { Link } from "@tanstack/react-router";

export function SpotlightCard({ to, className = "", glowColor = "#7cb8d8", children }: any) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });

    // Gentle 3D tilt for subtle depth
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = (y - centerY) / centerY * -2.5;
    const rotY = (x - centerX) / centerX * 2.5;
    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <Link
      to={to}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={
        `group relative overflow-hidden rounded-2xl bg-white/95 text-foreground border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 focus:outline-none ${className}`
      }
      style={{
        transform: `perspective(900px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      }}
    >
      {/* Subtle radial highlight that follows the cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-0"
        style={{
          background: `radial-gradient(circle 420px at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}12, transparent 35%)`,
        }}
      />

      {/* Minimal decorative grid at very low opacity for texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-8">
        {children}
      </div>
    </Link>
  );
}
