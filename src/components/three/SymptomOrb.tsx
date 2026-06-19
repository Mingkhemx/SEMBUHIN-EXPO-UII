import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

type Props = {
  /** 0 = calm, 1 = urgent */
  intensity?: number;
  className?: string;
};

function Orb({ intensity = 0.3 }: { intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.25;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  // Color blend: cyan -> blue -> magenta as intensity rises
  const color = useMemo(() => {
    const c = new THREE.Color();
    c.setHSL(0.58 - intensity * 0.15, 0.85, 0.6);
    return c;
  }, [intensity]);

  const emissive = useMemo(() => {
    const c = new THREE.Color();
    c.setHSL(0.6 - intensity * 0.2, 1, 0.5);
    return c;
  }, [intensity]);

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
      <Sphere ref={meshRef} args={[1.2, 48, 48]}>
        <MeshDistortMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.4 + intensity * 0.6}
          distort={0.35 + intensity * 0.35}
          speed={1.5 + intensity * 2}
          roughness={0.15}
          metalness={0.4}
          transparent
          opacity={0.92}
        />
      </Sphere>
      <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[1.65, 0.015, 16, 120]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 1.6, Math.PI / 4, 0]}>
        <torusGeometry args={[1.85, 0.008, 16, 120]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </Float>
  );
}

export function SymptomOrb({ intensity = 0.3, className }: Props) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#7dd3fc" />
        <pointLight position={[-5, -3, -5]} intensity={1} color="#a78bfa" />
        <directionalLight position={[0, 5, 5]} intensity={0.6} />
        <Orb intensity={intensity} />
      </Canvas>
    </div>
  );
}
