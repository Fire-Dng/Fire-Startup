'use client';

import React from 'react';
import { SideNav, SideNavSection, SideNavItem } from '@astryxdesign/core/SideNav';
import { Badge } from '@astryxdesign/core/Badge';
import { useCms } from '@/context/CmsContext';

export interface CmsSideNavProps {
  ordersCount: number;
  categoriesCount: number;
  productsCount: number;
  materialsCount: number;
  lowStockMaterialsCount: number;
}

export function CmsSideNav({
  ordersCount,
  categoriesCount,
  productsCount,
  materialsCount,
  lowStockMaterialsCount,
}: CmsSideNavProps) {
  const { activeTab, setActiveTab, sideNavCollapseConfig, isEn } = useCms();

  return (
    <div className="cms-sidenav-wrap" style={{ display: 'contents' }}>
      <SideNav collapsible={sideNavCollapseConfig}>
        <SideNavSection title={isEn ? 'Workshop Operations' : 'Vận hành xưởng 3D'}>
          <SideNavItem
            label={isEn ? 'Overview & Charts' : 'Tổng quan & Biểu đồ'}
            icon="info"
            isSelected={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <SideNavItem
            label={isEn ? 'Orders & 3D Tickets' : 'Đơn hàng & Phiếu 3D'}
            icon="calendar"
            isSelected={activeTab === 'orders'}
            endContent={<Badge variant="neutral" label={String(ordersCount)} />}
            onClick={() => setActiveTab('orders')}
          />
        </SideNavSection>

        <SideNavSection title={isEn ? 'Catalog & Cloudinary' : 'Danh mục & Cloudinary'}>
          <SideNavItem
            label={isEn ? 'Category Management' : 'Quản lý danh mục'}
            icon="funnel"
            isSelected={activeTab === 'categories'}
            endContent={<Badge variant="neutral" label={String(categoriesCount)} />}
            onClick={() => setActiveTab('categories')}
          />
          <SideNavItem
            label={isEn ? 'Products' : 'Sản phẩm'}
            icon="viewColumns"
            isSelected={activeTab === 'products'}
            endContent={<Badge variant="neutral" label={String(productsCount)} />}
            onClick={() => setActiveTab('products')}
          />
          <SideNavItem
            label={isEn ? 'Materials BOM' : 'Kho Vỏ sò / Ốc BOM'}
            icon="wrench"
            isSelected={activeTab === 'materials'}
            endContent={
              lowStockMaterialsCount > 0 ? (
                <Badge variant="warning" label={String(lowStockMaterialsCount)} />
              ) : (
                <Badge variant="neutral" label={String(materialsCount)} />
              )
            }
            onClick={() => setActiveTab('materials')}
          />
        </SideNavSection>
      </SideNav>
    </div>
  );
}
