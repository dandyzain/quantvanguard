'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSessionDto } from '@/lib/types';
import { useLoading } from './LoadingContext';

interface AuthContextType {
  user: UserSessionDto | null;
  token: string;
  isDemo: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  continueAsDemo: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USER: UserSessionDto = {
  id: 'demo-user-recruiter-uuid',
  name: 'Recruiter Guest Portfolio',
  email: 'recruiter-demo@quantvanguard.internal',
  isDemoUser: true,
};

export const DEMO_TOKEN = 'demo-session-token-recruiter';
export const STORAGE_KEY = 'quantvanguard_session_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showLoading, hideLoading } = useLoading();
  // Start as unauthenticated so public users land on the Landing Page
  const [user, setUser] = useState<UserSessionDto | null>(null);
  const [token, setToken] = useState<string>('');
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Initialize session from localStorage on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const savedToken = localStorage.getItem(STORAGE_KEY);
        if (savedToken && savedToken !== DEMO_TOKEN) {
          const res = await fetch('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          const json = await res.json();
          if (json.success && json.data?.user) {
            setUser(json.data.user);
            setToken(savedToken);
            setIsDemo(json.data.user.isDemoUser);
          } else {
            // Token expired or invalid, clear storage
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
            setToken('');
            setIsDemo(false);
          }
        } else if (savedToken === DEMO_TOKEN) {
          // User previously opted into Demo mode
          setUser(DEMO_USER);
          setToken(DEMO_TOKEN);
          setIsDemo(true);
        } else {
          // Fresh unauthenticated visitor
          setUser(null);
          setToken('');
          setIsDemo(false);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
        setUser(null);
        setToken('');
        setIsDemo(false);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    showLoading('Memverifikasi Sesi Akun...', 'Mengotentikasi akun & menyiapkan dasbor...');
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data.user);
        setToken(json.data.token);
        setIsDemo(json.data.user.isDemoUser);
        localStorage.setItem(STORAGE_KEY, json.data.token);
        setIsAuthModalOpen(false);
        await new Promise((r) => setTimeout(r, 300));
        return { success: true };
      } else {
        return { success: false, error: json.error?.message || 'Gagal masuk akun.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan jaringan.' };
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const register = useCallback(async (name: string, email: string, pass: string) => {
    showLoading('Mendaftarkan Akun Baru...', 'Menginisialisasi portofolio fresh 0-state...');
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data.user);
        setToken(json.data.token);
        setIsDemo(false);
        localStorage.setItem(STORAGE_KEY, json.data.token);
        setIsAuthModalOpen(false);
        await new Promise((r) => setTimeout(r, 300));
        return { success: true };
      } else {
        return { success: false, error: json.error?.message || 'Gagal mendaftar.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan jaringan.' };
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const logout = useCallback(async () => {
    showLoading('Keluar dari Sesi...', 'Membersihkan token otentikasi lokal...');
    try {
      if (token && token !== DEMO_TOKEN) {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setToken('');
      setIsDemo(false);
      hideLoading();
    }
  }, [token, showLoading, hideLoading]);

  const continueAsDemo = useCallback(() => {
    showLoading('Menyiapkan Akun Demo (Rp 150M)...', 'Memuat data simulasi multi-aset portofolio...');
    localStorage.setItem(STORAGE_KEY, DEMO_TOKEN);
    setUser(DEMO_USER);
    setToken(DEMO_TOKEN);
    setIsDemo(true);
    setIsAuthModalOpen(false);
    setTimeout(() => {
      hideLoading();
    }, 450);
  }, [showLoading, hideLoading]);

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isDemo,
        isLoading,
        login,
        register,
        logout,
        continueAsDemo,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
