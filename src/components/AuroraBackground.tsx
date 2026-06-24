import { motion } from "framer-motion";

export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Large sky-blue top-left blob */}
      <motion.div
        className="aurora-blob"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 60, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: 800,
          height: 800,
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
          x: [0, -60, 50, 0],
          y: [0, 70, -50, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: 700,
          height: 700,
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
          x: [0, 40, -50, 0],
          y: [0, -60, 30, 0],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: 900,
          height: 900,
          bottom: -250,
          left: "15%",
          background: "radial-gradient(circle, oklch(0.80 0.09 240 / 0.50) 0%, oklch(0.86 0.06 250 / 0.25) 40%, transparent 70%)",
          filter: "blur(100px)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}
