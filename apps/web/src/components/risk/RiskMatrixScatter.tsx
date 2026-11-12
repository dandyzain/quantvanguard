'use client';

import React from 'react';
import { StrategyName } from '@/lib/types';
import { useTheme } from '@/context/ThemeContext';

interface RiskMatrixScatterProps {
  capacityScore: number;
  toleranceScore: number;
  strategyName: StrategyName;
}

export function RiskMatrixScatter({
  capacityScore,
  toleranceScore,
  strategyName,
}: RiskMatrixScatterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 0-100 coordinates mapped to 0-300 SVG viewbox
  // Capacity: X axis (0 to 100) -> 40 to 280
  // Tolerance: Y axis (0 to 100) -> 260 to 20 (inverted)
  const mapX = (val: number) => 40 + (val / 100) * 240;
  const mapY = (val: number) => 260 - (val / 100) * 240;

  const currentX = mapX(capacityScore);
  const currentY = mapY(toleranceScore);

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-3">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">2D Risk Matrix Scatter</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Capacity ({capacityScore}/100) × Tolerance ({toleranceScore}/100)
          </p>
        </div>
        <div className="rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-300">
          {capacityScore === 0 && toleranceScore === 0 ? 'Titik Awal (0, 0)' : 'Tier Guardrail'}
        </div>
      </div>

      <div className="relative w-full aspect-square max-w-[320px] mx-auto">
        <svg viewBox="0 0 320 300" className="w-full h-full">
          {/* Grid background */}
          <rect
            x="40"
            y="20"
            width="240"
            height="240"
            fill={isDark ? '#0b0f19' : '#f8fafc'}
            stroke={isDark ? '#1e293b' : '#e2e8f0'}
            strokeWidth="1"
            rx="8"
          />

          {/* Zones */}
          {/* Tier 1: Defensive */}
          <rect x="40" y="164" width="96" height="96" fill={isDark ? '#334155' : '#cbd5e1'} fillOpacity={isDark ? 0.25 : 0.45} />
          <text x="88" y="220" textAnchor="middle" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="9" fontWeight="bold">
            DEFENSIVE
          </text>

          {/* Tier 2: Conservative */}
          <rect x="136" y="140" width="60" height="120" fill={isDark ? '#475569' : '#94a3b8'} fillOpacity={isDark ? 0.2 : 0.3} />
          <text x="166" y="205" textAnchor="middle" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="8" fontWeight="bold">
            PRESERVER
          </text>

          {/* Tier 3: Balanced Core */}
          <rect x="136" y="68" width="72" height="72" fill="#3b82f6" fillOpacity={isDark ? 0.2 : 0.15} stroke="#3b82f6" strokeOpacity={isDark ? 0.4 : 0.6} strokeDasharray="3 3" />
          <text x="172" y="108" textAnchor="middle" fill={isDark ? '#60a5fa' : '#2563eb'} fontSize="9" fontWeight="bold">
            BALANCED CORE
          </text>

          {/* Tier 4: Growth */}
          <rect x="208" y="44" width="48" height="96" fill="#6366f1" fillOpacity={isDark ? 0.25 : 0.15} />
          <text x="232" y="92" textAnchor="middle" fill={isDark ? '#a5b4fc' : '#4f46e5'} fontSize="8" fontWeight="bold">
            GROWTH
          </text>

          {/* Tier 5: Asymmetric */}
          <rect x="244" y="20" width="36" height="48" fill="#10b981" fillOpacity={isDark ? 0.3 : 0.2} />
          <text x="262" y="48" textAnchor="middle" fill={isDark ? '#34d399' : '#059669'} fontSize="8" fontWeight="bold">
            ALPHA
          </text>

          {/* Axes */}
          <line x1="40" y1="260" x2="280" y2="260" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1.5" />
          <line x1="40" y1="20" x2="40" y2="260" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth="1.5" />

          {/* Axis Labels */}
          <text x="160" y="282" textAnchor="middle" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="10" fontWeight="bold">
            Risk Capacity Score →
          </text>
          <text
            x="-140"
            y="22"
            transform="rotate(-90)"
            textAnchor="middle"
            fill={isDark ? '#94a3b8' : '#64748b'}
            fontSize="10"
            fontWeight="bold"
          >
            Risk Tolerance Score →
          </text>

          {/* Investor Position Pin */}
          <circle
            cx={currentX}
            cy={currentY}
            r="14"
            fill="#3B82F6"
            fillOpacity="0.3"
            className="animate-ping"
          />
          <circle cx={currentX} cy={currentY} r="7" fill="#3B82F6" stroke={isDark ? '#FFFFFF' : '#0F172A'} strokeWidth="2" />
          <text
            x={capacityScore < 15 ? currentX + 12 : currentX}
            y={toleranceScore < 10 ? currentY - 10 : currentY - 12}
            textAnchor={capacityScore < 15 ? 'start' : 'middle'}
            fill={isDark ? '#FFFFFF' : '#0F172A'}
            fontSize="10"
            fontWeight="black"
            className="drop-shadow"
          >
            {capacityScore === 0 && toleranceScore === 0 ? 'YOU (0, 0) - Fresh' : `YOU (${capacityScore}, ${toleranceScore})`}
          </text>
        </svg>
      </div>

      <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        Active Coordinate: <strong className="text-blue-600 dark:text-blue-400">({capacityScore}, {toleranceScore})</strong> | Strategy:{' '}
        <strong className="text-slate-900 dark:text-white">
          {capacityScore === 0 && toleranceScore === 0
            ? 'Fresh Baseline (Menunggu Diagnosis)'
            : strategyName.replace(/_/g, ' ')}
        </strong>
      </div>
    </div>
  );
}
