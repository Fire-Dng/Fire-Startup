'use client';

import React, { useEffect } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { AppShell } from '@astryxdesign/core/AppShell';
import { Layout, LayoutHeader, LayoutContent } from '@astryxdesign/core/Layout';
import { Banner } from '@astryxdesign/core/Banner';
import { HStack } from '@astryxdesign/core/HStack';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { themes, defaultThemeSlug } from '@/astryx-themes';
import { pingServerKeepAlive, type CmsAuthUser } from '@/lib/api';
import { useCms, type AdminTab } from '@/context/CmsContext';
import { CmsTopNav } from './CmsTopNav';
import { CmsSideNav } from './CmsSideNav';

const TAB_HEADERS: Record<
  AdminTab,
  { titleVi: string; titleEn: string; subtitleVi: string; subtitleEn: string }
> = {
  dashboard: {
    titleVi: 'Tổng Quan Xưởng Thủ Công & Biểu Đồ Phân Tích',
    titleEn: 'Workshop Analytics & 3D Crafting Operations',
    subtitleVi:
      'Biểu đồ doanh thu, tỷ trọng danh mục sản phẩm, sản lượng lưới cá thu hồi và tiến độ chế tác 3D.',
    subtitleEn:
      'Real-time revenue charts, category distribution, ghost net recovery impact, and 3D crafting tickets.',
  },
  orders: {
    titleVi: 'Quản Lý Đơn Hàng & Phiếu Chế Tác 3D',
    titleEn: 'Orders & 3D Crafting Tickets',
    subtitleVi:
      'Kiểm tra bản vẽ đính vỏ sò 3D của khách, đối soát thanh toán VietQR và cập nhật tiến độ chế tác.',
    subtitleEn:
      'Inspect 3D custom shell attachments, verify VietQR payments, and advance crafting stages.',
  },
  categories: {
    titleVi: 'Quản Lý Danh Mục Sản Phẩm & Phân Nhóm 3D',
    titleEn: 'Product & Material Category Management',
    subtitleVi:
      'Thêm, chỉnh sửa, sắp xếp các danh mục sản phẩm tái chế và cấu hình phôi 3D mặc định.',
    subtitleEn:
      'Organize product categories, slugs, default 3D mesh presets, and display order.',
  },
  products: {
    titleVi: 'Danh Mục Sản Phẩm Tái Chế & Hình Ảnh Cloudinary',
    titleEn: 'Upcycled Product Catalog & Cloudinary Media',
    subtitleVi:
      'Quản lý phôi sản phẩm 3D, kiểm tra định dạng tiền tệ VNĐ và trường hình ảnh (`image`) trên Cloudinary.',
    subtitleEn:
      'Manage 3D product blanks, validated VND prices, crafting fees, and Cloudinary images.',
  },
  materials: {
    titleVi: 'Kho Nguyên Liệu Vỏ Sò & Ốc Biển BOM',
    titleEn: 'Marine Shell & Snail BOM Inventory',
    subtitleVi:
      'Quản lý định mức tồn kho các loại vỏ sò, ốc biển và charm đính trong phòng thiết kế 3D Studio.',
    subtitleEn:
      'Track marine shell, snail, and charm stock levels used in the 3D Customizer Studio.',
  },
};

export interface CmsShellProps {
  currentUser: CmsAuthUser;
  cloudStorageLabel: string;
  onLogout: () => void;
  ordersCount: number;
  categoriesCount: number;
  productsCount: number;
  materialsCount: number;
  lowStockMaterialsCount: number;
  headerActions: React.ReactNode;
  children: React.ReactNode;
}

export function CmsShell({
  currentUser,
  cloudStorageLabel,
  onLogout,
  ordersCount,
  categoriesCount,
  productsCount,
  materialsCount,
  lowStockMaterialsCount,
  headerActions,
  children,
}: CmsShellProps) {
  const { activeTab, themeMode, toastMsg, setToastMsg, isEn } = useCms();
  const meta = TAB_HEADERS[activeTab];

  // Keep-Alive Heartbeat: Wake up Render backend immediately and ping every 8 minutes
  useEffect(() => {
    pingServerKeepAlive();
    const timer = setInterval(() => {
      pingServerKeepAlive();
    }, 8 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Theme theme={themes[defaultThemeSlug]} mode={themeMode}>
      <AppShell
        height="fill"
        variant="surface"
        contentPadding={0}
        banner={
          toastMsg ? (
            <Banner
              status="success"
              container="section"
              title={toastMsg}
              isDismissable
              onDismiss={() => setToastMsg(null)}
            />
          ) : undefined
        }
        topNav={
          <CmsTopNav
            currentUser={currentUser}
            cloudStorageLabel={cloudStorageLabel}
            onLogout={onLogout}
          />
        }
        sideNav={
          <CmsSideNav
            ordersCount={ordersCount}
            categoriesCount={categoriesCount}
            productsCount={productsCount}
            materialsCount={materialsCount}
            lowStockMaterialsCount={lowStockMaterialsCount}
          />
        }
      >
        <Layout
          height="fill"
          padding={6}
          header={
            <LayoutHeader hasDivider>
              <HStack gap={4} vAlign="center" hAlign="between" wrap="wrap">
                <VStack gap={1}>
                  <Heading level={1}>{isEn ? meta.titleEn : meta.titleVi}</Heading>
                  <Text type="supporting">{isEn ? meta.subtitleEn : meta.subtitleVi}</Text>
                </VStack>
                <HStack gap={2} vAlign="center">
                  {headerActions}
                </HStack>
              </HStack>
            </LayoutHeader>
          }
          content={<LayoutContent>{children}</LayoutContent>}
        />
      </AppShell>
    </Theme>
  );
}
