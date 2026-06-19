import { motion } from "framer-motion";

export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Large sky-blue top-left blob */}
      <motion.div
        className="aurora-blob"
        animate={{
          x: [0, 120, -60, 0],
          y: [0, -100, 140, 0],
          scale: [1, 1.3, 0.95, 1],
          rotate: [0, 45, 180, 360],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: 900,
          height: 900,
          top: -200,
          left: -150,
          background: "radial-gradient(circle, oklch(0.82 0.10 215 / 0.65) 0%, oklch(0.88 0.07 220 / 0.30) 40%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.7,
        }}
      />

      {/* Vibrant cyan-blue top-right blob */}
      <motion.div
        className="aurora-blob"
        animate={{
          x: [0, -140, 100, 0],
          y: [0, 180, -120, 0],
          scale: [1, 0.85, 1.15, 1],
          rotate: [360, 270, 90, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: 800,
          height: 800,
          top: "5%",
          right: -120,
          background: "radial-gradient(circle, oklch(0.78 0.12 210 / 0.55) 0%, oklch(0.85 0.08 225 / 0.25) 45%, transparent 70%)",
          filter: "blur(90px)",
          opacity: 0.65,
        }}
      />

      {/* Large bottom-center blue-purple blob */}
      <motion.div
        className="aurora-blob"
        animate={{
          x: [0, 100, -120, 0],
          y: [0, -140, 80, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: 1000,
          height: 1000,
          bottom: -250,
          left: "15%",
          background: "radial-gradient(circle, oklch(0.80 0.09 240 / 0.50) 0%, oklch(0.86 0.06 250 / 0.25) 40%, transparent 70%)",
          filter: "blur(100px)",
          opacity: 0.6,
        }}
      />

      {/* Mid-page teal accent blob */}
      <motion.div
        className="aurora-blob"
        animate={{
          x: [0, -80, 60, 0],
          y: [0, 100, -60, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: 600,
          height: 600,
          top: "40%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, oklch(0.80 0.11 195 / 0.45) 0%, oklch(0.87 0.07 205 / 0.20) 45%, transparent 70%)",
          filter: "blur(85px)",
          opacity: 0.55,
        }}
      />

      {/* Small vivid accent blob - bottom right */}
      <motion.div
        className="aurora-blob"
        animate={{
          x: [0, -60, 80, 0],
          y: [0, -80, 50, 0],
          scale: [1, 0.9, 1.2, 1],
          rotate: [0, -90, -180, -360],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: 500,
          height: 500,
          bottom: "10%",
          right: -50,
          background: "radial-gradient(circle, oklch(0.78 0.10 230 / 0.50) 0%, oklch(0.85 0.07 240 / 0.20) 45%, transparent 70%)",
          filter: "blur(75px)",
          opacity: 0.55,
        }}
      />

      {/* Subtle warm highlight - very top for depth */}
      <motion.div
        className="aurora-blob"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 30, -20, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: 1200,
          height: 400,
          top: 0,
          left: "10%",
          background: "linear-gradient(180deg, oklch(0.85 0.08 218 / 0.40) 0%, transparent 100%)",
          filter: "blur(60px)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
