'use client';

import { useEffect, useState } from 'react';
import { ENV } from '@/config/env';
import {
  clearCmsSession,
  getStoredCmsSession,
  loginCmsAdmin,
  type CmsAuthUser,
} from '@/lib/api';

interface UseCmsAuthOptions {
  isEn: boolean;
  notify: (msg: string) => void;
  onAuthenticated: () => void;
}

export function useCmsAuth({ isEn, notify, onAuthenticated }: UseCmsAuthOptions) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CmsAuthUser | null>(null);
  const [loginEmail, setLoginEmail] = useState(ENV.DEFAULT_ADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState(ENV.DEFAULT_ADMIN_PASSWORD);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const { token, user } = getStoredCmsSession();
    if (token && user) {
      setCurrentUser(user);
      onAuthenticated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError(
        isEn
          ? 'Please enter both your email and password.'
          : 'Vui lòng nhập đầy đủ Email và Mật khẩu quản trị.'
      );
      return;
    }

    setIsLoggingIn(true);
    try {
      const { user } = await loginCmsAdmin(loginEmail, loginPassword);
      setCurrentUser(user);
      onAuthenticated();
      notify(
        isEn
          ? `Welcome back, ${user.fullName}!`
          : `Xin chào ${user.fullName} (${user.role.toUpperCase()})!`
      );
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : isEn
            ? 'Authentication failed. Please verify your credentials.'
            : 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearCmsSession();
    setCurrentUser(null);
    setLoginError(null);
  };

  return {
    isHydrated,
    currentUser,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    setLoginError,
    isLoggingIn,
    handleLoginSubmit,
    handleLogout,
  };
}
