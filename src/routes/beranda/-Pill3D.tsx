import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function PillModel() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Complex organic tumbling and random-feeling rotations
    groupRef.current.rotation.x = Math.sin(t * 0.8) * 0.6 + 0.5;
    groupRef.current.rotation.y = t * 0.4 + Math.cos(t * 0.5) * 0.5;
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.3;
    
    // Slight random drift
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.2 + Math.sin(t * 0.6) * 0.1;
    groupRef.current.position.x = Math.cos(t * 1.2) * 0.15;
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
      {/* Top half of the pill */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        <meshStandardMaterial color="#a855f7" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#a855f7" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Bottom half of the pill */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        <meshStandardMaterial color="#22d3ee" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#22d3ee" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Center rim/split */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.51, 0.51, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} />
      </mesh>
    </group>
  );
}

export function Pill3D() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} className="w-full h-full pointer-events-none">
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={3} />
        <pointLight position={[-5, -5, 5]} intensity={2} color="#06b6d4" />
        <pointLight position={[5, 5, 5]} intensity={2} color="#d946ef" />
        <PillModel />
      </Canvas>
    </div>
  );
}
