'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { ENV } from '@/config/env';
import { CmsProvider, useCms } from '@/context/CmsContext';
import {
  getAdminDashboard,
  getAdminOrders,
  getCategoriesAdmin,
  getCustomMaterials,
  getMediaStatus,
  getProducts,
} from '@/lib/api';
import type { MediaStorageStatus } from '@/types';
import {
  ConfirmDeleteDialog,
  type DeleteTarget,
} from '@/components/common/ConfirmDeleteDialog';
import { useCmsAuth } from './auth/useCmsAuth';
import { LoginScreen } from './auth/LoginScreen';
import { CmsShell } from './shell/CmsShell';
import { useOrders } from './orders/useOrders';
import { createOrderColumns } from './orders/orderColumns';
import { OrdersTab } from './orders/OrdersTab';
import { OrderInspectorDrawer } from './orders/inspector/OrderInspectorDrawer';
import { useCategories } from './categories/useCategories';
import { createCategoryColumns } from './categories/categoryColumns';
import { CategoriesTab } from './categories/CategoriesTab';
import { CategoryDialog } from './categories/CategoryDialog';
import { useProducts } from './products/useProducts';
import { createProductColumns } from './products/productColumns';
import { ProductsTab } from './products/ProductsTab';
import { ProductDialog } from './products/ProductDialog';
import { useMaterials } from './materials/useMaterials';
import { createMaterialColumns } from './materials/materialColumns';
import { MaterialsTab } from './materials/MaterialsTab';
import { MaterialDialog } from './materials/MaterialDialog';
import { useKpiStats } from './dashboard/useKpiStats';
import { DashboardTab } from './dashboard/DashboardTab';

function CmsWorkspace() {
  const { activeTab, isEn, locale, t, notify } = useCms();
  const [mediaStatus, setMediaStatus] = useState<MediaStorageStatus | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const ordersState = useOrders({ isEn, notify });
  const productsState = useProducts({ isEn, locale, t, notify });
  const materialsState = useMaterials({ isEn, locale, notify });
  const categoriesState = useCategories({
    products: productsState.products,
    materials: materialsState.materials,
    isEn,
    notify,
  });

  const loadCmsData = () => {
    Promise.all([
      getAdminDashboard(),
      getAdminOrders(),
      getCategoriesAdmin(),
      getProducts({ includeInactive: true }),
      getCustomMaterials(),
      getMediaStatus(),
    ]).then(([, serverOrders, catList, prodList, matList, cloudStatus]) => {
      if (serverOrders && serverOrders.length > 0) {
        ordersState.setOrders(serverOrders);
        ordersState.setInspectedOrder(serverOrders[0]);
      }
      if (catList && catList.length > 0) categoriesState.setCategories(catList);
      if (prodList.length > 0) productsState.setProducts(prodList);
      if (matList.length > 0) materialsState.setMaterials(matList);
      if (cloudStatus) setMediaStatus(cloudStatus);
    });
  };

  const auth = useCmsAuth({ isEn, notify, onAuthenticated: loadCmsData });

  const kpiStats = useKpiStats({
    orders: ordersState.orders,
    materials: materialsState.materials,
    categories: categoriesState.categories,
    products: productsState.products,
    isEn,
  });

  const orderColumns = createOrderColumns({
    isEn,
    isHydrated: auth.isHydrated,
    onStepStatus: ordersState.handleStepOrderStatus,
    onOpenInspector: ordersState.openInspector,
  });

  const categoryColumns = createCategoryColumns({
    isEn,
    piecesLabel: t('common.pieces'),
    onEdit: categoriesState.openEditCategoryModal,
    onDelete: (c) => setDeleteTarget({ type: 'category', id: c._id, name: c.name }),
  });

  const productColumns = createProductColumns({
    isEn,
    piecesLabel: t('common.pieces'),
    categories: categoriesState.categories,
    onEdit: productsState.openEditProductModal,
    onDelete: (p) => setDeleteTarget({ type: 'product', id: p._id, name: p.name }),
  });

  const materialColumns = createMaterialColumns({
    isEn,
    piecesLabel: t('common.pieces'),
    onEdit: materialsState.openEditMaterialModal,
    onDelete: (m) => setDeleteTarget({ type: 'material', id: m._id, name: m.name }),
  });

  const productCategoryOptions = useMemo(() => {
    return categoriesState.categories
      .filter((c) => c.type === 'product')
      .map((c) => ({
        value: c.slug,
        label: isEn ? c.nameEn || c.name : c.name,
      }));
  }, [categoriesState.categories, isEn]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'category') {
      await categoriesState.removeCategory(deleteTarget.id, deleteTarget.name);
    } else if (deleteTarget.type === 'product') {
      await productsState.removeProduct(deleteTarget.id, deleteTarget.name);
    } else {
      await materialsState.removeMaterial(deleteTarget.id, deleteTarget.name);
    }
    setDeleteTarget(null);
  };

  if (!auth.isHydrated) {
    return null;
  }

  if (!auth.currentUser) {
    return (
      <LoginScreen
        loginEmail={auth.loginEmail}
        onEmailChange={auth.setLoginEmail}
        loginPassword={auth.loginPassword}
        onPasswordChange={auth.setLoginPassword}
        loginError={auth.loginError}
        onClearError={() => auth.setLoginError(null)}
        isLoggingIn={auth.isLoggingIn}
        onSubmit={auth.handleLoginSubmit}
      />
    );
  }

  const cloudStorageLabel = mediaStatus?.isCloudinaryConfigured
    ? `Cloudinary (${mediaStatus.cloudName || ENV.CLOUDINARY_CLOUD_NAME})`
    : `Cloudinary (${ENV.CLOUDINARY_CLOUD_NAME || 'fbemz6fi'})`;

  const headerActions = (
    <>
      {activeTab === 'categories' && (
        <Button
          label={isEn ? 'New Category' : 'Thêm danh mục mới'}
          variant="primary"
          onClick={categoriesState.openNewCategoryModal}
        />
      )}
      {activeTab === 'products' && (
        <Button
          label={isEn ? 'New Product' : 'Thêm sản phẩm mới'}
          variant="primary"
          onClick={() => productsState.openNewProductModal(categoriesState.categories)}
        />
      )}
      {activeTab === 'materials' && (
        <Button
          label={isEn ? 'New Material' : 'Thêm nguyên liệu BOM'}
          variant="primary"
          onClick={materialsState.openNewMaterialModal}
        />
      )}
      {(activeTab === 'dashboard' || activeTab === 'orders') && (
        <Button
          label={isEn ? 'Open 3D Inspector' : 'Mở Máy Trạm 3D Inspector'}
          variant="primary"
          onClick={() => {
            if (!ordersState.inspectedOrder && ordersState.orders.length > 0) {
              ordersState.setInspectedOrder(ordersState.orders[0]);
            }
            ordersState.setIsInspectorOpen(true);
          }}
        />
      )}
    </>
  );

  return (
    <>
      <CmsShell
        currentUser={auth.currentUser}
        cloudStorageLabel={cloudStorageLabel}
        onLogout={auth.handleLogout}
        ordersCount={ordersState.orders.length}
        categoriesCount={categoriesState.categories.length}
        productsCount={productsState.products.length}
        materialsCount={materialsState.materials.length}
        lowStockMaterialsCount={kpiStats.lowStockMats.length}
        headerActions={headerActions}
      >
        {activeTab === 'dashboard' && (
          <DashboardTab
            kpiStats={kpiStats}
            recentOrders={ordersState.filteredOrders.slice(0, 5)}
            orderColumns={orderColumns}
            onSelectCategoryFilter={productsState.setProductCatFilter}
            onEditMaterial={materialsState.openEditMaterialModal}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orderSearch={ordersState.orderSearch}
            onOrderSearchChange={ordersState.setOrderSearch}
            orderStatusFilter={ordersState.orderStatusFilter}
            onOrderStatusFilterChange={ordersState.setOrderStatusFilter}
            filteredOrders={ordersState.filteredOrders}
            orderColumns={orderColumns}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesTab
            categorySearch={categoriesState.categorySearch}
            onCategorySearchChange={categoriesState.setCategorySearch}
            categoryTypeFilter={categoriesState.categoryTypeFilter}
            onCategoryTypeFilterChange={categoriesState.setCategoryTypeFilter}
            filteredCategories={categoriesState.filteredCategories}
            categoryColumns={categoryColumns}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            productSearch={productsState.productSearch}
            onProductSearchChange={productsState.setProductSearch}
            productCatFilter={productsState.productCatFilter}
            onProductCatFilterChange={productsState.setProductCatFilter}
            categoryOptions={productCategoryOptions}
            filteredProducts={productsState.filteredProducts}
            productColumns={productColumns}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsTab
            materialSearch={materialsState.materialSearch}
            onMaterialSearchChange={materialsState.setMaterialSearch}
            materialTypeFilter={materialsState.materialTypeFilter}
            onMaterialTypeFilterChange={materialsState.setMaterialTypeFilter}
            filteredMaterials={materialsState.filteredMaterials}
            materialColumns={materialColumns}
          />
        )}
      </CmsShell>

      <OrderInspectorDrawer
        isOpen={ordersState.isInspectorOpen}
        onOpenChange={ordersState.setIsInspectorOpen}
        order={ordersState.inspectedOrder}
        isEn={isEn}
        selectedPlacementId={ordersState.selectedInspectorPlacementId}
        onSelectPlacement={ordersState.setSelectedInspectorPlacementId}
        checkedPlacementIds={ordersState.checkedPlacementIds}
        onTogglePlacementCheck={ordersState.togglePlacementCheck}
        onStepStatus={ordersState.handleStepOrderStatus}
        onTogglePayment={ordersState.handleTogglePayment}
      />

      <CategoryDialog
        isOpen={categoriesState.isCategoryModalOpen}
        onOpenChange={categoriesState.setIsCategoryModalOpen}
        editingCategory={categoriesState.editingCategory}
        form={categoriesState.catForm}
        onChange={categoriesState.setCatForm}
        onSave={categoriesState.handleSaveCategory}
        isEn={isEn}
        cancelLabel={t('common.cancel')}
      />

      <ProductDialog
        isOpen={productsState.isProductModalOpen}
        onOpenChange={productsState.setIsProductModalOpen}
        editingProduct={productsState.editingProduct}
        form={productsState.prodForm}
        onChange={productsState.setProdForm}
        onSave={productsState.handleSaveProduct}
        categoryOptions={productCategoryOptions}
        basePriceValidation={productsState.basePriceValidation}
        craftFeeValidation={productsState.craftFeeValidation}
        isEn={isEn}
        piecesLabel={t('common.pieces')}
        cancelLabel={t('common.cancel')}
      />

      <MaterialDialog
        isOpen={materialsState.isMaterialModalOpen}
        onOpenChange={materialsState.setIsMaterialModalOpen}
        editingMaterial={materialsState.editingMaterial}
        form={materialsState.matForm}
        onChange={materialsState.setMatForm}
        onSave={materialsState.handleSaveMaterial}
        unitPriceValidation={materialsState.matUnitPriceValidation}
        isEn={isEn}
        piecesLabel={t('common.pieces')}
        cancelLabel={t('common.cancel')}
      />

      <ConfirmDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isEn={isEn}
        cancelLabel={t('common.cancel')}
      />
    </>
  );
}

export function CmsApp() {
  return (
    <CmsProvider>
      <CmsWorkspace />
    </CmsProvider>
  );
}
