'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function GeometricBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* ── 1. AMBIENT CHROMATIC SPOTLIGHTS & AURORA BEAMS ─────────── */}
      {/* Top Center Spotlight Cone */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] sm:w-[1100px] h-[450px] bg-gradient-to-b from-blue-600/15 via-indigo-600/8 to-transparent dark:from-blue-500/20 dark:via-indigo-500/10 dark:to-transparent blur-[120px] rounded-full" />
      
      {/* Left Headline Accent Aura */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-purple-600/12 dark:bg-purple-500/15 rounded-full blur-[130px]" />
      
      {/* Center Rebalance Emerald Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/12 rounded-full blur-[140px]" />

      {/* ── 2. SVG TOPOLOGICAL CONTOUR CURVES & FINANCIAL GRID ────── */}
      <svg
        viewBox="0 0 1440 900"
        className="absolute inset-0 w-full h-full object-cover opacity-50 dark:opacity-35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="contourGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.05" />
            <stop offset="30%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="contourGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.02" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.02" />
          </linearGradient>

          <pattern id="dotMatrix" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="currentColor" className="text-slate-400 dark:text-slate-600" opacity="0.3" />
          </pattern>
        </defs>

        {/* Subtle Background Dot Matrix Field */}
        <rect width="100%" height="100%" fill="url(#dotMatrix)" />

        {/* Topological Quantitative Volatility Waves (Surface Curves) */}
        <path
          d="M -100 280 C 240 180, 500 380, 800 240 C 1100 100, 1340 340, 1600 260"
          stroke="url(#contourGrad1)"
          strokeWidth="1.2"
          strokeDasharray="6 6"
        />
        <path
          d="M -100 340 C 260 240, 520 440, 820 300 C 1120 160, 1360 400, 1600 320"
          stroke="url(#contourGrad2)"
          strokeWidth="1"
        />
        <path
          d="M -100 400 C 280 300, 540 500, 840 360 C 1140 220, 1380 460, 1600 380"
          stroke="url(#contourGrad1)"
          strokeWidth="0.8"
          strokeDasharray="3 5"
          opacity="0.5"
        />

        {/* Horizon Perspective Grid Lines */}
        <g stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeWidth="0.75" opacity="0.2">
          <line x1="0" y1="520" x2="1440" y2="520" />
          <line x1="0" y1="620" x2="1440" y2="620" strokeDasharray="4 6" />
          <line x1="0" y1="740" x2="1440" y2="740" strokeDasharray="8 8" />

          {/* Perspective Vanishing Rays */}
          <line x1="720" y1="180" x2="100" y2="900" />
          <line x1="720" y1="180" x2="350" y2="900" />
          <line x1="720" y1="180" x2="600" y2="900" />
          <line x1="720" y1="180" x2="840" y2="900" />
          <line x1="720" y1="180" x2="1090" y2="900" />
          <line x1="720" y1="180" x2="1340" y2="900" />
        </g>

        {/* Institutional Crosshair Markers (+) at Grid Intersections */}
        <g stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1" opacity="0.4">
          {/* Top Left */}
          <path d="M 80 140 L 80 150 M 75 145 L 85 145" />
          <text x="95" y="149" fill="currentColor" fontSize="8.5" fontWeight="bold" fontFamily="monospace" letterSpacing="0.1em" className="text-slate-400 dark:text-slate-500">
            SEC.01 // ALPHA_MATRIX
          </text>

          {/* Mid Left */}
          <path d="M 60 400 L 60 410 M 55 405 L 65 405" />
          <text x="75" y="409" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="monospace" letterSpacing="0.1em" className="text-slate-400 dark:text-slate-500">
            LAT: 0ms // SHARPE: 1.84
          </text>

          {/* Top Right */}
          <path d="M 1360 140 L 1360 150 M 1355 145 L 1365 145" />
          <text x="1270" y="149" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="monospace" letterSpacing="0.1em" className="text-slate-400 dark:text-slate-500">
            ZERO_SELL: 100%
          </text>

          {/* Mid Right */}
          <path d="M 1380 440 L 1380 450 M 1375 445 L 1385 445" />
          <text x="1290" y="449" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="monospace" letterSpacing="0.1em" className="text-slate-400 dark:text-slate-500">
            GFC_RUNWAY: 6.3M
          </text>
        </g>
      </svg>

      {/* ── 3. FLOATING MICRO-GEOMETRIC SHAPES (TASTEFUL & WELL-SPACED) ─ */}
      {/* Geometric Glyph 1: Floating Wireframe Diamond (Far Top-Left Margin) */}
      <motion.div
        animate={{
          y: [-6, 6, -6],
          rotate: [0, 45, 90, 45, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 left-6 sm:left-10 w-12 h-12 rounded-xl border border-blue-500/20 dark:border-blue-400/25 bg-blue-500/5 backdrop-blur-[1px] flex items-center justify-center shadow-md hidden lg:flex opacity-60"
      >
        <div className="w-6 h-6 border border-indigo-500/25 rounded-lg transform rotate-45" />
      </motion.div>

      {/* Geometric Glyph 2: Floating Concentric Target Ring (Far Left Margin) */}
      <motion.div
        animate={{
          y: [5, -5, 5],
          scale: [0.96, 1.04, 0.96],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-3 w-16 h-16 rounded-full border border-dashed border-emerald-500/20 dark:border-emerald-400/25 flex items-center justify-center hidden xl:flex opacity-60"
      >
        <div className="w-8 h-8 rounded-full border border-emerald-500/25" />
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
      </motion.div>

      {/* Geometric Glyph 3: Floating Wireframe Hexagon (Far Top-Right Margin) */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          rotate: [0, -25, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 right-6 sm:right-12 w-14 h-14 rounded-2xl border border-purple-500/20 dark:border-purple-400/25 bg-purple-500/5 backdrop-blur-[1px] flex items-center justify-center shadow-md hidden lg:flex opacity-60"
      >
        <div className="w-7 h-7 border border-purple-500/30 rounded-xl transform rotate-12" />
      </motion.div>
    </div>
  );
}

export default GeometricBackground;
