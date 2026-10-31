import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, ShieldCheck, Zap, Layers } from 'lucide-react';

// Flow particle animation along connection line
const FlowPulses: React.FC = () => {
  const points = useRef<THREE.Points>(null);
  const count = 40;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  });

  useFrame((_, delta) => {
    if (points.current) {
      const pos = points.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3] += delta * 1.2;
        if (pos[i * 3] > 3) pos[i * 3] = -3;
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#0ea5e9"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 3D Municipal Network Model
const MunicipalGrid3D: React.FC<{
  activeNode: string;
  onSelectNode: (id: string) => void;
}> = ({ activeNode, onSelectNode }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Base Foundation Platform */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[3.2, 3.4, 0.25, 32]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Grid Guide Ring */}
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.25, 64]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.4} />
      </mesh>

      {/* Main Hydraulic Arterial Box Drain (Conduit) */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[4.8, 0.6, 1.2]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} transparent opacity={0.85} />
      </mesh>

      {/* Water Flow Ribbon inside conduit */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[4.9, 0.35, 0.9]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Node 1: Upstream Inflow Grate */}
      <group position={[-1.8, 0.4, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectNode('inflow');
          }}
        >
          <cylinderGeometry args={[0.45, 0.45, 0.3, 16]} />
          <meshStandardMaterial
            color={activeNode === 'inflow' ? '#0d9488' : '#38bdf8'}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Node 2: Central Culvert Sump & Silt Monitor */}
      <group position={[0, 0.6, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectNode('sump');
          }}
        >
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial
            color={activeNode === 'sump' ? '#f59e0b' : '#64748b'}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Node 3: Downstream Outfall Junction */}
      <group position={[1.8, 0.4, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectNode('outfall');
          }}
        >
          <cylinderGeometry args={[0.5, 0.5, 0.35, 16]} />
          <meshStandardMaterial
            color={activeNode === 'outfall' ? '#e11d48' : '#0284c7'}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Moving Water Particles */}
      <FlowPulses />
    </group>
  );
};

export const HeroLanding3D: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string>('sump');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const nodeDetails: Record<string, { title: string; status: string; desc: string }> = {
    inflow: {
      title: 'Inflow Screen (MG Road)',
      status: 'Normal Intake (85%)',
      desc: 'Surface runoff intake with automated debris sieve screening.'
    },
    sump: {
      title: 'Culvert Chamber DR-001',
      status: '32cm Silt Surcharge',
      desc: 'Real-time telemetry detects compacted sediment layer reducing capacity.'
    },
    outfall: {
      title: 'Receiver Junction DR-002',
      status: 'Hydraulic Backwater Alert',
      desc: 'Downstream railway culvert constricted during peak precipitation events.'
    }
  };

  const selected = nodeDetails[activeNode] || nodeDetails.sump;

  if (reducedMotion) {
    return (
      <div className="w-full h-full min-h-[340px] bg-white/90 rounded-3xl p-6 border border-slate-200/90 shadow-lg flex flex-col justify-between">
        <div className="flex items-center gap-2 text-teal-700 font-bold text-xs">
          <Layers className="w-4 h-4" />
          <span>2D Hydraulic Model View</span>
        </div>
        <div className="space-y-3 py-4">
          <h4 className="text-lg font-bold text-slate-900">{selected.title}</h4>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            {selected.status}
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">{selected.desc}</p>
        </div>
        <div className="flex gap-2">
          {Object.keys(nodeDetails).map((key) => (
            <button
              key={key}
              onClick={() => setActiveNode(key)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                activeNode === key
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] lg:h-[440px] bg-gradient-to-b from-white/90 via-sky-50/50 to-teal-50/30 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col">
      {/* Top Floating Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
          Interactive 3D Infrastructure Twin
        </span>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 2.5, 6], fov: 45 }}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[10, 15, 10]} intensity={1.6} />
          <directionalLight position={[-10, -5, -5]} intensity={0.6} color="#0ea5e9" />
          <Suspense fallback={null}>
            <MunicipalGrid3D activeNode={activeNode} onSelectNode={setActiveNode} />
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>
      </div>

      {/* Bottom Interactive Component Strip */}
      <div className="p-3.5 bg-white/90 backdrop-blur-md border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">{selected.title}:</span>
          <span className="text-slate-600 hidden sm:inline">{selected.desc}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {['inflow', 'sump', 'outfall'].map((key) => (
            <button
              key={key}
              onClick={() => setActiveNode(key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition uppercase tracking-wider ${
                activeNode === key
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
