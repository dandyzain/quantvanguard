'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { soundManager } from '@/lib/audio/soundEffects';
import {
  Scale,
  BrainCircuit,
  ShieldAlert,
  Globe,
  Sparkles,
  Lock,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Zap,
  Terminal,
} from 'lucide-react';

export function BentoFeatures() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Interactive state for Bento Card 3 (Macro Crisis simulation)
  const [selectedCrisis, setSelectedCrisis] = useState<'gfc' | 'covid' | 'stagflation'>('covid');

  const crisisData = {
    gfc: {
      name: isEn ? '2008 Global Financial Crisis' : 'Krisis Finansial Global 2008',
      drop: '-18.7%',
      recovery: '8.4 Mo',
      runway: '16.5 Mo',
      defense: isEn ? 'MMF Cash & Gold Absorbed Shock' : 'Kas RDPU & Emas Menahan Penurunan',
    },
    covid: {
      name: isEn ? '2020 Covid-19 Black Swan' : 'Crash Pandemi Covid-19 2020',
      drop: '-12.8%',
      recovery: '4.1 Mo',
      runway: '14.2 Mo',
      defense: isEn ? 'Liquid Cash Prevented Panic Selling' : 'Likuiditas Kas Menghindarkan Panic Selling',
    },
    stagflation: {
      name: isEn ? '2022 Global Stagflation' : 'Stagflasi & Suku Bunga Global 2022',
      drop: '-9.4%',
      recovery: '6.2 Mo',
      runway: '18.0 Mo',
      defense: isEn ? 'Gold & High MMF Yield Protected Principal' : 'Emas & Yield RDPU Menjaga Modal Pokok',
    },
  };

  return (
    <section id="fitur" className="py-24 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/40 relative overflow-hidden">
      {/* Background Chromatic Flares */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/10 dark:bg-blue-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-600/10 dark:bg-purple-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Title Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>{isEn ? 'Institutional Architecture' : 'Arsitektur Kuantitatif'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Four Institutional Pillars of Precision' : 'Empat Pilar Disiplin Portofolio'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? 'Engineered to eliminate emotional bias, eradicate capital gain tax drag, and withstand extreme market drawdowns.'
              : 'Didesain untuk menghilangkan bias emosional, menghapus pajak penjualan modal, dan bertahan dari crash pasar global.'}
          </p>
        </div>

        {/* ── BENTO GRID ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── BENTO CARD 1 (7 Cols): ZERO-SELL WATER FILLING ── */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-emerald-500/5 relative overflow-hidden group hover:border-emerald-500/40 transition-all flex flex-col justify-between"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Scale className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  Zero Tax Friction
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isEn ? 'Smart Zero-Sell Inflow Rebalancer' : 'Zero-Sell Inflow Rebalancing'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {isEn
                    ? 'Unlike conventional platforms that force you to sell your highest-performing assets (incurring tax events and exit fees), QuantVanguard routes fresh monthly capital strictly to underweight buckets using an institutional water-filling algorithm.'
                    : 'Berbeda dengan metode konvensional yang memaksa menjual aset pemenang (memicu pajak dan fee broker ganda), QuantVanguard mengalirkan kas baru murni ke aset yang tertinggal menggunakan formula water-filling.'}
                </p>
              </div>

              {/* Visual Interactive Pipeline Simulation Box */}
              <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>INPUT: +Rp 15.000.000 Fresh Inflow</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">STATUS: REBALANCED</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <div className="font-bold">MMF KAS</div>
                    <div className="font-mono mt-1 text-[11px] font-bold text-slate-900 dark:text-white">+Rp 8.25M</div>
                    <div className="text-[9px] text-emerald-500 mt-0.5">Absorbs 55%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <div className="font-bold">VOO (S&P)</div>
                    <div className="font-mono mt-1 text-[11px] font-bold text-slate-900 dark:text-white">+Rp 3.75M</div>
                    <div className="text-[9px] text-blue-500 mt-0.5">Absorbs 25%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <div className="font-bold">EMAS XAU</div>
                    <div className="font-mono mt-1 text-[11px] font-bold text-slate-900 dark:text-white">+Rp 3.00M</div>
                    <div className="text-[9px] text-amber-500 mt-0.5">Absorbs 20%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex flex-col justify-between">
                    <div className="font-bold">BITCOIN</div>
                    <div className="font-mono mt-1 text-[10px] font-extrabold text-orange-500">Rp 0 JUAL</div>
                    <div className="text-[9px] text-orange-400 mt-0.5">🔒 LOCKED</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                {isEn ? 'Let Compounders Run Uninterrupted' : 'Biarkan Aset Compounder Bekerja Utuh'}
              </span>
            </div>
          </motion.div>

          {/* ── BENTO CARD 2 (5 Cols): GEMINI AI RISK PROFILER ── */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-purple-500/5 relative overflow-hidden group hover:border-purple-500/40 transition-all flex flex-col justify-between"
          >
            {/* Ambient Purple Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-bold">
                  Gemini 2.5 Flash
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isEn ? '13-Parameter AI Diagnostic' : 'Diagnosis Psikologis AI 2D'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {isEn
                    ? 'Separates financial capacity from psychological courage. Detects emotional loss aversion and cognitive biases.'
                    : 'Memisahkan kapasitas finansial neraca dari daya tahan psikologis. Mendeteksi bias kognitif dan mencegah panik di pasar beruang.'}
                </p>
              </div>

              {/* Simulated AI Terminal Dialogue Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-[11px] space-y-1.5 shadow-inner">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                  <Terminal className="h-3 w-3 text-purple-400" />
                  <span>GEMINI_AI // DIAGNOSTIC_ENGINE</span>
                </div>
                <div className="text-purple-400">&gt; Capacity: 14.2 Mo Runway [Resilient]</div>
                <div className="text-slate-300">&gt; Psychological Endurance: 78/100</div>
                <div className="text-emerald-400">&gt; Guardrail: Max Crypto 20% Hard-Capped</div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                Balance Sheet × Psychology
              </span>
            </div>
          </motion.div>

          {/* ── BENTO CARD 3 (5 Cols): MACRO STRESS TEST SIMULATOR ── */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-rose-500/5 relative overflow-hidden group hover:border-rose-500/40 transition-all flex flex-col justify-between"
          >
            {/* Ambient Rose Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold">
                  Crisis Lab
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isEn ? 'Macro Stress Simulator' : 'Simulator Uji Stres Makro'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {isEn
                    ? 'Stress-test your portfolio against the worst historical shocks without risking real capital.'
                    : 'Uji daya tahan portofolio menghadapi skenario terburuk krisis global tanpa risiko uang sungguhan.'}
                </p>
              </div>

              {/* Interactive Crisis Switcher */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => {
                      setSelectedCrisis('covid');
                      soundManager.playClick();
                    }}
                    className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedCrisis === 'covid'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Covid 2020
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCrisis('gfc');
                      soundManager.playClick();
                    }}
                    className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedCrisis === 'gfc'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    GFC 2008
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCrisis('stagflation');
                      soundManager.playClick();
                    }}
                    className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedCrisis === 'stagflation'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Stagflasi
                  </button>
                </div>

                {/* Crisis Output Display */}
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">{crisisData[selectedCrisis].name}</span>
                    <span className="font-mono font-bold text-rose-500">
                      {crisisData[selectedCrisis].drop}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Liquid Runway:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {crisisData[selectedCrisis].runway} Survival
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    🛡️ {crisisData[selectedCrisis].defense}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                Survival Runway Engine
              </span>
            </div>
          </motion.div>

          {/* ── BENTO CARD 4 (7 Cols): MULTI-ASSET ENGINE & FX ORACLE ── */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-blue-500/5 relative overflow-hidden group hover:border-blue-500/40 transition-all flex flex-col justify-between"
          >
            {/* Ambient Blue Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Globe className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold">
                  USD &bull; IDR Multi-Currency
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isEn ? 'Dynamic Multi-Asset Catalog & FX Oracle' : 'Katalog Multi-Aset & Oracle Valas'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {isEn
                    ? 'Seamlessly track and rebalance MMF cash buffers, US equities (VOO, QQQ), physical gold (XAU), and digital assets (BTC) with automated real-time FX conversion and 3.5% CPI inflation adjustment.'
                    : 'Kelola kas RDPU, saham AS (VOO), emas fisik (XAU), dan cadangan digital (BTC) dalam satu tampilan terpadu dengan konversi kurs USD/IDR dan penyesuaian inflasi riil.'}
                </p>
              </div>

              {/* 4 Multi-Asset Interactive Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10 text-center">
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">MMF KAS</div>
                  <div className="text-[10px] text-slate-500 mt-1">IDR Liquid Buffer</div>
                  <div className="text-xs font-mono font-bold mt-1 text-slate-800 dark:text-slate-200">5.8% p.a.</div>
                </div>

                <div className="p-3 rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/10 text-center">
                  <div className="text-xs font-black text-blue-600 dark:text-blue-400">VOO (S&P 500)</div>
                  <div className="text-[10px] text-slate-500 mt-1">USD Equity</div>
                  <div className="text-xs font-mono font-bold mt-1 text-slate-800 dark:text-slate-200">$542.80</div>
                </div>

                <div className="p-3 rounded-2xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/10 text-center">
                  <div className="text-xs font-black text-amber-600 dark:text-amber-400">EMAS FISIK</div>
                  <div className="text-[10px] text-slate-500 mt-1">XAU Bullion</div>
                  <div className="text-xs font-mono font-bold mt-1 text-slate-800 dark:text-slate-200">Rp 1.48M/g</div>
                </div>

                <div className="p-3 rounded-2xl border border-orange-500/20 bg-orange-50/50 dark:bg-orange-500/10 text-center">
                  <div className="text-xs font-black text-orange-600 dark:text-orange-400">BITCOIN (BTC)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Digital Reserve</div>
                  <div className="text-xs font-mono font-bold mt-1 text-slate-800 dark:text-slate-200">$88,450</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                Real Purchasing Power Engine (CPI 3.5%)
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
