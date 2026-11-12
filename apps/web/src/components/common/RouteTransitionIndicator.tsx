'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '@/context/LoadingContext';
import { useLanguage } from '@/context/LanguageContext';
import { soundManager } from '@/lib/audio/soundEffects';

export function RouteTransitionIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoading, hideLoading } = useLoading();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0);

  // When pathname or searchParams change, navigation is complete
  useEffect(() => {
    if (isNavigating) {
      setNavProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setNavProgress(0);
        hideLoading();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, hideLoading, isNavigating]);

  // Intercept internal link clicks to trigger instant visual transition
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external links, anchors, or new tabs
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('#') ||
        target.getAttribute('target') === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey
      ) {
        return;
      }

      // If navigating to the exact same pathname without search query change, ignore
      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      soundManager.playClick();
      setIsNavigating(true);
      setNavProgress(35);

      // Map destination pathname to intuitive title & subtitle
      let title = isEn ? 'Loading Page...' : 'Memuat Halaman...';
      let subtitle = isEn ? 'Optimizing quantitative models...' : 'Mempersiapkan model kuantitatif...';

      if (url.pathname === '/dashboard') {
        title = isEn ? 'Opening Portfolio Command Center...' : 'Membuka Portfolio Command Center...';
        subtitle = isEn ? 'Aggregating live multi-asset holdings & drift...' : 'Mengambil data kepemilikan aset & kalkulasi drift...';
      } else if (url.pathname === '/profiler') {
        title = isEn ? 'Opening AI Risk Profiler...' : 'Membuka AI Risk Profiler...';
        subtitle = isEn ? 'Loading Gemini 2.5 behavioral framework...' : 'Memuat instrumen diagnostik perilaku Gemini 2.5...';
      } else if (url.pathname === '/rebalancer') {
        title = isEn ? 'Opening Smart Inflow Rebalancer...' : 'Membuka Smart Inflow Rebalancer...';
        subtitle = isEn ? 'Loading Zero-Sell water-filling engine...' : 'Menginisialisasi formula water-filling tanpa pajak...';
      } else if (url.pathname === '/stress-test') {
        title = isEn ? 'Opening Macro Crisis Lab...' : 'Membuka Macro Crisis Lab...';
        subtitle = isEn ? 'Calibrating historical shock presets (2008 & 2020)...' : 'Mengalkulasi simulasi guncangan pasar makro...';
      } else if (url.pathname === '/') {
        title = isEn ? 'Opening Home...' : 'Kembali ke Beranda...';
        subtitle = isEn ? 'Preparing QuantVanguard Overview...' : 'Mempersiapkan ringkasan QuantVanguard...';
      }

      showLoading(title, subtitle);

      // Increment progress bar smoothly
      const progressTimer = setTimeout(() => {
        setNavProgress(75);
      }, 150);

      return () => clearTimeout(progressTimer);
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
    };
  }, [showLoading, isEn]);

  return (
    <>
      {/* Top Laser Progress Bar */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            key="top-laser-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 shadow-[0_0_14px_#38bdf8]"
              initial={{ width: '0%' }}
              animate={{ width: `${navProgress}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
