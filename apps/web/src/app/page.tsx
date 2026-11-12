'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { AuthModal } from '@/components/auth/AuthModal';
import { soundManager } from '@/lib/audio/soundEffects';
import {
  TrendingUp,
  BrainCircuit,
  Scale,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  LogIn,
  DollarSign,
  Activity,
  Coins,
  ChevronRight,
  Layers,
  BarChart3,
  Flame,
  Zap,
  Globe,
  PieChart,
  MousePointerClick,
} from 'lucide-react';

import { GeometricBackground } from '@/components/landing/GeometricBackground';
import { MarketTicker } from '@/components/landing/MarketTicker';
import { InteractiveHeroVisual } from '@/components/landing/InteractiveHeroVisual';
import { ZeroSellInteractiveSandbox } from '@/components/landing/ZeroSellInteractiveSandbox';
import { BentoFeatures } from '@/components/landing/BentoFeatures';
import { CreativeDock } from '@/components/landing/CreativeDock';

export default function HomePage() {
  const router = useRouter();
  const { user, isDemo, openAuthModal, continueAsDemo } = useAuth();
  const { dict, language } = useLanguage();
  const isEn = language === 'en';

  const handleStartDemo = () => {
    soundManager.playChime();
    continueAsDemo();
    router.push('/dashboard');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    soundManager.playClick();
    openAuthModal(mode);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-200 relative overflow-x-hidden">
      {/* Ambient Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-60 dark:opacity-40" />

      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            href="/"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-slate-950">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:rotate-6 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg leading-none">
                Quant<span className="text-blue-600 dark:text-blue-400">Vanguard</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mt-1">
                {dict.common.tagline}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#sandbox"
              onClick={() => soundManager.playClick()}
              className="px-3 py-1.5 rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <Scale className="h-3.5 w-3.5 text-emerald-500" />
              <span>{isEn ? 'Live Sandbox' : 'Sandbox Interaktif'}</span>
            </a>
            <a
              href="#fitur"
              onClick={() => soundManager.playClick()}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              {isEn ? 'Bento Pillars' : '4 Pilar Kuantitatif'}
            </a>
            <a
              href="#zero-sell-alpha"
              onClick={() => soundManager.playClick()}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              {isEn ? 'Tax Alpha' : 'Keunggulan Pajak 0%'}
            </a>
            <a
              href="#how-it-works"
              onClick={() => soundManager.playClick()}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              {isEn ? 'Workflow' : 'Langkah Mudah'}
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {/* Language Switcher (EN | ID) */}
            <LanguageToggle />

            {/* Subtle Divider */}
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-0.5" />

            {user || isDemo ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => soundManager.playClick()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:shadow-blue-500/30 hover:scale-[1.02] cursor-pointer"
                >
                  <span>{dict.landing.openDashboard}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={handleStartDemo}
                  className="hidden xl:flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 transition-all hover:scale-[1.02] cursor-pointer"
                  title="Explore Recruiter Demo Account (Rp 150M)"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
                  <span>Demo (Rp 150M)</span>
                </button>

                <button
                  onClick={() => handleOpenAuth('login')}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  {dict.common.signIn}
                </button>

                <button
                  onClick={() => handleOpenAuth('register')}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  {dict.common.signUp}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. LIVE INSTITUTIONAL MARKET TICKER RIBBON */}
      <MarketTicker />

      {/* 3. HERO SECTION WITH DUAL-MODE INTERACTIVE 3D / CONSTELLATION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
        {/* Glow and background geometric ambient lighting */}
        <GeometricBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Hero Text Content */}
            <div className="lg:col-span-6 xl:col-span-7 text-center lg:text-left space-y-6">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold backdrop-blur-md shadow-inner">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300 shrink-0 animate-pulse" />
                <span>{dict.landing.pill}</span>
              </div>

              {/* Main Headline with Living Shimmer & Ambient Flare */}
              <div className="relative group">
                <div className="absolute -inset-x-6 -inset-y-4 bg-gradient-to-r from-blue-600/15 via-purple-600/20 to-cyan-500/15 blur-2xl rounded-3xl pointer-events-none -z-10 animate-pulse-glow" />

                <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] transition-transform duration-300 group-hover:scale-[1.01]">
                  <span>{dict.landing.headlinePart1}</span>
                  <span className="inline-block bg-gradient-to-r from-blue-500 via-indigo-400 via-purple-400 to-cyan-400 dark:from-blue-400 dark:via-indigo-300 dark:via-purple-300 dark:to-cyan-300 bg-clip-text text-transparent animate-shimmer-text font-black">
                    {dict.landing.headlineGradient}
                  </span>
                </h1>
              </div>

              {/* Subheadline */}
              <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {dict.landing.subheadline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2 max-w-md mx-auto lg:mx-0">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenAuth('register')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span>{dict.landing.startFree}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartDemo}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800/90 px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  <span>{dict.landing.exploreDemo}</span>
                </motion.button>
              </div>

              {/* Trust & Spec Badges (Clean 2x2 Balanced Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-4 text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{dict.landing.badgeFresh}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0" />
                  <span>{dict.landing.badgeZeroTax}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-500 dark:text-purple-400 shrink-0" />
                  <span>{dict.landing.badgeGemini}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>{dict.landing.badgeSha}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dual-Mode Interactive Hero Graphic (WebGL 3D vs Constellation) */}
            <div className="lg:col-span-6 xl:col-span-5 relative">
              <InteractiveHeroVisual />
            </div>
          </div>

          {/* 4. HERO INTERACTIVE ZERO-SELL REBALANCING SANDBOX */}
          <div id="sandbox" className="pt-16 max-w-5xl mx-auto scroll-mt-24">
            <ZeroSellInteractiveSandbox onExploreDemo={handleStartDemo} />
          </div>
        </div>
      </section>

      {/* 5. FEATURE SECTION: BENTO GRID (4 INSTITUTIONAL PILLARS) */}
      <BentoFeatures />

      {/* 6. ZERO-SELL COMPARISON SECTION */}
      <section id="zero-sell-alpha" className="py-24 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden scroll-mt-20">
        {/* Subtle Ambient Emerald Balance Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {isEn ? 'Quantitative Alpha' : 'Keunggulan Kuantitatif'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {dict.landing.comparisonTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              {dict.landing.comparisonSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tradisional */}
            <div className="rounded-3xl border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 p-6 sm:p-8 space-y-4 shadow-sm hover:border-red-300 transition-colors">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base">
                <span>{dict.landing.tradTitle}</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 dark:text-red-400 font-bold">•</span>
                  <span>{dict.landing.tradPoint1}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 dark:text-red-400 font-bold">•</span>
                  <span>{dict.landing.tradPoint2}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 dark:text-red-400 font-bold">•</span>
                  <span>{dict.landing.tradPoint3}</span>
                </li>
              </ul>
            </div>

            {/* QuantVanguard Zero-Sell */}
            <div className="rounded-3xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/10 p-6 sm:p-8 space-y-4 shadow-xl shadow-emerald-500/10 hover:border-emerald-400 transition-colors">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                <CheckCircle2 className="h-5 w-5" />
                <span>{dict.landing.zeroSellTitle}</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-800 dark:text-slate-200">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span>{dict.landing.zeroSellPoint1}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span>{dict.landing.zeroSellPoint2}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span>{dict.landing.zeroSellPoint3}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS: 3 LANGKAH MUDAH */}
      <section id="how-it-works" className="py-24 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/30 relative overflow-hidden scroll-mt-20">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {isEn ? 'Seamless Setup' : 'Langkah Mudah'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {dict.landing.stepsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-7 space-y-4 text-center shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-xl mx-auto">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{dict.landing.step1Title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {dict.landing.step1Desc}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-7 space-y-4 text-center shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-black text-xl mx-auto">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{dict.landing.step2Title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {dict.landing.step2Desc}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-7 space-y-4 text-center shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xl mx-auto">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{dict.landing.step3Title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {dict.landing.step3Desc}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION */}
      <section className="py-24 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-50/80 dark:from-blue-900/40 via-indigo-50/70 dark:via-indigo-900/40 to-purple-50/80 dark:to-purple-900/40 p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="space-y-3 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {dict.landing.finalCtaTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
                {dict.landing.finalCtaDesc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenAuth('register')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>{dict.landing.startFree}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span>{dict.landing.exploreDemo}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <span className="font-bold text-slate-800 dark:text-slate-300">{dict.common.appName}</span>
            <span>&copy; {new Date().getFullYear()} Wealthtech Platform. All rights reserved.</span>
          </div>

          <p className="text-[11px] text-center sm:text-right text-slate-500 max-w-md">
            {dict.landing.footerDisclaimer}
          </p>
        </div>
      </footer>

      {/* 10. FLOATING CREATIVE DOCK */}
      <CreativeDock onStartDemo={handleStartDemo} />

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
}
