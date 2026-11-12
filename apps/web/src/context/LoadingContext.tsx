'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  title: string;
  subtitle: string;
  progress?: number;
  showLoading: (title?: string, subtitle?: string, progress?: number) => void;
  updateProgress: (progress: number, subtitle?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(
    promiseOrFn: Promise<T> | (() => Promise<T>),
    options?: { title?: string; subtitle?: string; minDurationMs?: number }
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Memuat Data...');
  const [subtitle, setSubtitle] = useState<string>('Memproses algoritma kuantitatif...');
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const activeCountRef = useRef<number>(0);

  const showLoading = useCallback((customTitle?: string, customSubtitle?: string, customProgress?: number) => {
    activeCountRef.current += 1;
    if (customTitle) setTitle(customTitle);
    if (customSubtitle) setSubtitle(customSubtitle);
    setProgress(customProgress);
    setIsLoading(true);
  }, []);

  const updateProgress = useCallback((newProgress: number, newSubtitle?: string) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
    if (newSubtitle) setSubtitle(newSubtitle);
  }, []);

  const hideLoading = useCallback(() => {
    activeCountRef.current = Math.max(0, activeCountRef.current - 1);
    if (activeCountRef.current === 0) {
      setIsLoading(false);
      setProgress(undefined);
    }
  }, []);

  const withLoading = useCallback(
    async <T,>(
      promiseOrFn: Promise<T> | (() => Promise<T>),
      options?: { title?: string; subtitle?: string; minDurationMs?: number }
    ): Promise<T> => {
      const minDuration = options?.minDurationMs ?? 400;
      const startTime = Date.now();

      showLoading(options?.title, options?.subtitle);

      try {
        const promise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
        const result = await promise;

        const elapsed = Date.now() - startTime;
        if (elapsed < minDuration) {
          await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
        }

        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        title,
        subtitle,
        progress,
        showLoading,
        updateProgress,
        hideLoading,
        withLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
