'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '@/context/PortfolioContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  X,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Layers,
  Coins,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Wallet,
  Check,
  Building2,
  Gem,
  CircleDollarSign,
  Scale,
} from 'lucide-react';
import { MarketAssetQuote, AssetCategory } from '@/lib/services/market-data';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterCategory = 'ALL' | AssetCategory;

export function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const { addHolding, formatMoney } = usePortfolio();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');
  const [quotes, setQuotes] = useState<MarketAssetQuote[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MarketAssetQuote | null>(null);
  const [units, setUnits] = useState('');
  const [costBasisPrice, setCostBasisPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Ensure client-side portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Category Tabs Configuration
  const categoryTabs: { id: FilterCategory; label: string; icon?: React.ReactNode }[] = [
    { id: 'ALL', label: isEn ? 'All Assets' : 'Semua Aset' },
    { id: 'INDONESIAN_EQUITY', label: isEn ? 'IDX Stocks' : 'Saham BEI' },
    { id: 'US_EQUITY', label: isEn ? 'US Stocks & ETFs' : 'US Saham & ETF' },
    { id: 'FIXED_INCOME', label: isEn ? 'Bonds & SBN' : 'Obligasi & SBN' },
    { id: 'COMMODITY', label: isEn ? 'Gold & Commodities' : 'Emas & Komoditas' },
    { id: 'CRYPTO', label: isEn ? 'Crypto' : 'Kripto' },
    { id: 'MONEY_MARKET', label: isEn ? 'Money Market & Cash' : 'Pasar Uang & Kas' },
  ];

  // Load quotes from search API
  useEffect(() => {
    if (!isOpen) return;

    async function fetchAssets() {
      try {
        const catParam = selectedCategory !== 'ALL' ? `&category=${selectedCategory}` : '';
        const res = await fetch(`/api/v1/market/search?q=${encodeURIComponent(searchQuery)}${catParam}`);
        const json = await res.json();
        if (json.success && json.data?.assets) {
          setQuotes(json.data.assets);
        }
      } catch (err) {
        console.error('Failed to load asset catalog:', err);
      }
    }

    const timer = setTimeout(fetchAssets, 100);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, isOpen]);

  const handleSelectAsset = (quote: MarketAssetQuote) => {
    setSelectedAsset(quote);
    setCostBasisPrice(quote.priceIdr.toString());
    setError(null);
  };

  const getUnitHelperText = (asset: MarketAssetQuote) => {
    switch (asset.category) {
      case 'INDONESIAN_EQUITY':
        return isEn ? 'Shares / Lembar (1 Lot = 100 shares)' : 'Lembar Saham (1 Lot = 100 lembar)';
      case 'US_EQUITY':
        return isEn ? 'Shares (fractional supported)' : 'Lembar Saham (dukung fraksional)';
      case 'COMMODITY':
        return isEn ? 'Grams (g) / Units' : 'Gram (g) / Unit Emas Murni';
      case 'CRYPTO':
        return isEn ? 'Coins / Tokens (supports up to 8 decimals)' : 'Koin / Token (hingga 8 desimal)';
      case 'FIXED_INCOME':
        return isEn ? 'Units (nominal multiple of Rp 1,000,000)' : 'Unit Nominal (kelipatan Rp 1.000.000)';
      case 'MONEY_MARKET':
      case 'CASH':
        return isEn ? 'Units / Nominal Balance' : 'Unit Saldo / Nominal RDPU';
      default:
        return isEn ? 'Quantity / Units' : 'Jumlah Unit';
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAsset) {
      setError(isEn ? 'Please select an asset from the catalog first.' : 'Pilih aset dari katalog terlebih dahulu.');
      return;
    }

    const numUnits = parseFloat(units);
    if (isNaN(numUnits) || numUnits <= 0) {
      setError(isEn ? 'Number of units held must be greater than 0.' : 'Jumlah unit harus lebih dari 0.');
      return;
    }

    setLoading(true);

    const res = await addHolding(
      selectedAsset.assetCode,
      numUnits,
      costBasisPrice ? parseFloat(costBasisPrice) : selectedAsset.priceIdr,
      selectedAsset.name
    );

    setLoading(false);

    if (res.success) {
      setSuccessMsg(
        isEn
          ? `Asset ${selectedAsset.ticker} successfully added to portfolio!`
          : `Aset ${selectedAsset.ticker} berhasil ditambahkan ke portofolio!`
      );
      setTimeout(() => {
        setSuccessMsg(null);
        setSelectedAsset(null);
        setUnits('');
        setCostBasisPrice('');
        onClose();
      }, 900);
    } else {
      setError(res.error || (isEn ? 'Failed to add asset.' : 'Gagal menambahkan aset.'));
    }
  };

  if (!isOpen || !mounted) return null;

  const currentPriceIdr = selectedAsset ? selectedAsset.priceIdr : 0;
  const estimatedTotalVal = Number(units || 0) * currentPriceIdr;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] w-screen h-screen min-h-screen bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Ambient background glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />

      {/* Enlarged Modal Container (max-w-4xl / 5xl for generous executive feel) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl lg:max-w-5xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl shadow-blue-500/10 max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Top Gradient Decorative Edge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {isEn ? 'Add Investment Asset' : 'Tambah Aset Investasi'}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  <Sparkles className="h-3 w-3" />
                  <span>Real-Time Pricing</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn
                  ? 'Expand your multi-asset portfolio: IDX Blue-Chips, US Tech & ETFs, SBN Bonds, Gold & Crypto'
                  : 'Perluas portofolio multi-aset: Saham BEI, Saham & ETF US, Obligasi SBN, Emas & Kripto'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-block text-[11px] font-mono text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg">
              ESC
            </span>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Notifications */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Search & Category Filter Section */}
          <div className="space-y-3">
            {/* Enlarged Modern Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder={
                  isEn
                    ? 'Search by ticker symbol or asset name (e.g. BBCA, NVDA, VOO, XAU, BTC, BMRI, ORI026)...'
                    : 'Cari ticker atau nama aset (contoh: BBCA, NVDA, VOO, XAU, BTC, BMRI, ORI026)...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 pl-12 pr-10 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categoryTabs.map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Asset Grid (2 Columns on tablet/desktop for expansive browse experience) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              <span>{isEn ? 'Available Assets in Universe' : 'Katalog Aset Tersedia'}</span>
              <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                {quotes.length} {isEn ? 'assets' : 'aset'}
              </span>
            </div>

            <div className="max-h-72 sm:max-h-80 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-2.5">
              {quotes.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? 'No assets matching your search query.' : 'Tidak ada aset yang cocok dengan kata kunci pencarian.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {quotes.map((q) => {
                    const isSelected = selectedAsset?.assetCode === q.assetCode;
                    const isPositive = q.change24hPercent >= 0;

                    return (
                      <button
                        type="button"
                        key={q.assetCode}
                        onClick={() => handleSelectAsset(q)}
                        className={`flex items-center justify-between rounded-2xl p-3.5 text-left text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-500/10 border-blue-500 dark:bg-blue-500/20 text-blue-900 dark:text-blue-100 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                            : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950/70 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="h-4 w-4 rounded-full shrink-0 shadow-sm ring-2 ring-white dark:ring-slate-900"
                            style={{ backgroundColor: q.color }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                                {q.ticker}
                              </span>
                              <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border ${q.badgeClass}`}>
                                {q.categoryLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px] sm:max-w-[190px] mt-0.5">
                              {q.name}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            {formatMoney(q.priceIdr)}
                          </div>
                          <div className="flex items-center justify-end gap-1.5 text-[10.5px] mt-0.5">
                            {q.annualYield ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                                {isEn ? `Yield ${q.annualYield}%` : `Yield ${q.annualYield}%`}
                              </span>
                            ) : null}
                            <span
                              className={`font-semibold font-mono ${
                                isPositive
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-500 dark:text-red-400'
                              }`}
                            >
                              {isPositive ? '+' : ''}
                              {q.change24hPercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Selected Asset Configuration Form */}
          {selectedAsset ? (
            <div className="rounded-3xl border-2 border-blue-500/40 bg-blue-50/60 dark:bg-blue-950/20 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Selected Asset Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/80 dark:border-blue-900/50 pb-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-2xl flex items-center justify-center text-white font-mono font-bold text-xs shadow-md"
                    style={{ backgroundColor: selectedAsset.color }}
                  >
                    {selectedAsset.ticker.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {selectedAsset.name}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-300">
                        {selectedAsset.ticker}
                      </span>
                    </div>
                    <span className="text-xs text-blue-700 dark:text-blue-300/80 mt-0.5 block font-medium">
                      {getUnitHelperText(selectedAsset)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                      {isEn ? 'Current Live Price' : 'Harga Pasar Saat Ini'}
                    </span>
                    <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      {formatMoney(currentPriceIdr)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    {isEn ? 'Number of Units Held' : 'Jumlah Unit Dimiliki'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder={selectedAsset.category === 'CRYPTO' ? '0.005' : '10'}
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-sm"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {isEn ? 'Enter total quantity held in your broker or wallet.' : 'Masukkan jumlah yang Anda pegang di sekuritas/wallet.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    {isEn ? 'Average Cost Basis (IDR)' : 'Harga Beli Rata-Rata (IDR)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder={currentPriceIdr.toString()}
                    value={costBasisPrice}
                    onChange={(e) => setCostBasisPrice(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-sm"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {isEn ? 'Defaults to market price. Adjust to track unrealized P&L.' : 'Otomatis diisi harga pasar. Sesuaikan untuk hitung untung/rugi.'}
                  </p>
                </div>
              </div>

              {/* Real-Time Total Position Valuation Banner */}
              {Number(units || 0) > 0 && (
                <div className="flex items-center justify-between rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-blue-200 dark:border-blue-900/50 p-3.5 px-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isEn ? 'Estimated Total Position Valuation:' : 'Estimasi Total Nilai Posisi:'}
                    </span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-blue-700 dark:text-blue-400">
                    {formatMoney(estimatedTotalVal)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
              <Sparkles className="h-5 w-5 mx-auto mb-2 text-blue-500 dark:text-blue-400 opacity-60" />
              <span>
                {isEn
                  ? 'Click any asset from the catalog above to configure your position units.'
                  : 'Klik salah satu aset dari katalog di atas untuk mengatur jumlah unit posisi Anda.'}
              </span>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-6 pt-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {selectedAsset ? (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>
                  {isEn ? 'Selected:' : 'Terpilih:'}{' '}
                  <strong className="text-slate-900 dark:text-white font-mono">{selectedAsset.ticker}</strong>
                  {Number(units || 0) > 0 && ` · ${units} ${isEn ? 'units' : 'unit'}`}
                </span>
              </span>
            ) : (
              <span>{isEn ? 'No asset selected' : 'Belum ada aset yang dipilih'}</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={loading || !selectedAsset}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>
                {loading
                  ? isEn
                    ? 'Saving...'
                    : 'Menyimpan...'
                  : isEn
                  ? 'Add to Portfolio'
                  : 'Tambah ke Portofolio'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
