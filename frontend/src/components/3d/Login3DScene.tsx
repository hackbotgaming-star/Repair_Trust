import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ShieldCheck, Sparkles as SparklesIcon } from 'lucide-react';

interface RoleTheme {
  primary: string;
  glow: string;
  ring: string;
  label: string;
}

const ROLE_THEMES: Record<string, RoleTheme> = {
  administrator: {
    primary: '#6366f1', // Indigo
    glow: '#818cf8',
    ring: '#4338ca',
    label: 'Governance & Security'
  },
  field_worker: {
    primary: '#f59e0b', // Radiant Amber / Gold
    glow: '#fbbf24',
    ring: '#d97706',
    label: 'Field Execution Proof'
  },
  citizen: {
    primary: '#10b981', // Emerald
    glow: '#34d399',
    ring: '#059669',
    label: 'Public Transparency'
  },
  engineer: {
    primary: '#0ea5e9', // Sky / Cyan
    glow: '#38bdf8',
    ring: '#0284c7',
    label: 'Closure Auditor Node'
  }
};

// Sleek Municipal Holographic Core
const MunicipalCore: React.FC<{ activeRole: string }> = ({ activeRole }) => {
  const groupRef = useRef<THREE.Group>(null);
  const outerGemRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);

  const theme = ROLE_THEMES[activeRole] || ROLE_THEMES.engineer;

  useFrame((state, delta) => {
    // Gentle rotation of outer crystalline shell
    if (outerGemRef.current) {
      outerGemRef.current.rotation.y += delta * 0.35;
      outerGemRef.current.rotation.x += delta * 0.15;
    }

    // Counter-rotation of inner luminous core
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= delta * 0.5;
      innerCoreRef.current.rotation.z += delta * 0.3;
    }

    // Gyroscope rings rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.25;
      ring1Ref.current.rotation.x += delta * 0.12;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.3;
      ring2Ref.current.rotation.z -= delta * 0.18;
    }

    // Smooth interactive cursor tracking
    if (groupRef.current) {
      const mouse = state.mouse;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.35, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.35, 0.06);
    }
  });

  return (
    <group ref={groupRef} scale={1.05}>
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
        {/* 1. Outer Translucent Crystalline Facet */}
        <mesh ref={outerGemRef}>
          <icosahedronGeometry args={[0.92, 0]} />
          <meshStandardMaterial
            color={theme.primary}
            roughness={0.15}
            metalness={0.2}
            transparent
            opacity={0.55}
          />
        </mesh>

        {/* 1b. Crystalline Edge Wireframe */}
        <mesh>
          <icosahedronGeometry args={[0.93, 0]} />
          <meshBasicMaterial
            color={theme.glow}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* 2. Inner Glowing Octahedral Core */}
        <mesh ref={innerCoreRef}>
          <octahedronGeometry args={[0.48, 0]} />
          <meshStandardMaterial
            color={theme.glow}
            emissive={theme.primary}
            emissiveIntensity={1.4}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* 3. Primary Thin Orbital Gyro Ring */}
        <group ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
          <mesh>
            <torusGeometry args={[1.5, 0.018, 16, 72]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Orbital Satellite Node */}
          <mesh position={[1.5, 0, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={theme.glow} emissive={theme.glow} emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* 4. Secondary Polar Ring */}
        <group ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <mesh>
            <torusGeometry args={[1.75, 0.014, 16, 72]} />
            <meshStandardMaterial color={theme.ring} roughness={0.2} metalness={0.8} transparent opacity={0.75} />
          </mesh>
          {/* Polar Satellite Node */}
          <mesh position={[0, 1.75, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
          </mesh>
        </group>

        {/* 5. Ambient Micro Sparkles */}
        <Sparkles count={22} scale={3.2} size={1.6} speed={0.4} color={theme.glow} opacity={0.5} />
      </Float>
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

  const theme = ROLE_THEMES[activeRole] || ROLE_THEMES.engineer;

  if (reducedMotion) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-50 to-sky-50 rounded-2xl border border-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Cryptographic Integrity Core</h3>
        <p className="text-[11px] text-slate-600 max-w-xs mt-1">
          {theme.label} active
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/80 via-white to-sky-50/40">
      {/* Soft Ambient Radial Light Behind 3D Core */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-500 opacity-60"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme.glow}25 0%, transparent 70%)`
        }}
      />

      {/* Modern 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 42 }}
        className="w-full h-full"
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 8, 6]} intensity={1.6} />
        <directionalLight position={[-6, -6, -4]} intensity={0.7} color="#38bdf8" />
        <pointLight position={[0, 0, 3]} intensity={1.0} color="#ffffff" />
        <Suspense fallback={null}>
          <MunicipalCore activeRole={activeRole} />
        </Suspense>
      </Canvas>

      {/* Floating Status Pill */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-600 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200/80 shadow-xs pointer-events-none">
        <span className="flex items-center gap-1.5 font-semibold" style={{ color: theme.primary }}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.primary }} />
          {theme.label}
        </span>
        <span className="text-[9px] text-slate-400">Interactive 3D</span>
      </div>
    </div>
  );
};
