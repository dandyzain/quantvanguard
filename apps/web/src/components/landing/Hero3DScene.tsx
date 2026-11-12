'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, RoundedBox, Edges } from '@react-three/drei';
import * as THREE from 'three';

// Safe rounded rectangle drawing helper for all browser Canvas 2D engines
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

// ─── HELPER: Generate Crisp Canvas Textures for Isometric Block Faces ──────────
function createHeroTexture(isDark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Background Gradient (Bold Royal Blue & Indigo Hero Block)
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#2563EB'); // Royal Blue
  grad.addColorStop(0.5, '#1D4ED8'); // Deep Blue
  grad.addColorStop(1, '#0F172A'); // Midnight Obsidian
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Top Accent Ribbon
  ctx.fillStyle = '#10B981'; // Emerald Zero-Sell Shield
  ctx.fillRect(0, 0, 1024, 16);

  // Badge Pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  drawRoundedRect(ctx, 48, 48, 460, 44, 22);

  ctx.fillStyle = '#6EE7B7'; // Mint
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('INSTITUTIONAL ZERO-SELL ENGINE', 68, 77);

  // Brand Headline
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 88px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('QuantVanguard', 48, 185);

  // Subtitle
  ctx.fillStyle = '#93C5FD'; // Light blue
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Smart Inflow Rebalancer • Zero Tax Drag', 48, 245);

  // Bottom 3 Feature Pills
  const features = [
    { text: '0 Units Sold', color: '#34D399' },
    { text: 'Monotonic Drift Shrink', color: '#60A5FA' },
    { text: 'Water-Filling Algorithm', color: '#FBBF24' },
  ];

  let xOffset = 48;
  features.forEach((f) => {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    drawRoundedRect(ctx, xOffset, 310, 280, 56, 16);

    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(xOffset + 24, 338, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(f.text, xOffset + 44, 345);
    xOffset += 300;
  });

  // Footer Tagline
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Rebalance targets strictly via fresh savings without liquidating winning compounders.', 48, 440);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createAILayerTexture(isDark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isDark ? '#1E1B4B' : '#312E81'; // Deep Indigo/Purple
  ctx.fillRect(0, 0, 1024, 300);

  // Top Neon Purple Border
  ctx.fillStyle = '#A855F7';
  ctx.fillRect(0, 0, 1024, 12);

  // AI Tag
  ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
  drawRoundedRect(ctx, 48, 36, 320, 38, 19);

  ctx.fillStyle = '#E9D5FF';
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('GOOGLE GEMINI 2.5 FLASH', 68, 61);

  // Headline
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('AI Risk Profiler & Behavioral Diagnostic', 48, 140);

  // Metrics
  ctx.fillStyle = '#C084FC';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('2D Matrix: Balance Sheet Capacity × Psychological Resilience', 48, 195);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('13 Macro Parameter Survey • Automatic Cognitive Bias Detection', 48, 240);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createAssetVaultTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0F172A'; // Obsidian
  ctx.fillRect(0, 0, 1024, 300);

  // 4 Asset Color bars
  const assets = [
    { name: 'MMF Kas Buffer', weight: '40%', color: '#10B981', code: 'RDPU Kas' },
    { name: 'S&P 500 ETF', weight: '20%', color: '#3B82F6', code: 'VOO' },
    { name: 'Emas Fisik', weight: '20%', color: '#EAB308', code: 'XAU' },
    { name: 'Bitcoin Kripto', weight: '20%', color: '#F97316', code: 'BTC' },
  ];

  const colWidth = 1024 / 4;
  assets.forEach((a, i) => {
    const x = i * colWidth;
    // Top colored indicator line
    ctx.fillStyle = a.color;
    ctx.fillRect(x, 0, colWidth, 10);

    // Divider line
    if (i > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(x, 10, 1, 290);
    }

    // Weight
    ctx.fillStyle = a.color;
    ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(a.weight, x + 28, 90);

    // Code
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(a.code, x + 28, 140);

    // Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(a.name, x + 28, 180);

    // Status Pill
    ctx.fillStyle = `${a.color}25`;
    drawRoundedRect(ctx, x + 28, 215, 140, 36, 12);

    ctx.fillStyle = a.color;
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Guardrail OK', x + 44, 239);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createBaseTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 240;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090D16'; // Deep Foundation Base
  ctx.fillRect(0, 0, 1024, 240);

  ctx.fillStyle = '#0284C7'; // Cyan border
  ctx.fillRect(0, 0, 1024, 8);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Macro Stress-Testing & Liquid Survival Runway', 48, 70);

  ctx.fillStyle = '#38BDF8';
  ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Calibrated with 2008 GFC (-18.7%) & 2020 Covid (-12.8%) • 6.3 Months Buffer Guarantee', 48, 120);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Real-time USD/IDR FX Conversion Engine • Dynamic Multi-Tenant Data Isolation', 48, 175);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── ISOMETRIC GROUND GRID & INFLOW PIPELINES ──────────────────────────────────
function IsometricGroundAndPipelines({ isDark }: { isDark: boolean }) {
  const pulseRef1 = useRef<THREE.Mesh>(null!);
  const pulseRef2 = useRef<THREE.Mesh>(null!);
  const pulseRef3 = useRef<THREE.Mesh>(null!);

  const curve1 = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6.5, 0.05, 3.5),
      new THREE.Vector3(-4.0, 0.05, 3.5),
      new THREE.Vector3(-2.0, 0.05, 2.5),
      new THREE.Vector3(-1.0, 0.05, 1.2),
      new THREE.Vector3(-0.4, 0.1, 0.8),
    ]);
  }, []);

  const curve2 = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.5, 0.05, 6.0),
      new THREE.Vector3(2.0, 0.05, 4.0),
      new THREE.Vector3(1.2, 0.05, 2.5),
      new THREE.Vector3(0.6, 0.1, 1.0),
    ]);
  }, []);

  const curve3 = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(5.5, 0.05, -2.0),
      new THREE.Vector3(3.5, 0.05, -1.0),
      new THREE.Vector3(2.0, 0.05, 0.2),
      new THREE.Vector3(0.8, 0.1, 0.5),
    ]);
  }, []);

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * 0.4) % 1;
    const t2 = (state.clock.getElapsedTime() * 0.35 + 0.33) % 1;
    const t3 = (state.clock.getElapsedTime() * 0.45 + 0.66) % 1;

    if (pulseRef1.current) {
      const pt = curve1.getPoint(t);
      pulseRef1.current.position.copy(pt);
    }
    if (pulseRef2.current) {
      const pt = curve2.getPoint(t2);
      pulseRef2.current.position.copy(pt);
    }
    if (pulseRef3.current) {
      const pt = curve3.getPoint(t3);
      pulseRef3.current.position.copy(pt);
    }
  });

  return (
    <group position={[0, -0.05, 0]}>
      {/* Isometric Faint Grid Lines */}
      <gridHelper
        args={[22, 28, isDark ? '#3B82F6' : '#94A3B8', isDark ? '#1E293B' : '#E2E8F0']}
        position={[0, 0.01, 0]}
      />

      {/* Pipeline 1: Monthly Cash Inflow (Emerald / Blue) */}
      <mesh>
        <tubeGeometry args={[curve1, 64, 0.07, 8, false]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#10B981"
          emissiveIntensity={isDark ? 0.6 : 0.3}
          roughness={0.2}
        />
      </mesh>
      {/* Animated Glowing Pulse 1 */}
      <mesh ref={pulseRef1}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#34D399" />
        <pointLight color="#10B981" distance={1.8} intensity={2} />
      </mesh>

      {/* Pipeline 2: Gemini AI Behavioral Coprocessor (Purple) */}
      <mesh>
        <tubeGeometry args={[curve2, 64, 0.07, 8, false]} />
        <meshStandardMaterial
          color="#8B5CF6"
          emissive="#8B5CF6"
          emissiveIntensity={isDark ? 0.6 : 0.3}
          roughness={0.2}
        />
      </mesh>
      {/* Animated Glowing Pulse 2 */}
      <mesh ref={pulseRef2}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#C084FC" />
        <pointLight color="#8B5CF6" distance={1.8} intensity={2} />
      </mesh>

      {/* Pipeline 3: Multi-Asset Oracle (Amber/Blue) */}
      <mesh>
        <tubeGeometry args={[curve3, 64, 0.06, 8, false]} />
        <meshStandardMaterial
          color="#3B82F6"
          emissive="#3B82F6"
          emissiveIntensity={isDark ? 0.6 : 0.3}
          roughness={0.2}
        />
      </mesh>
      {/* Animated Glowing Pulse 3 */}
      <mesh ref={pulseRef3}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#60A5FA" />
        <pointLight color="#3B82F6" distance={1.8} intensity={2} />
      </mesh>

      {/* Isometric Floor Chip Node A: Inflow Rp 15M (Pill badge) */}
      <group position={[-5.0, 0.12, 3.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <planeGeometry args={[2.4, 0.7]} />
          <meshBasicMaterial color={isDark ? '#064E3B' : '#ECFDF5'} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.3, 0.6]} />
          <meshBasicMaterial color={isDark ? '#065F46' : '#D1FAE5'} />
        </mesh>
      </group>

      {/* Isometric Floor Chip Node B: Gemini AI Chip (Round chip like Laravel's OpenAI chip!) */}
      <group position={[2.2, 0.12, 5.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <circleGeometry args={[0.5, 32]} />
          <meshStandardMaterial
            color={isDark ? '#3B0764' : '#F3E8FF'}
            emissive="#8B5CF6"
            emissiveIntensity={0.4}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0.42, 0.48, 32]} />
          <meshBasicMaterial color="#C084FC" />
        </mesh>
      </group>
    </group>
  );
}

// ─── THE QUANTVANGUARD ISOMETRIC ARCHITECTURE STACK (TOWER) ────────────────────
function QuantVanguardIsometricTower({ isDark }: { isDark: boolean }) {
  const towerRef = useRef<THREE.Group>(null!);

  const heroTexture = useMemo(() => createHeroTexture(isDark), [isDark]);
  const aiTexture = useMemo(() => createAILayerTexture(isDark), [isDark]);
  const vaultTexture = useMemo(() => createAssetVaultTexture(), []);
  const baseTexture = useMemo(() => createBaseTexture(), []);

  useFrame((state) => {
    if (towerRef.current) {
      towerRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.2) * 0.06;
    }
  });

  const blockWidth = 4.0;
  const blockDepth = 3.6;

  return (
    <group ref={towerRef}>
      {/* LAYER 1 (BASE): Macro Stress-Test & Liquid Survival Runway */}
      <group position={[0, 0.4, 0]}>
        <RoundedBox args={[blockWidth, 0.7, blockDepth]} radius={0.08} smoothness={4}>
          <meshStandardMaterial
            color={isDark ? '#0F172A' : '#F1F5F9'}
            metalness={0.4}
            roughness={0.3}
          />
          <Edges
            threshold={15}
            color={isDark ? '#38BDF8' : '#0284C7'}
            renderOrder={1000}
          />
        </RoundedBox>

        <mesh position={[0, 0, blockDepth / 2 + 0.01]}>
          <planeGeometry args={[blockWidth - 0.2, 0.6]} />
          <meshBasicMaterial map={baseTexture} />
        </mesh>

        <mesh position={[0, -0.36, 0]}>
          <boxGeometry args={[blockWidth + 0.4, 0.08, blockDepth + 0.4]} />
          <meshStandardMaterial
            color="#0284C7"
            emissive="#0284C7"
            emissiveIntensity={isDark ? 0.7 : 0.4}
          />
        </mesh>
      </group>

      {/* LAYER 2: Guardrail & Mathematical Invariance Slab */}
      <group position={[0, 0.98, 0]}>
        <RoundedBox args={[blockWidth, 0.32, blockDepth]} radius={0.06} smoothness={4}>
          <meshStandardMaterial
            color={isDark ? '#020617' : '#E2E8F0'}
            metalness={0.7}
            roughness={0.2}
          />
          <Edges
            threshold={15}
            color={isDark ? '#64748B' : '#94A3B8'}
          />
        </RoundedBox>

        <mesh position={[0, 0, blockDepth / 2 + 0.01]}>
          <planeGeometry args={[blockWidth - 0.3, 0.12]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
      </group>

      {/* LAYER 3 (THE HERO BLOCK): QuantVanguard Zero-Sell Engine */}
      <group position={[0, 2.15, 0]}>
        <RoundedBox args={[blockWidth, 1.85, blockDepth]} radius={0.1} smoothness={4}>
          <meshStandardMaterial
            color={isDark ? '#1D4ED8' : '#2563EB'}
            metalness={0.3}
            roughness={0.2}
            emissive="#1E40AF"
            emissiveIntensity={isDark ? 0.25 : 0.1}
          />
          <Edges
            threshold={15}
            color={isDark ? '#93C5FD' : '#BFDBFE'}
            renderOrder={1000}
          />
        </RoundedBox>

        <mesh position={[0, 0, blockDepth / 2 + 0.015]}>
          <planeGeometry args={[blockWidth - 0.15, 1.7]} />
          <meshBasicMaterial map={heroTexture} />
        </mesh>

        <mesh position={[blockWidth / 2 + 0.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[blockDepth - 0.15, 1.7]} />
          <meshStandardMaterial
            color={isDark ? '#1E3A8A' : '#1D4ED8'}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* LAYER 4: Multi-Asset Dynamic Vault (MMF, VOO, Gold, BTC) */}
      <group position={[0, 3.45, 0]}>
        <RoundedBox args={[blockWidth, 0.65, blockDepth]} radius={0.06} smoothness={4}>
          <meshStandardMaterial
            color={isDark ? '#0F172A' : '#F8FAFC'}
            metalness={0.6}
            roughness={0.2}
          />
          <Edges
            threshold={15}
            color={isDark ? '#38BDF8' : '#60A5FA'}
          />
        </RoundedBox>

        <mesh position={[0, 0, blockDepth / 2 + 0.01]}>
          <planeGeometry args={[blockWidth - 0.15, 0.55]} />
          <meshBasicMaterial map={vaultTexture} />
        </mesh>
      </group>

      {/* LAYER 5: AI Risk Profiler & Behavioral Diagnostic Module */}
      <group position={[0, 4.3, 0]}>
        <RoundedBox args={[blockWidth, 0.85, blockDepth]} radius={0.08} smoothness={4}>
          <meshPhysicalMaterial
            color={isDark ? '#3B0764' : '#4C1D95'}
            transparent
            opacity={0.88}
            roughness={0.15}
            metalness={0.4}
            transmission={0.4}
            ior={1.4}
            emissive="#7C3AED"
            emissiveIntensity={isDark ? 0.35 : 0.15}
          />
          <Edges
            threshold={15}
            color={isDark ? '#C084FC' : '#A855F7'}
            renderOrder={1000}
          />
        </RoundedBox>

        <mesh position={[0, 0, blockDepth / 2 + 0.015]}>
          <planeGeometry args={[blockWidth - 0.15, 0.75]} />
          <meshBasicMaterial map={aiTexture} transparent opacity={0.96} />
        </mesh>
      </group>

      {/* TOP CROWN: Translucent Glass Analytics Pods */}
      <group position={[0, 5.1, 0]}>
        <group position={[-1.1, 0.25, -0.6]}>
          <RoundedBox args={[1.5, 0.45, 1.4]} radius={0.04} smoothness={3}>
            <meshPhysicalMaterial
              color="#38BDF8"
              transparent
              opacity={0.45}
              roughness={0.1}
              transmission={0.8}
            />
            <Edges threshold={15} color="#38BDF8" />
          </RoundedBox>
          <mesh position={[0, 0, 0.72]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color="#34D399" />
          </mesh>
        </group>

        <group position={[1.1, 0.25, -0.6]}>
          <RoundedBox args={[1.5, 0.45, 1.4]} radius={0.04} smoothness={3}>
            <meshPhysicalMaterial
              color="#A855F7"
              transparent
              opacity={0.45}
              roughness={0.1}
              transmission={0.8}
            />
            <Edges threshold={15} color="#A855F7" />
          </RoundedBox>
          <mesh position={[0, 0, 0.72]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color="#A855F7" />
          </mesh>
        </group>

        <group position={[0, 0.2, 0.8]}>
          <RoundedBox args={[blockWidth - 0.6, 0.35, 1.2]} radius={0.04} smoothness={3}>
            <meshPhysicalMaterial
              color={isDark ? '#1E293B' : '#E2E8F0'}
              transparent
              opacity={0.7}
              roughness={0.2}
            />
            <Edges threshold={15} color={isDark ? '#60A5FA' : '#3B82F6'} />
          </RoundedBox>
        </group>
      </group>
    </group>
  );
}

// ─── MAIN HERO 3D SCENE EXPORT ────────────────────────────────────────────────
export function Hero3DScene() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkDark = () => {
      if (typeof document !== 'undefined') {
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };
    checkDark();

    if (typeof document !== 'undefined') {
      const observer = new MutationObserver(checkDark);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      return () => observer.disconnect();
    }
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[440px] sm:h-[500px] lg:h-[540px] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[440px] sm:h-[500px] lg:h-[540px] select-none cursor-grab active:cursor-grabbing">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-blue-600/10 via-transparent to-transparent pointer-events-none rounded-3xl" />

      {/* Floating Badges (Laravel aesthetic) */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 dark:bg-slate-950/80 border border-slate-700/60 backdrop-blur-md text-xs font-bold text-white shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>QuantVanguard Modular Stack</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[10px] font-semibold text-blue-600 dark:text-blue-300 backdrop-blur-sm self-start">
          <span>Isometric Institutional Architecture</span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-10 pointer-events-none flex flex-wrap gap-1.5 justify-end max-w-xs">
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
          Zero-Sell Inflow
        </span>
        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[10px] font-bold">
          Gemini 2.5 Flash
        </span>
        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 text-[10px] font-bold">
          Multi-Asset Vault
        </span>
      </div>

      {/* 3D Canvas with True Isometric Angle */}
      <Canvas
        camera={{
          position: [8.5, 9.5, 8.5],
          fov: 34,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={isDark ? 0.9 : 1.3} />
        <directionalLight
          position={[12, 18, 10]}
          intensity={isDark ? 1.8 : 2.2}
          color="#FFFFFF"
        />
        <directionalLight
          position={[-10, 8, -6]}
          intensity={isDark ? 0.8 : 0.6}
          color="#38BDF8"
        />
        <pointLight position={[0, 4, 3]} intensity={1.2} color="#60A5FA" distance={10} />
        <pointLight position={[-4, 1, 3]} intensity={1.5} color="#10B981" distance={8} />

        <IsometricGroundAndPipelines isDark={isDark} />
        <QuantVanguardIsometricTower isDark={isDark} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.3}
          minPolarAngle={Math.PI / 3.4}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

export default Hero3DScene;