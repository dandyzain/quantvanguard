'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { usePortfolio } from '@/context/PortfolioContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Scale,
  Zap,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Coins,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import {
  calculateFullRebalance,
  calculateZeroSellInflowRebalance,
  HoldingInput,
  RebalancePlan,
} from '@/lib/math/rebalancer';

export default function RebalancerPage() {
  const { portfolio, formatMoney, formatUnits, formatPct, currency } = usePortfolio();
  const { dict, language } = useLanguage();

  const [mode, setMode] = useState<'ZERO_SELL_INFLOW' | 'FULL'>('ZERO_SELL_INFLOW');
  // Monthly inflow amount: Rp 15,000,000 default (or ~$946 in USD)
  const defaultInflow = currency === 'USD' ? 950 : 15000000;
  const [inflowInput, setInflowInput] = useState<number>(defaultInflow);
  const [plan, setPlan] = useState<RebalancePlan | null>(null);

  const isFresh = !portfolio || !portfolio.holdings || portfolio.holdings.length === 0;

  useEffect(() => {
    if (!portfolio || portfolio.holdings.length === 0) {
      setPlan(null);
      return;
    }

    // Convert display currency input back to base IDR for pure calculation
    const usdRate = portfolio.usdIdrRate || 15850.0;
    const nominalInflowIdr = currency === 'USD' ? inflowInput * usdRate : inflowInput;

    const holdingsInput: HoldingInput[] = portfolio.holdings.map((h) => ({
      assetCode: h.assetCode,
      units: h.units,
      currentPrice: h.currentPrice,
    }));

    const targets = portfolio.targetAllocations;

    if (mode === 'FULL') {
      const result = calculateFullRebalance(holdingsInput, targets, 0.05);
      setPlan(result);
    } else {
      const result = calculateZeroSellInflowRebalance(
        holdingsInput,
        targets,
        nominalInflowIdr,
        0.05
      );
      setPlan(result);
    }
  }, [portfolio, mode, inflowInput, currency]);

  const btcAllocation = plan?.allocations.find((a) => a.assetCode === 'CRYPTO_BTC');

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
              <Scale className="h-3.5 w-3.5" />
              <span>{dict.rebalancer.engineBadge}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {dict.rebalancer.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {dict.rebalancer.subtitle}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setMode('ZERO_SELL_INFLOW')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'ZERO_SELL_INFLOW'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>{dict.rebalancer.modeZeroSell}</span>
            </button>
            <button
              onClick={() => setMode('FULL')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'FULL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>{dict.rebalancer.modeFull}</span>
            </button>
          </div>
        </div>

        {/* Highlight Banner depending on Mode */}
        {isFresh ? (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/20 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-blue-700 dark:text-blue-300">
                  {language === 'id' ? 'Portofolio Fresh (Belum Ada Aset Terdaftar)' : 'Fresh Portfolio (No Assets Registered Yet)'}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300/90 leading-relaxed max-w-3xl">
                  {language === 'id'
                    ? 'Mesin Smart Rebalancer membutuhkan minimal 1 aset terdaftar untuk memonitor drift dan menjalankan alokasi modal baru tanpa penjualan (Zero-Sell Inflow). Silakan tambahkan aset pertama Anda di Dashboard.'
                    : 'The Smart Rebalancer engine requires at least 1 registered holding to monitor drift deviations and compute tax-smart Zero-Sell Inflow rebalancing. Please add your first asset in the Dashboard.'}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shrink-0 self-start md:self-auto"
            >
              <span>{language === 'id' ? '+ Tambah Aset di Dashboard' : '+ Add Asset in Dashboard'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {mode === 'ZERO_SELL_INFLOW' ? (
              <motion.div
                key="zero-sell"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                      {dict.rebalancer.zeroSellBannerTitle}
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300/90 leading-relaxed max-w-3xl">
                      {language === 'id' ? (
                        <>
                          Dengan mengarahkan modal baru khusus ke aset yang underweight (RDPU, VOO, Emas), bobot aset overweight Bitcoin Anda turun ke{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {btcAllocation ? (btcAllocation.postWeight * 100).toFixed(2) : '24.85'}%
                          </strong>{' '}
                          dengan <strong className="text-slate-900 dark:text-white">0 satoshi yang perlu dijual</strong>.
                        </>
                      ) : (
                        <>
                          By routing your new capital strictly into underweight assets (MMF, VOO, Gold), your overweight Bitcoin position drops from{' '}
                          <strong className="text-slate-900 dark:text-white">27.33%</strong> to{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            {btcAllocation ? (btcAllocation.postWeight * 100).toFixed(2) : '24.85'}%
                          </strong>{' '}
                          with <strong className="text-slate-900 dark:text-white">ZERO satoshis sold</strong>.
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <span>{dict.rebalancer.savedTaxDrag} ~{formatMoney(plan?.taxDragAvoided || 165000)}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-amber-700 dark:text-amber-300">
                      {dict.rebalancer.fullBannerTitle}
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300/90 leading-relaxed max-w-3xl">
                      {dict.rebalancer.fullBannerDesc}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Capital Inflow Controller (Only relevant for Zero-Sell) */}
        {mode === 'ZERO_SELL_INFLOW' && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {dict.rebalancer.inflowTitle}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {dict.rebalancer.inflowDesc}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                    {currency === 'USD' ? '$' : 'Rp'}
                  </span>
                  <input
                    type="number"
                    value={inflowInput}
                    onChange={(e) => setInflowInput(Math.max(0, Number(e.target.value)))}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-4 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-44"
                  />
                </div>
                {/* Preset quick buttons */}
                <div className="hidden md:flex items-center gap-1.5 text-xs">
                  {[
                    { label: currency === 'USD' ? '$500' : 'Rp 5M', val: currency === 'USD' ? 500 : 5000000 },
                    { label: currency === 'USD' ? '$1,000' : 'Rp 15M', val: currency === 'USD' ? 1000 : 15000000 },
                    { label: currency === 'USD' ? '$2,000' : 'Rp 30M', val: currency === 'USD' ? 2000 : 30000000 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setInflowInput(p.val)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{dict.rebalancer.modeCardTitle}</span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {isFresh
                ? (language === 'id' ? 'Zero-Sell (Standby)' : 'Zero-Sell (Standby)')
                : mode === 'ZERO_SELL_INFLOW' ? dict.rebalancer.zeroSellModeLabel : dict.rebalancer.fullModeLabel}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isFresh
                ? (language === 'id' ? 'Siap digunakan' : 'Ready to activate')
                : mode === 'ZERO_SELL_INFLOW' ? dict.rebalancer.zeroLiquidations : dict.rebalancer.selfFinancing}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{dict.rebalancer.totalBought}</span>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {isFresh ? formatMoney(0) : `+${formatMoney(plan?.summary.totalBought || 0)}`}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isFresh
                ? (language === 'id' ? 'Menunggu aset terdaftar' : 'Awaiting registered assets')
                : dict.rebalancer.distributedUnderweight}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{dict.rebalancer.totalLiquidated}</span>
            <div
              className={`text-lg font-extrabold mt-1 ${
                isFresh || plan?.summary.totalSold === 0 ? 'text-slate-400' : 'text-orange-500 dark:text-orange-400'
              }`}
            >
              {isFresh
                ? (language === 'id' ? '0 Unit (Zero Sell)' : '0 Units (Zero Sell)')
                : plan?.summary.totalSold === 0 ? dict.rebalancer.zeroSellSold : `-${formatMoney(plan?.summary.totalSold || 0)}`}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isFresh
                ? (language === 'id' ? 'Tanpa likuidasi paksa' : 'No forced liquidations')
                : mode === 'ZERO_SELL_INFLOW' ? dict.rebalancer.noCapGains : dict.rebalancer.taxableRealization}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">{dict.rebalancer.driftImprovement}</span>
            <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {isFresh ? '0.0%' : `+${plan?.summary.driftReduction.improvementPercentage || 0}%`}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isFresh
                ? (language === 'id' ? 'Deviasi baseline stabil' : 'Stable baseline drift')
                : dict.rebalancer.closerGuardrails}
            </span>
          </div>
        </div>

        {/* Detailed Rebalance Execution Plan Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{dict.rebalancer.execPlanTitle}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{dict.rebalancer.execPlanSubtitle}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Lock className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{dict.rebalancer.btcPrecision}</span>
            </div>
          </div>

          {isFresh || !plan || plan.allocations.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Scale className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'id' ? 'Belum Ada Aset untuk Direbalance' : 'No Assets to Rebalance Yet'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  {language === 'id'
                    ? 'Portofolio Anda saat ini masih bersih (0 aset). Setelah Anda menambahkan aset di Dashboard, rencana eksekusi rebalancing otomatis akan segera dihitung di sini.'
                    : 'Your portfolio is currently clean with 0 assets. Once you add assets in the Dashboard, the automated rebalance plan will be computed here.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <span>{language === 'id' ? '+ Tambah Aset di Dashboard' : '+ Add Asset in Dashboard'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/profiler"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                >
                  <span>{language === 'id' ? 'Kuesioner AI Profiler' : 'AI Profiler Survey'}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-3">{dict.rebalancer.colAsset}</th>
                    <th className="py-3 px-3 text-center">{dict.rebalancer.colAction}</th>
                    <th className="py-3 px-3 text-right">{dict.rebalancer.colNominal}</th>
                    <th className="py-3 px-3 text-right">{dict.rebalancer.colUnits}</th>
                    <th className="py-3 px-3 text-right">{dict.rebalancer.colUnitPrice}</th>
                    <th className="py-3 px-3 text-right">{dict.rebalancer.colPreWeight}</th>
                    <th className="py-3 px-3 text-right">{dict.rebalancer.colPostWeight}</th>
                    <th className="py-3 px-3 text-right">{dict.rebalancer.colTarget}</th>
                    <th className="py-3 px-3 text-right">{dict.rebalancer.colPostDrift}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                  {plan.allocations.map((item) => {
                    const isBuy = item.action === 'BUY';
                    const isSell = item.action === 'SELL';

                    return (
                      <tr key={item.assetCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{item.assetCode}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {item.assetCode === 'MMF_IDR'
                              ? (language === 'id' ? 'Reksadana Pasar Uang (Kas)' : 'Money Market Fund (Cash)')
                              : item.assetCode === 'ETF_VOO'
                              ? 'Vanguard S&P 500 ETF'
                              : item.assetCode === 'GOLD_XAU'
                              ? (language === 'id' ? 'Emas Fisik (XAU)' : 'Gold (XAU)')
                              : (language === 'id' ? 'Bitcoin Cadangan Digital' : 'Bitcoin Digital Reserve')}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                              isBuy
                                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : isSell
                                ? 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {item.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {item.nominalAmount === 0 ? '—' : formatMoney(item.nominalAmount)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-200">
                          {item.unitsDelta === 0
                            ? '0'
                            : `${isBuy ? '+' : isSell ? '-' : ''}${formatUnits(item.assetCode, item.unitsDelta)}`}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                          {formatMoney(item.unitPrice)}
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-500 dark:text-slate-400">
                          {(item.preWeight * 100).toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {(item.postWeight * 100).toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-500 dark:text-slate-400">
                          {(item.targetWeight * 100).toFixed(0)}%
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                              Math.abs(item.postDrift) >= 0.05
                                ? 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {item.postDrift > 0 ? '+' : ''}
                            {(item.postDrift * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
