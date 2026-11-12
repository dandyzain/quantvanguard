'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '@/context/LoadingContext';
import { TrendingUp, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

export function GlobalLoadingModal() {
  const { isLoading, title, subtitle, progress } = useLoading();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling while loading modal is active
  useEffect(() => {
    if (isLoading) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isLoading]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="global-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] w-screen h-screen min-h-screen flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none overflow-hidden"
        >
          {/* Ambient Glow behind modal */}
          <div className="absolute w-96 h-96 rounded-full bg-blue-600/25 blur-[120px] pointer-events-none" />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm rounded-3xl border border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-7 shadow-2xl shadow-blue-500/10 backdrop-blur-2xl text-center space-y-5 overflow-hidden text-slate-900 dark:text-white"
          >
            {/* Top subtle decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            {/* Quantum Orbital Spinner */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center pt-2">
              {/* Outer Orbital Ring (Clockwise) */}
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin"
                style={{ animationDuration: '2s' }}
              />

              {/* Middle Orbital Ring (Counter-Clockwise) */}
              <div
                className="absolute inset-2 rounded-full border-2 border-transparent border-b-purple-500 border-l-indigo-400 animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '2.5s' }}
              />

              {/* Pulsing Ambient Core */}
              <div className="absolute inset-5 rounded-full bg-blue-500/20 dark:bg-blue-500/30 blur-md animate-pulse" />

              {/* Central Quant Icon */}
              <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/40">
                <TrendingUp className="h-6 w-6 animate-pulse" />
              </div>
            </div>

            {/* Titles & Dynamic Information */}
            <div className="space-y-1.5 pt-1">
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                {subtitle}
              </p>
            </div>

            {/* Progress / Shimmer Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                {progress !== undefined ? (
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div
                    className="h-full w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-gradient-x"
                    style={{ backgroundSize: '200% 100%' }}
                  />
                )}
              </div>

              {progress !== undefined && (
                <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                  <span>PROGRESS</span>
                  <span className="text-blue-500">{Math.round(progress)}%</span>
                </div>
              )}
            </div>

            {/* Institutional Security & Engine Tag */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              <Cpu className="h-3.5 w-3.5 text-blue-500" />
              <span>QUANT CORE // ZERO-SELL PIPELINE</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
