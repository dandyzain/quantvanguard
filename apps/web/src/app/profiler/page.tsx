'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { RiskMatrixScatter } from '@/components/risk/RiskMatrixScatter';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLoading } from '@/context/LoadingContext';
import { soundManager } from '@/lib/audio/soundEffects';
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ArrowRight,
  TrendingUp,
  Flame,
  Info,
  Settings2,
  Target,
  Compass,
  Wallet,
  Activity,
  DollarSign,
  PieChart,
  Layers,
  Zap,
  Shield,
  Rocket,
  Check,
  Scale,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';
import {
  RiskProfileOutput,
  StrategyName,
  RiskSurveyInput,
  TargetAllocations,
  RecommendedDynamicAsset,
  CustomPortfolioHoldingInput,
  CustomPortfolioAuditOutput,
} from '@/lib/types';
import { MARKET_CATALOG } from '@/lib/services/market-data';
import { AssetPickerModal } from '@/components/risk/AssetPickerModal';
import { CustomPortfolioStudio } from '@/components/risk/CustomPortfolioStudio';
import { CustomPortfolioAuditReport } from '@/components/risk/CustomPortfolioAuditReport';

export default function ProfilerPage() {
  const { portfolio, refreshPortfolio } = usePortfolio();
  const { user, isDemo, isLoading } = useAuth();
  const { dict, language } = useLanguage();
  const { showLoading, updateProgress, hideLoading } = useLoading();
  const isEn = language === 'en';
  const isFresh = Boolean(user && !isDemo);
  const [hasInitializedAuth, setHasInitializedAuth] = useState(false);

  // User Experience Mode: 'SIMPLE' | 'ADVANCED' | 'CUSTOM_STUDIO'
  const [surveyMode, setSurveyMode] = useState<'SIMPLE' | 'ADVANCED' | 'CUSTOM_STUDIO'>('SIMPLE');

  // Quick Preset Selection: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'CUSTOM'
  const [selectedPreset, setSelectedPreset] = useState<'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'CUSTOM'>('MODERATE');

  // Active Tab for Advanced Mode: 'CAPACITY' | 'TOLERANCE' | 'CUSTOMIZATION'
  const [activeTab, setActiveTab] = useState<'CAPACITY' | 'TOLERANCE' | 'CUSTOMIZATION'>('CAPACITY');

  // --- Kategori 1: Kapasitas Finansial Objektif (Balance Sheet) ---
  const [emergencyMonths, setEmergencyMonths] = useState<number>(8.0);
  const [savingsRatio, setSavingsRatio] = useState<number>(0.35);
  const [horizonYears, setHorizonYears] = useState<number>(10);
  const [incomeStability, setIncomeStability] = useState<number>(80);
  const [dependentsCount, setDependentsCount] = useState<number>(1);
  const [debtToIncome, setDebtToIncome] = useState<number>(0.15);
  const [liquidityTiming, setLiquidityTiming] = useState<
    'LESS_THAN_1_YEAR' | '1_TO_3_YEARS' | '3_TO_5_YEARS' | 'MORE_THAN_5_YEARS'
  >('3_TO_5_YEARS');

  // --- Kategori 2: Toleransi Risiko Psikologis & Perilaku ---
  const [crashReaction, setCrashReaction] = useState<number>(75);
  const [volatilityComfort, setVolatilityComfort] = useState<number>(70);
  const [experienceYears, setExperienceYears] = useState<number>(6);
  const [lossAversion, setLossAversion] = useState<number>(3);
  const [extremeReaction, setExtremeReaction] = useState<
    'PANIC_SELL_ALL' | 'PAUSE_CONTRIBUTIONS' | 'MAINTAIN_DCA' | 'AGGRESSIVE_DIP_BUY'
  >('MAINTAIN_DCA');
  const [financialKnowledge, setFinancialKnowledge] = useState<
    'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'QUANT_EXPERT'
  >('INTERMEDIATE');

  // --- Kategori 3: Preferensi Kustom & Alokasi Target ---
  const [primaryGoal, setPrimaryGoal] = useState<
    'CAPITAL_PRESERVATION' | 'BALANCED_GROWTH' | 'AGGRESSIVE_WEALTH_ACCUMULATION' | 'PASSIVE_DIVIDEND_INCOME'
  >('BALANCED_GROWTH');
  const [cryptoPreference, setCryptoPreference] = useState<
    'NONE' | 'CONSERVATIVE_5' | 'MODERATE_10' | 'AGGRESSIVE_20'
  >('MODERATE_10');
  const [enableCustomWeights, setEnableCustomWeights] = useState<boolean>(false);
  const [customAllocations, setCustomAllocations] = useState<{
    MMF_IDR: number;
    ETF_VOO: number;
    GOLD_XAU: number;
    CRYPTO_BTC: number;
  }>({
    MMF_IDR: 40,
    ETF_VOO: 20,
    GOLD_XAU: 20,
    CRYPTO_BTC: 20,
  });
  const [userNotes, setUserNotes] = useState<string>('');

  // Diagnosis execution state
  const [diagnosing, setDiagnosing] = useState<boolean>(false);
  const [profileResult, setProfileResult] = useState<RiskProfileOutput | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // --- Kategori 4: Studio Portofolio Kustom & AI Doctor State ---
  const [customStudioHoldings, setCustomStudioHoldings] = useState<CustomPortfolioHoldingInput[]>([]);
  const [customHorizonYears, setCustomHorizonYears] = useState<number>(7);
  const [customMonthlyIncome, setCustomMonthlyIncome] = useState<number>(15000000);
  const [customMonthlyExpenses, setCustomMonthlyExpenses] = useState<number>(8000000);
  const [customPortfolioCapital, setCustomPortfolioCapital] = useState<number>(50000000);
  const [customPrimaryGoal, setCustomPrimaryGoal] = useState<string>('BALANCED_GROWTH');
  const [customUserNotes, setCustomUserNotes] = useState<string>('');

  // Asset picker modal state
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState<boolean>(false);
  const [auditingCustom, setAuditingCustom] = useState<boolean>(false);
  const [customAuditResult, setCustomAuditResult] = useState<CustomPortfolioAuditOutput | null>(null);
  const [appliedCustomSuccess, setAppliedCustomSuccess] = useState<boolean>(false);

  // Sync capital from user portfolio if loaded
  useEffect(() => {
    if (portfolio && portfolio.totalValue > 0 && customPortfolioCapital === 50000000) {
      setCustomPortfolioCapital(portfolio.totalValue);
    }
  }, [portfolio, customPortfolioCapital]);

  // Initialize fresh defaults for registered non-demo accounts
  useEffect(() => {
    if (isLoading || hasInitializedAuth) return;

    if (user && !isDemo) {
      setEmergencyMonths(0);
      setSavingsRatio(0);
      setHorizonYears(1);
      setIncomeStability(50);
      setDependentsCount(0);
      setDebtToIncome(0);
      setLiquidityTiming('LESS_THAN_1_YEAR');
      setCrashReaction(50);
      setVolatilityComfort(50);
      setExperienceYears(0);
      setLossAversion(3);
      setExtremeReaction('MAINTAIN_DCA');
      setFinancialKnowledge('BEGINNER');
      setPrimaryGoal('BALANCED_GROWTH');
      setCryptoPreference('NONE');
      setCustomAllocations({
        MMF_IDR: 70,
        ETF_VOO: 15,
        GOLD_XAU: 15,
        CRYPTO_BTC: 0,
      });
      setProfileResult(null);
      setCustomStudioHoldings([]);
      setCustomAuditResult(null);
    }
    setHasInitializedAuth(true);
  }, [user, isDemo, isLoading, hasInitializedAuth]);

  const handleSelectAssetFromCatalog = (assetCode: string) => {
    const meta = MARKET_CATALOG[assetCode];
    if (!meta) return;
    if (customStudioHoldings.some((h) => h.assetCode === assetCode)) return;

    const newHoldings = [
      ...customStudioHoldings,
      {
        assetCode: meta.assetCode,
        ticker: meta.ticker,
        name: meta.name,
        category: meta.category,
        weight: 10,
        color: meta.color,
      },
    ];
    setCustomStudioHoldings(newHoldings);
  };

  const handleRunCustomAudit = async () => {
    if (customStudioHoldings.length === 0) {
      alert(
        isEn
          ? 'Please select at least one asset to build your custom portfolio.'
          : 'Silakan pilih minimal 1 aset investasi untuk menyusun portofolio kustom.'
      );
      return;
    }
    soundManager.playClick();
    setAuditingCustom(true);
    setAppliedCustomSuccess(false);

    showLoading(
      isEn ? 'AI Portfolio Doctor Auditing...' : 'AI Portfolio Doctor Mengaudit Portofolio...',
      isEn
        ? 'Diagnosing horizon alignment, balance sheet liquidity, and hidden risks...'
        : 'Mengevaluasi kesesuaian horison, ketahanan kas, kelebihan & risiko tersembunyi...',
      35
    );

    try {
      updateProgress(
        70,
        isEn
          ? 'Synthesizing quantitative metrics & actionable guidance...'
          : 'Menghitung estimasi return, stres volatilitas & rekomendasi perbaikan...'
      );

      const res = await fetch('/api/v1/ai-profiler/audit-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings: customStudioHoldings,
          horizonYears: customHorizonYears,
          monthlyIncome: customMonthlyIncome,
          monthlyExpenses: customMonthlyExpenses,
          portfolioCapital: customPortfolioCapital,
          primaryGoal: customPrimaryGoal,
          userNotes: customUserNotes,
          applyToPortfolio: false,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        updateProgress(100, isEn ? 'Audit complete!' : 'Audit selesai!');
        setCustomAuditResult(json.data);
        soundManager.playChime();
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (err) {
      console.error('Custom portfolio audit failed:', err);
    } finally {
      setAuditingCustom(false);
      hideLoading();
    }
  };

  const handleApplyCustomPortfolio = async () => {
    if (customStudioHoldings.length === 0) return;
    soundManager.playChime();
    setAppliedCustomSuccess(true);

    try {
      const res = await fetch('/api/v1/ai-profiler/audit-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings: customStudioHoldings,
          horizonYears: customHorizonYears,
          monthlyIncome: customMonthlyIncome,
          monthlyExpenses: customMonthlyExpenses,
          portfolioCapital: customPortfolioCapital,
          primaryGoal: customPrimaryGoal,
          userNotes: customUserNotes,
          applyToPortfolio: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        await refreshPortfolio();
      }
    } catch (err) {
      console.error('Apply custom portfolio error:', err);
    }

    setTimeout(() => setAppliedCustomSuccess(false), 3500);
  };

  // Handle Preset Switching
  const applyPreset = (preset: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE') => {
    soundManager.playClick();
    setSelectedPreset(preset);

    if (preset === 'CONSERVATIVE') {
      setEmergencyMonths(12);
      setSavingsRatio(0.25);
      setHorizonYears(3);
      setIncomeStability(85);
      setDependentsCount(2);
      setDebtToIncome(0.1);
      setLiquidityTiming('1_TO_3_YEARS');
      setCrashReaction(35);
      setVolatilityComfort(35);
      setExperienceYears(2);
      setLossAversion(5);
      setExtremeReaction('PAUSE_CONTRIBUTIONS');
      setFinancialKnowledge('BEGINNER');
      setPrimaryGoal('CAPITAL_PRESERVATION');
      setCryptoPreference('CONSERVATIVE_5');
      setCustomAllocations({ MMF_IDR: 60, ETF_VOO: 15, GOLD_XAU: 20, CRYPTO_BTC: 5 });
    } else if (preset === 'MODERATE') {
      setEmergencyMonths(8);
      setSavingsRatio(0.35);
      setHorizonYears(10);
      setIncomeStability(80);
      setDependentsCount(1);
      setDebtToIncome(0.15);
      setLiquidityTiming('3_TO_5_YEARS');
      setCrashReaction(75);
      setVolatilityComfort(70);
      setExperienceYears(6);
      setLossAversion(3);
      setExtremeReaction('MAINTAIN_DCA');
      setFinancialKnowledge('INTERMEDIATE');
      setPrimaryGoal('BALANCED_GROWTH');
      setCryptoPreference('MODERATE_10');
      setCustomAllocations({ MMF_IDR: 40, ETF_VOO: 20, GOLD_XAU: 20, CRYPTO_BTC: 20 });
    } else if (preset === 'AGGRESSIVE') {
      setEmergencyMonths(6);
      setSavingsRatio(0.45);
      setHorizonYears(15);
      setIncomeStability(90);
      setDependentsCount(0);
      setDebtToIncome(0.05);
      setLiquidityTiming('MORE_THAN_5_YEARS');
      setCrashReaction(90);
      setVolatilityComfort(85);
      setExperienceYears(8);
      setLossAversion(1);
      setExtremeReaction('AGGRESSIVE_DIP_BUY');
      setFinancialKnowledge('ADVANCED');
      setPrimaryGoal('AGGRESSIVE_WEALTH_ACCUMULATION');
      setCryptoPreference('AGGRESSIVE_20');
      setCustomAllocations({ MMF_IDR: 20, ETF_VOO: 40, GOLD_XAU: 15, CRYPTO_BTC: 25 });
    }
  };

  // Live estimated capacity & tolerance preview calculation
  const livePreviewScores = useMemo(() => {
    // 1. Capacity
    const fRunway = Math.min(100, emergencyMonths * (100 / 12));
    const fSavings = Math.min(100, (savingsRatio / 0.5) * 100);
    const fHorizon = Math.min(100, (horizonYears / 15) * 100);
    const fStability = Math.max(0, Math.min(100, incomeStability));

    let cap = 0.3 * fRunway + 0.25 * fSavings + 0.25 * fHorizon + 0.2 * fStability;
    if (dependentsCount === 0) cap += 2;
    else if (dependentsCount === 2) cap -= 2;
    else if (dependentsCount === 3) cap -= 5;
    else if (dependentsCount >= 4) cap -= 8;

    if (debtToIncome <= 0.05) cap += 4;
    else if (debtToIncome <= 0.2) cap += 1;
    else if (debtToIncome <= 0.35) cap -= 3;
    else if (debtToIncome <= 0.5) cap -= 7;
    else cap -= 14;

    if (liquidityTiming === 'LESS_THAN_1_YEAR') cap -= 10;
    else if (liquidityTiming === '1_TO_3_YEARS') cap -= 5;
    else if (liquidityTiming === 'MORE_THAN_5_YEARS') cap += 3;

    cap = Math.max(0, Math.min(100, cap));

    // 2. Tolerance
    const fCrash = Math.max(0, Math.min(100, crashReaction));
    const fComfort = Math.max(0, Math.min(100, volatilityComfort));
    const fExp = Math.min(100, (experienceYears / 10) * 100);
    let tol = 0.4 * fCrash + 0.35 * fComfort + 0.25 * fExp;

    tol += (3 - lossAversion) * 3;

    if (extremeReaction === 'PANIC_SELL_ALL') tol -= 15;
    else if (extremeReaction === 'PAUSE_CONTRIBUTIONS') tol -= 5;
    else if (extremeReaction === 'AGGRESSIVE_DIP_BUY') tol += 8;

    if (financialKnowledge === 'BEGINNER') tol -= 6;
    else if (financialKnowledge === 'ADVANCED') tol += 4;
    else if (financialKnowledge === 'QUANT_EXPERT') tol += 7;

    tol = Math.max(0, Math.min(100, tol));

    // Strategy mapping
    let strat: StrategyName = 'CONSERVATIVE_CAPITAL_PRESERVER';
    if (cap < 40 && tol < 40) strat = 'DEFENSIVE_LIQUIDITY_FIRST';
    else if (cap < 50 || tol < 50) strat = 'CONSERVATIVE_CAPITAL_PRESERVER';
    else if (cap >= 70 && tol >= 70) strat = 'AGGRESSIVE_ASYMMETRIC_ALPHA';
    else if (cap >= 60 && tol >= 60) strat = 'GROWTH_ACCUMULATOR';
    else strat = 'BALANCED_LIQUID_CORE';

    return {
      capacityScore: Math.round(cap * 10) / 10,
      toleranceScore: Math.round(tol * 10) / 10,
      strategyName: strat,
    };
  }, [
    emergencyMonths,
    savingsRatio,
    horizonYears,
    incomeStability,
    dependentsCount,
    debtToIncome,
    liquidityTiming,
    crashReaction,
    volatilityComfort,
    experienceYears,
    lossAversion,
    extremeReaction,
    financialKnowledge,
  ]);

  const currentCapacity = profileResult ? profileResult.capacityScore : livePreviewScores.capacityScore;
  const currentTolerance = profileResult ? profileResult.toleranceScore : livePreviewScores.toleranceScore;
  const currentStrategy = profileResult ? profileResult.strategyName : livePreviewScores.strategyName;

  // Custom allocation normalizer
  const customSum =
    (customAllocations.MMF_IDR || 0) +
    (customAllocations.ETF_VOO || 0) +
    (customAllocations.GOLD_XAU || 0) +
    (customAllocations.CRYPTO_BTC || 0);

  const currentTargetAllocations: TargetAllocations = useMemo(() => {
    if (enableCustomWeights && customSum > 0) {
      return {
        MMF_IDR: (customAllocations.MMF_IDR || 0) / customSum,
        ETF_VOO: (customAllocations.ETF_VOO || 0) / customSum,
        GOLD_XAU: (customAllocations.GOLD_XAU || 0) / customSum,
        CRYPTO_BTC: (customAllocations.CRYPTO_BTC || 0) / customSum,
      };
    }
    if (profileResult) {
      return profileResult.targetAllocations;
    }
    // Baseline allocation for current strategy
    if (currentStrategy === 'CONSERVATIVE_CAPITAL_PRESERVER' || currentStrategy === 'DEFENSIVE_LIQUIDITY_FIRST') {
      return { MMF_IDR: 0.6, ETF_VOO: 0.15, GOLD_XAU: 0.2, CRYPTO_BTC: 0.05 };
    }
    if (currentStrategy === 'AGGRESSIVE_ASYMMETRIC_ALPHA' || currentStrategy === 'GROWTH_ACCUMULATOR') {
      return { MMF_IDR: 0.2, ETF_VOO: 0.4, GOLD_XAU: 0.15, CRYPTO_BTC: 0.25 };
    }
    return { MMF_IDR: 0.4, ETF_VOO: 0.2, GOLD_XAU: 0.2, CRYPTO_BTC: 0.2 };
  }, [enableCustomWeights, customAllocations, customSum, profileResult, currentStrategy]);

  // Dynamic Asset List extracted from profileResult
  const displayedAssets: RecommendedDynamicAsset[] = useMemo(() => {
    if (profileResult?.dynamicAssets && profileResult.dynamicAssets.length > 0) {
      return profileResult.dynamicAssets;
    }
    return [];
  }, [profileResult]);

  // Projected Return & Volatility calculated dynamically from diagnosed assets
  const dynamicStats = useMemo(() => {
    if (displayedAssets.length === 0) {
      return {
        cagr: '0.0',
        volatility: '0.0',
        guardrailStatus: isEn ? 'Optimal' : 'Optimal',
        guardrailColor: 'text-emerald-500',
      };
    }
    const approxCagr = displayedAssets.reduce((sum, a) => sum + a.weight * (a.expectedCagr || 0.08) * 100, 0);
    const approxVolatility = Math.sqrt(
      displayedAssets.reduce((sum, a) => sum + Math.pow(a.weight * (a.annualVolatility || 0.15) * 100, 2), 0)
    );

    let guardrailStatus = isEn ? 'Optimal & Verified' : 'Optimal & Terverifikasi';
    let guardrailColor = 'text-emerald-600 dark:text-emerald-400';
    const btcAsset = displayedAssets.find((a) => a.assetCode.includes('BTC') || a.category === 'CRYPTO');
    const mmfAsset = displayedAssets.find((a) => a.assetCode.includes('MMF') || a.category === 'MONEY_MARKET');

    if (btcAsset && btcAsset.weight > 0.25) {
      guardrailStatus = isEn ? 'High Crypto Volatility' : 'Volatilitas Kripto Tinggi (>25%)';
      guardrailColor = 'text-rose-600 dark:text-rose-400';
    } else if (mmfAsset && mmfAsset.weight < 0.15) {
      guardrailStatus = isEn ? 'Low Cash Buffer Warning' : 'Buffer Kas Tipis (<15%)';
      guardrailColor = 'text-amber-600 dark:text-amber-400';
    }

    return {
      cagr: approxCagr.toFixed(1),
      volatility: approxVolatility.toFixed(1),
      guardrailStatus,
      guardrailColor,
    };
  }, [displayedAssets, isEn]);

  const handleRunDiagnosis = async () => {
    soundManager.playClick();
    setDiagnosing(true);
    setAppliedSuccess(false);

    showLoading(
      isEn ? 'Gemini 2.5 AI Diagnosing...' : 'Mendiagnosis dengan Google Gemini AI...',
      isEn ? 'Analyzing balance sheet capacity & behavioral psychology...' : 'Menganalisis profil risiko neraca keuangan & psikologi investasi...',
      30
    );

    try {
      const payload: RiskSurveyInput = {
        emergencyFundMonths: emergencyMonths,
        monthlySavingsRatio: savingsRatio,
        investmentHorizonYears: horizonYears,
        incomeStabilityScore: incomeStability,
        crashReactionScore: crashReaction,
        volatilityComfortScore: volatilityComfort,
        experienceYears: experienceYears,
        dependentsCount,
        debtToIncomeRatio: debtToIncome,
        liquidityNeedTiming: liquidityTiming,
        lossAversionSensitivity: lossAversion,
        extremeDrawdownReaction: extremeReaction,
        financialKnowledgeLevel: financialKnowledge,
        primaryGoal,
        cryptoPreference,
        userNotesOrGuidance: userNotes,
      };

      if (enableCustomWeights && customSum > 0) {
        payload.customTargetAllocations = {
          MMF_IDR: customAllocations.MMF_IDR / customSum,
          ETF_VOO: customAllocations.ETF_VOO / customSum,
          GOLD_XAU: customAllocations.GOLD_XAU / customSum,
          CRYPTO_BTC: customAllocations.CRYPTO_BTC / customSum,
        };
      }

      updateProgress(70, isEn ? 'Detecting cognitive biases & formulating guardrails...' : 'Mendeteksi bias kognitif & menyusun target alokasi...');

      const res = await fetch('/api/v1/ai-profiler/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        updateProgress(100, isEn ? 'Diagnosis complete!' : 'Diagnosis AI selesai!');
        setProfileResult(json.data);
        soundManager.playChime();
        await new Promise((r) => setTimeout(r, 350));
      }
    } catch (err) {
      console.error('Diagnosis failed:', err);
    } finally {
      setDiagnosing(false);
      hideLoading();
    }
  };

  const handleApplyStrategy = async () => {
    soundManager.playChime();
    setAppliedSuccess(true);
    if (enableCustomWeights || !profileResult) {
      await handleRunDiagnosis();
    }
    await refreshPortfolio();
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>Google Gemini 2.5 AI Risk Profiler</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isEn ? 'AI Portfolio Strategy & Risk Profiler' : 'Profil Risiko & Strategi Portofolio AI'}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              {isEn
                ? 'Determine your optimal 4-pillar asset allocation based on financial capacity and psychological resilience.'
                : 'Temukan alokasi 4 pilar aset ideal Anda secara presisi berdasarkan daya tahan neraca keuangan dan kenyamanan psikologis.'}
            </p>
          </div>

          {/* User Experience Mode Switcher (Simple vs Advanced vs Custom Studio) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 self-start sm:self-auto shadow-sm overflow-x-auto max-w-full">
            <button
              onClick={() => {
                soundManager.playClick();
                setSurveyMode('SIMPLE');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                surveyMode === 'SIMPLE'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>{isEn ? 'Quick Mode (Instant)' : 'Mode Cepat (Instan)'}</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setSurveyMode('ADVANCED');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                surveyMode === 'ADVANCED'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>{isEn ? 'Advanced Mode (13 Params)' : 'Mode Lanjutan (13 Param)'}</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setSurveyMode('CUSTOM_STUDIO');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                surveyMode === 'CUSTOM_STUDIO'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5 text-emerald-300" />
              <span>{isEn ? 'Custom Studio & AI Doctor' : 'Portofolio Kustom & AI Doctor'}</span>
            </button>
          </div>
        </div>

        {/* ── 2-COLUMN RESPONSIVE LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── LEFT COLUMN: QUESTIONNAIRE & STUDIO ── */}
          <div className="lg:col-span-7 space-y-5">
            {surveyMode === 'CUSTOM_STUDIO' ? (
              <CustomPortfolioStudio
                holdings={customStudioHoldings}
                onUpdateHoldings={setCustomStudioHoldings}
                onOpenAssetPicker={() => setIsAssetPickerOpen(true)}
                horizonYears={customHorizonYears}
                onChangeHorizonYears={setCustomHorizonYears}
                monthlyIncome={customMonthlyIncome}
                onChangeMonthlyIncome={setCustomMonthlyIncome}
                monthlyExpenses={customMonthlyExpenses}
                onChangeMonthlyExpenses={setCustomMonthlyExpenses}
                simulatedCapital={customPortfolioCapital}
                onChangeSimulatedCapital={setCustomPortfolioCapital}
                primaryGoal={customPrimaryGoal}
                onChangePrimaryGoal={setCustomPrimaryGoal}
                userNotes={customUserNotes}
                onChangeUserNotes={setCustomUserNotes}
                onRunAudit={handleRunCustomAudit}
                auditing={auditingCustom}
                isEn={isEn}
              />
            ) : surveyMode === 'SIMPLE' ? (
              <div className="space-y-5">
                {/* 1. Quick Profile Presets (3 Cards) */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                          1
                        </span>
                        {isEn ? 'Choose Your Investment Style' : 'Pilih Gaya Investasi Anda (1-Klik)'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isEn ? 'Select a calibrated preset or customize below.' : 'Pilih profil yang paling mendekati preferensi risiko Anda.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Konservatif */}
                    <button
                      type="button"
                      onClick={() => applyPreset('CONSERVATIVE')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        selectedPreset === 'CONSERVATIVE'
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                            <Shield className="h-4 w-4" />
                          </div>
                          {selectedPreset === 'CONSERVATIVE' && (
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {isEn ? 'Conservative' : 'Konservatif'}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {isEn ? 'Capital Preservation' : 'Amankan Modal & Kas'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                        Kas 60% &bull; Emas 20%
                      </div>
                    </button>

                    {/* Moderat (Populer) */}
                    <button
                      type="button"
                      onClick={() => applyPreset('MODERATE')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        selectedPreset === 'MODERATE'
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                            <Scale className="h-4 w-4" />
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                            Populer
                          </span>
                        </div>
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {isEn ? 'Balanced Core' : 'Moderat (Balanced)'}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {isEn ? 'Growth & Stability' : 'Pertumbuhan Seimbang'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        Kas 40% &bull; VOO 20% &bull; Kripto 20%
                      </div>
                    </button>

                    {/* Agresif */}
                    <button
                      type="button"
                      onClick={() => applyPreset('AGGRESSIVE')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        selectedPreset === 'AGGRESSIVE'
                          ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                            <Rocket className="h-4 w-4" />
                          </div>
                          {selectedPreset === 'AGGRESSIVE' && (
                            <CheckCircle2 className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {isEn ? 'Aggressive' : 'Agresif (Growth)'}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {isEn ? 'Maximum Long-Term Alpha' : 'Akumulasi Hasil Maksimal'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                        VOO 40% &bull; Kripto 25% &bull; Kas 20%
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Three Simple Practical Questions */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5 sm:p-6 backdrop-blur-xl shadow-sm space-y-5">
                  <div className="border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                        2
                      </span>
                      {isEn ? 'Refine in 30 Seconds' : 'Sesuaikan dalam 30 Detik (3 Pilihan Cepat)'}
                    </h3>
                  </div>

                  {/* Pertanyaan A: Target Waktu Investasi */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      A. {isEn ? 'Investment Time Horizon' : 'Berapa lama target waktu investasi Anda?'}
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { label: isEn ? '1 - 3 Years' : '1 - 3 Tahun', sub: isEn ? 'Short-term' : 'Jangka Pendek', val: 3 },
                        { label: isEn ? '3 - 7 Years' : '3 - 7 Tahun', sub: isEn ? 'Medium-term' : 'Menengah', val: 5 },
                        { label: isEn ? '7 - 15+ Years' : '7 - 15+ Tahun', sub: isEn ? 'Long-term' : 'Jangka Panjang', val: 12 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setHorizonYears(item.val);
                          }}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                            horizonYears === item.val
                              ? 'border-blue-500 bg-blue-500/15 text-blue-700 dark:text-white font-bold shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-bold">{item.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pertanyaan B: Reaksi jika Pasar Turun */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      B. {isEn ? 'Comfort with Market Drawdowns' : 'Bagaimana reaksi Anda saat pasar sedang anjlok -20%?'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        {
                          label: isEn ? 'Anxious / Conservative' : 'Cemas & Ingin Amankan Kas',
                          sub: isEn ? 'Low tolerance' : 'Prioritas bebas risiko',
                          reaction: 30,
                          comfort: 35,
                          loss: 5,
                        },
                        {
                          label: isEn ? 'Calm / Maintain DCA' : 'Tenang & Tetap Rutin DCA',
                          sub: isEn ? 'Disciplined core' : 'Disiplin jangka panjang',
                          reaction: 75,
                          comfort: 70,
                          loss: 3,
                        },
                        {
                          label: isEn ? 'Aggressive / Buy Dip' : 'Manfaatkan Diskon / Tambah',
                          sub: isEn ? 'High courage' : 'Peluang akumulasi harga murah',
                          reaction: 95,
                          comfort: 85,
                          loss: 1,
                        },
                      ].map((item) => {
                        const isSelected = crashReaction === item.reaction;
                        return (
                          <button
                            key={item.reaction}
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              setCrashReaction(item.reaction);
                              setVolatilityComfort(item.comfort);
                              setLossAversion(item.loss);
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-purple-500 bg-purple-500/15 text-purple-700 dark:text-white font-bold shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <div className="font-bold">{item.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pertanyaan C: Batas Kripto (Bitcoin) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      C. {isEn ? 'Digital Asset (Bitcoin) Guardrail' : 'Batas maksimal aset digital (Bitcoin) yang Anda kehendaki?'}
                    </label>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {[
                        { label: '0% Kripto', val: 'NONE' },
                        { label: 'Max 5%', val: 'CONSERVATIVE_5' },
                        { label: 'Max 10%', val: 'MODERATE_10' },
                        { label: 'Max 20%', val: 'AGGRESSIVE_20' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setCryptoPreference(item.val as any);
                          }}
                          className={`p-2.5 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                            cryptoPreference === item.val
                              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-white shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pertanyaan D: Tujuan Finansial Utama */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      D. {isEn ? 'Primary Financial Objective' : 'Apa tujuan finansial utama yang diprioritaskan?'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        {
                          label: isEn ? 'Preservation' : 'Preservasi Modal',
                          sub: isEn ? 'Beat Inflation' : 'Amankan Nilai',
                          val: 'CAPITAL_PRESERVATION',
                        },
                        {
                          label: isEn ? 'Balanced' : 'Seimbang (Core)',
                          sub: isEn ? 'Optimal Barbell' : 'Kombinasi Core',
                          val: 'BALANCED_GROWTH',
                        },
                        {
                          label: isEn ? 'Aggressive' : 'Akumulasi Agresif',
                          sub: isEn ? 'Maximum Alpha' : 'Compounding Tinggi',
                          val: 'AGGRESSIVE_WEALTH_ACCUMULATION',
                        },
                        {
                          label: isEn ? 'Passive Income' : 'Dividen & Kupon',
                          sub: isEn ? 'Cashflow Focus' : 'Arus Kas Rutin',
                          val: 'PASSIVE_DIVIDEND_INCOME',
                        },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setPrimaryGoal(item.val as any);
                          }}
                          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                            primaryGoal === item.val
                              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-700 dark:text-white font-bold shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-bold text-[11px]">{item.label}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{item.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Button: Run Diagnosis */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRunDiagnosis}
                      disabled={diagnosing}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                    >
                      <Sparkles className={`h-4 w-4 text-amber-300 ${diagnosing ? 'animate-spin' : ''}`} />
                      <span>{diagnosing ? dict.profiler.diagnosing : isEn ? 'Run AI Diagnosis & Formulate Dynamic Assets' : 'Jalankan Diagnosis AI (Rumuskan Aset Dinamis)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── ADVANCED MODE: 13 PARAMS WITH ORGANIZED TABS ── */
              <div className="space-y-4">
                <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900/80 p-1 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('CAPACITY')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'CAPACITY'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    <span>{dict.profiler.tabCapacity} ({currentCapacity})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('TOLERANCE')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'TOLERANCE'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>{dict.profiler.tabTolerance} ({currentTolerance})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('CUSTOMIZATION')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'CUSTOMIZATION'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>{dict.profiler.tabCustomization}</span>
                  </button>
                </div>

                {/* TAB 1: CAPACITY */}
                {activeTab === 'CAPACITY' && (
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {dict.profiler.objectiveCapacityTitle}
                      </h4>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Score: {currentCapacity}/100
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{dict.profiler.q1Title}</span>
                        <span className="text-blue-600">{emergencyMonths} Bulan</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="1"
                        value={emergencyMonths}
                        onChange={(e) => setEmergencyMonths(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{dict.profiler.q2Title}</span>
                        <span className="text-blue-600">{Math.round(savingsRatio * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.7"
                        step="0.05"
                        value={savingsRatio}
                        onChange={(e) => setSavingsRatio(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{dict.profiler.q3Title}</span>
                        <span className="text-blue-600">{horizonYears} Tahun</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={horizonYears}
                        onChange={(e) => setHorizonYears(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{dict.profiler.q4Title}</span>
                        <span className="text-blue-600">{incomeStability}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="5"
                        value={incomeStability}
                        onChange={(e) => setIncomeStability(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Navigation to Tab 2 */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setActiveTab('TOLERANCE');
                        }}
                        className="w-full py-3 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>{isEn ? 'Next: Psychological Tolerance Tab' : 'Lanjut ke Tab 2: Toleransi Mental'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: TOLERANCE */}
                {activeTab === 'TOLERANCE' && (
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {dict.profiler.subjectiveToleranceTitle}
                      </h4>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        Score: {currentTolerance}/100
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{dict.profiler.q5Title}</span>
                        <span className="text-purple-600">{crashReaction}/100</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={crashReaction}
                        onChange={(e) => setCrashReaction(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{dict.profiler.q6Title}</span>
                        <span className="text-purple-600">{volatilityComfort}/100</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={volatilityComfort}
                        onChange={(e) => setVolatilityComfort(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{dict.profiler.q7Title}</span>
                        <span className="text-purple-600">{experienceYears} Tahun</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    {/* Navigation between Tabs */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setActiveTab('CAPACITY');
                        }}
                        className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        <span>{isEn ? 'Back' : 'Kembali'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setActiveTab('CUSTOMIZATION');
                        }}
                        className="flex-1 py-3 rounded-2xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 font-bold text-xs border border-purple-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>{isEn ? 'Next: Preferences & Goals' : 'Lanjut ke Tab 3: Preferensi & Tujuan'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: CUSTOMIZATION */}
                {activeTab === 'CUSTOMIZATION' && (
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {dict.profiler.customizationTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isEn ? 'Configure your strategic objective & digital asset guardrails.' : 'Pilih tujuan strategis & batasan alokasi aset digital Anda.'}
                        </p>
                      </div>
                    </div>

                    {/* 1. Primary Financial Goal Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isEn ? 'Your Primary Financial Goal:' : 'Tujuan Finansial Utama Portofolio:'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[
                          {
                            label: isEn ? 'Capital Preservation (Beat Inflation)' : 'Preservasi Modal (Kalahkan Inflasi)',
                            desc: isEn ? 'Focus on MMF, Sovereign Bonds & Gold' : 'Fokus RDPU, SBN ORI & Emas Fisik',
                            val: 'CAPITAL_PRESERVATION',
                          },
                          {
                            label: isEn ? 'Balanced Growth (Risk-Adjusted)' : 'Pertumbuhan Seimbang (Barbell Core)',
                            desc: isEn ? 'Optimal mix across global & domestic assets' : 'Kombinasi optimal saham global, domestik & kas',
                            val: 'BALANCED_GROWTH',
                          },
                          {
                            label: isEn ? 'Aggressive Wealth Accumulation' : 'Akumulasi Kekayaan Maksimal',
                            desc: isEn ? 'High tech equity & asymmetric upside' : 'Mesin compounding US Tech, AI & Alpha',
                            val: 'AGGRESSIVE_WEALTH_ACCUMULATION',
                          },
                          {
                            label: isEn ? 'Passive Dividend Income' : 'Pendapatan Dividen & Arus Kas Pasif',
                            desc: isEn ? 'High-dividend blue chips & bond coupons' : 'SBN kupon bulanan & saham dividen yield jumbo',
                            val: 'PASSIVE_DIVIDEND_INCOME',
                          },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              setPrimaryGoal(item.val as any);
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              primaryGoal === item.val
                                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-white font-bold shadow-sm ring-1 ring-emerald-500/30'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <div className="font-bold text-xs">{item.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Crypto Preference */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isEn ? 'Digital Asset / Bitcoin Guardrail Preference:' : 'Batas Alokasi Aset Digital / Kripto:'}
                      </label>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        {[
                          { label: '0% (No Crypto)', val: 'NONE' },
                          { label: 'Max 5% (Conservative)', val: 'CONSERVATIVE_5' },
                          { label: 'Max 10% (Moderate)', val: 'MODERATE_10' },
                          { label: 'Max 20% (Aggressive)', val: 'AGGRESSIVE_20' },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => {
                              soundManager.playClick();
                              setCryptoPreference(item.val as any);
                            }}
                            className={`p-2.5 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                              cryptoPreference === item.val
                                ? 'border-blue-500 bg-blue-500/15 text-blue-700 dark:text-white shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Manual Fine Tuning Toggle & Sliders */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {isEn ? 'Manual Target Weight Fine-Tuning (Optional)' : 'Kustomisasi Bobot Target Manual (Opsional)'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isEn ? 'Override algorithmic weights manually' : 'Sesuaikan persentase secara mandiri'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnableCustomWeights(!enableCustomWeights)}
                          className={`text-xs px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${
                            enableCustomWeights
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {enableCustomWeights ? 'Kustom: AKTIF' : 'Otomatis AI'}
                        </button>
                      </div>

                      {enableCustomWeights && (
                        <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>Kas RDPU (IDR):</span>
                              <span>{customAllocations.MMF_IDR}%</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="80"
                              step="5"
                              value={customAllocations.MMF_IDR}
                              onChange={(e) =>
                                setCustomAllocations({ ...customAllocations, MMF_IDR: Number(e.target.value) })
                              }
                              className="w-full accent-emerald-500 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>S&P 500 ETF (VOO):</span>
                              <span>{customAllocations.ETF_VOO}%</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="80"
                              step="5"
                              value={customAllocations.ETF_VOO}
                              onChange={(e) =>
                                setCustomAllocations({ ...customAllocations, ETF_VOO: Number(e.target.value) })
                              }
                              className="w-full accent-blue-500 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>Emas Fisik (XAU):</span>
                              <span>{customAllocations.GOLD_XAU}%</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="80"
                              step="5"
                              value={customAllocations.GOLD_XAU}
                              onChange={(e) =>
                                setCustomAllocations({ ...customAllocations, GOLD_XAU: Number(e.target.value) })
                              }
                              className="w-full accent-yellow-500 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>Bitcoin (BTC):</span>
                              <span>{customAllocations.CRYPTO_BTC}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="40"
                              step="5"
                              value={customAllocations.CRYPTO_BTC}
                              onChange={(e) =>
                                setCustomAllocations({ ...customAllocations, CRYPTO_BTC: Number(e.target.value) })
                              }
                              className="w-full accent-orange-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. Special Instructions for Gemini AI */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isEn ? 'Special Context or Notes for Gemini AI (Optional):' : 'Instruksi Khusus untuk Gemini AI (Opsional):'}
                      </label>
                      <textarea
                        rows={2}
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        placeholder={
                          isEn
                            ? 'e.g. Preparing for early retirement in 10 years, prioritize high dividend yield...'
                            : 'Contoh: Menyiapkan dana pensiun dalam 10 tahun, prioritaskan dividen bulanan dan efisiensi pajak...'
                        }
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Primary Execution Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setActiveTab('TOLERANCE');
                        }}
                        className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        <span>{isEn ? 'Back' : 'Kembali'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRunDiagnosis}
                        disabled={diagnosing}
                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                      >
                        <Sparkles className={`h-4 w-4 text-amber-300 ${diagnosing ? 'animate-spin' : ''}`} />
                        <span>{diagnosing ? dict.profiler.diagnosing : isEn ? 'Run Full AI Diagnosis (Formulate Dynamic Assets)' : 'Jalankan Diagnosis AI (Rumuskan Aset Dinamis)'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: CLEAN RECOMMENDATION CARD & VISUAL OUTPUT ── */}
          <div className="lg:col-span-5 space-y-5">
            {surveyMode === 'CUSTOM_STUDIO' ? (
              <CustomPortfolioAuditReport
                auditResult={customAuditResult}
                onApplyPortfolio={handleApplyCustomPortfolio}
                appliedSuccess={appliedCustomSuccess}
                onRunAudit={handleRunCustomAudit}
                auditing={auditingCustom}
                holdingsCount={customStudioHoldings.length}
                totalWeight={
                  Math.round(customStudioHoldings.reduce((s, h) => s + h.weight, 0) * 10) / 10
                }
                horizonYears={customHorizonYears}
                isEn={isEn}
              />
            ) : !profileResult ? (
              /* ── STATE 1: MENUNGGU DIAGNOSIS AI (Awaiting AI Diagnosis) ── */
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        {isEn ? 'AI Strategy Profiler' : 'Profil Risiko & Strategi AI'}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {isEn ? 'Awaiting AI Diagnosis' : 'Menunggu Diagnosis AI'}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-extrabold flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    {isEn ? 'Pending Input' : 'Belum Didiagnosis'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isEn
                      ? 'Asset allocations are not yet generated. Complete the questionnaire on the left and run the AI diagnosis to formulate a dynamic, tailored multi-asset portfolio based on your risk capacity and financial goals.'
                      : 'Aset-aset investasi dan alokasi portofolio belum dirumuskan. Jawab seluruh kuesioner di sebelah kiri, kemudian jalankan diagnosis AI untuk merumuskan keranjang multi-aset dinamis yang direkomendasikan secara personal.'}
                  </p>

                  {/* 3 Step Roadmap */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold">1</span>
                      <span>{isEn ? 'Fill in your financial balance sheet & behavioral comfort parameters.' : 'Tentukan parameter neraca finansial & kenyamanan psikologis di sebelah kiri.'}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">2</span>
                      <span>{isEn ? 'Click Run AI Diagnosis to calculate 2D capacity & formulate dynamic assets.' : 'Klik Jalankan Diagnosis AI untuk merumuskan keranjang aset dinamis.'}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">3</span>
                      <span>{isEn ? 'Review dynamic assets, expected CAGR, and apply directly to your portfolio.' : 'Tinjau aset rekomendasi AI dan terapkan langsung ke Smart Rebalancer.'}</span>
                    </div>
                  </div>
                </div>

                {/* Live Real-Time Coordinate Estimation Preview */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 border border-blue-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-blue-500" />
                      {isEn ? 'Live Coordinate Estimation' : 'Estimasi Koordinat Sementara (Live)'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold">
                      {livePreviewScores.strategyName.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase block">
                        {isEn ? 'Capacity (Balance Sheet)' : 'Kapasitas (Neraca)'}
                      </span>
                      <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        {livePreviewScores.capacityScore}
                      </div>
                      <span className="text-[10px] text-slate-400">Skor Objektif</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase block">
                        {isEn ? 'Tolerance (Mental)' : 'Toleransi (Mental)'}
                      </span>
                      <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        {livePreviewScores.toleranceScore}
                      </div>
                      <span className="text-[10px] text-slate-400">Skor Psikologis</span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA Button to Run Diagnosis */}
                <button
                  type="button"
                  onClick={handleRunDiagnosis}
                  disabled={diagnosing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <Sparkles className={`h-4 w-4 text-amber-300 ${diagnosing ? 'animate-spin' : ''}`} />
                  <span>
                    {diagnosing
                      ? isEn ? 'Synthesizing with Gemini 2.5 AI...' : 'Mendiagnosis dengan Gemini AI...'
                      : isEn ? 'Run AI Diagnosis & Formulate Dynamic Assets' : 'Jalankan Diagnosis AI (Rumuskan Aset Dinamis)'}
                  </span>
                </button>
              </div>
            ) : (
              /* ── STATE 2: HASIL DIAGNOSIS AI DENGAN ASET DINAMIS (Diagnosed) ── */
              <div className="space-y-5">
                {/* 1. Target Strategy & Dynamic Multi-Asset Basket */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {isEn ? 'AI Formulated Strategy' : 'Strategi Portofolio Dinamis AI'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                        {profileResult.strategyName.replace(/_/g, ' ')}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold">
                      Total 100%
                    </span>
                  </div>

                  {/* Dynamic Asset Recommendation Tiles */}
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{isEn ? 'Recommended Dynamic Multi-Asset Basket' : 'Keranjang Multi-Aset Dinamis Rekomendasi AI'}</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">{displayedAssets.length} Aset Terpilih</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {displayedAssets.map((asset) => (
                        <div
                          key={asset.assetCode}
                          style={{ borderColor: `${asset.color}40`, backgroundColor: `${asset.color}0c` }}
                          className="p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 relative overflow-hidden transition-all hover:scale-[1.01]"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs tracking-wide" style={{ color: asset.color }}>
                                {asset.ticker}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                                {asset.categoryLabel}
                              </span>
                            </div>
                            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                              {(asset.weight * 100).toFixed(0)}%
                            </div>
                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                              {asset.name}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 space-y-1">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                              {asset.role}
                            </div>
                            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400 pt-0.5">
                              <span>CAGR +{(asset.expectedCagr * 100).toFixed(1)}%</span>
                              <span>Vol ~{(asset.annualVolatility * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Expected Return & Volatility Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isEn ? 'Expected Portfolio CAGR' : 'Estimasi Return Portofolio'}
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        +{dynamicStats.cagr}% / tahun
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isEn ? 'Portfolio Volatility' : 'Estimasi Volatilitas Risiko'}
                      </span>
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">
                        ~{dynamicStats.volatility}%
                      </span>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    type="button"
                    onClick={handleApplyStrategy}
                    className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                      appliedSuccess
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25 hover:scale-[1.01]'
                    }`}
                  >
                    {appliedSuccess ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{isEn ? 'Applied to Portfolio & Rebalancer!' : 'Strategi Berhasil Diterapkan ke Portofolio!'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>{isEn ? 'Apply Dynamic Strategy to Portfolio' : 'Terapkan Strategi Ini ke Portofolio Saya'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. 2D Balance Sheet Capacity vs Mental Tolerance Score Summary */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-5 backdrop-blur-xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{isEn ? '2D Risk Diagnostic' : 'Diagnosis Keseimbangan 2D'}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono">
                      Gap: {Math.round((profileResult.capacityScore - profileResult.toleranceScore) * 10) / 10 > 0 ? '+' : ''}
                      {Math.round((profileResult.capacityScore - profileResult.toleranceScore) * 10) / 10}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase block">
                        Kapasitas Neraca
                      </span>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                        {profileResult.capacityScore}
                      </div>
                      <span className="text-[10px] text-slate-400">Objektif (Finansial)</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase block">
                        Toleransi Mental
                      </span>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                        {profileResult.toleranceScore}
                      </div>
                      <span className="text-[10px] text-slate-400">Psikologis (Emosional)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Gemini AI Behavioral Insights */}
                <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 p-5 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {isEn ? 'Gemini 2.5 AI Behavioral Synthesis' : 'Wawasan Perilaku Gemini AI'}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                      Behavioral Finance
                    </span>
                  </div>

                  {/* Dominant Bias */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Bias Kognitif Dominan:
                    </span>
                    <p className="font-bold text-amber-700 dark:text-amber-300">
                      {profileResult.geminiDiagnosis.dominant_bias}
                    </p>
                  </div>

                  {/* Custom Guidance if available */}
                  {profileResult.geminiDiagnosis.custom_guidance && (
                    <div className="space-y-1 text-xs pt-1.5 border-t border-slate-200/80 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                        Panduan Sasaran Finansial:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        {profileResult.geminiDiagnosis.custom_guidance}
                      </p>
                    </div>
                  )}

                  {/* 3 Execution Rules */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                      3 Aturan Eksekusi Disiplin:
                    </span>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
                      {profileResult.geminiDiagnosis.execution_rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action link */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setProfileResult(null);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>{isEn ? 'Adjust Survey' : 'Ubah Jawaban'}</span>
                    </button>
                    <Link
                      href="/rebalancer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                    >
                      <span>{isEn ? 'Go to Smart Rebalancer' : 'Buka Smart Rebalancer'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Universal Multi-Asset Catalog Modal */}
      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        selectedAssetCodes={customStudioHoldings.map((h) => h.assetCode)}
        onSelectAsset={handleSelectAssetFromCatalog}
        isEn={isEn}
      />
    </AppShell>
  );
}
