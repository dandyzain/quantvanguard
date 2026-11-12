'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/context/PortfolioContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { AddAssetModal } from './AddAssetModal';

export function HoldingsTable() {
  const { portfolio, formatMoney, formatUnits, removeHolding } = usePortfolio();
  const { dict, language } = useLanguage();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const holdings = portfolio?.holdings || [];

  const handleDelete = async (assetCode: string) => {
    const confirmMsg =
      language === 'id'
        ? `Yakin ingin menghapus aset ${assetCode} dari portofolio?`
        : `Are you sure you want to delete ${assetCode} from your portfolio?`;
    if (confirm(confirmMsg)) {
      setDeletingCode(assetCode);
      await removeHolding(assetCode);
      setDeletingCode(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-sm overflow-hidden shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-4 gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Holdings & Asset Drift Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Position Details, Precision Units & Guardrail Status</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{dict.dashboard.addAsset}</span>
            </button>
            <Link
              href="/rebalancer"
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm"
            >
              <span>{dict.nav.rebalancer}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {holdings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{dict.dashboard.emptyHoldingsTitle}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
              {dict.dashboard.emptyHoldingsDesc}
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{dict.dashboard.addAsset}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3 text-right">Units Held</th>
                  <th className="py-3 px-3 text-right">Current Price</th>
                  <th className="py-3 px-3 text-right">Total Valuation</th>
                  <th className="py-3 px-3 text-right">Current Weight</th>
                  <th className="py-3 px-3 text-right">Target Weight</th>
                  <th className="py-3 px-3 text-right">Drift Delta</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {holdings.map((h) => {
                  const isAlert = h.isAlertTriggered;

                  return (
                    <tr key={h.assetCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: h.color }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{h.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{h.assetCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-200">
                        {formatUnits(h.assetCode, h.units)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatMoney(h.currentPrice)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatMoney(h.currentValue)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {(h.currentWeight * 100).toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-500 dark:text-slate-400">
                        {(h.targetWeight * 100).toFixed(0)}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${
                            isAlert
                              ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                              : h.drift > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : h.drift < 0
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-500 dark:text-slate-300'
                          }`}
                        >
                          {h.drift > 0 ? '+' : ''}
                          {(h.drift * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {isAlert ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-500/20">
                            <AlertTriangle className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
                            <span>Drift Alert</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                            <span>Aligned</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleDelete(h.assetCode)}
                          disabled={deletingCode === h.assetCode}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Hapus aset dari portofolio"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AddAssetModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}
