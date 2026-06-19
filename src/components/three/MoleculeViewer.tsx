import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Molecule() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.4;
      group.current.rotation.x = state.clock.elapsedTime * 0.15;
    }
  });

  const atoms: { pos: [number, number, number]; color: string; size: number }[] = [
    { pos: [0, 0, 0], color: "#3b82f6", size: 0.35 },
    { pos: [1, 0.5, 0], color: "#06b6d4", size: 0.25 },
    { pos: [-1, 0.4, 0.3], color: "#06b6d4", size: 0.25 },
    { pos: [0.4, -0.9, 0.5], color: "#a78bfa", size: 0.22 },
    { pos: [-0.6, -0.8, -0.4], color: "#22d3ee", size: 0.22 },
    { pos: [0, 1.1, -0.2], color: "#60a5fa", size: 0.28 },
  ];

  const bonds: [[number, number, number], [number, number, number]][] = [
    [[0, 0, 0], [1, 0.5, 0]],
    [[0, 0, 0], [-1, 0.4, 0.3]],
    [[0, 0, 0], [0.4, -0.9, 0.5]],
    [[0, 0, 0], [-0.6, -0.8, -0.4]],
    [[0, 0, 0], [0, 1.1, -0.2]],
  ];

  return (
    <group ref={group}>
      {atoms.map((a, i) => (
        <mesh key={i} position={a.pos}>
          <sphereGeometry args={[a.size, 32, 32]} />
          <meshStandardMaterial
            color={a.color}
            emissive={a.color}
            emissiveIntensity={0.4}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      ))}
      {bonds.map(([a, b], i) => {
        const start = new THREE.Vector3(...a);
        const end = new THREE.Vector3(...b);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const dir = end.clone().sub(start);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );
        return (
          <mesh key={i} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.04, 0.04, len, 12]} />
            <meshStandardMaterial color="#93c5fd" transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

export function MoleculeViewer({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#7dd3fc" />
        <pointLight position={[-5, -3, 2]} intensity={0.8} color="#a78bfa" />
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
          <Molecule />
        </Float>
      </Canvas>
    </div>
  );
}
