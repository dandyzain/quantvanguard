'use client';

import React, { Suspense } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { LoadingProvider } from '@/context/LoadingContext';
import { GlobalLoadingModal } from '@/components/common/GlobalLoadingModal';
import { RouteTransitionIndicator } from '@/components/common/RouteTransitionIndicator';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LoadingProvider>
          <AuthProvider>
            <PortfolioProvider>
              <Suspense fallback={null}>
                <RouteTransitionIndicator />
              </Suspense>
              <GlobalLoadingModal />
              {children}
            </PortfolioProvider>
          </AuthProvider>
        </LoadingProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
