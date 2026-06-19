import { useEffect, useRef } from "react";

/** Animated 3D-style voice waveform on canvas. Lightweight, no GPU needed. */
export function VoiceWave({
  active = true,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const bars = 64;
      const radius = Math.min(width, height) * 0.28;

      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;
        const noise = active
          ? Math.abs(Math.sin(t * 0.04 + i * 0.3)) +
            Math.abs(Math.sin(t * 0.07 + i * 0.5)) * 0.5
          : 0.2;
        const len = 12 + noise * 50;
        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + len);
        const y2 = cy + Math.sin(angle) * (radius + len);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, "rgba(59,130,246,0.9)");
        grad.addColorStop(1, "rgba(167,139,250,0.2)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Center pulsing orb
      const pulse = active ? 1 + Math.sin(t * 0.08) * 0.15 : 1;
      const r = radius * 0.6 * pulse;
      const grad2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad2.addColorStop(0, "rgba(125,211,252,0.9)");
      grad2.addColorStop(0.6, "rgba(59,130,246,0.4)");
      grad2.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return <canvas ref={ref} className={className} />;
}
