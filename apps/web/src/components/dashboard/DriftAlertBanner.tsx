'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useLanguage } from '@/context/LanguageContext';

export function DriftAlertBanner() {
  const { portfolio } = usePortfolio();
  const { language } = useLanguage();
  const isEn = language === 'en';

  if (!portfolio?.holdings || portfolio.holdings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-between p-4.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-200 gap-3 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {isEn ? 'Welcome to Your Clean Slate Portfolio!' : 'Selamat Datang di Portofolio Baru Anda!'}
            </h4>
            <p className="text-xs text-blue-800/80 dark:text-blue-200/80">
              {isEn
                ? 'Your account is fresh from 0. Start by completing the AI Risk Profiler or adding your first asset.'
                : 'Akun Anda fresh dari 0. Mulai isi kuesioner profil risiko AI atau tambahkan aset pertama Anda.'}
            </p>
          </div>
        </div>
        <Link
          href="/profiler"
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-500/20 hover:scale-[1.02]"
        >
          <span>{isEn ? 'Start Risk Profiler' : 'Mulai Profil Risiko'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>
    );
  }

  if (!portfolio?.hasActiveDriftAlert) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">
              {isEn ? 'Portfolio Balanced Within Guardrails' : 'Portofolio Seimbang dalam Batas Guardrail'}
            </h4>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-200/80">
              {isEn
                ? 'All asset classes are currently within their allowable +/- 5.0% allocation bands.'
                : 'Semua kelas aset saat ini berada dalam rentang toleransi alokasi +/- 5.0%.'}
            </p>
          </div>
        </div>
        <Link
          href="/rebalancer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 transition-colors"
        >
          <span>{isEn ? 'Simulate Inflow' : 'Simulasi Inflow'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>
    );
  }

  const btcHolding = portfolio.holdings.find((h) => h.assetCode === 'CRYPTO_BTC');
  const btcDrift = btcHolding ? btcHolding.driftPercentage : 7.33;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-orange-300 dark:border-orange-500/40 bg-gradient-to-r from-orange-50 dark:from-orange-950/40 via-amber-50 dark:via-amber-950/30 to-white dark:to-slate-900/60 p-4 md:p-5 shadow-lg shadow-orange-500/5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 text-[11px] font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider border border-orange-200 dark:border-orange-500/30">
                {isEn ? 'Active Drift Alert' : 'Peringatan Drift Aktif'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{isEn ? 'Threshold: ±5.0%' : 'Ambang Batas: ±5.0%'}</span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Bitcoin has drifted to{' '}
              <span className="text-orange-600 dark:text-orange-400 font-extrabold">
                {btcHolding ? (btcHolding.currentWeight * 100).toFixed(1) : '27.3'}%
              </span>{' '}
              (+{btcDrift.toFixed(1)}% {isEn ? 'above 20.0% target' : 'di atas target 20.0%'})
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300/90 leading-relaxed max-w-2xl">
              {isEn
                ? 'High-beta crypto expansion has skewed your risk profile. Use our "Zero-Sell" Inflow Rebalancer to re-align your portfolio using new monthly capital without triggering capital gains taxes or broker trading fees.'
                : 'Ekspansi aset kripto beta tinggi telah menggeser profil risiko Anda. Gunakan Rebalancer Inflow "Zero-Sell" kami untuk menyelaraskan kembali portofolio menggunakan modal bulanan baru tanpa memicu pajak capital gain atau biaya transaksi.'}
            </p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/rebalancer"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs px-4 py-2.5 transition-all shadow-md shadow-orange-600/30 shrink-0 cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            <span>{isEn ? 'Launch Zero-Sell Rebalancer' : 'Buka Zero-Sell Rebalancer'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}