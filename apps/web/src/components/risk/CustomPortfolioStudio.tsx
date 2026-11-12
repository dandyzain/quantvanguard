'use client';

import React from 'react';
import {
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Scale,
  Zap,
  Target,
  Wallet,
  Clock,
  RotateCcw,
  Stethoscope,
  Info,
  DollarSign,
  Layers,
} from 'lucide-react';
import { CustomPortfolioHoldingInput } from '@/lib/types';
import { soundManager } from '@/lib/audio/soundEffects';

interface CustomPortfolioStudioProps {
  holdings: CustomPortfolioHoldingInput[];
  onUpdateHoldings: (holdings: CustomPortfolioHoldingInput[]) => void;
  onOpenAssetPicker: () => void;
  horizonYears: number;
  onChangeHorizonYears: (val: number) => void;
  monthlyIncome: number;
  onChangeMonthlyIncome: (val: number) => void;
  monthlyExpenses: number;
  onChangeMonthlyExpenses: (val: number) => void;
  simulatedCapital: number;
  onChangeSimulatedCapital: (val: number) => void;
  primaryGoal: string;
  onChangePrimaryGoal: (val: string) => void;
  userNotes: string;
  onChangeUserNotes: (val: string) => void;
  onRunAudit: () => void;
  auditing: boolean;
  isEn?: boolean;
}

export function CustomPortfolioStudio({
  holdings,
  onUpdateHoldings,
  onOpenAssetPicker,
  horizonYears,
  onChangeHorizonYears,
  monthlyIncome,
  onChangeMonthlyIncome,
  monthlyExpenses,
  onChangeMonthlyExpenses,
  simulatedCapital,
  onChangeSimulatedCapital,
  primaryGoal,
  onChangePrimaryGoal,
  userNotes,
  onChangeUserNotes,
  onRunAudit,
  auditing,
  isEn = false,
}: CustomPortfolioStudioProps) {
  const totalWeight = Math.round(holdings.reduce((sum, h) => sum + h.weight, 0) * 10) / 10;
  const isWeightValid = Math.abs(totalWeight - 100) < 0.05;

  const handleAutoBalance = () => {
    soundManager.playClick();
    if (holdings.length === 0) return;
    const currentSum = holdings.reduce((sum, h) => sum + h.weight, 0);
    if (currentSum === 0) {
      const equal = Math.round((100 / holdings.length) * 10) / 10;
      onUpdateHoldings(holdings.map((h) => ({ ...h, weight: equal })));
      return;
    }
    const normalized = holdings.map((h) => ({
      ...h,
      weight: Math.round((h.weight / currentSum) * 1000) / 10,
    }));
    onUpdateHoldings(normalized);
  };

  const handleEqualWeights = () => {
    soundManager.playClick();
    if (holdings.length === 0) return;
    const equal = Math.round((100 / holdings.length) * 10) / 10;
    onUpdateHoldings(holdings.map((h) => ({ ...h, weight: equal })));
  };

  const handleRemoveAsset = (code: string) => {
    soundManager.playClick();
    onUpdateHoldings(holdings.filter((h) => h.assetCode !== code));
  };

  const handleUpdateAssetWeight = (code: string, newWeight: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newWeight * 10) / 10));
    onUpdateHoldings(
      holdings.map((h) => (h.assetCode === code ? { ...h, weight: clamped } : h))
    );
  };

  const applyTemplate = (
    type: 'BALANCED' | 'ALL_WEATHER' | 'HIGH_DIVIDEND' | 'TECH_GROWTH' | 'CLEAR'
  ) => {
    soundManager.playClick();
    if (type === 'CLEAR') {
      onUpdateHoldings([]);
      return;
    }
    if (type === 'BALANCED') {
      onUpdateHoldings([
        {
          assetCode: 'MMF_IDR',
          ticker: 'MMF_IDR',
          name: 'Money Market Fund (RDPU)',
          category: 'MONEY_MARKET',
          weight: 35,
          color: '#10B981',
        },
        {
          assetCode: 'IDX_BBCA',
          ticker: 'BBCA',
          name: 'Bank Central Asia Tbk',
          category: 'INDONESIAN_EQUITY',
          weight: 20,
          color: '#3B82F6',
        },
        {
          assetCode: 'ETF_VOO',
          ticker: 'VOO',
          name: 'Vanguard S&P 500 ETF',
          category: 'US_EQUITY',
          weight: 25,
          color: '#6366F1',
        },
        {
          assetCode: 'GOLD_XAU',
          ticker: 'XAU',
          name: 'Physical Gold Bullion',
          category: 'COMMODITY',
          weight: 10,
          color: '#EAB308',
        },
        {
          assetCode: 'CRYPTO_BTC',
          ticker: 'BTC',
          name: 'Bitcoin Digital Reserve',
          category: 'CRYPTO',
          weight: 10,
          color: '#F97316',
        },
      ]);
      onChangePrimaryGoal('BALANCED_GROWTH');
      onChangeHorizonYears(7);
    } else if (type === 'ALL_WEATHER') {
      onUpdateHoldings([
        {
          assetCode: 'SBN_FR0100',
          ticker: 'FR0100',
          name: 'Surat Berharga Negara FR0100',
          category: 'FIXED_INCOME',
          weight: 35,
          color: '#0EA5E9',
        },
        {
          assetCode: 'ETF_VOO',
          ticker: 'VOO',
          name: 'Vanguard S&P 500 ETF',
          category: 'US_EQUITY',
          weight: 30,
          color: '#3B82F6',
        },
        {
          assetCode: 'GOLD_XAU',
          ticker: 'XAU',
          name: 'Physical Gold Bullion',
          category: 'COMMODITY',
          weight: 15,
          color: '#EAB308',
        },
        {
          assetCode: 'COMMODITY_BRENT',
          ticker: 'BRENT',
          name: 'Brent Crude Oil Spot',
          category: 'COMMODITY',
          weight: 10,
          color: '#D97706',
        },
        {
          assetCode: 'MMF_IDR',
          ticker: 'MMF_IDR',
          name: 'Money Market Fund (RDPU)',
          category: 'MONEY_MARKET',
          weight: 10,
          color: '#10B981',
        },
      ]);
      onChangePrimaryGoal('CAPITAL_PRESERVATION');
      onChangeHorizonYears(10);
    } else if (type === 'HIGH_DIVIDEND') {
      onUpdateHoldings([
        {
          assetCode: 'IDX_BBRI',
          ticker: 'BBRI',
          name: 'Bank Rakyat Indonesia Tbk',
          category: 'INDONESIAN_EQUITY',
          weight: 25,
          color: '#2563EB',
        },
        {
          assetCode: 'IDX_BMRI',
          ticker: 'BMRI',
          name: 'Bank Mandiri Tbk',
          category: 'INDONESIAN_EQUITY',
          weight: 20,
          color: '#1D4ED8',
        },
        {
          assetCode: 'IDX_UNTR',
          ticker: 'UNTR',
          name: 'United Tractors Tbk',
          category: 'INDONESIAN_EQUITY',
          weight: 15,
          color: '#F59E0B',
        },
        {
          assetCode: 'SBN_ORI025',
          ticker: 'ORI025',
          name: 'Obligasi Ritel Indonesia ORI025',
          category: 'FIXED_INCOME',
          weight: 25,
          color: '#06B6D4',
        },
        {
          assetCode: 'MMF_IDR',
          ticker: 'MMF_IDR',
          name: 'Money Market Fund (RDPU)',
          category: 'MONEY_MARKET',
          weight: 15,
          color: '#10B981',
        },
      ]);
      onChangePrimaryGoal('PASSIVE_DIVIDEND_INCOME');
      onChangeHorizonYears(5);
    } else if (type === 'TECH_GROWTH') {
      onUpdateHoldings([
        {
          assetCode: 'ETF_QQQ',
          ticker: 'QQQ',
          name: 'Invesco QQQ Trust (Nasdaq 100)',
          category: 'US_EQUITY',
          weight: 30,
          color: '#8B5CF6',
        },
        {
          assetCode: 'US_NVDA',
          ticker: 'NVDA',
          name: 'NVIDIA Corporation',
          category: 'US_EQUITY',
          weight: 25,
          color: '#10B981',
        },
        {
          assetCode: 'US_AAPL',
          ticker: 'AAPL',
          name: 'Apple Inc.',
          category: 'US_EQUITY',
          weight: 15,
          color: '#64748B',
        },
        {
          assetCode: 'CRYPTO_BTC',
          ticker: 'BTC',
          name: 'Bitcoin Digital Reserve',
          category: 'CRYPTO',
          weight: 15,
          color: '#F97316',
        },
        {
          assetCode: 'CRYPTO_ETH',
          ticker: 'ETH',
          name: 'Ethereum Smart Contract Network',
          category: 'CRYPTO',
          weight: 10,
          color: '#6366F1',
        },
        {
          assetCode: 'MMF_IDR',
          ticker: 'MMF_IDR',
          name: 'Money Market Fund (RDPU)',
          category: 'MONEY_MARKET',
          weight: 5,
          color: '#10B981',
        },
      ]);
      onChangePrimaryGoal('AGGRESSIVE_WEALTH_ACCUMULATION');
      onChangeHorizonYears(12);
    }
  };

  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRatePct = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* ── Studio Header & Template Presets ── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Sliders className="h-4 w-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isEn ? 'Custom Portfolio Studio & Financial Profile' : 'Studio Portofolio Kustom & Finansial Pribadi'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {isEn
                ? 'Select any combination of assets, tune your target percentages, and input your real financial horizon & cashflow.'
                : 'Pilih bebas aset investasi Anda, atur persentase alokasi target, serta masukkan profil finansial (horison, penghasilan, pengeluaran). AI Doctor akan mengaudit kelayakan portofolio secara komprehensif.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => applyTemplate('CLEAR')}
            className="text-[11px] font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{isEn ? 'Reset (Fresh 0)' : 'Reset (Fresh dari Nol)'}</span>
          </button>
        </div>

        {/* Template Starter Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {isEn ? 'Quick Starter Templates (Optional):' : 'Templat Portofolio Instan (Opsional):'}
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => applyTemplate('BALANCED')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <span>🛡️</span>
              <span>{isEn ? 'Balanced Growth (5 Assets)' : 'Pertumbuhan Seimbang (5 Aset)'}</span>
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('ALL_WEATHER')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-500 transition-all font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <span>🌐</span>
              <span>{isEn ? 'Ray Dalio All-Weather' : 'Ray Dalio All-Weather'}</span>
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('HIGH_DIVIDEND')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-amber-500 dark:hover:border-amber-500 transition-all font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <span>💰</span>
              <span>{isEn ? 'High Dividend Beast' : 'Dividen Jumbo & Arus Kas'}</span>
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('TECH_GROWTH')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-purple-500 dark:hover:border-purple-500 transition-all font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <span>🚀</span>
              <span>{isEn ? 'US Tech & Alpha' : 'US Tech & Alpha Compounding'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── BAGIAN 1: KERANJANG ASET INVESTASI PILIHAN USER ── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              1
            </span>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {isEn ? 'Selected Investment Assets & Weights' : 'Keranjang Aset Investasi & Alokasi Bobot'}
            </h4>
          </div>

          {/* Allocation balance status & Auto-balance tools */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                isWeightValid
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              Total: {totalWeight}%
            </span>
            <button
              type="button"
              onClick={handleAutoBalance}
              title={isEn ? 'Normalize weights to exactly 100%' : 'Otomatis sesuaikan rasio ke 100%'}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Zap className="h-3 w-3 text-amber-500" />
              <span>{isEn ? 'Auto-100%' : 'Auto-100%'}</span>
            </button>
            <button
              type="button"
              onClick={handleEqualWeights}
              title={isEn ? 'Distribute weights equally' : 'Bagi bobot rata ke semua aset'}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Scale className="h-3 w-3 text-blue-500" />
              <span>{isEn ? 'Equal' : 'Bagi Rata'}</span>
            </button>
          </div>
        </div>

        {/* Selected Holdings Card List */}
        {holdings.length === 0 ? (
          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
            <Layers className="h-10 w-10 text-slate-400 mx-auto opacity-50" />
            <div>
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                {isEn ? 'No Assets Selected Yet (Fresh State)' : 'Belum Ada Aset yang Dipilih (Portofolio Kosong)'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {isEn
                  ? 'Add assets from the 48-asset catalog or choose a starter template above to build your custom portfolio.'
                  : 'Pilih instrumen dari katalog 48 aset investasi di bawah atau pilih templat instan di atas untuk memulai simulasi.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenAssetPicker();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isEn ? 'Browse 48 Assets in Catalog' : 'Buka Katalog 48 Aset Investasi'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((holding) => (
              <div
                key={holding.assetCode}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: holding.color || '#3B82F6' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {holding.ticker}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {(holding.category || 'ASSET').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {holding.name}
                      </div>
                    </div>
                  </div>

                  {/* Weight direct input & Remove button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 shadow-sm">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={holding.weight}
                        onChange={(e) =>
                          handleUpdateAssetWeight(holding.assetCode, parseFloat(e.target.value) || 0)
                        }
                        className="w-12 text-right font-black text-xs text-slate-900 dark:text-white focus:outline-none bg-transparent"
                      />
                      <span className="text-[11px] font-bold text-slate-400">%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAsset(holding.assetCode)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                      title={isEn ? 'Remove asset' : 'Hapus aset dari portofolio'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <div className="pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={holding.weight}
                    onChange={(e) =>
                      handleUpdateAssetWeight(holding.assetCode, parseFloat(e.target.value) || 0)
                    }
                    className="w-full accent-blue-600 dark:accent-blue-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            ))}

            {/* Add Asset Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenAssetPicker();
              }}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-50/50 dark:bg-slate-950/20"
            >
              <Plus className="h-4 w-4" />
              <span>{isEn ? '+ Add Asset from 48-Asset Catalog' : '+ Tambah Aset dari Katalog (48 Aset)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── BAGIAN 2: PROFIL FINANSIAL & HORISON WAKTU ── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-bold">
            2
          </span>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {isEn ? 'Financial Balance Sheet & Life Goals' : 'Profil Finansial, Horison Waktu & Arus Kas'}
          </h4>
        </div>

        {/* 1. Investment Horizon */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              {isEn ? 'Investment Time Horizon:' : 'Tujuan Investasi (Horison Waktu):'}
            </span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono text-sm">
              {horizonYears} {isEn ? 'Years' : 'Tahun'}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={horizonYears}
            onChange={(e) => onChangeHorizonYears(parseInt(e.target.value) || 1)}
            className="w-full accent-blue-600 dark:accent-blue-500 cursor-pointer"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {[
              { val: 3, label: '3 Thn (Pendek)' },
              { val: 7, label: '7 Thn (Menengah)' },
              { val: 12, label: '12 Thn (Pensiun Sejahtera)' },
              { val: 20, label: '20+ Thn (Generational)' },
            ].map((chip) => (
              <button
                key={chip.val}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onChangeHorizonYears(chip.val);
                }}
                className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                  horizonYears === chip.val
                    ? 'border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Monthly Income & Monthly Expenses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Income */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              {isEn ? 'Monthly Income (IDR):' : 'Penghasilan Bulanan (Rp):'}
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="500000"
                value={monthlyIncome}
                onChange={(e) => onChangeMonthlyIncome(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1 text-[10px]">
              {[5000000, 15000000, 30000000, 60000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onChangeMonthlyIncome(amt)}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer hover:border-slate-400"
                >
                  {(amt / 1000000).toFixed(0)} Jt
                </button>
              ))}
            </div>
          </div>

          {/* Expenses */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              {isEn ? 'Monthly Expenses (IDR):' : 'Pengeluaran Bulanan (Rp):'}
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="500000"
                value={monthlyExpenses}
                onChange={(e) => onChangeMonthlyExpenses(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1 text-[10px]">
              {[3000000, 8000000, 15000000, 30000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onChangeMonthlyExpenses(amt)}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer hover:border-slate-400"
                >
                  {(amt / 1000000).toFixed(0)} Jt
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Cashflow Savings Indicator */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs font-bold">
          <span className="text-emerald-700 dark:text-emerald-300">
            {isEn ? 'Monthly Surplus / Savings:' : 'Surplus Tabungan Bulanan:'}
          </span>
          <span className="text-emerald-800 dark:text-emerald-200 font-mono">
            Rp {monthlySavings.toLocaleString('id-ID')} ({savingsRatePct.toFixed(0)}% Savings Rate)
          </span>
        </div>

        {/* 3. Simulated Portfolio Capital */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isEn ? 'Simulated Portfolio Capital (IDR):' : 'Modal Portofolio yang Disimulasikan (Rp):'}
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white font-mono">
              Rp {simulatedCapital.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Rp
            </span>
            <input
              type="number"
              min="1000000"
              step="5000000"
              value={simulatedCapital}
              onChange={(e) => onChangeSimulatedCapital(parseFloat(e.target.value) || 0)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div className="flex gap-1.5 text-[10px]">
            {[10000000, 50000000, 150000000, 500000000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => onChangeSimulatedCapital(amt)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Rp {(amt / 1000000).toFixed(0)} Jt
              </button>
            ))}
          </div>
        </div>

        {/* 4. Primary Financial Goal */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isEn ? 'Primary Financial Target:' : 'Tujuan Finansial Utama:'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              {
                id: 'CAPITAL_PRESERVATION',
                label: isEn ? 'Capital Preservation' : 'Preservasi Modal (Kalahkan Inflasi)',
                sub: isEn ? 'Safety first & low drawdown' : 'Aman dari volatilitas & krisis makro',
              },
              {
                id: 'BALANCED_GROWTH',
                label: isEn ? 'Balanced Growth' : 'Pertumbuhan Seimbang (Risk-Adjusted)',
                sub: isEn ? 'Optimal Sharpe ratio compounding' : 'Kombinasi obligasi, saham & emas',
              },
              {
                id: 'AGGRESSIVE_WEALTH_ACCUMULATION',
                label: isEn ? 'Aggressive Wealth' : 'Akumulasi Kekayaan Maksimal',
                sub: isEn ? 'US tech, AI & asymmetric upside' : 'Mesin compounding agresif jangka panjang',
              },
              {
                id: 'PASSIVE_DIVIDEND_INCOME',
                label: isEn ? 'Passive Dividend Income' : 'Dividen & Arus Kas Pasif',
                sub: isEn ? 'High dividend yield & coupons' : 'SBN kupon bulanan & saham dividen jumbo',
              },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onChangePrimaryGoal(g.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  primaryGoal === g.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-white font-bold ring-1 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs">{g.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{g.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Special Notes / Custom Context for AI */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isEn ? 'Special Context or Instructions for AI Doctor:' : 'Catatan Khusus atau Konteks untuk AI Doctor:'}
          </label>
          <textarea
            rows={2}
            value={userNotes}
            onChange={(e) => onChangeUserNotes(e.target.value)}
            placeholder={
              isEn
                ? 'e.g. Planning early retirement in 7 years, need high liquidity buffer for upcoming mortgage...'
                : 'Contoh: Rencana membeli rumah dalam 5 tahun, butuh dividen bulanan untuk bayar cicilan...'
            }
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ── CTA EXECUTION BUTTON ── */}
      <button
        type="button"
        onClick={onRunAudit}
        disabled={auditing || holdings.length === 0}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Stethoscope className={`h-4 w-4 ${auditing ? 'animate-spin' : ''}`} />
        <span>
          {auditing
            ? isEn
              ? 'AI Doctor Auditing Your Custom Portfolio...'
              : 'AI Doctor Sedang Mengaudit Portofolio Kustom Anda...'
            : isEn
            ? 'Run AI Portfolio Doctor Audit (Full Diagnosis)'
            : 'Jalankan Audit AI Portofolio Doctor (Diagnosis Lengkap)'}
        </span>
      </button>
    </div>
  );
}
