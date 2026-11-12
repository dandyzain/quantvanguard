'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  BrainCircuit,
  Scale,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  User,
} from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { soundManager } from '@/lib/audio/soundEffects';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { portfolio } = usePortfolio();
  const { user, isDemo } = useAuth();
  const { dict } = useLanguage();

  const handleToggle = () => {
    soundManager.playClick();
    setCollapsed(!collapsed);
  };

  const navItems = [
    {
      name: dict.nav.home,
      href: '/',
      icon: Home,
      badge: null,
    },
    {
      name: dict.nav.dashboard,
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: dict.nav.profiler,
      href: '/profiler',
      icon: BrainCircuit,
      badge: portfolio?.strategyName ? 'Tier 3' : 'New',
    },
    {
      name: dict.nav.rebalancer,
      href: '/rebalancer',
      icon: Scale,
      badge: portfolio?.hasActiveDriftAlert ? '+7.3% Drift' : 'Balanced',
      badgeAlert: portfolio?.hasActiveDriftAlert,
    },
    {
      name: dict.nav.stressTest,
      href: '/stress-test',
      icon: ShieldAlert,
      badge: 'Crisis Lab',
    },
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Floating Collapse/Expand Toggle Button on the Right Border */}
      <button
        onClick={handleToggle}
        className="hidden md:flex absolute -right-3.5 top-5 z-30 h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all cursor-pointer"
        title={collapsed ? 'Perluas sidebar (Expand)' : 'Kecilkan sidebar (Collapse)'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Brand Header */}
      <div
        className={`flex h-16 items-center border-b border-slate-200/80 dark:border-slate-800/80 transition-all ${
          collapsed ? 'justify-center px-2' : 'justify-start px-4 gap-3'
        }`}
      >
        <Link
          href="/"
          onClick={() => soundManager.playClick()}
          className="flex items-center gap-3 overflow-hidden group cursor-pointer"
        >
          {/* Logo Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-slate-950">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:rotate-6 transition-transform" />
            </div>
          </div>

          {/* Brand Text (Hidden when collapsed) */}
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base leading-none truncate">
                Quant<span className="text-blue-600 dark:text-blue-400">Vanguard</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                {dict.common.tagline}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto overflow-x-hidden">
        {/* Menu Section Label / Divider */}
        {collapsed ? (
          <div className="my-2.5 mx-auto w-8 h-px bg-slate-200 dark:bg-slate-800" />
        ) : (
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu
          </div>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => soundManager.playClick()}
              className={`group relative flex items-center rounded-xl transition-all ${
                collapsed
                  ? 'w-12 h-12 mx-auto justify-center'
                  : 'justify-between px-3.5 py-3 text-xs font-semibold'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <Icon
                  className={`shrink-0 transition-colors ${
                    collapsed ? 'h-5 w-5' : 'h-4 w-4'
                  } ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}
                />
                {!collapsed && <span>{item.name}</span>}
              </div>

              {/* Alert indicator dot when collapsed */}
              {collapsed && item.badgeAlert && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5 pointer-events-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 border border-white dark:border-slate-950" />
                </span>
              )}

              {/* Badges (Expanded only) */}
              {!collapsed && item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.badgeAlert
                      ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Floating Tooltip when Collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3.5 hidden group-hover:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold whitespace-nowrap shadow-xl z-50 pointer-events-none transition-all">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        item.badgeAlert
                          ? 'bg-orange-500 text-white'
                          : 'bg-blue-500/20 text-blue-300 dark:text-blue-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {/* Tooltip Caret */}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-100" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Drift Alert Card (Expanded only) */}
      {!collapsed && portfolio?.hasActiveDriftAlert && (
        <div className="m-3 p-3.5 rounded-2xl border border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-950 dark:text-orange-200">
          <div className="flex items-center gap-2 font-semibold text-xs text-orange-700 dark:text-orange-300 mb-1">
            <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            <span>{dict.nav.activeDriftWarning}</span>
          </div>
          <p className="text-[11px] text-orange-900/80 dark:text-orange-200/80 leading-relaxed">
            Bitcoin has drifted to{' '}
            <span className="font-bold text-orange-950 dark:text-white">27.3%</span> (+7.3%{' '}
            {dict.nav.driftDetected})
          </p>
          <Link
            href="/rebalancer"
            onClick={() => soundManager.playClick()}
            className="mt-2.5 block text-center rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 py-1.5 text-xs font-semibold text-orange-800 dark:text-orange-200 transition-colors"
          >
            {dict.nav.reviewRebalance}
          </Link>
        </div>
      )}

      {/* User / Recruiter Status Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
        {collapsed ? (
          /* Collapsed Avatar Icon with Tooltip */
          <div className="relative group flex items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-transform cursor-pointer">
              <Flame className="h-5 w-5" />
            </div>

            {/* Hover Tooltip */}
            <div className="absolute left-full ml-3.5 hidden group-hover:flex flex-col px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs whitespace-nowrap shadow-xl z-50 pointer-events-none">
              <span className="font-bold">
                {!isDemo && user ? user.name : isDemo ? dict.common.recruiterDemo : dict.common.guestVisitor}
              </span>
              <span className="text-[10px] text-emerald-400 dark:text-emerald-600 font-semibold">
                {!isDemo && user ? dict.common.publicPortfolio : isDemo ? 'Rp 150M Multi-Asset' : dict.common.notSignedIn}
              </span>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-100" />
            </div>
          </div>
        ) : (
          /* Expanded Full Badge */
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 p-2.5 border border-slate-200 dark:border-slate-800/60">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Flame className="h-4 w-4" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {!isDemo && user ? user.name : isDemo ? dict.common.recruiterDemo : dict.common.guestVisitor}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                {!isDemo && user ? dict.common.publicPortfolio : isDemo ? 'Rp 150M Multi-Asset' : dict.common.notSignedIn}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
