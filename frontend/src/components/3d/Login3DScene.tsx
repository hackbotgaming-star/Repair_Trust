import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ShieldCheck } from 'lucide-react';

// Inner Core Mesh with dynamic pulse
const MunicipalCore: React.FC<{ activeRole: string }> = ({ activeRole }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Determine color based on active role
  const getCoreColor = () => {
    switch (activeRole) {
      case 'administrator':
        return '#6366f1'; // Indigo
      case 'field_worker':
        return '#f59e0b'; // Amber
      case 'citizen':
        return '#10b981'; // Emerald
      case 'engineer':
      default:
        return '#0d9488'; // Teal
    }
  };

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.6;
      ringRef1.current.rotation.x += delta * 0.3;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y -= delta * 0.5;
      ringRef2.current.rotation.z -= delta * 0.2;
    }
    if (groupRef.current) {
      // Gentle floating tracking cursor
      const mouse = state.mouse;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.4, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.4, 0.05);
    }
  });

  const coreColor = getCoreColor();

  return (
    <group ref={groupRef}>
      {/* Central Central Node */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.5, 2]} />
          <MeshDistortMaterial
            color={coreColor}
            speed={2}
            distort={0.25}
            roughness={0.1}
            metalness={0.6}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* Primary Equatorial Ring */}
      <mesh ref={ringRef1} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.5, 0.04, 16, 100]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Secondary Polar Ring */}
      <mesh ref={ringRef2} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.9, 0.03, 16, 100]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* 4 Satellite Role Nodes */}
      {/* 1. Citizen (Emerald) */}
      <mesh position={[2.6, 0.4, 0.8]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#10b981" roughness={0.1} metalness={0.5} />
      </mesh>

      {/* 2. Worker (Amber) */}
      <mesh position={[-2.4, -0.6, 1.0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.1} metalness={0.5} />
      </mesh>

      {/* 3. Engineer (Teal) */}
      <mesh position={[0.4, 2.7, -0.5]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#0d9488" roughness={0.1} metalness={0.5} />
      </mesh>

      {/* 4. Administrator (Indigo) */}
      <mesh position={[-0.8, -2.5, -0.7]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#6366f1" roughness={0.1} metalness={0.5} />
      </mesh>
    </group>
  );
};

export const Login3DScene: React.FC<{ activeRole?: string }> = ({ activeRole = 'engineer' }) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (reducedMotion) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-teal-50 to-sky-50 rounded-3xl border border-teal-100">
        <div className="w-20 h-20 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg mb-4">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">RepairTrust Security Core</h3>
        <p className="text-xs text-slate-600 max-w-xs mt-1">
          Cryptographically authenticated municipal role access.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative min-h-[380px] lg:min-h-[460px] flex items-center justify-center overflow-hidden">
      {/* Soft Ambient Light Gradient Behind 3D Canvas */}
      <div className="absolute inset-0 bg-radial from-teal-100/60 via-sky-50/40 to-transparent pointer-events-none rounded-3xl" />

      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 8]} intensity={1.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#38bdf8" />
        <pointLight position={[0, 0, 4]} intensity={1.0} color="#ffffff" />
        <Suspense fallback={null}>
          <MunicipalCore activeRole={activeRole} />
        </Suspense>
      </Canvas>

      {/* Floating 3D Telemetry Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-500 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/60 shadow-xs">
        <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
          3D Cryptographic Node Active
        </span>
        <span className="hidden sm:inline">Interactive pointer tracking</span>
      </div>
    </div>
  );
};
