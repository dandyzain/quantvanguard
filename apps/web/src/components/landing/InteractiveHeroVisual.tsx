'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { soundManager } from '@/lib/audio/soundEffects';
import { Sparkles, Box, Network, Eye, RotateCw } from 'lucide-react';
import { HeroAnimatedGraphic } from './HeroAnimatedGraphic';

// Dynamically import Three.js Hero3DScene with SSR disabled to guarantee smooth client-side canvas mounting
const Hero3DScene = dynamic(() => import('./Hero3DScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-slate-400">Loading 3D Quantum Engine...</span>
    </div>
  ),
});

export function InteractiveHeroVisual() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [activeMode, setActiveMode] = useState<'3d' | 'constellation'>('constellation');

  const handleToggle = (mode: '3d' | 'constellation') => {
    setActiveMode(mode);
    soundManager.playClick();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Mode Switcher Floating Pill Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg shadow-blue-500/5">
          <button
            onClick={() => handleToggle('constellation')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'constellation'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>{isEn ? 'Neural Constellation' : 'Peta Konstelasi'}</span>
          </button>

          <button
            onClick={() => handleToggle('3d')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === '3d'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span>{isEn ? '3D Quantum Lab' : 'Lab Isometrik 3D'}</span>
          </button>
        </div>

        {/* Interactive Hint Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <Eye className="h-3 w-3 text-blue-500" />
          <span>{activeMode === '3d' ? (isEn ? 'Drag to rotate 3D' : 'Putar 3D dengan mouse') : (isEn ? 'Hover nodes for details' : 'Sentuh node untuk detail')}</span>
        </div>
      </div>

      {/* Main Visual Display Container */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeMode === 'constellation' ? (
            <motion.div
              key="constellation"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <HeroAnimatedGraphic />
            </motion.div>
          ) : (
            <motion.div
              key="3d"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <Hero3DScene />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
