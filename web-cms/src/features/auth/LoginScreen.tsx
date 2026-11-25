'use client';

import React from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { Center } from '@astryxdesign/core/Center';
import { themes, defaultThemeSlug } from '@/astryx-themes';
import { ENV } from '@/config/env';
import { useCms } from '@/context/CmsContext';

export interface LoginScreenProps {
  loginEmail: string;
  onEmailChange: (val: string) => void;
  loginPassword: string;
  onPasswordChange: (val: string) => void;
  loginError: string | null;
  onClearError: () => void;
  isLoggingIn: boolean;
  onSubmit: (e?: React.FormEvent) => void;
}

export function LoginScreen({
  loginEmail,
  onEmailChange,
  loginPassword,
  onPasswordChange,
  loginError,
  onClearError,
  isLoggingIn,
  onSubmit,
}: LoginScreenProps) {
  const { themeMode, setThemeMode, locale, setLocale, isEn } = useCms();

  return (
    <Theme theme={themes[defaultThemeSlug]} mode={themeMode}>
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-background-body)',
        }}
      >
        <HStack gap={2} vAlign="center" hAlign="between" padding={4}>
          <HStack gap={2} vAlign="center">
            <img
              src="/favicon.svg"
              alt="WAVO Logo"
              style={{ width: 28, height: 28, borderRadius: 7 }}
            />
            <Text weight="semibold">WAVO × ECO GREEN CMS</Text>
          </HStack>

          <HStack gap={2} vAlign="center">
            <SegmentedControl
              size="sm"
              label={isEn ? 'Language' : 'Ngôn ngữ'}
              value={locale}
              onChange={(val) => setLocale(val as 'vi' | 'en')}
            >
              <SegmentedControlItem value="vi" label="VI" />
              <SegmentedControlItem value="en" label="EN" />
            </SegmentedControl>

            <SegmentedControl
              size="sm"
              label={isEn ? 'Theme Mode' : 'Giao diện'}
              value={themeMode}
              onChange={(val) => setThemeMode(val as 'light' | 'dark')}
            >
              <SegmentedControlItem value="light" label={isEn ? 'Light' : 'Sáng'} />
              <SegmentedControlItem value="dark" label={isEn ? 'Dark' : 'Tối'} />
            </SegmentedControl>
          </HStack>
        </HStack>

        <Center axis="both" padding={6} style={{ flex: 1 }}>
          <div className="cms-anim-enter" style={{ width: '100%', maxWidth: 440 }}>
            <VStack gap={5}>
              <VStack gap={2} hAlign="center">
                <img
                  src="/favicon.svg"
                  alt="WAVO Emblem"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    boxShadow: '0 8px 20px rgba(6, 59, 67, 0.18)',
                  }}
                />
                <Badge variant="neutral" label="Astryx Neutral Admin Portal" />
                <Heading level={1}>
                  {isEn ? 'Sign in to WAVO CMS' : 'Đăng Nhập Quản Trị Xưởng 3D'}
                </Heading>
                <Text type="supporting">
                  {isEn
                    ? 'Enter your Admin or Artisan credentials to manage orders, 3D tickets, and Cloudinary catalog.'
                    : 'Đăng nhập tài khoản Quản trị viên hoặc Nghệ nhân để quản lý đơn hàng, phiếu 3D & kho Cloudinary.'}
                </Text>
              </VStack>

              <Card padding={6} width="100%">
                <form onSubmit={onSubmit}>
                  <VStack gap={4}>
                    {loginError && (
                      <Banner
                        status="error"
                        container="card"
                        collapsible={false}
                        title={isEn ? 'Sign in failed' : 'Đăng nhập không thành công'}
                        description={loginError}
                      />
                    )}

                    <FormLayout>
                      <TextInput
                        label="Email"
                        type="email"
                        size="lg"
                        isRequired
                        value={loginEmail}
                        onChange={onEmailChange}
                        placeholder="admin@dtu-upcycled.vn"
                        autoComplete="email"
                        hasClear
                        width="100%"
                      />

                      <TextInput
                        label={isEn ? 'Password' : 'Mật khẩu'}
                        type="password"
                        size="lg"
                        isRequired
                        value={loginPassword}
                        onChange={onPasswordChange}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                        width="100%"
                      />
                    </FormLayout>

                    <Button
                      type="submit"
                      label={
                        isLoggingIn
                          ? isEn
                            ? 'Signing in...'
                            : 'Đang xác thực...'
                          : isEn
                            ? 'Sign in to CMS'
                            : 'Đăng nhập Hệ thống CMS'
                      }
                      variant="primary"
                      size="lg"
                      width="100%"
                      isLoading={isLoggingIn}
                    />

                    <Divider />

                    <VStack gap={2}>
                      <Text type="supporting">
                        {isEn
                          ? 'Quick fill demo credentials:'
                          : 'Chọn nhanh tài khoản mẫu để kiểm thử phân quyền (RBAC):'}
                      </Text>
                      <HStack gap={2} wrap="wrap">
                        <Button
                          label="Admin (Toàn quyền)"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            onEmailChange(ENV.DEFAULT_ADMIN_EMAIL);
                            onPasswordChange(ENV.DEFAULT_ADMIN_PASSWORD);
                            onClearError();
                          }}
                        />
                        <Button
                          label="Artisan / Staff (Xưởng 3D)"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            onEmailChange('artisan@dtu-upcycled.vn');
                            onPasswordChange(ENV.DEFAULT_ADMIN_PASSWORD);
                            onClearError();
                          }}
                        />
                      </HStack>
                    </VStack>
                  </VStack>
                </form>
              </Card>
            </VStack>
          </div>
        </Center>
      </div>
    </Theme>
  );
}
