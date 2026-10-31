import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Layers, Eye, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface ComponentInfo {
  name: string;
  status: string;
  health: 'GOOD' | 'WARNING' | 'CRITICAL';
  description: string;
  siltDepthCm?: number;
  flowCapacity?: string;
  lastInspection?: string;
  recommendation?: string;
}

const componentData: Record<string, ComponentInfo> = {
  grate: {
    name: 'Inlet Surface Trash Screen & Steel Grate',
    status: 'Operational with Moderate Litter',
    health: 'WARNING',
    description: 'Commercial curb inlet grate capturing surface runoff from MG Avenue. Periodic plastic debris accumulation.',
    flowCapacity: '85% design intake',
    lastInspection: '2026-10-10 (Zone 4 Squad)',
    recommendation: 'Install high-capacity composite debris deflector.'
  },
  silt: {
    name: 'Sediment Silt Bed & Debris Layer',
    status: 'Critical Heavy Accumulation',
    health: 'CRITICAL',
    siltDepthCm: 32,
    description: 'Compacted silt and sand deposition along the concrete invert floor reducing hydraulic freeboard.',
    flowCapacity: 'Constrained (0.62 capacity ratio)',
    lastInspection: '2026-10-10 (Post-Storm Survey)',
    recommendation: 'Mechanical vacuum gully sucker extraction and high-pressure jetting.'
  },
  flume: {
    name: 'Reinforced Concrete Culvert Conduit / Flume',
    status: 'Structurally Sound (Minor Spalling)',
    health: 'GOOD',
    description: 'Pre-cast reinforced concrete box culvert segment (2.2m x 1.8m cross-section). Invert slope 1:250.',
    flowCapacity: 'Nominal dry-weather flow clear',
    lastInspection: '2026-08-10 (Routine Check)',
    recommendation: 'Annual ultrasonic concrete crack monitoring.'
  },
  downstream: {
    name: 'Downstream Outfall & Receiver Junction (DR-002)',
    status: 'Suspected Hydraulic Restriction / Backwater',
    health: 'CRITICAL',
    description: 'Junction connecting 12th Cross arterial drain into railway culvert underpass. Backwater observed during rainfall.',
    flowCapacity: 'Backflow detected at storm discharge',
    lastInspection: 'No CCTV probe within 120 days',
    recommendation: 'Commission Downstream CCTV Camera Probe to locate constriction.'
  }
};

// Animated Water Flow Simulation
const WaterFlow: React.FC<{ active: boolean }> = ({ active }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (active && meshRef.current) {
      meshRef.current.position.x = ((meshRef.current.position.x + delta * 1.5 + 4) % 8) - 4;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.4, 0]}>
      <boxGeometry args={[7.2, 0.25, 1.3]} />
      <meshStandardMaterial
        color="#0284c7"
        transparent
        opacity={0.65}
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
  );
};

// 3D Scene Elements
const DrainStructure3D: React.FC<{
  selectedKey: string;
  onSelect: (key: string) => void;
  waterFlowing: boolean;
}> = ({ selectedKey, onSelect, waterFlowing }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Concrete Trench Bed & Walls */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[8, 0.4, 2.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* Back Wall */}
      <mesh position={[0, 0.2, -1.0]}>
        <boxGeometry args={[8, 1.6, 0.2]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>
      {/* Front Cutaway Wall */}
      <mesh position={[0, -0.2, 1.0]}>
        <boxGeometry args={[8, 0.8, 0.2]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} transparent opacity={0.4} />
      </mesh>

      {/* 1. Surface Steel Grate (Clickable) */}
      <mesh
        position={[-2.8, 1.05, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect('grate');
        }}
      >
        <boxGeometry args={[1.8, 0.1, 1.8]} />
        <meshStandardMaterial
          color={selectedKey === 'grate' ? '#14b8a6' : '#94a3b8'}
          wireframe={false}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 2. Silt & Sediment Deposit Layer (Clickable) */}
      <mesh
        position={[-0.5, -0.55, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect('silt');
        }}
      >
        <boxGeometry args={[3.2, 0.3, 1.6]} />
        <meshStandardMaterial
          color={selectedKey === 'silt' ? '#f59e0b' : '#78350f'}
          roughness={1.0}
        />
      </mesh>

      {/* 3. Main Culvert Flume Box (Clickable) */}
      <mesh
        position={[0.5, 0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect('flume');
        }}
      >
        <boxGeometry args={[3.8, 1.4, 1.8]} />
        <meshStandardMaterial
          color={selectedKey === 'flume' ? '#0d9488' : '#334155'}
          wireframe={true}
        />
      </mesh>

      {/* 4. Downstream Outfall Junction (Clickable) */}
      <mesh
        position={[3.2, -0.2, 0]}
        rotation={[0, 0, Math.PI / 2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect('downstream');
        }}
      >
        <cylinderGeometry args={[0.9, 0.9, 1.8, 16]} />
        <meshStandardMaterial
          color={selectedKey === 'downstream' ? '#ef4444' : '#1e293b'}
          roughness={0.5}
        />
      </mesh>

      {/* Water Flow Animation */}
      <WaterFlow active={waterFlowing} />
    </group>
  );
};

export const InfrastructureDrain3D: React.FC<{
  assetId?: string;
  assetName?: string;
  theme?: 'light' | 'dark';
}> = ({
  assetId = 'DR-001',
  assetName = '12th Cross Arterial Box Drain',
  theme = 'light'
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('silt');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [flowActive, setFlowActive] = useState(true);

  const isLight = theme === 'light';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const selectedInfo = componentData[selectedKey] || componentData.silt;

  return (
    <div
      className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 ${
        isLight
          ? 'bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-xl text-slate-900'
          : 'bg-slate-900/95 backdrop-blur-xl border-slate-800 shadow-2xl text-white'
      }`}
    >
      {/* 3D Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isLight
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-teal-950/80 text-teal-400 border-teal-800'
            }`}>
              Interactive 3D Twin &bull; Live Telemetry
            </span>
            <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>&bull;</span>
            <span className={`text-xs font-mono ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>{assetId}</span>
          </div>
          <h3 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Layers className="w-5 h-5 text-teal-600" />
            3D Infrastructure Culvert & Sediment Model
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Rotate, zoom, and click components to inspect invert sediment depth, structural flume, and downstream junctions.
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlowActive(!flowActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
              flowActive
                ? isLight
                  ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-xs'
                  : 'bg-sky-950/70 text-sky-300 border-sky-700'
                : isLight
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${flowActive ? 'animate-spin' : ''}`} />
            Water Simulation: {flowActive ? 'Flowing' : 'Paused'}
          </button>

          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              reducedMotion
                ? isLight
                  ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold'
                  : 'bg-teal-900/60 text-teal-300 border-teal-700'
                : isLight
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {reducedMotion ? '2D Schematic Fallback' : '3D Mode'}
          </button>
        </div>
      </div>

      {/* Component Navigation Chips */}
      <div className="flex flex-wrap gap-2 pt-4 pb-2">
        {[
          { id: 'grate', label: '1. Surface Steel Grate' },
          { id: 'silt', label: '2. Sediment Silt Bed (32cm)' },
          { id: 'flume', label: '3. Concrete Box Culvert' },
          { id: 'downstream', label: '4. Downstream Outfall Junction' }
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedKey(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              selectedKey === c.id
                ? isLight
                  ? 'bg-teal-600 text-white font-bold shadow-md scale-102 border-teal-600'
                  : 'bg-white text-slate-900 font-bold shadow-md scale-105 border-white'
                : isLight
                ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* 3D Canvas Viewport / 2D Fallback */}
        <div
          className={`lg:col-span-2 rounded-2xl border relative h-[390px] overflow-hidden flex items-center justify-center ${
            isLight
              ? 'bg-gradient-to-b from-sky-50/70 via-slate-100/60 to-slate-200/50 border-slate-200 shadow-inner'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          {reducedMotion ? (
            /* 2D Schematic Fallback */
            <div className="p-6 text-center space-y-4 max-w-md">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                isLight ? 'bg-teal-100 text-teal-700 border border-teal-200' : 'bg-teal-950/60 text-teal-400 border border-teal-800'
              }`}>
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>2D Schematic Cross-Section View</h4>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Reduced motion / accessible engineering layout of {assetId} ({assetName}).
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Trench Width</span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>1.8 meters</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                  <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sediment Depth</span>
                  <span className="font-bold text-amber-600">32 cm (Critical)</span>
                </div>
              </div>
            </div>
          ) : (
            /* Three.js / React Three Fiber Canvas */
            <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
              <ambientLight intensity={isLight ? 1.0 : 0.7} />
              <directionalLight position={[10, 10, 5]} intensity={isLight ? 1.4 : 1.2} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              <Suspense fallback={null}>
                <DrainStructure3D
                  selectedKey={selectedKey}
                  onSelect={setSelectedKey}
                  waterFlowing={flowActive}
                />
              </Suspense>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2 + 0.1}
                minDistance={3}
                maxDistance={14}
              />
            </Canvas>
          )}

          {/* Interactive Hint */}
          <div className={`absolute bottom-3 left-3 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono border flex items-center gap-1.5 ${
            isLight
              ? 'bg-white/85 text-slate-700 border-slate-200/90 shadow-xs'
              : 'bg-slate-900/80 text-slate-400 border-slate-800'
          }`}>
            <Eye className="w-3.5 h-3.5 text-teal-600" />
            <span>Click any 3D component to inspect &bull; Drag to rotate &bull; Scroll to zoom</span>
          </div>
        </div>

        {/* Selected Component Telemetry Card */}
        <div
          className={`rounded-2xl p-5 border flex flex-col justify-between backdrop-blur-md space-y-4 shadow-sm ${
            isLight
              ? 'bg-slate-50/90 border-slate-200 text-slate-900'
              : 'bg-slate-800/80 border-slate-700 text-white'
          }`}
        >
          <div>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                Component Telemetry
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  selectedInfo.health === 'CRITICAL'
                    ? isLight
                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                    : selectedInfo.health === 'WARNING'
                    ? isLight
                      ? 'bg-amber-100 text-amber-700 border-amber-300'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                    : isLight
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}
              >
                {selectedInfo.health}
              </span>
            </div>

            <h4 className={`text-base font-bold mt-3 leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedInfo.name}</h4>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{selectedInfo.description}</p>

            <div className={`mt-4 space-y-2 p-3 rounded-xl border text-xs ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex justify-between">
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Current Status:</span>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedInfo.status}</span>
              </div>
              {selectedInfo.siltDepthCm && (
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Measured Silt Depth:</span>
                  <span className="font-bold text-amber-600 font-mono">{selectedInfo.siltDepthCm} cm</span>
                </div>
              )}
              {selectedInfo.flowCapacity && (
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Discharge Flow:</span>
                  <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{selectedInfo.flowCapacity}</span>
                </div>
              )}
              {selectedInfo.lastInspection && (
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Last Physical Audit:</span>
                  <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{selectedInfo.lastInspection}</span>
                </div>
              )}
            </div>

            {selectedInfo.recommendation && (
              <div className={`mt-3 p-3 rounded-xl text-xs border ${
                isLight ? 'bg-teal-50 border-teal-200 text-teal-900' : 'bg-teal-950/40 border-teal-800/80 text-teal-200'
              }`}>
                <strong className="block text-[11px] uppercase tracking-wider text-teal-700 mb-0.5 font-bold">
                  Engineering Action:
                </strong>
                {selectedInfo.recommendation}
              </div>
            )}
          </div>

          <div className={`pt-3 border-t text-[11px] flex items-center gap-1.5 ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-700 text-slate-400'}`}>
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Connected to real asset telemetry and maintenance graph.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
