'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatAssetUnits, formatPercent } from '@/lib/utils';
import { AssetCode, StrategyName, TargetAllocations } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useLoading } from './LoadingContext';

export interface HoldingView {
  assetCode: AssetCode;
  name: string;
  units: number;
  currentPrice: number;
  currentValue: number;
  costBasisPrice: number;
  currentWeight: number;
  targetWeight: number;
  drift: number;
  driftPercentage: number;
  isAlertTriggered: boolean;
  color: string;
}

export interface PortfolioSummaryData {
  portfolioId: string;
  portfolioName: string;
  baseCurrency: string;
  displayCurrency: string;
  inflationAdjusted: boolean;
  usdIdrRate: number;
  totalValue: number;
  totalCostBasis: number;
  unrealizedGainNominal: number;
  unrealizedGainPercentage: number;
  monthlyExpenses: number;
  hasActiveDriftAlert: boolean;
  totalAbsoluteDrift: number;
  strategyName: StrategyName;
  targetAllocations: TargetAllocations;
  holdings: HoldingView[];
  historicalSnapshots: Array<{
    date: string;
    totalValue: number;
    totalCostBasis: number;
  }>;
}

interface PortfolioContextType {
  currency: 'IDR' | 'USD';
  setCurrency: (c: 'IDR' | 'USD') => void;
  inflationAdjusted: boolean;
  setInflationAdjusted: (b: boolean) => void;
  portfolio: PortfolioSummaryData | null;
  loading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
  resetToDemo: () => Promise<void>;
  addHolding: (assetCode: string, units: number, costBasisPrice?: number, name?: string) => Promise<{ success: boolean; error?: string }>;
  updateHolding: (assetCode: string, units?: number, costBasisPrice?: number) => Promise<{ success: boolean; error?: string }>;
  removeHolding: (assetCode: string) => Promise<{ success: boolean; error?: string }>;
  formatMoney: (valIdr: number) => string;
  formatUnits: (assetCode: string, units: number) => string;
  formatPct: (val: number, withSign?: boolean) => string;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { token, isDemo, continueAsDemo } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [inflationAdjusted, setInflationAdjusted] = useState<boolean>(false);
  const [portfolio, setPortfolio] = useState<PortfolioSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!token && !isDemo) {
      setPortfolio(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/v1/portfolio/summary?currency=${currency}&inflationAdjusted=${inflationAdjusted}`,
        {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      if (json.success && json.data) {
        setPortfolio(json.data);
      } else {
        throw new Error(json.error?.message || 'Failed to fetch portfolio');
      }
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError(err.message || 'Error fetching portfolio');
    } finally {
      setLoading(false);
    }
  }, [currency, inflationAdjusted, token, isDemo]);

  const refreshPortfolio = useCallback(async () => {
    showLoading('Menyinkronkan Portofolio...', 'Mengambil harga pasar terkini & kalkulasi drift...');
    try {
      await fetchPortfolio();
      await new Promise((r) => setTimeout(r, 450));
    } finally {
      hideLoading();
    }
  }, [fetchPortfolio, showLoading, hideLoading]);

  const resetToDemo = useCallback(async () => {
    showLoading('Memuat Ulang Akun Demo...', 'Mengembalikan saldo Rp 150.000.000 dengan 4 aset multi-currency...');
    try {
      setLoading(true);
      continueAsDemo();
      const res = await fetch('/api/v1/auth/guest-demo', {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        await fetchPortfolio();
        await new Promise((r) => setTimeout(r, 400));
      }
    } catch (err) {
      console.error('Failed to reset demo account:', err);
    } finally {
      setLoading(false);
      hideLoading();
    }
  }, [fetchPortfolio, continueAsDemo, showLoading, hideLoading]);

  const addHolding = useCallback(
    async (assetCode: string, units: number, costBasisPrice?: number, name?: string) => {
      showLoading('Menyimpan Aset Baru...', 'Memperbarui database & bobot alokasi...');
      try {
        const res = await fetch('/api/v1/portfolio/holdings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ assetCode, units, costBasisPrice, name }),
        });
        const json = await res.json();
        if (json.success) {
          await fetchPortfolio();
          return { success: true };
        }
        return { success: false, error: json.error?.message || 'Gagal menambahkan aset.' };
      } catch (err: any) {
        return { success: false, error: err.message };
      } finally {
        hideLoading();
      }
    },
    [token, fetchPortfolio, showLoading, hideLoading]
  );

  const updateHolding = useCallback(
    async (assetCode: string, units?: number, costBasisPrice?: number) => {
      showLoading('Memperbarui Aset...', 'Menghitung ulang nilai portofolio...');
      try {
        const res = await fetch('/api/v1/portfolio/holdings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ assetCode, units, costBasisPrice }),
        });
        const json = await res.json();
        if (json.success) {
          await fetchPortfolio();
          return { success: true };
        }
        return { success: false, error: json.error?.message || 'Gagal memperbarui aset.' };
      } catch (err: any) {
        return { success: false, error: err.message };
      } finally {
        hideLoading();
      }
    },
    [token, fetchPortfolio, showLoading, hideLoading]
  );

  const removeHolding = useCallback(
    async (assetCode: string) => {
      showLoading('Menghapus Aset...', 'Menyesuaikan bobot aset lainnya...');
      try {
        const res = await fetch(`/api/v1/portfolio/holdings?assetCode=${encodeURIComponent(assetCode)}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          await fetchPortfolio();
          return { success: true };
        }
        return { success: false, error: json.error?.message || 'Gagal menghapus aset.' };
      } catch (err: any) {
        return { success: false, error: err.message };
      } finally {
        hideLoading();
      }
    },
    [token, fetchPortfolio, showLoading, hideLoading]
  );

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const usdRate = portfolio?.usdIdrRate || 15850.0;

  const formatMoney = useCallback(
    (valIdr: number) => formatCurrency(valIdr, currency, usdRate, inflationAdjusted),
    [currency, usdRate, inflationAdjusted]
  );

  const formatUnits = useCallback(
    (assetCode: string, units: number) => formatAssetUnits(assetCode, units),
    []
  );

  const formatPct = useCallback(
    (val: number, withSign = false) => formatPercent(val, withSign),
    []
  );

  return (
    <PortfolioContext.Provider
      value={{
        currency,
        setCurrency,
        inflationAdjusted,
        setInflationAdjusted,
        portfolio,
        loading,
        error,
        refreshPortfolio: fetchPortfolio,
        resetToDemo,
        addHolding,
        updateHolding,
        removeHolding,
        formatMoney,
        formatUnits,
        formatPct,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
