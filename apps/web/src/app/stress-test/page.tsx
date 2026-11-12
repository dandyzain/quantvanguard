'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { usePortfolio } from '@/context/PortfolioContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  simulateMacroStressTest,
  calculate10YearProjections,
  StressSimulationResult,
  MonteCarloProjectionResult,
} from '@/lib/math/stresstest';
import { HISTORICAL_CRISIS_PRESETS } from '@/lib/constants';
import { AssetCode, TargetAllocations } from '@/lib/types';
import { HoldingInput } from '@/lib/math/rebalancer';

export default function StressTestPage() {
  const { portfolio, formatMoney, formatPct, currency } = usePortfolio();
  const { dict, language } = useLanguage();

  const [activePreset, setActivePreset] = useState<string>('2008_GFC');
  const [customShocks, setCustomShocks] = useState<Record<AssetCode, number>>({
    MMF_IDR: 0.04,
    ETF_VOO: -0.38,
    GOLD_XAU: 0.055,
    CRYPTO_BTC: -0.5,
  });

  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(12500000);
  const [dcaMonthlyAmount, setDcaMonthlyAmount] = useState<number>(5000000);
  const [simulationResult, setSimulationResult] = useState<StressSimulationResult | null>(null);
  const [projectionsResult, setProjectionsResult] = useState<MonteCarloProjectionResult | null>(null);

  const isFresh = !portfolio || !portfolio.holdings || portfolio.holdings.length === 0;

  // Interactive Custom Sandbox Simulation States
  const [simulationMode, setSimulationMode] = useState<'CUSTOM' | 'ACTUAL'>('CUSTOM');
  const [simulatedPrincipal, setSimulatedPrincipal] = useState<number>(
    currency === 'USD' ? 10000 : 100000000
  );
  const [simulatedWeights, setSimulatedWeights] = useState<Record<AssetCode, number>>({
    MMF_IDR: 40,
    ETF_VOO: 20,
    GOLD_XAU: 20,
    CRYPTO_BTC: 20,
  });

  // Sync simulated weights if user has target allocations from their AI profile
  useEffect(() => {
    if (portfolio?.targetAllocations) {
      setSimulatedWeights({
        MMF_IDR: Math.round((portfolio.targetAllocations.MMF_IDR ?? 0.4) * 100),
        ETF_VOO: Math.round((portfolio.targetAllocations.ETF_VOO ?? 0.2) * 100),
        GOLD_XAU: Math.round((portfolio.targetAllocations.GOLD_XAU ?? 0.2) * 100),
        CRYPTO_BTC: Math.round((portfolio.targetAllocations.CRYPTO_BTC ?? 0.2) * 100),
      });
    }
  }, [portfolio?.targetAllocations]);

  const weightsSum =
    (simulatedWeights.MMF_IDR || 0) +
    (simulatedWeights.ETF_VOO || 0) +
    (simulatedWeights.GOLD_XAU || 0) +
    (simulatedWeights.CRYPTO_BTC || 0) || 100;

  const normalizedWeights: TargetAllocations = {
    MMF_IDR: (simulatedWeights.MMF_IDR || 0) / weightsSum,
    ETF_VOO: (simulatedWeights.ETF_VOO || 0) / weightsSum,
    GOLD_XAU: (simulatedWeights.GOLD_XAU || 0) / weightsSum,
    CRYPTO_BTC: (simulatedWeights.CRYPTO_BTC || 0) / weightsSum,
  };

  // Sync shocks when preset changes
  const handleSelectPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey !== 'CUSTOM' && (HISTORICAL_CRISIS_PRESETS as any)[presetKey]) {
      const preset = (HISTORICAL_CRISIS_PRESETS as any)[presetKey];
      setCustomShocks({ ...preset.shocks });
    }
  };

  const isCustomSimActive = simulationMode === 'CUSTOM' || (isFresh && simulationMode !== 'ACTUAL');

  useEffect(() => {
    if (!portfolio) return;

    const usdRate = portfolio.usdIdrRate || 15850.0;
    let holdingsInput: HoldingInput[] = [];

    if (isCustomSimActive) {
      // Build synthetic holdings from customized principal and customized allocation
      const nominalPrincipalIdr =
        currency === 'USD' ? simulatedPrincipal * usdRate : simulatedPrincipal;

      holdingsInput = [
        {
          assetCode: 'MMF_IDR',
          units: nominalPrincipalIdr * (normalizedWeights.MMF_IDR ?? 0.4),
          currentPrice: 1.0,
        },
        {
          assetCode: 'ETF_VOO',
          units:
            (nominalPrincipalIdr * (normalizedWeights.ETF_VOO ?? 0.2)) /
            (497.87 * usdRate),
          currentPrice: 497.87 * usdRate,
        },
        {
          assetCode: 'GOLD_XAU',
          units:
            (nominalPrincipalIdr * (normalizedWeights.GOLD_XAU ?? 0.2)) /
            1494338.0,
          currentPrice: 1494338.0,
        },
        {
          assetCode: 'CRYPTO_BTC',
          units:
            (nominalPrincipalIdr * (normalizedWeights.CRYPTO_BTC ?? 0.2)) /
            (93786.5 * usdRate),
          currentPrice: 93786.5 * usdRate,
        },
      ];
    } else {
      holdingsInput = portfolio.holdings.map((h) => ({
        assetCode: h.assetCode,
        units: h.units,
        currentPrice: h.currentPrice,
      }));
    }

    const result = simulateMacroStressTest(holdingsInput, {
      preset: activePreset as any,
      customShocks,
      monthlyExpenses,
      goldHaircut: 0.15,
    });
    setSimulationResult(result);

    const proj = calculate10YearProjections(
      result.preShockTotalValue,
      dcaMonthlyAmount,
      isCustomSimActive ? normalizedWeights : portfolio.targetAllocations
    );
    setProjectionsResult(proj);
  }, [
    portfolio,
    isCustomSimActive,
    simulatedPrincipal,
    simulatedWeights,
    weightsSum,
    activePreset,
    customShocks,
    monthlyExpenses,
    dcaMonthlyAmount,
    currency,
  ]);

  const runwayMonths =
    !isCustomSimActive && isFresh ? 0.0 : (simulationResult?.liquidRunway.runwayMonths ?? 0);
  const runwayStatus =
    !isCustomSimActive && isFresh
      ? 'FRESH_ACCOUNT'
      : (simulationResult?.liquidRunway.status || 'MODERATE_RESILIENCE');

  const chartData = (projectionsResult?.tenYearTrajectories || []).map((t) => ({
    yearLabel: `Yr ${t.year}`,
    year: t.year,
    baselineMedian: t.baselineMedian,
    rebalancedGrowth: t.rebalancedGrowth,
    crisisYear3Shock: t.crisisYear3Shock,
  }));

  const CustomProjectionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2">
          <div className="font-bold text-slate-900 dark:text-white text-sm pb-1 border-b border-slate-200 dark:border-slate-800">
            {label} {language === 'id' ? 'Proyeksi 10 Tahun' : '10-Year Projections'}
          </div>
          <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400">
            <span>{dict.stressTest.legendRebalanced}:</span>
            <span className="font-bold">{formatMoney(payload[0]?.value)}</span>
          </div>
          <div className="flex justify-between gap-4 text-blue-600 dark:text-blue-400">
            <span>{dict.stressTest.legendBaseline}:</span>
            <span className="font-semibold">{formatMoney(payload[1]?.value)}</span>
          </div>
          <div className="flex justify-between gap-4 text-orange-600 dark:text-orange-400">
            <span>{dict.stressTest.legendCrisis}:</span>
            <span className="font-semibold">{formatMoney(payload[2]?.value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold mb-2">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{dict.stressTest.badge}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {dict.stressTest.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {dict.stressTest.subtitle}
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 self-start sm:self-auto text-xs">
            {[
              { id: '2008_GFC', label: dict.stressTest.presetGfc },
              { id: '2020_COVID', label: dict.stressTest.presetCovid },
              { id: '2022_BEAR', label: dict.stressTest.presetBear },
              { id: 'CUSTOM', label: dict.stressTest.presetCustom },
            ].map((p) => (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activePreset === p.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {p.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Interactive Custom Capital & Allocation Simulation Panel */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'id' ? 'Simulasi Mandiri: Kustomisasi Modal & Alokasi Portofolio' : 'Interactive Sandbox: Custom Capital & Allocation Simulation'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                    {isCustomSimActive ? (language === 'id' ? 'Simulasi Aktif' : 'Simulation Active') : 'Real Portfolio'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'id'
                    ? 'Ubah nominal modal dan geser persentase alokasi untuk melihat respons matematis ketahanan krisis secara instan.'
                    : 'Adjust the starting principal and allocation weights to inspect dynamic crisis resilience in real-time.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSimulationMode(simulationMode === 'CUSTOM' ? 'ACTUAL' : 'CUSTOM')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  simulationMode === 'CUSTOM'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {simulationMode === 'CUSTOM'
                  ? (language === 'id' ? 'Mode Simulasi Kustom: AKTIF' : 'Custom Simulation: ACTIVE')
                  : (language === 'id' ? 'Gunakan Portofolio Riil (Rp 0)' : 'Use Real Portfolio ($0)')}
              </button>
            </div>
          </div>

          {simulationMode === 'CUSTOM' && (
            <div className="space-y-4">
              {/* Row 1: Modal Principal Input & Quick Presets */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {language === 'id' ? 'Nominal Modal yang Disimulasikan:' : 'Simulated Investment Capital:'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    {language === 'id' ? 'Ketik bebas jumlah modal yang ingin Anda uji ketahanannya' : 'Enter any hypothetical portfolio size to test'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      {currency === 'USD' ? '$' : 'Rp'}
                    </span>
                    <input
                      type="number"
                      step={currency === 'USD' ? '1000' : '10000000'}
                      min="1000000"
                      value={simulatedPrincipal}
                      onChange={(e) => setSimulatedPrincipal(Math.max(0, Number(e.target.value)))}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 w-44"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    {(currency === 'USD'
                      ? [
                          { label: '$10k', val: 10000 },
                          { label: '$25k', val: 25000 },
                          { label: '$50k', val: 50000 },
                          { label: '$100k', val: 100000 },
                        ]
                      : [
                          { label: '50 Juta', val: 50000000 },
                          { label: '100 Juta', val: 100000000 },
                          { label: '250 Juta', val: 250000000 },
                          { label: '500 Juta', val: 500000000 },
                        ]
                    ).map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => setSimulatedPrincipal(btn.val)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          simulatedPrincipal === btn.val
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: 4 Sliders Kustomisasi Alokasi */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'id' ? 'Komposisi Bobot Aset yang Disimulasikan:' : 'Simulated Asset Weight Composition:'}
                  </span>
                  {/* Preset Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setSimulatedWeights({
                          MMF_IDR: 70,
                          ETF_VOO: 15,
                          GOLD_XAU: 15,
                          CRYPTO_BTC: 0,
                        })
                      }
                      className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-indigo-400 cursor-pointer"
                    >
                      Defensive (70/15/15/0)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSimulatedWeights({
                          MMF_IDR: 40,
                          ETF_VOO: 20,
                          GOLD_XAU: 20,
                          CRYPTO_BTC: 20,
                        })
                      }
                      className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-indigo-400 cursor-pointer"
                    >
                      Balanced (40/20/20/20)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSimulatedWeights({
                          MMF_IDR: 20,
                          ETF_VOO: 40,
                          GOLD_XAU: 10,
                          CRYPTO_BTC: 30,
                        })
                      }
                      className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:border-indigo-400 cursor-pointer"
                    >
                      Aggressive (20/40/10/30)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* MMF Slider */}
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <span>MMF (Kas Likuid):</span>
                      <span>
                        {simulatedWeights.MMF_IDR}% (
                        {Math.round((normalizedWeights.MMF_IDR ?? 0.4) * 100)}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={simulatedWeights.MMF_IDR}
                      onChange={(e) =>
                        setSimulatedWeights({
                          ...simulatedWeights,
                          MMF_IDR: Number(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* VOO Slider */}
                  <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                      <span>S&P 500 (Ekuitas):</span>
                      <span>
                        {simulatedWeights.ETF_VOO}% (
                        {Math.round((normalizedWeights.ETF_VOO ?? 0.2) * 100)}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={simulatedWeights.ETF_VOO}
                      onChange={(e) =>
                        setSimulatedWeights({
                          ...simulatedWeights,
                          ETF_VOO: Number(e.target.value),
                        })
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* GOLD Slider */}
                  <div className="p-3 rounded-xl border border-yellow-500/20 bg-yellow-50/40 dark:bg-yellow-950/20 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-amber-700 dark:text-yellow-300">
                      <span>Emas Fisik (Hedge):</span>
                      <span>
                        {simulatedWeights.GOLD_XAU}% (
                        {Math.round((normalizedWeights.GOLD_XAU ?? 0.2) * 100)}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={simulatedWeights.GOLD_XAU}
                      onChange={(e) =>
                        setSimulatedWeights({
                          ...simulatedWeights,
                          GOLD_XAU: Number(e.target.value),
                        })
                      }
                      className="w-full accent-yellow-500 cursor-pointer"
                    />
                  </div>

                  {/* BTC Slider */}
                  <div className="p-3 rounded-xl border border-orange-500/20 bg-orange-50/40 dark:bg-orange-950/20 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-orange-700 dark:text-orange-300">
                      <span>Bitcoin (Alpha):</span>
                      <span>
                        {simulatedWeights.CRYPTO_BTC}% (
                        {Math.round((normalizedWeights.CRYPTO_BTC ?? 0.2) * 100)}%)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={simulatedWeights.CRYPTO_BTC}
                      onChange={(e) =>
                        setSimulatedWeights({
                          ...simulatedWeights,
                          CRYPTO_BTC: Number(e.target.value),
                        })
                      }
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liquid Survival Runway Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-blue-50/30 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 p-5 md:p-6 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Runway Dial & Status */}
            <div className="md:col-span-5 flex flex-col items-center sm:items-start space-y-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-5 md:pb-0 md:pr-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span>{dict.stressTest.liquidRunway}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-amber-600 dark:text-amber-300">
                  {runwayMonths.toFixed(1)}
                </span>
                <span className="text-lg font-bold text-slate-500 dark:text-slate-400">{dict.stressTest.months}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                    !isCustomSimActive && isFresh
                      ? 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30'
                      : runwayStatus === 'FORTRESS_BALANCE_SHEET'
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                      : runwayStatus === 'MODERATE_RESILIENCE'
                      ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40'
                      : 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 animate-pulse'
                  }`}
                >
                  {!isCustomSimActive && isFresh && (language === 'id' ? 'Fresh (Belum Ada Aset Likuid)' : 'Fresh (0 Liquid Reserves)')}
                  {(isCustomSimActive || !isFresh) && runwayStatus === 'FORTRESS_BALANCE_SHEET' && dict.stressTest.fortressBadge}
                  {(isCustomSimActive || !isFresh) && runwayStatus === 'MODERATE_RESILIENCE' && dict.stressTest.moderateBadge}
                  {(isCustomSimActive || !isFresh) && runwayStatus === 'CRITICAL_RISK' && dict.stressTest.criticalBadge}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left mt-2 leading-relaxed">
                {isCustomSimActive
                  ? (language === 'id'
                      ? `Alokasi kustom Anda mampu menopang ${runwayMonths.toFixed(1)} bulan pengeluaran tanpa perlu menjual aset yang sedang crash.`
                      : `Your custom allocation sustains ${runwayMonths.toFixed(1)} months of expenses without distress selling crash assets.`)
                  : isFresh
                  ? (language === 'id' ? 'Tambahkan kas / RDPU / emas di Dashboard untuk memperpanjang daya tahan runway likuiditas Anda.' : 'Add cash / MMF / gold in the Dashboard to extend your safe liquidity survival runway.')
                  : dict.stressTest.fundedBySafeReserves}
              </p>
            </div>

            {/* Right: Macro Drawdown KPI Metrics */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{dict.stressTest.preShockNetWorth}</span>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatMoney(simulationResult?.preShockTotalValue ?? 0)}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isCustomSimActive
                    ? (language === 'id' ? 'Modal Simulasi Kustom' : 'Simulated Principal')
                    : isFresh
                    ? (language === 'id' ? 'Saldo Awal Fresh' : 'Fresh Baseline')
                    : dict.stressTest.normalBaseline}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{dict.stressTest.postCrisisNetWorth}</span>
                <div className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                  {formatMoney(simulationResult?.postShockTotalValue ?? 0)}
                </div>
                <span className={`text-[10px] font-bold ${!isCustomSimActive && isFresh ? 'text-slate-500 dark:text-slate-400' : 'text-red-500 dark:text-red-400'}`}>
                  {!isCustomSimActive && isFresh ? '0.0%' : `${simulationResult?.totalDrawdownPercentage ?? 0}%`} {dict.stressTest.drawdownSuffix}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{dict.stressTest.safeLiquidCapital}</span>
                <div className="text-lg font-extrabold text-amber-600 dark:text-amber-300 mt-1">
                  {formatMoney(simulationResult?.liquidRunway.totalSafeLiquidity ?? 0)}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{dict.stressTest.rdpuPlusGold}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shock Sliders Grid (Custom Mode or Preset Inspector) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {dict.stressTest.assetShocksTitle} ({simulationResult?.scenarioName})
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {dict.stressTest.assetShocksDesc}
              </p>
            </div>
            {activePreset !== 'CUSTOM' && (
              <button
                onClick={() => setActivePreset('CUSTOM')}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{dict.stressTest.unlockSliders}</span>
              </button>
            )}
          </div>

          {isFresh && (
            <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div className="space-y-0.5">
                <span className="font-bold">
                  {language === 'id' ? 'Tolok Ukur Kelas Aset Makro Global (Benchmark Universe)' : 'Global Macro Asset Class Benchmark'}
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'id'
                    ? 'Anda belum menambahkan aset apapun ke portofolio Anda. Keempat aset di bawah ini (Pasar Uang, S&P 500, Emas, Bitcoin) adalah tolok ukur historis untuk menguji bagaimana pasar dunia bergerak saat krisis 2008/2020. Nilai saldo portofolio Anda tetap Rp 0 tanpa risiko kerugian.'
                    : 'You have not added any assets to your portfolio yet. The four assets below (Money Market, S&P 500, Gold, Bitcoin) are historical benchmarks demonstrating global market drawdowns during crisis scenarios. Your actual portfolio balance remains $0.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              [
                {
                  code: 'MMF_IDR',
                  name: language === 'id' ? 'Pasar Uang (RDPU)' : 'Money Market (MMF)',
                  color: '#10B981',
                },
                { code: 'ETF_VOO', name: 'S&P 500 ETF (VOO)', color: '#3B82F6' },
                {
                  code: 'GOLD_XAU',
                  name: language === 'id' ? 'Emas Fisik (XAU)' : 'Physical Gold (XAU)',
                  color: '#EAB308',
                },
                { code: 'CRYPTO_BTC', name: 'Bitcoin (BTC)', color: '#F97316' },
              ] as const
            ).map((asset) => {
              const currentShock = customShocks[asset.code];
              const shockPct = Math.round(currentShock * 100);

              return (
                <div
                  key={asset.code}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                      {asset.name}
                    </span>
                    <span
                      className={`font-extrabold ${
                        shockPct > 0 ? 'text-emerald-600 dark:text-emerald-400' : shockPct < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {shockPct > 0 ? '+' : ''}
                      {shockPct}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="-80"
                    max="100"
                    step="1"
                    disabled={activePreset !== 'CUSTOM'}
                    value={shockPct}
                    onChange={(e) =>
                      setCustomShocks({
                        ...customShocks,
                        [asset.code]: Number(e.target.value) / 100,
                      })
                    }
                    className={`w-full cursor-pointer ${
                      activePreset !== 'CUSTOM' ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-80%</span>
                    <span>0%</span>
                    <span>+100%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 10-Year Monte Carlo Projections Chart (3 Lines) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {dict.stressTest.chartTitle}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {dict.stressTest.chartSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700 dark:text-slate-200">{dict.stressTest.legendRebalanced}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 dark:text-slate-300">{dict.stressTest.legendBaseline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span className="text-slate-500 dark:text-slate-400">{dict.stressTest.legendCrisis}</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
                <XAxis dataKey="yearLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (currency === 'USD') return `$${Math.round(v / 1000)}k`;
                    return `Rp ${Math.round(v / 1000000)}M`;
                  }}
                />
                <Tooltip content={<CustomProjectionTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rebalancedGrowth"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="baselineMedian"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="crisisYear3Shock"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#F97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lump-Sum vs. Monthly DCA Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lump-Sum Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{dict.stressTest.lumpSumTitle}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{dict.stressTest.lumpSumSubtitle}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {dict.stressTest.cagr}: {isFresh ? '0.0' : projectionsResult?.lumpSumVsDca.lumpSum.effectiveCAGR}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-transparent">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{dict.stressTest.initialPrincipal}</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatMoney(projectionsResult?.lumpSumVsDca.lumpSum.initialInvestment ?? 0)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-transparent">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{dict.stressTest.terminalWealth}</span>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatMoney(projectionsResult?.lumpSumVsDca.lumpSum.projected10YearTerminal ?? 0)}
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
              <span>{dict.stressTest.maxDrawdownRisk}</span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {isFresh ? '0.0%' : `${projectionsResult?.lumpSumVsDca.lumpSum.maxHistoricalDrawdown}%`}
              </span>
            </div>
          </div>

          {/* DCA Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{dict.stressTest.dcaTitle}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatMoney(dcaMonthlyAmount)} / {dict.stressTest.dcaSubtitle}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {dict.stressTest.cagr}: {projectionsResult?.lumpSumVsDca.dca.effectiveCAGR}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-transparent">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{dict.stressTest.totalContributed}</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatMoney(projectionsResult?.lumpSumVsDca.dca.totalPrincipalContributed || 600000000)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-transparent">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{dict.stressTest.terminalWealth}</span>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatMoney(projectionsResult?.lumpSumVsDca.dca.projected10YearTerminal || 1184000000)}
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
              <span>{dict.stressTest.maxDrawdownRisk}</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {projectionsResult?.lumpSumVsDca.dca.maxHistoricalDrawdown}% {dict.stressTest.smootherDrawdowns}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
