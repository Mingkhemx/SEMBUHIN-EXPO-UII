import { useEffect, useState } from "react";
import { Activity, Heart, Pill } from "lucide-react";

export function HealthParticles() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const icons = [Activity, Heart, Pill];
    const particleCount = 10; // Lebih sedikit untuk performa maksimal

    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      const cellWidth = 100 / particleCount;
      const baseLeft = i * cellWidth;
      const jitter = (Math.random() * cellWidth) - (cellWidth / 2);

      return {
        id: i,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        left: Math.max(2, Math.min(98, baseLeft + jitter)),
        duration: 40 + Math.random() * 30,
        delay: Math.random() * -60,
        size: 14 + Math.random() * 20,
        opacity: 0.08 + Math.random() * 0.15,
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
