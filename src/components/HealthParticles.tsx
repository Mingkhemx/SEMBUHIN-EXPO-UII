import { useEffect, useState } from "react";
import { Activity, Heart, ShieldPlus, Pill, Stethoscope, Plus } from "lucide-react";

export function HealthParticles() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const icons = [Activity, Heart, ShieldPlus, Pill, Stethoscope, Plus];
    const particleCount = 28; // Reduced for performance
    
    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      const cellWidth = 100 / particleCount;
      const baseLeft = i * cellWidth;
      const jitter = (Math.random() * cellWidth) - (cellWidth / 2);
      
      return {
        id: i,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        left: Math.max(2, Math.min(98, baseLeft + jitter)),
        duration: 30 + Math.random() * 40, // Slower for smoother feel
        delay: Math.random() * -70,
        size: 18 + Math.random() * 32, // Slightly smaller
        opacity: 0.1 + Math.random() * 0.25, // Lower opacity to blend better
      };
    });
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => {
        const Icon = p.Icon;
        return (
          <div
            key={p.id}
            className="absolute text-cyan-400"
            style={{
              left: `${p.left}%`,
              bottom: "-15%",
              opacity: p.opacity,
              animation: `particleFloatUp ${p.duration}s linear ${p.delay}s infinite`,
              willChange: "transform",
              transform: "translateZ(0)",
            }}
          >
            <Icon size={p.size} />
          </div>
        );
      })}
    </div>
  );
}
