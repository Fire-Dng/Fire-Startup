'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';

export type AdminTab = 'dashboard' | 'orders' | 'categories' | 'products' | 'materials';

interface CmsContextValue {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  isSideNavCollapsed: boolean;
  setIsSideNavCollapsed: (collapsed: boolean) => void;
  sideNavCollapseConfig: {
    isCollapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
    hasButton: boolean;
  };
  toastMsg: string | null;
  setToastMsg: (msg: string | null) => void;
  notify: (msg: string) => void;
  locale: 'vi' | 'en';
  setLocale: (locale: 'vi' | 'en') => void;
  isEn: boolean;
  t: (key: string) => string;
}

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const isEn = locale === 'en';

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 3500);
  }, []);

  const sideNavCollapseConfig = useMemo(
    () => ({
      isCollapsed: isSideNavCollapsed,
      onCollapsedChange: setIsSideNavCollapsed,
      hasButton: false,
    }),
    [isSideNavCollapsed]
  );

  const value = useMemo<CmsContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      themeMode,
      setThemeMode,
      isSideNavCollapsed,
      setIsSideNavCollapsed,
      sideNavCollapseConfig,
      toastMsg,
      setToastMsg,
      notify,
      locale,
      setLocale,
      isEn,
      t,
    }),
    [
      activeTab,
      themeMode,
      isSideNavCollapsed,
      sideNavCollapseConfig,
      toastMsg,
      notify,
      locale,
      setLocale,
      isEn,
      t,
    ]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used within CmsProvider');
  }
  return ctx;
}
