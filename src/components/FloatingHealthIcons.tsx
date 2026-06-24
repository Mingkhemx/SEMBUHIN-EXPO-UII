import { motion } from "framer-motion";
import { Heart, Pill, Stethoscope, Activity, Brain, HeartPulse } from "lucide-react";

const ICONS = [
  { Icon: Heart, color: "text-sky-500/70", size: 36 },
  { Icon: Pill, color: "text-cyan-600/60", size: 32 },
  { Icon: Stethoscope, color: "text-blue-500/70", size: 40 },
  { Icon: Activity, color: "text-teal-500/60", size: 34 },
  { Icon: Brain, color: "text-sky-600/60", size: 38 },
  { Icon: HeartPulse, color: "text-cyan-500/70", size: 30 },
];

const POSITIONS = [
  { left: "10%", top: "15%" },
  { left: "85%", top: "20%" },
  { left: "25%", top: "60%" },
  { left: "75%", top: "65%" },
  { left: "50%", top: "40%" },
  { left: "15%", top: "80%" },
];

export function FloatingHealthIcons() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ICONS.map(({ Icon, color, size }, i) => {
        const pos = POSITIONS[i % POSITIONS.length];
        const duration = 20 + i * 5;
        const delay = i * 2;

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
              y: [0, -20, 0],
              opacity: [0.6, 0.8, 0.6],
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
