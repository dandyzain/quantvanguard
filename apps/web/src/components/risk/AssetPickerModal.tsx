'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Check, Plus, Filter, Sparkles, TrendingUp, ShieldAlert, Coins, Layers } from 'lucide-react';
import { MARKET_CATALOG, AssetCategory } from '@/lib/services/market-data';
import { soundManager } from '@/lib/audio/soundEffects';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssetCodes: string[];
  onSelectAsset: (assetCode: string) => void;
  isEn?: boolean;
}

const CATEGORY_TABS: { key: string; labelId: string; labelEn: string }[] = [
  { key: 'ALL', labelId: 'Semua (48)', labelEn: 'All (48)' },
  { key: 'FIXED_INCOME', labelId: 'Obligasi SBN', labelEn: 'Govt Bonds' },
  { key: 'INDONESIAN_EQUITY', labelId: 'Saham IDX', labelEn: 'Indonesian Equity' },
  { key: 'US_EQUITY', labelId: 'Saham AS & Tech', labelEn: 'US Equity & Tech' },
  { key: 'COMMODITY', labelId: 'Komoditas & Emas', labelEn: 'Commodities' },
  { key: 'CRYPTO', labelId: 'Aset Kripto', labelEn: 'Crypto' },
  { key: 'MONEY_MARKET', labelId: 'Pasar Uang (Kas)', labelEn: 'Money Market' },
];

export function AssetPickerModal({
  isOpen,
  onClose,
  selectedAssetCodes,
  onSelectAsset,
  isEn = false,
}: AssetPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const catalogList = useMemo(() => {
    return Object.values(MARKET_CATALOG);
  }, []);

  const filteredAssets = useMemo(() => {
    return catalogList.filter((asset) => {
      // Category filter
      if (activeCategory !== 'ALL' && asset.category !== activeCategory) {
        return false;
      }
      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        asset.ticker.toLowerCase().includes(q) ||
        asset.name.toLowerCase().includes(q) ||
        asset.categoryLabel.toLowerCase().includes(q) ||
        asset.assetCode.toLowerCase().includes(q)
      );
    });
  }, [catalogList, activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {isEn ? 'Universal Multi-Asset Catalog' : 'Katalog Instrumen Investasi (48 Aset)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isEn
                ? 'Select any asset from SBN bonds, IDX blue chips, US tech, commodities, crypto, or cash.'
                : 'Pilih instrumen dari obligasi SBN, saham blue chip IDX, US tech, komoditas, kripto, atau kas pasar uang.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isEn
                  ? 'Search by ticker, name, or category (e.g. BBCA, VOO, ORI025, Gold, BTC)...'
                  : 'Cari berdasarkan ticker, nama aset, atau kategori (contoh: BBCA, VOO, ORI025, Emas, BTC)...'
              }
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveCategory(tab.key);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isEn ? tab.labelEn : tab.labelId}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Asset Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 max-h-[50vh]">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <Search className="h-10 w-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-semibold">
                {isEn ? 'No investment assets match your search.' : 'Tidak ada aset yang cocok dengan pencarian Anda.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                }}
                className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                {isEn ? 'Reset filters' : 'Reset pencarian & filter'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssetCodes.includes(asset.assetCode);
                return (
                  <div
                    key={asset.assetCode}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: asset.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {asset.ticker}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {asset.categoryLabel}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono">
                        <span>
                          CAGR:{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            +{(asset.expectedCagr * 100).toFixed(1)}%
                          </strong>
                        </span>
                        <span>
                          Vol:{' '}
                          <strong className="text-blue-600 dark:text-blue-400">
                            ~{(asset.annualVolatility * 100).toFixed(0)}%
                          </strong>
                        </span>
                        {asset.annualYield !== undefined && asset.annualYield > 0 && (
                          <span>
                            Yield:{' '}
                            <strong className="text-amber-600 dark:text-amber-400">
                              {asset.annualYield.toFixed(1)}%
                            </strong>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isSelected}
                        onClick={() => {
                          soundManager.playClick();
                          onSelectAsset(asset.assetCode);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>{isEn ? 'Selected' : 'Terpilih'}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            <span>{isEn ? 'Add' : 'Pilih'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isEn
              ? `Showing ${filteredAssets.length} of ${catalogList.length} assets`
              : `Menampilkan ${filteredAssets.length} dari ${catalogList.length} instrumen`}
          </span>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
          >
            {isEn ? 'Done Selecting' : 'Selesai Memilih'}
          </button>
        </div>
      </div>
    </div>
  );
}
