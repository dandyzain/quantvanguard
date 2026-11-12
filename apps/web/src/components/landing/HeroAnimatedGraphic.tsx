'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Lock,
  Zap,
  Activity,
  Layers,
  Shield,
  Coins,
  Cpu,
  Share2,
} from 'lucide-react';

export function HeroAnimatedGraphic() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isEn = language === 'en';
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Asset constellation nodes - Clean 2D Minimalist Palette (Non-glaring)
  const nodes = [
    {
      id: 'mmf',
      code: 'MMF',
      name: isEn ? 'Money Market Fund' : 'Reksadana Pasar Uang',
      target: '40.0%',
      current: '35.0%',
      status: 'underweight',
      delta: '+Rp 8.25M Inflow',
      color: '#10B981',
      borderColor: '#34D399',
      bgColor: '#064E3B',
      cx: 140,
      cy: 150,
      radius: 38,
    },
    {
      id: 'voo',
      code: 'VOO',
      name: isEn ? 'S&P 500 US Equity' : 'Saham Global S&P 500',
      target: '20.0%',
      current: '20.3%',
      status: 'optimal',
      delta: '+Rp 3.75M Inflow',
      color: '#3B82F6',
      borderColor: '#60A5FA',
      bgColor: '#1E3A8A',
      cx: 540,
      cy: 150,
      radius: 38,
    },
    {
      id: 'xau',
      code: 'XAU',
      name: isEn ? 'Physical Gold Vault' : 'Emas Fisik Bullion',
      target: '20.0%',
      current: '18.0%',
      status: 'underweight',
      delta: '+Rp 3.00M Inflow',
      color: '#F59E0B',
      borderColor: '#FCD34D',
      bgColor: '#713F12',
      cx: 140,
      cy: 480,
      radius: 38,
    },
    {
      id: 'btc',
      code: 'BTC',
      name: isEn ? 'Bitcoin Digital Reserve' : 'Cadangan Digital Bitcoin',
      target: '20.0%',
      current: '27.3%',
      status: 'drift',
      delta: 'Zero-Sell (HOLD)',
      color: '#F97316',
      borderColor: '#FB923C',
      bgColor: '#7C2D12',
      cx: 540,
      cy: 480,
      radius: 40,
    },
  ];

  // 48 Rich Cosmic Stars distributed across coordinates
  const cosmicStars = [
    { cx: 50, cy: 70, r: 1.2, fill: '#FFFFFF', dur: '3.2s' },
    { cx: 90, cy: 40, r: 0.9, fill: '#C084FC', dur: '4.1s' },
    { cx: 130, cy: 80, r: 1.5, fill: '#93C5FD', dur: '2.8s' },
    { cx: 200, cy: 50, r: 1.0, fill: '#FFFFFF', dur: '3.6s' },
    { cx: 270, cy: 85, r: 1.3, fill: '#A7F3D0', dur: '4.5s' },
    { cx: 410, cy: 75, r: 1.1, fill: '#FFFFFF', dur: '3.1s' },
    { cx: 480, cy: 45, r: 1.4, fill: '#C084FC', dur: '3.9s' },
    { cx: 590, cy: 60, r: 1.0, fill: '#93C5FD', dur: '2.7s' },
    { cx: 630, cy: 110, r: 1.6, fill: '#FFFFFF', dur: '4.3s' },
    { cx: 650, cy: 170, r: 0.9, fill: '#FEF08A', dur: '3.4s' },

    { cx: 40, cy: 190, r: 1.1, fill: '#A7F3D0', dur: '3.8s' },
    { cx: 80, cy: 230, r: 1.4, fill: '#FFFFFF', dur: '2.9s' },
    { cx: 230, cy: 180, r: 1.0, fill: '#C084FC', dur: '4.6s' },
    { cx: 450, cy: 180, r: 1.2, fill: '#93C5FD', dur: '3.3s' },
    { cx: 600, cy: 220, r: 1.5, fill: '#FFFFFF', dur: '4.0s' },
    { cx: 640, cy: 280, r: 0.9, fill: '#FED7AA', dur: '2.6s' },

    { cx: 45, cy: 310, r: 1.3, fill: '#FFFFFF', dur: '3.7s' },
    { cx: 85, cy: 350, r: 1.0, fill: '#C084FC', dur: '4.2s' },
    { cx: 210, cy: 280, r: 0.8, fill: '#93C5FD', dur: '3.0s' },
    { cx: 470, cy: 280, r: 1.1, fill: '#FFFFFF', dur: '4.4s' },
    { cx: 590, cy: 330, r: 1.4, fill: '#A7F3D0', dur: '3.5s' },
    { cx: 635, cy: 370, r: 1.0, fill: '#FEF08A', dur: '2.9s' },

    { cx: 50, cy: 430, r: 1.2, fill: '#FFFFFF', dur: '4.1s' },
    { cx: 90, cy: 410, r: 0.9, fill: '#FDE68A', dur: '3.2s' },
    { cx: 230, cy: 390, r: 1.4, fill: '#93C5FD', dur: '4.7s' },
    { cx: 450, cy: 390, r: 1.0, fill: '#C084FC', dur: '3.1s' },
    { cx: 610, cy: 440, r: 1.5, fill: '#FFFFFF', dur: '3.8s' },
    { cx: 650, cy: 470, r: 1.1, fill: '#FED7AA', dur: '4.3s' },

    { cx: 55, cy: 540, r: 1.0, fill: '#C084FC', dur: '3.4s' },
    { cx: 95, cy: 570, r: 1.5, fill: '#FFFFFF', dur: '4.0s' },
    { cx: 160, cy: 550, r: 0.8, fill: '#FEF08A', dur: '2.8s' },
    { cx: 230, cy: 520, r: 1.3, fill: '#A7F3D0', dur: '3.9s' },
    { cx: 300, cy: 560, r: 1.0, fill: '#FFFFFF', dur: '4.5s' },
    { cx: 380, cy: 560, r: 1.2, fill: '#93C5FD', dur: '3.3s' },
    { cx: 450, cy: 530, r: 0.9, fill: '#C084FC', dur: '4.1s' },
    { cx: 520, cy: 560, r: 1.4, fill: '#FFFFFF', dur: '3.6s' },
    { cx: 590, cy: 540, r: 1.1, fill: '#FED7AA', dur: '2.9s' },
    { cx: 630, cy: 570, r: 1.3, fill: '#FFFFFF', dur: '4.2s' },
  ];

  return (
    <div className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col items-center justify-center select-none overflow-visible group py-2">
      {/* ── 1. AMBIENT NEURAL NEBULA AURA (DEEP SPACE GLOW, BORDERLESS) ── */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.55, 0.75, 0.55],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[600px] h-[480px] sm:h-[600px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/15 to-blue-500/20 dark:from-purple-500/25 dark:via-indigo-500/20 dark:to-blue-400/20 rounded-full blur-[120px] pointer-events-none"
      />
      <div className="absolute top-1/6 left-8 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-400/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/6 right-8 w-64 h-64 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-[90px] pointer-events-none" />

      {/* ── 2. TOP FLOATING STATUS BAR (CLEAN, SYMMETRICAL & BALANCED) ── */}
      <div className="w-full max-w-[660px] px-2 mb-2 flex items-center justify-between gap-3 z-20 pointer-events-none">
        <motion.div
          initial={{ y: -4, opacity: 0.95 }}
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 shadow-xl shadow-purple-500/10 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 pointer-events-auto"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Gemini 2.5 Flash AI
          </span>
          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
            {isEn ? 'Matrix 74 × 70' : 'Matriks 74 × 70'}
          </span>
        </motion.div>

        <motion.div
          initial={{ y: -4, opacity: 0.95 }}
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 shadow-xl shadow-emerald-500/10 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 pointer-events-auto"
        >
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {isEn ? 'Volatility Alpha' : 'Panen Alpha'}
          </span>
          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            +3.8%
          </span>
        </motion.div>
      </div>

      {/* ── 3. SVG AI NEURAL CONSTELLATION WEB CANVAS (VIEWBOX 680x620) ─ */}
      <div className="relative w-full max-w-[640px] aspect-[680/620] flex items-center justify-center">
        <svg
          viewBox="0 0 680 620"
          className="w-full h-full overflow-visible transition-transform duration-700 group-hover:scale-[1.01]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Subtle 2D Pathway Gradients */}
            <linearGradient id="synapseMMF" x1="340" y1="310" x2="140" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="70%" stopColor="#10B981" />
            </linearGradient>

            <linearGradient id="synapseVOO" x1="340" y1="310" x2="540" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="70%" stopColor="#3B82F6" />
            </linearGradient>

            <linearGradient id="synapseXAU" x1="340" y1="310" x2="140" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="70%" stopColor="#F59E0B" />
            </linearGradient>

            <linearGradient id="synapseBTC" x1="340" y1="310" x2="540" y2="480" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="inflowVertical" x1="340" y1="45" x2="340" y2="255" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>

          {/* ─── 3.1 RICH COSMIC STARDUST (40+ TWINKLING STARS) ──── */}
          <g>
            {cosmicStars.map((s, idx) => (
              <circle
                key={idx}
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                fill={s.fill === '#FFFFFF' ? (isDark ? '#FFFFFF' : '#6366F1') : s.fill}
              >
                <animate
                  attributeName="opacity"
                  values="0.2;0.9;0.2"
                  dur={s.dur}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>

          {/* ─── 3.2 CELESTIAL ORBITAL RINGS & ASTROLABE (MULTIPLE RINGS) ── */}
          {/* Ring 1: Inner Orbit Track (R=95) */}
          <circle
            cx="340"
            cy="310"
            r="95"
            stroke="#818CF8"
            strokeWidth="1"
            strokeDasharray="4 8"
            strokeOpacity="0.25"
          />

          {/* Ring 2: Intermediate Synapse Orbit (R=155) */}
          <circle
            cx="340"
            cy="310"
            r="155"
            stroke="currentColor"
            className="text-slate-400 dark:text-slate-600"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            strokeOpacity="0.3"
          />

          {/* Ring 3: Main Asset Constellation Orbit (R=215) */}
          <circle
            cx="340"
            cy="310"
            r="215"
            stroke="currentColor"
            className="text-slate-400 dark:text-slate-600"
            strokeWidth="1.2"
            strokeDasharray="8 8"
            strokeOpacity="0.35"
          />

          {/* Ring 4: Macro Guardrail Orbit (R=275) */}
          <circle
            cx="340"
            cy="310"
            r="275"
            stroke="#38BDF8"
            strokeWidth="0.9"
            strokeDasharray="3 7"
            strokeOpacity="0.2"
          />

          {/* Ring 5: Outer Horizon Orbit (R=310) */}
          <circle
            cx="340"
            cy="310"
            r="310"
            stroke="currentColor"
            className="text-slate-400 dark:text-slate-700"
            strokeWidth="0.8"
            strokeDasharray="4 10"
            strokeOpacity="0.18"
          />

          {/* Ring 6: Inclined Celestial Orbit Ellipse (-25 deg) */}
          <ellipse
            cx="340"
            cy="310"
            rx="285"
            ry="135"
            transform="rotate(-25 340 310)"
            stroke="#C084FC"
            strokeWidth="1"
            strokeDasharray="5 9"
            strokeOpacity="0.22"
          />

          {/* Ring 7: Counter-Inclined Celestial Orbit Ellipse (+30 deg) */}
          <ellipse
            cx="340"
            cy="310"
            rx="270"
            ry="115"
            transform="rotate(30 340 310)"
            stroke="#34D399"
            strokeWidth="0.9"
            strokeDasharray="4 8"
            strokeOpacity="0.18"
          />

          {/* Revolving Orbit Satellite Photons along tracks */}
          <circle r="3" fill="#C084FC" opacity="0.8">
            <animateMotion
              path="M 340 95 A 215 215 0 1 1 339.9 95"
              dur="24s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="2.5" fill="#38BDF8" opacity="0.7">
            <animateMotion
              path="M 340 155 A 155 155 0 1 0 340.1 155"
              dur="18s"
              repeatCount="indefinite"
            />
          </circle>

          {/* ─── 3.3 COVARIANCE GEOMETRIC WEB LINES ───────────────── */}
          <g stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="4 6">
            <line x1="140" y1="150" x2="540" y2="150" />
            <line x1="540" y1="150" x2="540" y2="480" />
            <line x1="540" y1="480" x2="140" y2="480" />
            <line x1="140" y1="480" x2="140" y2="150" />
            <line x1="140" y1="150" x2="540" y2="480" strokeOpacity="0.12" />
            <line x1="540" y1="150" x2="140" y2="480" strokeOpacity="0.12" />
          </g>

          {/* ─── 3.4 TOP INFLOW HIGHWAY & 2D TERMINAL CHIP ────────── */}
          {/* Conduit Path */}
          <path
            d="M 340 50 L 340 250"
            stroke="url(#inflowVertical)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="6 4"
            className="opacity-80"
          />
          {/* Animated Inflow Photons pouring down into Gemini Nexus */}
          <circle r="4" fill="#34D399">
            <animateMotion path="M 340 50 L 340 250" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle r="2.5" fill="#A7F3D0">
            <animateMotion path="M 340 50 L 340 250" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
          </circle>

          {/* Top Inflow Terminal Badge (Clean 2D, No overlap) */}
          <g transform="translate(340, 42)">
            <rect
              x="-80"
              y="-15"
              width="160"
              height="30"
              rx="8"
              fill={isDark ? '#064E3B' : '#ECFDF5'}
              stroke="#10B981"
              strokeWidth="1.4"
            />
            <circle cx="-60" cy="0" r="4" fill="#34D399" />
            <text
              x="8"
              y="4"
              fill={isDark ? '#ECFDF5' : '#065F46'}
              fontSize="11"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              letterSpacing="-0.2"
            >
              +Rp 15.000.000 / bln
            </text>
          </g>

          {/* ─── 3.5 SYNAPTIC FIBER-OPTIC PATHWAYS (CENTER -> NODES) */}
          {/* SYNAPSE 1: Gemini -> MMF (Active High Inflow) */}
          <path
            d="M 340 310 C 260 260 210 190 140 150"
            stroke="url(#synapseMMF)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="8 5"
            className="opacity-85"
          />
          <circle r="4" fill="#34D399">
            <animateMotion
              path="M 340 310 C 260 260 210 190 140 150"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>

          {/* SYNAPSE 2: Gemini -> VOO (Equilibrium Stream) */}
          <path
            d="M 340 310 C 420 260 470 190 540 150"
            stroke="url(#synapseVOO)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="7 5"
            className="opacity-80"
          />
          <circle r="3.5" fill="#60A5FA">
            <animateMotion
              path="M 340 310 C 420 260 470 190 540 150"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>

          {/* SYNAPSE 3: Gemini -> XAU Gold (Target Inflow Stream) */}
          <path
            d="M 340 310 C 260 360 210 430 140 480"
            stroke="url(#synapseXAU)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="7 5"
            className="opacity-85"
          />
          <circle r="4" fill="#FCD34D">
            <animateMotion
              path="M 340 310 C 260 360 210 430 140 480"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </circle>

          {/* SYNAPSE 4: Gemini -> BTC (Zero-Sell Shield Locked / No Outflow) */}
          <path
            d="M 340 310 C 420 360 470 430 540 480"
            stroke="url(#synapseBTC)"
            strokeWidth="1.8"
            strokeDasharray="5 7"
            className="opacity-40"
          />
          {/* Shield Clamp Icon along BTC Synapse */}
          <g transform="translate(450, 400)">
            <circle cx="0" cy="0" r="11" fill={isDark ? '#0F172A' : '#FFFFFF'} stroke="#F97316" strokeWidth="1.4" />
            <path
              d="M -3 -1 L 3 -1 L 3 4 L -3 4 Z M -2 -1 L -2 -3 C -2 -4 2 -4 2 -3 L 2 -1"
              stroke="#FB923C"
              strokeWidth="1.2"
              fill="none"
            />
          </g>

          {/* ─── 3.6 CENTRAL GEMINI 2.5 FLASH AI NEXUS (CLEAN 2D) ─── */}
          <g transform="translate(340, 310)" className="cursor-pointer">
            {/* Outer Subtle Orbit Disc */}
            <circle cx="0" cy="0" r="64" fill="#581C87" fillOpacity={isDark ? 0.15 : 0.08} stroke="#A855F7" strokeWidth="1" strokeDasharray="6 8" />

            {/* Clean 2D Center Disk */}
            <circle
              cx="0"
              cy="0"
              r="48"
              fill={isDark ? '#080B1A' : '#FFFFFF'}
              stroke="#A855F7"
              strokeWidth="2"
            />

            {/* Static Subtle Sparkle Shape in Center */}
            <g transform="translate(0, -12)">
              <path
                d="M 0 -8 L 2.5 -2.5 L 8 0 L 2.5 2.5 L 0 8 L -2.5 2.5 L -8 0 L -2.5 -2.5 Z"
                fill="#C084FC"
              />
            </g>

            {/* Clean Nexus Typography */}
            <text
              x="0"
              y="8"
              fill={isDark ? '#FFFFFF' : '#0F172A'}
              fontSize="12.5"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              letterSpacing="0.3"
            >
              GEMINI 2.5
            </text>
            <text
              x="0"
              y="20"
              fill={isDark ? '#D8B4FE' : '#9333EA'}
              fontSize="7.5"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              letterSpacing="0.4"
            >
              FLASH COPROCESSOR
            </text>
          </g>

          {/* ─── 3.7 THE 4 ASSET NODES (CLEAN 2D MINIMALIST DESIGN) ── */}
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.cx}, ${node.cy})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-all duration-300"
              >
                {/* Thin Orbital Rim Halo (Clean 2D, No shiny glare) */}
                <circle
                  cx="0"
                  cy="0"
                  r={isHovered ? node.radius + 8 : node.radius + 5}
                  fill={node.color}
                  fillOpacity={isHovered ? '0.18' : '0.08'}
                  stroke={node.borderColor}
                  strokeWidth="1.2"
                  strokeDasharray={node.id === 'btc' ? '4 3' : 'none'}
                  className="transition-all duration-300"
                />

                {/* Clean 2D Circular Disk */}
                <circle
                  cx="0"
                  cy="0"
                  r={node.radius}
                  fill={isDark ? '#080D1D' : '#FFFFFF'}
                  stroke={node.borderColor}
                  strokeWidth="2"
                />

                {/* Subtle 2D Inner Tint Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={node.radius - 4}
                  fill={node.color}
                  fillOpacity={isDark ? 0.12 : 0.08}
                />

                {/* Asset Ticker Code */}
                <text
                  x="0"
                  y="-3"
                  fill={isDark ? '#FFFFFF' : '#0F172A'}
                  fontSize="13"
                  fontWeight="900"
                  fontFamily="system-ui, sans-serif"
                  textAnchor="middle"
                >
                  {node.code}
                </text>

                {/* Target Weight */}
                <text
                  x="0"
                  y="12"
                  fill={node.borderColor}
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="system-ui, sans-serif"
                  textAnchor="middle"
                >
                  {node.target}
                </text>

                {/* Bottom Status Capsule Badge */}
                <g transform="translate(0, 48)">
                  <rect
                    x="-46"
                    y="0"
                    width="92"
                    height="19"
                    rx="9.5"
                    fill={isDark ? '#020617' : '#FFFFFF'}
                    stroke={node.borderColor}
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="13"
                    fill={isDark ? '#F8FAFC' : '#0F172A'}
                    fontSize="8.5"
                    fontWeight="800"
                    fontFamily="system-ui, sans-serif"
                    textAnchor="middle"
                  >
                    {node.status === 'drift'
                      ? 'HOLD (+7.3%)'
                      : node.status === 'optimal'
                      ? 'OPTIMAL'
                      : 'INFLOW'}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── 4. BOTTOM FLOATING HUD CARDS (BALANCED SYMMETRY, NO TRUNCATION) ── */}
      <div className="w-full max-w-[660px] px-2 mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 pointer-events-none">
        {/* Zero-Sell Tax Shield Metric */}
        <motion.div
          initial={{ y: 4, opacity: 0.95 }}
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full sm:flex-1 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 shadow-xl shadow-emerald-500/10 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 pointer-events-auto"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {isEn ? 'Zero-Sell Tax Shield' : 'Perisai Pajak Zero-Sell'}
              </span>
              <span className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {isEn ? '0 units sold • 100% tax-free' : '0 unit dijual • Bebas pajak'}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
            +Rp 165k/mo
          </span>
        </motion.div>

        {/* Macro Survival Runway */}
        <motion.div
          initial={{ y: 4, opacity: 0.95 }}
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full sm:flex-1 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/90 shadow-xl shadow-blue-500/10 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 pointer-events-auto"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {isEn ? 'Macro Survival Runway' : 'Bantalan Krisis Makro'}
              </span>
              <span className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {isEn ? '2008 GFC crisis calibrated' : 'Kalibrasi GFC 2008'}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 whitespace-nowrap">
            {isEn ? '6.3 Months' : '6.3 Bulan'}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default HeroAnimatedGraphic;
