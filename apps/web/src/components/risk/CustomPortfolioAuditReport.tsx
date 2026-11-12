'use client';

import React from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Wallet,
  TrendingUp,
  Activity,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  PieChart,
  ShieldAlert,
} from 'lucide-react';
import { CustomPortfolioAuditOutput } from '@/lib/types';
import { soundManager } from '@/lib/audio/soundEffects';

interface CustomPortfolioAuditReportProps {
  auditResult: CustomPortfolioAuditOutput | null;
  onApplyPortfolio: () => void;
  appliedSuccess: boolean;
  onRunAudit: () => void;
  auditing: boolean;
  holdingsCount: number;
  totalWeight: number;
  horizonYears: number;
  isEn?: boolean;
}

export function CustomPortfolioAuditReport({
  auditResult,
  onApplyPortfolio,
  appliedSuccess,
  onRunAudit,
  auditing,
  holdingsCount,
  totalWeight,
  horizonYears,
  isEn = false,
}: CustomPortfolioAuditReportProps) {
  // If awaiting diagnosis
  if (!auditResult) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {isEn ? 'AI Portfolio Doctor' : 'AI Portofolio Doctor'}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isEn ? 'Awaiting Portfolio Audit' : 'Menunggu Audit Portofolio Kustom'}
              </h3>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-extrabold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            {isEn ? 'Audit Ready' : 'Siap Diaudit'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isEn
              ? 'The AI Portfolio Doctor will analyze your custom asset basket against your investment horizon, income, and living expenses to diagnose potential vulnerabilities.'
              : 'AI Portfolio Doctor akan mendiagnosis kelayakan keranjang portofolio kustom Anda terhadap horison waktu, penghasilan bulanan, dan kebutuhan likuiditas hidup Anda.'}
          </p>

          <div className="space-y-2 pt-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>{isEn ? 'Strengths & Edge:' : 'Kelebihan & Kekuatan:'}</strong>{' '}
                {isEn
                  ? 'Compounding power, asset diversification, and yield capture.'
                  : 'Efisiensi compounding, diversifikasi aset, dan potensi arus kas dividen/kupon.'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">⚠</span>
              <span>
                <strong>{isEn ? 'Weaknesses & Red Flags:' : 'Kekurangan & Risiko Tersembunyi:'}</strong>{' '}
                {isEn
                  ? 'Horizon mismatches, emergency fund deficits, and concentration.'
                  : 'Deteksi aset terlalu volatil untuk horison pendek, kekurangan dana darurat, dan konsentrasi berlebih.'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">🎯</span>
              <span>
                <strong>{isEn ? 'Actionable Recommendations:' : 'Rekomendasi Konkret:'}</strong>{' '}
                {isEn
                  ? 'Refined steps to optimize risk-adjusted returns without overriding your preferences.'
                  : 'Langkah perbaikan presisi untuk menjaga stabilitas portofolio Anda.'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick parameters summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Aset</span>
            <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
              {holdingsCount}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Bobot</span>
            <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
              {totalWeight}%
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Horison</span>
            <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
              {horizonYears} Thn
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onRunAudit}
          disabled={auditing || holdingsCount === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Stethoscope className={`h-4 w-4 ${auditing ? 'animate-spin' : ''}`} />
          <span>
            {auditing
              ? isEn
                ? 'Synthesizing with AI Doctor...'
                : 'Mendiagnosis dengan AI Doctor...'
              : isEn
              ? 'Run AI Portfolio Doctor Audit'
              : 'Jalankan Audit AI Portofolio Doctor'}
          </span>
        </button>
      </div>
    );
  }

  // ── AUDIT RESULT DISPLAY ──
  const {
    healthScore,
    healthStatus,
    strengths,
    weaknesses,
    horizonAlignmentVerdict,
    incomeCashflowVerdict,
    metrics,
    recommendations,
    normalizedHoldings,
  } = auditResult;

  const badgeColor =
    healthStatus === 'EXCELLENT'
      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      : healthStatus === 'GOOD'
      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
      : healthStatus === 'NEEDS_ATTENTION'
      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';

  const badgeLabel =
    healthStatus === 'EXCELLENT'
      ? isEn ? 'EXCELLENT HEALTH' : 'KESEHATAN PRIMA'
      : healthStatus === 'GOOD'
      ? isEn ? 'GOOD HEALTH' : 'KESEHATAN BAIK'
      : healthStatus === 'NEEDS_ATTENTION'
      ? isEn ? 'NEEDS ATTENTION' : 'PERLU PERHATIAN'
      : isEn ? 'CRITICAL RISK' : 'RISIKO TINGGI';

  return (
    <div className="space-y-5">
      {/* 1. Health Score & Badge Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {isEn ? 'AI Portfolio Doctor Audit Report' : 'Laporan Audit AI Portofolio Doctor'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isEn ? 'Portfolio Diagnostic Verdict' : 'Hasil Diagnosis Portofolio Kustom'}
              </h3>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full border text-xs font-black tracking-wide ${badgeColor}`}>
            {badgeLabel}
          </span>
        </div>

        {/* Health Score Gauge Display */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-slate-50 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              {isEn ? 'Institutional Health Score' : 'Skor Kesehatan Portofolio'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {healthScore}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isEn ? 'Audited Assets' : 'Aset Diselaraskan'}
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
              {normalizedHoldings.length} Instrumen
            </span>
          </div>
        </div>

        {/* 2. Kelebihan Portofolio (Strengths) */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/25 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>{isEn ? 'Key Strengths & Advantages:' : 'Kelebihan & Kekuatan Portofolio:'}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Kekurangan & Risiko Tersembunyi (Weaknesses & Red Flags) */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-500/25 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <AlertTriangle className="h-4 w-4" />
            <span>{isEn ? 'Weaknesses & Hidden Risks:' : 'Kekurangan & Risiko Tersembunyi:'}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Horizon Alignment Verdict */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-500/20 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
            <Clock className="h-3.5 w-3.5" />
            <span>{isEn ? 'Time Horizon Alignment:' : 'Kesesuaian Horison Waktu:'}</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
            {horizonAlignmentVerdict}
          </p>
        </div>

        {/* 5. Cashflow & Emergency Buffer Verdict */}
        <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/20 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
            <Wallet className="h-3.5 w-3.5" />
            <span>{isEn ? 'Cashflow & Emergency Buffer:' : 'Ketahanan Kas & Likuiditas:'}</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
            {incomeCashflowVerdict}
          </p>
        </div>

        {/* 6. Projected Quantitative Metrics Grid */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            {isEn ? 'Projected Financial Metrics:' : 'Proyeksi Metrik Finansial Riil:'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
            {/* CAGR */}
            <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Estimasi Return</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                +{(metrics.expectedCagr * 100).toFixed(1)}% / thn
              </span>
            </div>

            {/* Volatility */}
            <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Volatilitas</span>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                ~{(metrics.annualVolatility * 100).toFixed(0)}%
              </span>
            </div>

            {/* Monthly Passive Income */}
            <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Arus Kas Pasif</span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5 block truncate">
                Rp {Math.round(metrics.estimatedMonthlyPassiveIncome).toLocaleString('id-ID')}/bln
              </span>
            </div>

            {/* Emergency Fund */}
            <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Dana Darurat</span>
              <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
                {metrics.liquidityBufferMonths.toFixed(1)} Bulan
              </span>
            </div>

            {/* Stress Drawdown */}
            <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Stres Drawdown</span>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                {(metrics.maxDrawdownStressEstimate * 100).toFixed(1)}%
              </span>
            </div>

            {/* Sharpe Ratio */}
            <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Sharpe Ratio</span>
              <span className="text-xs font-black text-purple-600 dark:text-purple-400 mt-0.5 block">
                {metrics.sharpeRatioEstimate.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 7. Actionable Recommendations */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/25 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
            <Sparkles className="h-4 w-4" />
            <span>{isEn ? 'Actionable AI Recommendations:' : 'Rekomendasi Tindakan Konkret dari AI:'}</span>
          </div>
          <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside">
            {recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="leading-relaxed">
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 8. Normalized Target Holdings Breakdown */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{isEn ? 'Normalized Target Allocation (100% Total)' : 'Alokasi Portofolio yang Diselaraskan (Total 100%)'}</span>
          </div>

          <div className="space-y-2">
            {normalizedHoldings.map((h) => (
              <div key={h.assetCode} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                    <span className="font-bold text-slate-900 dark:text-white">{h.ticker}</span>
                    <span className="text-slate-400 text-[11px]">({h.name})</span>
                  </div>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                    {(h.weight * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, h.weight * 100)}%`,
                      backgroundColor: h.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 9. Apply Button */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={onApplyPortfolio}
            className={`w-full py-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              appliedSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-600/25 hover:scale-[1.01]'
            }`}
          >
            {appliedSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {isEn
                    ? 'Applied to Portfolio & Smart Rebalancer!'
                    : 'Portofolio Kustom Berhasil Diterapkan ke Smart Rebalancer!'}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {isEn
                    ? 'Apply Custom Portfolio to My Account'
                    : 'Terapkan Portofolio Kustom Ini ke Akun Saya'}
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-end pt-1">
            <Link
              href="/rebalancer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
            >
              <span>{isEn ? 'Open Smart Rebalancer' : 'Buka Smart Rebalancer'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
