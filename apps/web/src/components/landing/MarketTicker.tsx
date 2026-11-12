'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ShieldCheck, Sparkles, Activity } from 'lucide-react';

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  tag?: string;
}

const TICKER_DATA: TickerItem[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: '$88,450', change: '+4.12%', isPositive: true, tag: 'Zero-Sell Hold' },
  { symbol: 'VOO', name: 'S&P 500 ETF', price: '$542.80', change: '+0.85%', isPositive: true, tag: 'Target 20%' },
  { symbol: 'XAU/USD', name: 'Physical Gold', price: '$2,684.20', change: '+1.14%', isPositive: true, tag: 'Hedge' },
  { symbol: 'USD/IDR', name: 'FX Spot', price: 'Rp 15.850', change: '-0.18%', isPositive: false, tag: 'Realtime' },
  { symbol: 'IDR MMF', name: 'Pasar Uang', price: 'Rp 1.000', change: '+5.85% p.a.', isPositive: true, tag: 'Buffer 40%' },
  { symbol: 'SHARPE', name: 'Risk/Return', price: '1.84', change: 'Top 5%', isPositive: true, tag: 'Alpha' },
  { symbol: 'MAX DD', name: 'Worst Stress', price: '-8.2%', change: 'Calm', isPositive: true, tag: '2020 Covid' },
  { symbol: 'TAX DRAG', name: 'Capital Gains', price: '0%', change: 'Eliminated', isPositive: true, tag: 'Zero-Sell' },
];

export function MarketTicker() {
  // Duplicate array for seamless infinite marquee loop
  const tickerItems = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div className="w-full bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 py-2 overflow-hidden relative backdrop-blur-md z-30 select-none">
      {/* Gradient Vignette Overlays for smooth entry/exit */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />

      {/* Floating Status Badge at left on desktop */}
      <div className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span>LIVE QUANT STREAM</span>
      </div>

      {/* Infinite Scrolling Marquee */}
      <motion.div
        className="flex items-center gap-6 sm:gap-8 whitespace-nowrap pl-4 xl:pl-48"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 35,
        }}
      >
        {tickerItems.map((item, idx) => (
          <div
            key={`${item.symbol}-${idx}`}
            className="inline-flex items-center gap-2 text-xs font-mono group cursor-default"
          >
            <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">
              {item.symbol}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              ({item.name})
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {item.price}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                item.isPositive
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                  : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
              }`}
            >
              {item.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {item.change}
            </span>
            {item.tag && (
              <span className="text-[9px] uppercase tracking-wider font-sans font-bold px-1.5 py-0.2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400">
                {item.tag}
              </span>
            )}
            <span className="text-slate-300 dark:text-slate-800 ml-3">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
