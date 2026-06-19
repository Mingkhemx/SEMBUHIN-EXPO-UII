import { motion } from "framer-motion";
import { Heart, Pill, Stethoscope, Activity, Brain, HeartPulse, Shield, Thermometer, Syringe, Cross, Plus, Droplets } from "lucide-react";

const ICONS = [
  { Icon: Heart, color: "text-sky-500/70", size: 36 },
  { Icon: Pill, color: "text-cyan-600/60", size: 32 },
  { Icon: Stethoscope, color: "text-blue-500/70", size: 40 },
  { Icon: Activity, color: "text-teal-500/60", size: 34 },
  { Icon: Brain, color: "text-sky-600/60", size: 38 },
  { Icon: HeartPulse, color: "text-cyan-500/70", size: 30 },
  { Icon: Shield, color: "text-blue-600/50", size: 34 },
  { Icon: Thermometer, color: "text-teal-600/60", size: 32 },
  { Icon: Syringe, color: "text-sky-500/65", size: 28 },
  { Icon: Cross, color: "text-cyan-600/60", size: 36 },
  { Icon: Plus, color: "text-blue-500/55", size: 26 },
  { Icon: Droplets, color: "text-sky-600/60", size: 30 },
  { Icon: Heart, color: "text-teal-500/60", size: 28 },
  { Icon: HeartPulse, color: "text-blue-500/65", size: 34 },
  { Icon: Pill, color: "text-sky-600/60", size: 30 },
  { Icon: Activity, color: "text-cyan-500/65", size: 32 },
  { Icon: Brain, color: "text-teal-600/55", size: 28 },
  { Icon: Shield, color: "text-sky-500/60", size: 30 },
];

// Predefined positions to spread icons across the viewport
const POSITIONS = [
  { left: "5%", top: "8%" },
  { left: "15%", top: "25%" },
  { left: "85%", top: "12%" },
  { left: "75%", top: "35%" },
  { left: "25%", top: "55%" },
  { left: "90%", top: "60%" },
  { left: "10%", top: "70%" },
  { left: "60%", top: "15%" },
  { left: "45%", top: "80%" },
  { left: "95%", top: "85%" },
  { left: "30%", top: "40%" },
  { left: "70%", top: "75%" },
  { left: "50%", top: "45%" },
  { left: "8%", top: "90%" },
  { left: "82%", top: "48%" },
  { left: "40%", top: "20%" },
  { left: "65%", top: "65%" },
  { left: "20%", top: "85%" },
];

export function FloatingHealthIcons() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ICONS.map(({ Icon, color, size }, i) => {
        const pos = POSITIONS[i % POSITIONS.length];
        // Each icon gets unique animation parameters for organic feel
        const duration = 15 + (i * 3.7) % 20;
        const delay = (i * 1.3) % 8;
        const xDrift = 30 + (i * 7) % 60;
        const yDrift = 25 + (i * 5) % 50;
        const rotateEnd = ((i % 2 === 0) ? 360 : -360);

        return (
          <motion.div
            key={i}
            className={`absolute ${color} drop-shadow-md`}
            style={{
              left: pos.left,
              top: pos.top,
              filter: "drop-shadow(0 4px 6px rgba(56, 189, 248, 0.2))",
            }}
            animate={{
              x: [0, xDrift, -xDrift * 0.6, xDrift * 0.3, 0],
              y: [0, -yDrift, yDrift * 0.8, -yDrift * 0.4, 0],
              rotate: [0, rotateEnd * 0.25, rotateEnd * 0.5, rotateEnd * 0.75, rotateEnd],
              scale: [1, 1.15, 0.9, 1.1, 1],
              opacity: [0.7, 1, 0.8, 1, 0.7],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </motion.div>
        );
      })}
    </div>
  );
}
