'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { usePortfolio } from '@/context/PortfolioContext';
import { useLanguage } from '@/context/LanguageContext';

export function PerformanceAreaChart() {
  const { portfolio, formatMoney, currency } = usePortfolio();
  const { language } = useLanguage();

  const snapshots = portfolio?.historicalSnapshots || [];

  const chartData = snapshots.map((s) => {
    // Format "2026-03-01" to "Mar '26"
    const d = new Date(s.date);
    const monthShort = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      year: '2-digit',
    });
    return {
      date: monthShort,
      totalValue: s.totalValue,
      costBasis: s.totalCostBasis,
      profit: s.totalValue - s.totalCostBasis,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const cost = payload[1]?.value || 0;
      const gain = val - cost;
      const gainPct = cost > 0 ? (gain / cost) * 100 : 0;

      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-1.5">
          <div className="font-bold text-slate-900 dark:text-white text-sm pb-1 border-b border-slate-100 dark:border-slate-800">
            {label} {language === 'id' ? 'Snapshot Portofolio' : 'Snapshot'}
          </div>
          <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
            <span>{language === 'id' ? 'Valuasi Portofolio:' : 'Portfolio Valuation:'}</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{formatMoney(val)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400">
            <span>{language === 'id' ? 'Modal Pokok Terinvestasi:' : 'Invested Principal:'}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{formatMoney(cost)}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>{language === 'id' ? 'Keuntungan Belum Direalisasi:' : 'Unrealized Gain:'}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +{formatMoney(gain)} (+{gainPct.toFixed(1)}%)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {language === 'id' ? 'Lintasan Portofolio 12 Bulan' : '12-Month Portfolio Trajectory'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'id'
              ? 'Valuasi Historis vs. Modal Pokok Terinvestasi'
              : 'Historical Net Worth vs. Invested Capital'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-700 dark:text-slate-300">
              {language === 'id' ? 'Nilai Portofolio' : 'Net Worth'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="text-slate-500 dark:text-slate-400">
              {language === 'id' ? 'Modal Pokok' : 'Cost Basis'}
            </span>
          </div>
        </div>
      </div>

      {!portfolio?.holdings || portfolio.holdings.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl text-center p-4">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-300">
            {language === 'id' ? 'Belum Ada Histori Performa' : 'No Performance History Yet'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
            {language === 'id'
              ? 'Grafik lintasan 12 bulan akan mulai tercatat saat Anda menambahkan kepemilikan aset pertama.'
              : 'The 12-month trajectory chart will begin logging once you record your first asset holding.'}
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  if (currency === 'USD') return `$${Math.round(v / 1000)}k`;
                  return `Rp ${Math.round(v / 1000000)}M`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalValue"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#valueGradient)"
              />
              <Area
                type="monotone"
                dataKey="costBasis"
                stroke="#64748B"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#costGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
