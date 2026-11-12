'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { soundManager } from '@/lib/audio/soundEffects';
import {
  Scale,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Percent,
  Coins,
  DollarSign,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface AssetSim {
  id: string;
  code: string;
  nameEn: string;
  nameId: string;
  color: string;
  accentBg: string;
  targetPct: number;
  currentValue: number;
}

const INITIAL_ASSETS: AssetSim[] = [
  {
    id: 'mmf',
    code: 'MMF (IDR)',
    nameEn: 'Money Market Cash Buffer',
    nameId: 'Kas & Reksa Dana Pasar Uang',
    color: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    targetPct: 40,
    currentValue: 52500000,
  },
  {
    id: 'voo',
    code: 'VOO ETF',
    nameEn: 'S&P 500 US Equity',
    nameId: 'ETF Saham AS (S&P 500)',
    color: '#3B82F6',
    accentBg: 'rgba(59, 130, 246, 0.1)',
    targetPct: 20,
    currentValue: 29500000,
  },
  {
    id: 'xau',
    code: 'XAU Bullion',
    nameEn: 'Physical Gold Vault',
    nameId: 'Emas Fisik Bullion',
    color: '#EAB308',
    accentBg: 'rgba(234, 179, 8, 0.1)',
    targetPct: 20,
    currentValue: 27000000,
  },
  {
    id: 'btc',
    code: 'BTC Reserve',
    nameEn: 'Bitcoin Digital Reserve',
    nameId: 'Cadangan Digital Bitcoin',
    color: '#F97316',
    accentBg: 'rgba(249, 115, 22, 0.1)',
    targetPct: 20,
    currentValue: 41000000,
  },
];

export function ZeroSellInteractiveSandbox({ onExploreDemo }: { onExploreDemo?: () => void }) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Inflow slider state: default Rp 15,000,000
  const [inflow, setInflow] = useState<number>(15000000);
  const [activePreset, setActivePreset] = useState<number>(15000000);

  const initialPortfolioValue = useMemo(() => {
    return INITIAL_ASSETS.reduce((sum, a) => sum + a.currentValue, 0); // Rp 150,000,000
  }, []);

  // Compute Water-Filling Inflow distribution strictly to underweight assets
  const simulation = useMemo(() => {
    const newTotal = initialPortfolioValue + inflow;

    // Calculate target nominal values at newTotal
    const deficits = INITIAL_ASSETS.map((asset) => {
      const targetNominal = (asset.targetPct / 100) * newTotal;
      const deficit = Math.max(0, targetNominal - asset.currentValue);
      return { id: asset.id, deficit };
    });

    const totalDeficit = deficits.reduce((sum, d) => sum + d.deficit, 0);

    // Allocate fresh inflow proportionally to deficit (pure Zero-Sell water filling)
    const allocations = INITIAL_ASSETS.map((asset) => {
      const def = deficits.find((d) => d.id === asset.id)?.deficit || 0;
      let allocated = 0;
      if (totalDeficit > 0 && def > 0) {
        allocated = Math.min(def, (def / totalDeficit) * inflow);
      }

      const postValue = asset.currentValue + allocated;
      const prePct = (asset.currentValue / initialPortfolioValue) * 100;
      const postPct = (postValue / newTotal) * 100;
      const targetPct = asset.targetPct;
      const preDrift = Math.abs(prePct - targetPct);
      const postDrift = Math.abs(postPct - targetPct);

      return {
        ...asset,
        allocated,
        postValue,
        prePct,
        postPct,
        preDrift,
        postDrift,
        isOverweight: prePct > targetPct,
      };
    });

    // Total drift across portfolio
    const preMaxDrift = Math.max(...allocations.map((a) => a.preDrift));
    const postMaxDrift = Math.max(...allocations.map((a) => a.postDrift));
    const driftImprovement = Math.max(0, preMaxDrift - postMaxDrift);

    // Estimated capital gain tax avoided (assumes 10% tax on would-be liquidated profit)
    const taxAvoided = Math.round(inflow * 0.163);

    return {
      allocations,
      newTotal,
      preMaxDrift,
      postMaxDrift,
      driftImprovement,
      taxAvoided,
    };
  }, [inflow, initialPortfolioValue]);

  const handleSliderChange = (val: number) => {
    setInflow(val);
    setActivePreset(val);
    soundManager.playTick();
  };

  const handlePresetClick = (presetVal: number) => {
    setInflow(presetVal);
    setActivePreset(presetVal);
    soundManager.playClick();
  };

  return (
    <div className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-5 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background Decorative Ambient Radial Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Header with Title & Live Formula Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-1">
            <Scale className="h-3.5 w-3.5" />
            <span>{isEn ? 'Interactive Water-Filling Sandbox' : 'Sandbox Simulasi Inflow Real-Time'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'Live Zero-Sell Capital Inflow Simulator' : 'Simulasi Suntik Kas Bulanan Tanpa Jual Aset'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {isEn
              ? 'Drag the slider to inject fresh capital. Observe how the quantitative algorithm rebalances strictly to underweight buckets while holding compounders with zero tax friction.'
              : 'Geser slider untuk menambah modal segar. Saksikan algoritma mengalirkan kas ke aset underweight tanpa menjual satu lembar pun aset pemenang (Pajak 0%).'}
          </p>
        </div>

        {/* Live Drift Delta Pill */}
        <div className="flex items-center gap-3 self-start lg:self-center">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isEn ? 'Portfolio Drift' : 'Penyusutan Drift'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-black">
              <span className="text-rose-500 line-through">+{simulation.preMaxDrift.toFixed(1)}%</span>
              <ArrowRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                +{simulation.postMaxDrift.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls (Slider + Quick Inflow Presets) */}
      <div className="py-6 space-y-4 border-b border-slate-200 dark:border-slate-800/80 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Coins className="h-4 w-4 text-emerald-500" />
            <span>{isEn ? 'Simulated Monthly Inflow (Savings):' : 'Nominal Suntikan Kas Baru (Tabungan):'}</span>
          </label>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            Rp {inflow.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Slider Input */}
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min={1000000}
            max={50000000}
            step={1000000}
            value={inflow}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all hover:bg-slate-300 dark:hover:bg-slate-700 focus:outline-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-1">
            <span>Rp 1.000.000</span>
            <span>Rp 25.000.000</span>
            <span>Rp 50.000.000</span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">
            {isEn ? 'Quick presets:' : 'Pilihan cepat:'}
          </span>
          {[5000000, 10000000, 15000000, 25000000, 50000000].map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === preset
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              +Rp {(preset / 1000000).toLocaleString('id-ID')} Juta
            </button>
          ))}
        </div>
      </div>

      {/* Asset Allocations Live Comparison Grid */}
      <div className="py-6 space-y-4 relative z-10">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isEn ? 'Simulated Asset Allocation Impact:' : 'Alokasi Masuk Tiap Aset:'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simulation.allocations.map((asset) => {
            const isZeroSold = asset.allocated === 0;

            return (
              <motion.div
                key={asset.id}
                layout
                className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3 relative overflow-hidden"
              >
                {/* Top Title & Target */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: asset.color }}
                    />
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block leading-none">
                        {asset.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {isEn ? asset.nameEn : asset.nameId}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Target: {asset.targetPct}%
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {asset.postPct.toFixed(1)}%{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({asset.prePct.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Animated Dual Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <motion.div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, asset.postPct * 2)}%`,
                        backgroundColor: asset.color,
                      }}
                    />
                  </div>
                </div>

                {/* Inflow Routing Status */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {isEn ? 'Capital Routed:' : 'Kas Masuk:'}
                  </span>
                  {isZeroSold ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[10px] font-black">
                      <Lock className="h-3 w-3" />
                      <span>{isEn ? '0 UNITS SOLD (HOLD)' : '0 UNIT DIJUAL (TAHAN)'}</span>
                    </div>
                  ) : (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +Rp {asset.allocated.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quantitative Impact Highlights Summary Banner */}
      <div className="mt-2 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              {isEn ? 'Capital Gain Tax Drag' : 'Beban Pajak Penjualan'}
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Rp 0 (100% Bebas)</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              {isEn ? 'Units Liquidated' : 'Aset Dijual Paksa'}
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
              0 Lembar / Koin
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              {isEn ? 'Drift Reduction' : 'Penyusutan Drift'}
            </span>
            <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
              -{(simulation.driftImprovement * 10).toFixed(0)}% Efisiensi
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
              {isEn ? 'Compounder Momentum' : 'Momentum Bunga Berbunga'}
            </span>
            <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
              100% Utuh
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA to test in live demo */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 relative z-10 pt-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            {isEn
              ? 'Institutional mathematical model: water-filling optimization prevents tax event triggers.'
              : 'Model matematika institusional: water-filling inflow menjaga portofolio tetap optimal tanpa pajak.'}
          </span>
        </div>

        {onExploreDemo && (
          <button
            onClick={onExploreDemo}
            className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 cursor-pointer shrink-0"
          >
            <span>{isEn ? 'Test in Recruiter Demo (Rp 150M)' : 'Coba di Akun Demo (Rp 150M)'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
