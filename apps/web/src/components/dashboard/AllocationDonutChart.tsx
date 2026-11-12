'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePortfolio } from '@/context/PortfolioContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export function AllocationDonutChart() {
  const { portfolio, formatMoney, formatPct } = usePortfolio();
  const { language } = useLanguage();
  const { theme } = useTheme();

  const holdings = portfolio?.holdings || [];

  const chartData = holdings.map((h) => ({
    name: h.name,
    assetCode: h.assetCode,
    value: h.currentValue,
    currentWeight: h.currentWeight,
    targetWeight: h.targetWeight,
    drift: h.drift,
    color: h.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-1">
          <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            {data.name}
          </div>
          <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between gap-4">
              <span>{language === 'id' ? 'Valuasi Pasar:' : 'Valuation:'}</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatMoney(data.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>{language === 'id' ? 'Bobot Saat Ini:' : 'Current Weight:'}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {(data.currentWeight * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>{language === 'id' ? 'Bobot Target:' : 'Target Weight:'}</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {(data.targetWeight * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Drift:</span>
              <span
                className={`font-bold ${
                  data.drift > 0 ? 'text-orange-500 dark:text-orange-400' : data.drift < 0 ? 'text-blue-500 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {data.drift > 0 ? '+' : ''}
                {(data.drift * 100).toFixed(1)}%
              </span>
            </div>
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
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {language === 'id' ? 'Alokasi Multi-Aset' : 'Multi-Asset Allocation'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'id'
              ? 'Distribusi Portofolio Riil vs. Batas Target Guardrail'
              : 'Current Distribution vs. Target Guardrails'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {language === 'id' ? 'Total Aset' : 'Total Assets'}
          </span>
          <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
            {holdings.length > 0
              ? `${holdings.length} ${language === 'id' ? 'Aset' : 'Assets'}`
              : `0 ${language === 'id' ? 'Aset' : 'Assets'}`}
          </div>
        </div>
      </div>

      {holdings.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl my-4">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-300">
            {language === 'id' ? 'Belum Ada Distribusi Aset' : 'No Asset Distribution Yet'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === 'id'
              ? 'Grafik alokasi donat akan terisi secara dinamis saat Anda memasukkan aset pertama.'
              : 'The donut chart will populate dynamically as soon as you record your first asset holding.'}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart */}
        <div className="md:col-span-5 h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                innerRadius={62}
                outerRadius={88}
                paddingAngle={4}
                dataKey="value"
                stroke={theme === 'dark' ? '#0f172a' : '#ffffff'}
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Donut Stat */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {language === 'id' ? 'Alokasi' : 'Allocation'}
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white">100%</span>
          </div>
        </div>

        {/* Weights & Drift Bars */}
        <div className="md:col-span-7 space-y-3.5">
          {chartData.map((asset) => {
            const isAlert = Math.abs(asset.drift) >= 0.05;
            return (
              <div key={asset.assetCode} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{asset.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-400">
                      {language === 'id' ? 'Aktual:' : 'Actual:'}{' '}
                      <strong className="text-slate-900 dark:text-white">{(asset.currentWeight * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="text-slate-500">
                      Target: {(asset.targetWeight * 100).toFixed(0)}%
                    </span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        isAlert
                          ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {asset.drift > 0 ? '+' : ''}
                      {(asset.drift * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Comparative Progress Bar */}
                <div className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, asset.currentWeight * 100)}%`,
                      backgroundColor: asset.color,
                    }}
                  />
                  {/* Target Marker Needle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-slate-900 dark:bg-white shadow-sm z-10"
                    style={{ left: `${asset.targetWeight * 100}%` }}
                    title={`Target: ${(asset.targetWeight * 100).toFixed(0)}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </motion.div>
  );
}
