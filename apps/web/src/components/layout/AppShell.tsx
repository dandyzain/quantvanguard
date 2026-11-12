'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DisclaimerFooter } from './DisclaimerFooter';
import { AuthModal } from '@/components/auth/AuthModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 bg-slate-100/60 dark:bg-slate-950/60">
          {children}
          <DisclaimerFooter />
        </main>
      </div>
      <AuthModal />
    </div>
  );
}
