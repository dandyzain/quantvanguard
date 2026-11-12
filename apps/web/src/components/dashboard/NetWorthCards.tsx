'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { usePortfolio } from '@/context/PortfolioContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Wallet,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: 'easeOut',
    },
  }),
};

export function NetWorthCards() {
  const { portfolio, formatMoney, formatPct, currency, inflationAdjusted } = usePortfolio();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const totalValue = portfolio?.totalValue ?? 0;
  const costBasis = portfolio?.totalCostBasis ?? 0;
  const unrealizedNominal = portfolio?.unrealizedGainNominal ?? 0;
  const unrealizedPct = portfolio?.unrealizedGainPercentage ?? 0;

  // Safe liquid capital = MMF + (Gold * 0.85)
  const mmfHolding = portfolio?.holdings?.find((h) => h.assetCode === 'MMF_IDR');
  const goldHolding = portfolio?.holdings?.find((h) => h.assetCode === 'GOLD_XAU');
  const safeLiquidity =
    (mmfHolding?.currentValue || 0) +
    (goldHolding?.currentValue || 0) * 0.85;
  const monthlyExpenses = portfolio?.monthlyExpenses || 0;
  const liquidRunwayMonths = monthlyExpenses > 0 ? (safeLiquidity / monthlyExpenses).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Portfolio Valuation */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-blue-500/5 shadow-sm group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? 'Total Net Worth' : 'Total Nilai Portofolio'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
            <Wallet className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatMoney(totalValue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{isEn ? 'Cost Basis:' : 'Modal Disetor:'}</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{formatMoney(costBasis)}</span>
            {inflationAdjusted && (
              <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 px-1.5 py-0.2 rounded font-semibold">
                Real CPI
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Card 2: Unrealized Gain/Loss */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-emerald-500/5 shadow-sm group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? 'Unrealized Gain' : 'Keuntungan Belum Direalisasi'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            +{formatMoney(unrealizedNominal)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/20">
              +{unrealizedPct.toFixed(2)}%
            </span>
            <span className="text-slate-500 dark:text-slate-400">{isEn ? 'all-time nominal ROI' : 'imbal hasil nominal'}</span>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Liquid Survival Runway */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-amber-500/5 shadow-sm group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? 'Safe Liquid Runway' : 'Runway Likuiditas Aman'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-300">
            {liquidRunwayMonths} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{isEn ? 'Months' : 'Bulan'}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Buffer:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {formatMoney(safeLiquidity)}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500" title="MMF + 85% Gold value">
              (RDPU + Gold)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Card 4: Strategy Tier & Drift Health */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-indigo-500/5 shadow-sm group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? 'Active Strategy Tier' : 'Tingkat Strategi Aktif'}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate capitalize">
            {portfolio?.strategyName
              ? portfolio.strategyName.toLowerCase().replace(/_/g, ' ')
              : isEn
              ? 'Not Diagnosed Yet'
              : 'Belum Ditentukan'}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            {!portfolio?.holdings || portfolio.holdings.length === 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-3 w-3" />
                <span>{isEn ? 'Fresh Portfolio (0 Assets)' : 'Portofolio Fresh (0 Aset)'}</span>
              </span>
            ) : portfolio?.hasActiveDriftAlert ? (
              <span className="inline-flex items-center gap-1 font-semibold text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-3 w-3 animate-pulse" />
                <span>{isEn ? 'Rebalance Recommended' : 'Rebalance Disarankan'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                <span>{isEn ? 'Within Balanced Guardrails' : 'Dalam Batas Aman'}</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}