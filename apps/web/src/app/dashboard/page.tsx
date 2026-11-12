'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { NetWorthCards } from '@/components/dashboard/NetWorthCards';
import { DriftAlertBanner } from '@/components/dashboard/DriftAlertBanner';
import { AllocationDonutChart } from '@/components/dashboard/AllocationDonutChart';
import { PerformanceAreaChart } from '@/components/dashboard/PerformanceAreaChart';
import { HoldingsTable } from '@/components/dashboard/HoldingsTable';
import { RefreshCw, Shield, User, LogIn, Sparkles, ArrowLeft } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

function DashboardContent() {
  const { loading, refreshPortfolio } = usePortfolio();
  const { user, isDemo, isLoading: authLoading, continueAsDemo, openAuthModal } = useAuth();
  const { dict } = useLanguage();

  // If user is not authenticated and has not opted into demo, show welcoming guest prompt
  if (!authLoading && !user && !isDemo) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{dict.dashboard.backToHome}</span>
        </Link>

        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 via-white dark:via-slate-900 to-slate-100 dark:to-slate-950 p-8 md:p-10 text-center space-y-6 shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mx-auto">
            <Shield className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold">
              <span>{dict.common.publicPortfolio}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {dict.dashboard.guestWelcomeTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              {dict.dashboard.guestWelcomeDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>{dict.dashboard.guestRegisterBtn}</span>
            </button>

            <button
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-6 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>{dict.dashboard.guestLoginBtn}</span>
            </button>

            <button
              onClick={() => continueAsDemo()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 px-6 py-3 text-xs font-bold text-amber-700 dark:text-amber-300 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <span>{dict.dashboard.guestDemoBtn}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {dict.dashboard.commandCenter}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {dict.dashboard.subtitle}
          </p>
        </div>
        <button
          onClick={() => refreshPortfolio()}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-500 dark:text-blue-400' : ''}`} />
          <span>{dict.dashboard.syncData}</span>
        </button>
      </div>

      {/* Drift Warning Banner */}
      <DriftAlertBanner />

      {/* Net Worth Summary Metrics */}
      <NetWorthCards />

      {/* Visual Analytics: Allocation Donut & 12-Month Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationDonutChart />
        <PerformanceAreaChart />
      </div>

      {/* Complete Holdings Breakdown Table */}
      <HoldingsTable />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}
