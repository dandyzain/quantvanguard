'use client';

import React, { useState } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import {
  RotateCcw,
  Sparkles,
  TrendingDown,
  DollarSign,
  Coins,
  CheckCircle2,
  Activity,
  LogIn,
  LogOut,
  User,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundManager } from '@/lib/audio/soundEffects';

export function TopBar() {
  const {
    currency,
    setCurrency,
    inflationAdjusted,
    setInflationAdjusted,
    resetToDemo,
    loading,
    portfolio,
  } = usePortfolio();

  const { user, isDemo, logout, openAuthModal } = useAuth();
  const { dict } = useLanguage();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  React.useEffect(() => {
    setSoundOn(soundManager.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const next = soundManager.toggle();
    setSoundOn(next);
  };

  const handleResetDemo = async () => {
    await resetToDemo();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 md:px-6 backdrop-blur-md transition-colors duration-200">
      {/* Left: Market Rates & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">{dict.common.engineOnline}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
          <Activity className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          <span>{dict.common.usdidrRate}:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            Rp {(portfolio?.usdIdrRate || 15850).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Right Controls: Theme, Language, Currency, Inflation, Demo/Auth */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Dark / Light Mode Switcher */}
        <ThemeToggle />

        {/* Language Switcher (EN | ID) */}
        <LanguageToggle />

        {/* Audio FX Toggle */}
        <button
          onClick={handleToggleSound}
          className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
            soundOn
              ? 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
          title={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </button>

        {/* Inflation Adjustment Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setInflationAdjusted(false)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              !inflationAdjusted
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Nominal
          </button>
          <button
            onClick={() => setInflationAdjusted(true)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              inflationAdjusted
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title={dict.common.realReturnTooltip}
          >
            <TrendingDown className="h-3 w-3" />
            <span>{dict.common.realReturn}</span>
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setCurrency('IDR')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              currency === 'IDR'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            <span>IDR</span>
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              currency === 'USD'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>USD</span>
          </button>
        </div>

        {/* User Account / Auth Section */}
        {!isDemo && user ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-xs text-blue-700 dark:text-blue-300">
              <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold truncate max-w-[120px]">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title={dict.common.signOut}
            >
              <LogOut className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">{dict.common.signOut}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{dict.common.signIn} / {dict.common.register}</span>
            </button>

            {/* Instant Recruiter Demo Button */}
            <button
              onClick={handleResetDemo}
              disabled={loading}
              className={`hidden md:flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border cursor-pointer ${
                resetSuccess
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Reset ke akun demo recruiter (Rp 150M)"
            >
              {resetSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Rp 150M Loaded</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                  <span>{dict.common.demoMode}</span>
                  <RotateCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
