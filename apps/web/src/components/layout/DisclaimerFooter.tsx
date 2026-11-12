'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Info, FileText, Lock } from 'lucide-react';

export function DisclaimerFooter() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800/80 pt-6 pb-8 text-xs text-slate-500 dark:text-slate-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Compliance Alert */}
        <div className="flex items-start gap-2.5 max-w-3xl">
          <Info className="h-4 w-4 shrink-0 text-amber-500/80 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-slate-300">
              {isEn ? 'Compliance & Educational Disclaimer:' : 'Pernyataan Kepatuhan & Edukasi:'}
            </strong>{' '}
            {isEn
              ? 'QuantVanguard is an independent mathematical simulation and portfolio analytics software platform. It is not a licensed financial advisor, broker-dealer, or fund manager. All rebalancing calculations, AI risk profiles, and macroeconomic stress simulations are purely deterministic and educational tools for self-directed investor consideration.'
              : 'QuantVanguard adalah platform perangkat lunak analitik komputasi dan edukasi portofolio investasi independen. Platform ini bukan Penasihat Investasi, Perantara Pedagang Efek, atau Manajer Investasi (MI) berizin OJK. Seluruh simulasi rebalancing, profil risiko AI, dan stress-test bersifat matematis objektif untuk pertimbangan mandiri pengguna.'}
          </p>
        </div>

        {/* Security / Privacy Trust Badges */}
        <div className="flex items-center gap-4 shrink-0 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
            <span>{isEn ? 'Multi-Tenant Isolation' : 'Enkripsi Multi-Tenant'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>{isEn ? 'Data Privacy Compliant' : 'Kepatuhan Privasi Data'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-900 pt-4 text-[10px] text-slate-500 dark:text-slate-600 gap-2">
        <span>
          © {new Date().getFullYear()} QuantVanguard Wealthtech.{' '}
          {isEn ? 'All rights reserved.' : 'Hak Cipta Dilindungi Undang-Undang.'}
        </span>
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-500">
          <span className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors cursor-pointer">
            {isEn ? 'Terms & Conditions' : 'Syarat & Ketentuan Layanan'}
          </span>
          <span>•</span>
          <span className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors cursor-pointer">
            {isEn ? 'Privacy Policy' : 'Kebijakan Privasi'}
          </span>
          <span>•</span>
          <span className="font-mono text-slate-500 dark:text-slate-600">v1.2.0-public-mvp</span>
        </div>
      </div>
    </footer>
  );
}
