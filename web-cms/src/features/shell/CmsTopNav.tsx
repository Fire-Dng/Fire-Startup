'use client';

import React from 'react';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import { SideNavCollapseButton } from '@astryxdesign/core/SideNav';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Avatar } from '@astryxdesign/core/Avatar';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { ENV } from '@/config/env';
import type { CmsAuthUser } from '@/lib/api';
import { useCms } from '@/context/CmsContext';

export interface CmsTopNavProps {
  currentUser: CmsAuthUser;
  cloudStorageLabel: string;
  onLogout: () => void;
}

export function CmsTopNav({ currentUser, cloudStorageLabel, onLogout }: CmsTopNavProps) {
  const { sideNavCollapseConfig, locale, setLocale, themeMode, setThemeMode, isEn } = useCms();

  return (
    <TopNav
      label="NetLoop CMS Top Navigation"
      heading={
        <HStack gap={2} vAlign="center">
          <SideNavCollapseButton collapsible={sideNavCollapseConfig} size="sm" />
          <img
            src="/favicon.svg"
            alt="WAVO Logo"
            style={{ width: 28, height: 28, borderRadius: 7 }}
          />
          <TopNavHeading
            heading="WAVO × ECO GREEN CMS"
            subheading={isEn ? '3D Craft & Cloudinary Admin' : 'Quản Trị Xưởng Chế Tác 3D'}
          />
        </HStack>
      }
      endContent={
        <HStack gap={2} vAlign="center">
          <HStack gap={1.5} vAlign="center">
            <StatusDot variant="success" label={cloudStorageLabel} />
            <Text type="supporting">{cloudStorageLabel}</Text>
          </HStack>

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

          <Button
            label={isEn ? 'Web Store' : 'Mở Web Store'}
            variant="secondary"
            size="sm"
            icon={<Icon icon="externalLink" />}
            href={ENV.STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          />

          <HStack gap={1.5} vAlign="center">
            <Avatar name={currentUser.fullName} size="sm" />
            <Badge
              variant={currentUser.role === 'admin' ? 'blue' : 'teal'}
              label={currentUser.role.toUpperCase()}
            />
            <Button
              label={isEn ? 'Sign out' : 'Đăng xuất'}
              variant="ghost"
              size="sm"
              onClick={onLogout}
            />
          </HStack>
        </HStack>
      }
    />
  );
}
