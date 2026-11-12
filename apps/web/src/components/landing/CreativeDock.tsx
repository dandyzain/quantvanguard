'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { soundManager } from '@/lib/audio/soundEffects';
import {
  Scale,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  ArrowUp,
  BrainCircuit,
  Zap,
} from 'lucide-react';

export function CreativeDock({ onStartDemo }: { onStartDemo: () => void }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [soundOn, setSoundOn] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    setSoundOn(soundManager.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const nextState = soundManager.toggle();
    setSoundOn(nextState);
  };

  const scrollToSection = (id: string) => {
    soundManager.playClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    soundManager.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 backdrop-blur-2xl shadow-2xl shadow-blue-500/10 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        {/* Quick Jump: Live Sandbox */}
        <button
          onClick={() => scrollToSection('sandbox')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isEn ? 'Scroll to Live Sandbox' : 'Menuju Sandbox Interaktif'}
        >
          <Scale className="h-3.5 w-3.5 text-emerald-500" />
          <span className="hidden sm:inline">{isEn ? 'Live Sandbox' : 'Sandbox'}</span>
        </button>

        {/* Quick Jump: Bento Pillars */}
        <button
          onClick={() => scrollToSection('fitur')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isEn ? 'Scroll to 4 Pillars' : 'Menuju 4 Pilar'}
        >
          <Layers className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden md:inline">{isEn ? 'Pillars' : 'Pilar'}</span>
        </button>

        {/* Quick Jump: Comparison */}
        <button
          onClick={() => scrollToSection('zero-sell-alpha')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isEn ? 'Quantitative Alpha' : 'Keunggulan Alpha'}
        >
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden md:inline">Alpha</span>
        </button>

        {/* Action: Demo (Rp 150M) */}
        <button
          onClick={() => {
            soundManager.playClick();
            onStartDemo();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-orange-500/20 font-bold transition-all hover:scale-105 cursor-pointer"
          title="Launch Recruiter Demo Account"
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Demo (Rp 150M)</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Audio FX Toggle Button */}
        <button
          onClick={handleToggleSound}
          className={`p-2 rounded-full transition-all cursor-pointer ${
            soundOn
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={soundOn ? (isEn ? 'Mute Sound FX' : 'Bisukan Efek Suara') : (isEn ? 'Enable Sound FX' : 'Aktifkan Efek Suara')}
        >
          {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </button>

        {/* Scroll To Top */}
        <button
          onClick={scrollToTop}
          className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isEn ? 'Back to top' : 'Kembali ke atas'}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </div>
  );
}
