'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { AppShell } from '@astryxdesign/core/AppShell';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import { SideNav, SideNavHeading, SideNavSection, SideNavItem } from '@astryxdesign/core/SideNav';
import { Layout, LayoutHeader, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Section } from '@astryxdesign/core/Section';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { TextInput } from '@astryxdesign/core/TextInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Selector } from '@astryxdesign/core/Selector';
import { Switch } from '@astryxdesign/core/Switch';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Table, proportional, pixel, type TableColumn } from '@astryxdesign/core/Table';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { AlertDialog } from '@astryxdesign/core/AlertDialog';
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';

import { themes, defaultThemeSlug } from '@/astryx-themes';
import { ThreeCanvasViewer } from '@/components/three/ThreeCanvasViewer';
import { BomPriceBreakdownCard } from '@/components/common/BomPriceBreakdownCard';
import { OrderStatusStepper } from '@/components/common/OrderStatusStepper';
import { S3ImageUploader } from '@/components/common/S3ImageUploader';
import { formatVnd } from '@/components/ui/PriceTag';
import { ASSETS, resolveAssetUrl } from '@/config/assets';
import { ENV } from '@/config/env';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';
import { useI18n } from '@/i18n/I18nContext';
import {
  FALLBACK_MATERIALS,
  FALLBACK_PRODUCTS,
  createMaterialAdmin,
  createProductAdmin,
  deleteMaterialAdmin,
  deleteProductAdmin,
  getAdminDashboard,
  getAdminOrders,
  getCustomMaterials,
  getMediaStatus,
  getProducts,
  updateMaterialAdmin,
  updateOrderPaymentStatus,
  updateOrderStatus,
  updateProductAdmin,
} from '@/lib/api';
import {
  CustomMaterial,
  MaterialCategory,
  MediaStorageStatus,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
} from '@/types';

type AdminTab = 'dashboard' | 'orders' | 'products' | 'materials';
type OrderRow = Order & Record<string, unknown>;
type ProductRow = Product & Record<string, unknown>;
type MaterialRow = CustomMaterial & Record<string, unknown>;

const DEMO_CRAFTING_ORDER: Order = {
  _id: 'ord-cms-demo-1',
  orderCode: 'DTU-20261108-OCN1',
  customerInfo: {
    fullName: 'Trần Minh Ngọc',
    phone: '0905888999',
    email: 'minhngoc@dtu.edu.vn',
    address: 'Số 03 Quang Trung, Quận Hải Châu, TP. Đà Nẵng',
    note: 'Nhờ nghệ nhân khâu chắc phần vỏ sò điệp ở mặt trước túi.',
  },
  items: [
    {
      productId: 'prod-bag-01',
      productName: 'Túi Xách Lưới Đại Dương Sơn Trà',
      productSlug: 'tui-xach-luoi-dai-duong-son-tra',
      category: 'bag',
      quantity: 1,
      selectedColor: PRODUCT_COLOR_PRESETS.kelpGreen,
      selectedSize: 'Tiêu chuẩn (38x32cm)',
      unitPrice: 405000,
      subtotal: 405000,
      isCustom: true,
      customDesignSnapshot: {
        productId: 'prod-bag-01',
        productName: 'Túi Xách Lưới Đại Dương Sơn Trà',
        productSlug: 'tui-xach-luoi-dai-duong-son-tra',
        meshPreset: 'tote_bag',
        baseColor: PRODUCT_COLOR_PRESETS.kelpGreen,
        strapColor: PRODUCT_COLOR_PRESETS.terracottaRust,
        artisanNote: 'Đính 2 vỏ sò điệp và 1 sao biển đối xứng ở mặt trước túi.',
        placements: [
          {
            placementId: 'cms-p1',
            materialId: 'mat-shell-01',
            materialName: 'Vỏ Sò Điệp Trắng',
            meshPreset: 'scallop_shell',
            unitPrice: 15000,
            position: [-0.32, 0.22, 0.56],
            normal: [-0.28, 0.08, 0.95],
            rotation: 10,
            scale: 1.15,
            color: PRODUCT_COLOR_PRESETS.sandCream,
          },
          {
            placementId: 'cms-p2',
            materialId: 'mat-shell-02',
            materialName: 'Vỏ Sò Điệp Hồng San Hô',
            meshPreset: 'scallop_shell',
            unitPrice: 18000,
            position: [0.32, 0.22, 0.56],
            normal: [0.28, 0.08, 0.95],
            rotation: -15,
            scale: 1.15,
            color: PRODUCT_COLOR_PRESETS.coralShell,
          },
          {
            placementId: 'cms-p3',
            materialId: 'mat-charm-01',
            materialName: 'Charm Sao Biển Đúc Đồng',
            meshPreset: 'starfish_charm',
            unitPrice: 22000,
            position: [0.0, -0.15, 0.58],
            normal: [0.0, 0.02, 0.99],
            rotation: 0,
            scale: 1.2,
            color: PRODUCT_COLOR_PRESETS.copperStarfish,
          },
        ],
        basePrice: 320000,
        craftFee: 30000,
        materialsTotal: 55000,
        estimatedPrice: 405000,
      },
    },
  ],
  totalAmount: 405000,
  shippingFee: 30000,
  finalAmount: 435000,
  totalNetWeightGrams: 380,
  paymentMethod: 'vietqr',
  paymentStatus: 'paid',
  status: 'in_crafting',
  createdAt: '2026-11-24T08:30:00.000Z',
  updatedAt: '2026-11-24T10:15:00.000Z',
};

function formatDateTimeDisplay(isoString: string, isEn: boolean): string {
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleString(isEn ? 'en-US' : 'vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function getOrderStatusBadge(
  status: OrderStatus,
  isEn: boolean
): { label: string; variant: 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'teal' | 'orange' | 'green' } {
  const map: Record<
    OrderStatus,
    { vi: string; en: string; variant: 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'teal' | 'orange' | 'green' }
  > = {
    pending: { vi: 'Chờ xác nhận', en: 'Pending', variant: 'warning' },
    confirmed: { vi: 'Đã xác nhận BOM', en: 'Confirmed', variant: 'blue' },
    in_crafting: { vi: 'Đang chế tác 3D', en: 'In 3D Crafting', variant: 'orange' },
    quality_check: { vi: 'Kiểm định QC', en: 'Quality Check', variant: 'teal' },
    shipping: { vi: 'Đang giao hàng', en: 'Shipping', variant: 'blue' },
    delivered: { vi: 'Đã hoàn thành', en: 'Delivered', variant: 'green' },
    cancelled: { vi: 'Đã hủy', en: 'Cancelled', variant: 'error' },
  };
  const entry = map[status] || map.pending;
  return { label: isEn ? entry.en : entry.vi, variant: entry.variant };
}

const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'in_crafting',
  in_crafting: 'quality_check',
  quality_check: 'shipping',
  shipping: 'delivered',
};

export default function AdminCmsPage() {
  const { t, locale, setLocale } = useI18n();
  const isEn = locale === 'en';

  const [isHydrated, setIsHydrated] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Data States
  const [orders, setOrders] = useState<Order[]>([DEMO_CRAFTING_ORDER]);
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [materials, setMaterials] = useState<CustomMaterial[]>(FALLBACK_MATERIALS);
  const [mediaStatus, setMediaStatus] = useState<MediaStorageStatus | null>(null);

  // Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState('all');

  // 3D Crafting Inspector Drawer State (BR-07)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(DEMO_CRAFTING_ORDER);
  const [selectedInspectorPlacementId, setSelectedInspectorPlacementId] = useState<string | null>(
    null
  );
  const [checkedMaterialIds, setCheckedMaterialIds] = useState<string[]>([]);

  // Product Form Dialog State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    slug: '',
    category: 'bag' as ProductCategory,
    basePrice: 320000,
    craftFee: 30000,
    stock: 20,
    shortDescription: '',
    imageUrl: ASSETS.products.toteBagMain as string,
    meshPreset: 'tote_bag',
    glbUrl: '',
    netWeightGrams: 350,
    originSea: 'Bán đảo Sơn Trà, Đà Nẵng',
    isCustomizable: true,
  });

  // Material Form Dialog State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CustomMaterial | null>(null);
  const [matForm, setMatForm] = useState({
    name: '',
    materialType: 'shell' as MaterialCategory,
    unitPrice: 15000,
    stockQuantity: 100,
    colorHex: PRODUCT_COLOR_PRESETS.sandCream as string,
    thumbnail: ASSETS.materials.scallopShell as string,
    meshPreset: 'scallop_shell',
    glbUrl: '',
    description: '',
  });

  // Confirm Delete AlertDialog State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'material';
    id: string;
    name: string;
  } | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    setIsHydrated(true);
    let mounted = true;
    Promise.all([
      getAdminDashboard(),
      getAdminOrders(),
      getProducts({ includeInactive: true }),
      getCustomMaterials(),
      getMediaStatus(),
    ]).then(([, serverOrders, prodList, matList, cloudStatus]) => {
      if (!mounted) return;
      if (serverOrders && serverOrders.length > 0) {
        setOrders(serverOrders);
        setInspectedOrder(serverOrders[0]);
      } else {
        try {
          const raw = localStorage.getItem('dtu_recent_orders_v1');
          const localOrders: Order[] = raw ? JSON.parse(raw) : [];
          if (localOrders.length > 0) {
            setOrders([...localOrders, DEMO_CRAFTING_ORDER]);
          }
        } catch {
          // Ignore
        }
      }
      if (prodList.length > 0) setProducts(prodList);
      if (matList.length > 0) setMaterials(matList);
      if (cloudStatus) setMediaStatus(cloudStatus);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Filtered Lists
  const filteredOrders = useMemo<OrderRow[]>(() => {
    return orders
      .filter((o) => {
        if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
        if (orderSearch) {
          const q = orderSearch.toLowerCase();
          return (
            o.orderCode.toLowerCase().includes(q) ||
            o.customerInfo.fullName.toLowerCase().includes(q) ||
            o.customerInfo.phone.includes(q)
          );
        }
        return true;
      })
      .map((o) => o as OrderRow);
  }, [orders, orderStatusFilter, orderSearch]);

  const filteredProducts = useMemo<ProductRow[]>(() => {
    return products
      .filter((p) => {
        if (productCatFilter !== 'all' && p.category !== productCatFilter) return false;
        if (productSearch) {
          return p.name.toLowerCase().includes(productSearch.toLowerCase());
        }
        return true;
      })
      .map((p) => p as ProductRow);
  }, [products, productCatFilter, productSearch]);

  const filteredMaterials = useMemo<MaterialRow[]>(() => {
    return materials
      .filter((m) => {
        if (materialTypeFilter !== 'all' && m.materialType !== materialTypeFilter) return false;
        if (materialSearch) {
          return m.name.toLowerCase().includes(materialSearch.toLowerCase());
        }
        return true;
      })
      .map((m) => m as MaterialRow);
  }, [materials, materialTypeFilter, materialSearch]);

  // Dashboard Computed KPIs
  const kpiStats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const revenue = activeOrders.reduce((s, o) => s + (o.finalAmount || 0), 0);
    const craftingCount = orders.filter(
      (o) => o.status === 'confirmed' || o.status === 'in_crafting' || o.status === 'quality_check'
    ).length;
    const totalNetsGrams = activeOrders.reduce(
      (s, o) => s + (o.totalNetWeightGrams || 380),
      16850
    );
    const lowStockMats = materials.filter((m) => m.stockQuantity <= 15);
    return {
      revenue,
      totalOrders: orders.length,
      craftingCount,
      totalNetsGrams,
      lowStockMats,
    };
  }, [orders, materials]);

  // Order Status Step Handler (BR-05)
  const handleStepOrderStatus = async (order: Order, nextStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(order._id, nextStatus);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
      if (inspectedOrder?._id === order._id) setInspectedOrder(updated);
      notify(
        isEn
          ? `Order ${order.orderCode} advanced to "${nextStatus}" (BR-05).`
          : `Đã chuyển đơn ${order.orderCode} sang bước "${nextStatus}" (BR-05).`
      );
    } catch {
      const fallbackUpdated: Order = {
        ...order,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      };
      setOrders((prev) => prev.map((o) => (o.orderCode === order.orderCode ? fallbackUpdated : o)));
      if (inspectedOrder?.orderCode === order.orderCode) setInspectedOrder(fallbackUpdated);
      notify(
        isEn
          ? `Order ${order.orderCode} advanced to "${nextStatus}" (BR-05).`
          : `Đã chuyển đơn ${order.orderCode} sang bước "${nextStatus}" (BR-05).`
      );
    }
  };

  // Toggle Payment Status
  const handleTogglePayment = async (order: Order) => {
    const nextPay = order.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    try {
      const updated = await updateOrderPaymentStatus(order._id, nextPay);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
      if (inspectedOrder?._id === order._id) setInspectedOrder(updated);
    } catch {
      const fallbackUpdated: Order = { ...order, paymentStatus: nextPay };
      setOrders((prev) => prev.map((o) => (o.orderCode === order.orderCode ? fallbackUpdated : o)));
      if (inspectedOrder?.orderCode === order.orderCode) setInspectedOrder(fallbackUpdated);
    }
    notify(
      isEn
        ? `Updated payment status for order ${order.orderCode}.`
        : `Đã cập nhật trạng thái thanh toán đơn ${order.orderCode}.`
    );
  };

  // Save Product (Create / Edit) with explicit `image`, `imageUrl`, `thumbnail`, `images`
  const handleSaveProduct = async () => {
    if (!prodForm.name.trim()) return;
    const resolvedImg =
      prodForm.imageUrl ||
      editingProduct?.image ||
      editingProduct?.imageUrl ||
      editingProduct?.images?.[0] ||
      ASSETS.placeholders.product;

    const payload: Partial<Product> = {
      name: prodForm.name,
      slug:
        prodForm.slug ||
        prodForm.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-'),
      category: prodForm.category,
      basePrice: Number(prodForm.basePrice),
      craftFee: Number(prodForm.craftFee),
      stock: Number(prodForm.stock),
      shortDescription: prodForm.shortDescription,
      description: prodForm.shortDescription,
      isCustomizable: prodForm.isCustomizable,
      isActive: true,
      image: resolvedImg,
      imageUrl: resolvedImg,
      thumbnail: resolvedImg,
      images: [resolvedImg],
      model3D: {
        meshPreset: prodForm.meshPreset,
        glbUrl: prodForm.glbUrl,
        defaultBaseColor: PRODUCT_COLOR_PRESETS.kelpGreen,
        defaultStrapColor: PRODUCT_COLOR_PRESETS.terracottaRust,
      },
      ecoImpact: {
        netWeightGrams: Number(prodForm.netWeightGrams),
        originSea: prodForm.originSea,
        recycledPlasticPct: 92,
        artisanGroup: t('eco.defaultArtisanGroup'),
      },
    };

    try {
      if (editingProduct) {
        const updated = await updateProductAdmin(editingProduct._id, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? updated : p)));
      } else {
        const created = await createProductAdmin(payload);
        setProducts((prev) => [created, ...prev]);
      }
    } catch {
      const localProd: Product = {
        ...(editingProduct || ({ _id: `prod-${Date.now()}` } as Product)),
        ...(payload as Product),
      };
      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? localProd : p)));
      } else {
        setProducts((prev) => [localProd, ...prev]);
      }
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
    notify(
      isEn
        ? 'Saved product & Cloudinary image configuration.'
        : 'Đã lưu sản phẩm & trường hình ảnh Cloudinary thành công.'
    );
  };

  // Save Material (Create / Edit)
  const handleSaveMaterial = async () => {
    if (!matForm.name.trim()) return;
    const payload: Partial<CustomMaterial> = {
      name: matForm.name,
      materialType: matForm.materialType,
      unitPrice: Number(matForm.unitPrice),
      stockQuantity: Number(matForm.stockQuantity),
      colorHex: matForm.colorHex,
      thumbnail: matForm.thumbnail || editingMaterial?.thumbnail || ASSETS.materials.scallopShell,
      description: matForm.description,
      isActive: true,
      model3D: {
        meshPreset: matForm.meshPreset,
        glbUrl: matForm.glbUrl,
        defaultScale: 1.0,
      },
    };

    try {
      if (editingMaterial) {
        const updated = await updateMaterialAdmin(editingMaterial._id, payload);
        setMaterials((prev) => prev.map((m) => (m._id === editingMaterial._id ? updated : m)));
      } else {
        const created = await createMaterialAdmin(payload);
        setMaterials((prev) => [created, ...prev]);
      }
    } catch {
      const localMat: CustomMaterial = {
        ...(editingMaterial || ({ _id: `mat-${Date.now()}` } as CustomMaterial)),
        ...(payload as CustomMaterial),
      };
      if (editingMaterial) {
        setMaterials((prev) => prev.map((m) => (m._id === editingMaterial._id ? localMat : m)));
      } else {
        setMaterials((prev) => [localMat, ...prev]);
      }
    }

    setIsMaterialModalOpen(false);
    setEditingMaterial(null);
    notify(
      isEn
        ? 'Updated shell/snail Cloudinary image & BOM inventory.'
        : 'Đã cập nhật ảnh Cloudinary & kho nguyên liệu vỏ sò / ốc biển thành công.'
    );
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'product') {
      try {
        await deleteProductAdmin(deleteTarget.id);
      } catch {
        // Fallback local removal
      }
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget.id));
      notify(
        isEn
          ? `Deleted product "${deleteTarget.name}".`
          : `Đã xóa sản phẩm "${deleteTarget.name}".`
      );
    } else {
      try {
        await deleteMaterialAdmin(deleteTarget.id);
      } catch {
        // Fallback local removal
      }
      setMaterials((prev) => prev.filter((m) => m._id !== deleteTarget.id));
      notify(
        isEn
          ? `Deleted material "${deleteTarget.name}".`
          : `Đã xóa nguyên liệu "${deleteTarget.name}".`
      );
    }
    setDeleteTarget(null);
  };

  // Astryx Table Columns for Orders
  const orderColumns: TableColumn<OrderRow>[] = [
    {
      key: 'orderCode',
      header: isEn ? 'Order Code & Time' : 'Mã đơn & Thời gian',
      width: proportional(1.2, { minWidth: 165 }),
      renderCell: (row) => (
        <VStack gap={0.5}>
          <Text type="code" weight="semibold">
            {row.orderCode}
          </Text>
          <Text type="supporting">
            {isHydrated ? formatDateTimeDisplay(row.createdAt, isEn) : row.createdAt.slice(0, 10)}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'customerInfo',
      header: isEn ? 'Customer' : 'Khách hàng',
      width: proportional(1.3, { minWidth: 170 }),
      renderCell: (row) => (
        <VStack gap={0.5}>
          <Text weight="medium">{row.customerInfo.fullName}</Text>
          <Text type="supporting" hasTabularNumbers>
            {row.customerInfo.phone}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'items',
      header: isEn ? 'Crafting Type' : 'Loại chế tác',
      width: proportional(1, { minWidth: 140 }),
      renderCell: (row) => {
        const hasCustom = row.items.some((i) => i.isCustom);
        return hasCustom ? (
          <Badge variant="purple" label={isEn ? '3D Blueprint' : 'Có bản vẽ 3D'} />
        ) : (
          <Text type="supporting">{isEn ? 'Standard Blank' : 'Phôi tiêu chuẩn'}</Text>
        );
      },
    },
    {
      key: 'finalAmount',
      header: isEn ? 'Total & Payment' : 'Tổng tiền & Thanh toán',
      width: proportional(1.1, { minWidth: 155 }),
      align: 'end',
      renderCell: (row) => (
        <VStack gap={1} hAlign="end">
          <Text weight="semibold" hasTabularNumbers>
            {formatVnd(row.finalAmount)}
          </Text>
          <Button
            label={
              row.paymentStatus === 'paid'
                ? isEn
                  ? 'Paid (VietQR)'
                  : 'Đã thanh toán'
                : isEn
                ? 'Unpaid'
                : 'Chưa thu tiền'
            }
            variant="ghost"
            size="sm"
            onClick={() => handleTogglePayment(row)}
          />
        </VStack>
      ),
    },
    {
      key: 'status',
      header: isEn ? 'Status (BR-05)' : 'Trạng thái (BR-05)',
      width: proportional(1.1, { minWidth: 150 }),
      renderCell: (row) => {
        const st = getOrderStatusBadge(row.status, isEn);
        return <Badge variant={st.variant} label={st.label} />;
      },
    },
    {
      key: '_id',
      header: isEn ? '3D Workstation' : 'Máy trạm 3D Inspector',
      width: pixel(210),
      align: 'end',
      renderCell: (row) => {
        const nextSt = NEXT_ORDER_STATUS[row.status];
        return (
          <HStack gap={1.5} hAlign="end" vAlign="center">
            {nextSt && (
              <Button
                label={isEn ? 'Next Step' : 'Bước kế'}
                variant="secondary"
                size="sm"
                onClick={() => handleStepOrderStatus(row, nextSt)}
              />
            )}
            <Button
              label={isEn ? '3D Ticket' : 'Phiếu 3D'}
              variant="primary"
              size="sm"
              onClick={() => {
                setInspectedOrder(row);
                setCheckedMaterialIds([]);
                setSelectedInspectorPlacementId(null);
                setIsInspectorOpen(true);
              }}
            />
          </HStack>
        );
      },
    },
  ];

  // Astryx Table Columns for Products
  const productColumns: TableColumn<ProductRow>[] = [
    {
      key: 'name',
      header: isEn ? 'Product & Cloudinary Image' : 'Sản phẩm & Ảnh Cloudinary',
      width: proportional(2, { minWidth: 260 }),
      renderCell: (row) => {
        const rawImg = row.image || row.imageUrl || row.thumbnail || row.images?.[0];
        const isCloud = rawImg?.includes('cloudinary.com');
        return (
          <HStack gap={3} vAlign="center">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--color-border)',
                background: 'var(--color-background-surface)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveAssetUrl(rawImg, ASSETS.placeholders.product)}
                alt={row.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <VStack gap={0.5}>
              <Text weight="semibold">{row.name}</Text>
              <HStack gap={1.5} vAlign="center" wrap="wrap">
                <Text type="code">{row.model3D?.meshPreset || 'tote_bag'}</Text>
                <Text type="supporting">• {row.ecoImpact?.netWeightGrams || 350}g lưới</Text>
                {isCloud && <Badge variant="blue" label="Cloudinary" />}
              </HStack>
            </VStack>
          </HStack>
        );
      },
    },
    {
      key: 'category',
      header: isEn ? 'Category' : 'Danh mục',
      width: proportional(0.8, { minWidth: 110 }),
      renderCell: (row) => <Badge variant="neutral" label={row.category} />,
    },
    {
      key: 'basePrice',
      header: isEn ? 'Base Price & 3D Fee' : 'Giá phôi & Phí khâu 3D',
      width: proportional(1.1, { minWidth: 155 }),
      align: 'end',
      renderCell: (row) => (
        <VStack gap={0.5} hAlign="end">
          <Text weight="semibold" hasTabularNumbers>
            {formatVnd(row.basePrice)}
          </Text>
          <Text type="supporting" hasTabularNumbers>
            +{formatVnd(row.craftFee)} phí 3D
          </Text>
        </VStack>
      ),
    },
    {
      key: 'stock',
      header: isEn ? 'Blank Stock' : 'Tồn kho phôi',
      width: proportional(0.9, { minWidth: 120 }),
      align: 'end',
      renderCell: (row) => {
        if (row.stock <= 0) {
          return <Badge variant="error" label={isEn ? 'Out of stock' : 'Hết phôi'} />;
        }
        if (row.stock <= 10) {
          return <Badge variant="warning" label={`${row.stock} ${t('common.pieces')}`} />;
        }
        return (
          <Text hasTabularNumbers>
            {row.stock} {t('common.pieces')}
          </Text>
        );
      },
    },
    {
      key: '_id',
      header: isEn ? 'Actions' : 'Thao tác',
      width: pixel(165),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} hAlign="end">
          <Button
            label={isEn ? 'Edit' : 'Sửa'}
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingProduct(row);
              setProdForm({
                name: row.name,
                slug: row.slug,
                category: row.category,
                basePrice: row.basePrice,
                craftFee: row.craftFee,
                stock: row.stock,
                shortDescription: row.shortDescription,
                imageUrl:
                  row.image ||
                  row.imageUrl ||
                  row.images?.[0] ||
                  row.thumbnail ||
                  ASSETS.products.toteBagMain,
                meshPreset: row.model3D?.meshPreset || 'tote_bag',
                glbUrl: row.model3D?.glbUrl || '',
                netWeightGrams: row.ecoImpact?.netWeightGrams || 350,
                originSea: row.ecoImpact?.originSea || t('common.centralSea'),
                isCustomizable: row.isCustomizable,
              });
              setIsProductModalOpen(true);
            }}
          />
          <Button
            label={isEn ? 'Delete' : 'Xóa'}
            variant="destructive"
            size="sm"
            onClick={() => setDeleteTarget({ type: 'product', id: row._id, name: row.name })}
          />
        </HStack>
      ),
    },
  ];

  // Astryx Table Columns for CustomMaterials (BOM)
  const materialColumns: TableColumn<MaterialRow>[] = [
    {
      key: 'name',
      header: isEn ? 'Shell / Snail Material' : 'Nguyên liệu vỏ sò / ốc biển',
      width: proportional(2, { minWidth: 240 }),
      renderCell: (row) => (
        <HStack gap={3} vAlign="center">
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid var(--color-border)',
              background: 'var(--color-background-surface)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveAssetUrl(row.thumbnail, ASSETS.materials.scallopShell)}
              alt={row.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: '9999px',
              backgroundColor: row.colorHex,
              border: '1px solid var(--color-border)',
              flexShrink: 0,
            }}
          />
          <VStack gap={0.5}>
            <Text weight="semibold">{row.name}</Text>
            <Text type="code">{row.model3D?.meshPreset}</Text>
          </VStack>
        </HStack>
      ),
    },
    {
      key: 'materialType',
      header: isEn ? 'Material Group' : 'Nhóm phụ kiện',
      width: proportional(0.9, { minWidth: 120 }),
      renderCell: (row) => <Badge variant="teal" label={row.materialType} />,
    },
    {
      key: 'unitPrice',
      header: isEn ? '3D Unit Price' : 'Đơn giá đính 3D',
      width: proportional(1, { minWidth: 140 }),
      align: 'end',
      renderCell: (row) => (
        <Text weight="medium" hasTabularNumbers>
          {formatVnd(row.unitPrice)} / {t('common.pieces')}
        </Text>
      ),
    },
    {
      key: 'stockQuantity',
      header: isEn ? 'BOM Inventory (BR-04)' : 'Tồn kho BOM (BR-04)',
      width: proportional(1, { minWidth: 140 }),
      align: 'end',
      renderCell: (row) => {
        if (row.stockQuantity <= 0) {
          return <Badge variant="error" label={isEn ? 'Out of stock' : 'Hết hàng'} />;
        }
        if (row.stockQuantity <= 15) {
          return <Badge variant="warning" label={`${row.stockQuantity} ${t('common.pieces')}`} />;
        }
        return (
          <Text hasTabularNumbers>
            {row.stockQuantity} {t('common.pieces')}
          </Text>
        );
      },
    },
    {
      key: '_id',
      header: isEn ? 'Actions' : 'Thao tác',
      width: pixel(165),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} hAlign="end">
          <Button
            label={isEn ? 'Edit' : 'Sửa'}
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingMaterial(row);
              setMatForm({
                name: row.name,
                materialType: row.materialType,
                unitPrice: row.unitPrice,
                stockQuantity: row.stockQuantity,
                colorHex: row.colorHex,
                thumbnail: row.thumbnail || ASSETS.materials.scallopShell,
                meshPreset: row.model3D?.meshPreset || 'scallop_shell',
                glbUrl: row.model3D?.glbUrl || '',
                description: row.description || '',
              });
              setIsMaterialModalOpen(true);
            }}
          />
          <Button
            label={isEn ? 'Delete' : 'Xóa'}
            variant="destructive"
            size="sm"
            onClick={() => setDeleteTarget({ type: 'material', id: row._id, name: row.name })}
          />
        </HStack>
      ),
    },
  ];

  const inspectedCustomItem = inspectedOrder?.items.find((i) => i.isCustom && i.customDesignSnapshot);

  const cloudStorageLabel = mediaStatus?.isCloudinaryConfigured
    ? `Cloudinary (${mediaStatus.cloudName || 'Cloud'})`
    : isEn
    ? 'Cloudinary / Local Ready'
    : 'Cloudinary / Local Sẵn sàng';

  if (!isHydrated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F6FBFF',
          color: '#0A1317',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Đang tải NetLoop CMS (Astryx Neutral)...
      </div>
    );
  }

  return (
    <Theme theme={themes[defaultThemeSlug]} mode={themeMode}>
      <AppShell
        height="fill"
        variant="elevated"
        contentPadding={6}
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
          <TopNav
            label="NetLoop CMS Navigation"
            heading={
              <TopNavHeading
                heading="NetLoop CMS"
                subheading={isEn ? '3D Ocean Craft & Cloudinary Admin' : 'Quản Trị Xưởng Chế Tác 3D & Cloudinary'}
              />
            }
            endContent={
              <HStack gap={2} vAlign="center">
                <HStack gap={1.5} vAlign="center">
                  <StatusDot
                    variant={mediaStatus?.isCloudinaryConfigured ? 'success' : 'accent'}
                    label={cloudStorageLabel}
                  />
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
                  label={isEn ? 'Theme Mode' : 'Chế độ giao diện'}
                  value={themeMode}
                  onChange={(val) => setThemeMode(val as 'light' | 'dark')}
                >
                  <SegmentedControlItem value="light" label={isEn ? 'Light' : 'Sáng'} />
                  <SegmentedControlItem value="dark" label={isEn ? 'Dark' : 'Tối'} />
                </SegmentedControl>

                <Button
                  label={isEn ? 'Open Web Store' : 'Mở Web Store'}
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon="externalLink" />}
                  href={ENV.STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </HStack>
            }
          />
        }
        sideNav={
          <SideNav
            collapsible
            header={
              <SideNavHeading
                superheading="DTU Upcycled Craft"
                heading={isEn ? 'Artisan CMS' : 'Xưởng Thủ Công 3D'}
                subheading="Astryx Neutral Theme"
              />
            }
            footer={
              <VStack gap={1}>
                <Text type="label">
                  {isEn ? 'Ghost Nets Recovered (BR-08)' : 'Lưới Thu Hồi Đại Dương (BR-08)'}
                </Text>
                <Text type="code" hasTabularNumbers>
                  {(kpiStats.totalNetsGrams / 1000).toFixed(2)} kg (
                  {kpiStats.totalNetsGrams.toLocaleString(isEn ? 'en-US' : 'vi-VN')}g)
                </Text>
              </VStack>
            }
          >
            <SideNavSection title={isEn ? 'Workshop Operations' : 'Vận hành xưởng 3D'}>
              <SideNavItem
                label={isEn ? 'Overview & KPIs' : 'Tổng quan & Cảnh báo'}
                icon={isHydrated ? 'info' : undefined}
                isSelected={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
              />
              <SideNavItem
                label={isEn ? 'Orders & 3D Tickets' : 'Đơn hàng & Phiếu 3D'}
                icon={isHydrated ? 'calendar' : undefined}
                isSelected={activeTab === 'orders'}
                endContent={<Badge variant="neutral" label={String(orders.length)} />}
                onClick={() => setActiveTab('orders')}
              />
            </SideNavSection>

            <SideNavSection title={isEn ? 'Catalog & Cloudinary' : 'Danh mục & Cloudinary'}>
              <SideNavItem
                label={isEn ? 'Products & Images' : 'Sản phẩm & Hình ảnh'}
                icon={isHydrated ? 'viewColumns' : undefined}
                isSelected={activeTab === 'products'}
                endContent={<Badge variant="neutral" label={String(products.length)} />}
                onClick={() => setActiveTab('products')}
              />
              <SideNavItem
                label={isEn ? 'Materials BOM (BR-04)' : 'Kho Vỏ sò / Ốc BOM'}
                icon={isHydrated ? 'wrench' : undefined}
                isSelected={activeTab === 'materials'}
                endContent={
                  kpiStats.lowStockMats.length > 0 ? (
                    <Badge variant="warning" label={String(kpiStats.lowStockMats.length)} />
                  ) : (
                    <Badge variant="neutral" label={String(materials.length)} />
                  )
                }
                onClick={() => setActiveTab('materials')}
              />
            </SideNavSection>
          </SideNav>
        }
      >
        <VStack gap={6}>
          {/* Page Header Region */}
          <HStack gap={4} vAlign="center" hAlign="between" wrap="wrap">
            <VStack gap={1}>
              <Heading level={1}>
                {activeTab === 'dashboard' &&
                  (isEn
                    ? 'Workshop Overview & 3D Crafting Operations'
                    : 'Tổng Quan Xưởng Thủ Công & Máy Trạm Chế Tác 3D')}
                {activeTab === 'orders' &&
                  (isEn
                    ? 'Orders & 3D Crafting Tickets (BR-05 / BR-07)'
                    : 'Quản Lý Đơn Hàng & Phiếu Chế Tác 3D (BR-05 / BR-07)')}
                {activeTab === 'products' &&
                  (isEn
                    ? 'Upcycled Product Catalog & Cloudinary Images'
                    : 'Danh Mục Sản Phẩm Tái Chế & Hình Ảnh Cloudinary')}
                {activeTab === 'materials' &&
                  (isEn
                    ? 'Marine Shell / Snail BOM Inventory (BR-04)'
                    : 'Kho Nguyên Liệu Vỏ Sò / Ốc Biển BOM (BR-04)')}
              </Heading>
              <Text type="supporting">
                {isEn
                  ? 'Built with Meta Astryx Design System (Neutral Theme) • Connected to Cloudinary & MongoDB API'
                  : 'Giao diện quản trị thiết kế bằng Meta Astryx (Neutral Theme) • Kết nối trực tiếp Cloudinary & MongoDB API'}
              </Text>
            </VStack>

            <HStack gap={2} vAlign="center">
              {activeTab === 'products' && (
                <Button
                  label={isEn ? 'Add Product Blank' : 'Thêm sản phẩm mới'}
                  variant="primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setProdForm({
                      name: '',
                      slug: '',
                      category: 'bag',
                      basePrice: 320000,
                      craftFee: 30000,
                      stock: 25,
                      shortDescription: '',
                      imageUrl: ASSETS.products.toteBagMain,
                      meshPreset: 'tote_bag',
                      glbUrl: '',
                      netWeightGrams: 380,
                      originSea: 'Bán đảo Sơn Trà, Đà Nẵng',
                      isCustomizable: true,
                    });
                    setIsProductModalOpen(true);
                  }}
                />
              )}
              {activeTab === 'materials' && (
                <Button
                  label={isEn ? 'Add Shell / Snail' : 'Thêm vỏ sò / ốc mới'}
                  variant="primary"
                  onClick={() => {
                    setEditingMaterial(null);
                    setMatForm({
                      name: '',
                      materialType: 'shell',
                      unitPrice: 15000,
                      stockQuantity: 100,
                      colorHex: PRODUCT_COLOR_PRESETS.sandCream,
                      thumbnail: ASSETS.materials.scallopShell,
                      meshPreset: 'scallop_shell',
                      glbUrl: '',
                      description: '',
                    });
                    setIsMaterialModalOpen(true);
                  }}
                />
              )}
              {activeTab === 'dashboard' && (
                <Button
                  label={isEn ? 'Open 3D Ticket Inspector' : 'Mở Máy Trạm 3D Inspector'}
                  variant="primary"
                  onClick={() => {
                    if (!inspectedOrder && orders.length > 0) {
                      setInspectedOrder(orders[0]);
                    }
                    setIsInspectorOpen(true);
                  }}
                />
              )}
            </HStack>
          </HStack>

          <Divider />

          {/* =============================================================== */}
          {/* VIEW 1: DASHBOARD                                               */}
          {/* =============================================================== */}
          {activeTab === 'dashboard' && (
            <VStack gap={6}>
              {/* 4 KPI Metric Cards */}
              <Grid columns={4} gap={4}>
                <Card>
                  <VStack gap={1.5}>
                    <Text type="supporting">
                      {isEn ? 'Total Workshop Revenue' : 'Tổng doanh thu xưởng'}
                    </Text>
                    <Heading level={2}>{formatVnd(kpiStats.revenue)}</Heading>
                    <Text type="supporting">
                      {isEn ? 'Includes 3D custom crafting fees' : 'Bao gồm phí đan & đính phụ kiện 3D'}
                    </Text>
                  </VStack>
                </Card>

                <Card>
                  <VStack gap={1.5}>
                    <Text type="supporting">
                      {isEn ? 'Total Orders' : 'Tổng đơn đặt hàng'}
                    </Text>
                    <Heading level={2}>
                      {kpiStats.totalOrders} {isEn ? 'orders' : 'đơn'}
                    </Heading>
                    <Text type="supporting">
                      {isEn ? 'Synced VietQR & COD' : 'Đồng bộ thanh toán VietQR & COD'}
                    </Text>
                  </VStack>
                </Card>

                <Card>
                  <VStack gap={1.5}>
                    <Text type="supporting">
                      {isEn ? 'Active 3D Crafting Tickets' : 'Phiếu đang chế tác 3D'}
                    </Text>
                    <Heading level={2}>
                      {kpiStats.craftingCount} {isEn ? 'tickets' : 'phiếu'}
                    </Heading>
                    <Text type="supporting">
                      {isEn ? 'Ready in 3D Inspector' : 'Đang xử lý trên máy trạm 3D'}
                    </Text>
                  </VStack>
                </Card>

                <Card>
                  <VStack gap={1.5}>
                    <Text type="supporting">
                      {isEn ? 'Ghost Nets Recovered (BR-08)' : 'Lưới ma thu hồi (BR-08)'}
                    </Text>
                    <Heading level={2}>{(kpiStats.totalNetsGrams / 1000).toFixed(2)} kg</Heading>
                    <Text type="supporting" hasTabularNumbers>
                      {kpiStats.totalNetsGrams.toLocaleString(isEn ? 'en-US' : 'vi-VN')} gram lưới biển
                    </Text>
                  </VStack>
                </Card>
              </Grid>

              {/* Low Stock Material Alert Banner */}
              {kpiStats.lowStockMats.length > 0 ? (
                <Banner
                  status="warning"
                  container="card"
                  collapsible={false}
                  title={
                    isEn
                      ? `Low Stock Shell / Snail BOM Alert (${kpiStats.lowStockMats.length} items <= 15 pcs)`
                      : `Cảnh báo nguyên liệu vỏ sò / ốc biển sắp cạn kho (${kpiStats.lowStockMats.length} mã <= 15 cái)`
                  }
                  description={
                    isEn
                      ? 'Replenish BOM stock so customers can continue placing 3D custom orders without interruption.'
                      : 'Cần nhập bổ sung định mức BOM để khách hàng tiếp tục đính phụ kiện trong phòng 3D Studio.'
                  }
                  endContent={
                    <Button
                      label={isEn ? 'Manage BOM Stock' : 'Nhập kho BOM'}
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('materials')}
                    />
                  }
                >
                  <Grid columns={3} gap={3}>
                    {kpiStats.lowStockMats.map((m) => (
                      <Card key={m._id} variant="muted">
                        <HStack gap={2} vAlign="center" hAlign="between">
                          <VStack gap={0.5}>
                            <Text weight="semibold">{m.name}</Text>
                            <Text type="supporting" hasTabularNumbers>
                              {formatVnd(m.unitPrice)} / {t('common.pieces')}
                            </Text>
                          </VStack>
                          <Badge
                            variant="warning"
                            label={`${m.stockQuantity} ${t('common.pieces')}`}
                          />
                        </HStack>
                      </Card>
                    ))}
                  </Grid>
                </Banner>
              ) : (
                <Banner
                  status="info"
                  container="card"
                  title={
                    isEn
                      ? 'All marine shell & snail BOM materials are well stocked'
                      : 'Tất cả nguyên liệu vỏ sò, ốc biển trong kho BOM đều đạt định mức an toàn'
                  }
                  description={
                    isEn
                      ? `Cloudinary Media Storage: ${cloudStorageLabel}`
                      : `Trạng thái lưu trữ hình ảnh: ${cloudStorageLabel}`
                  }
                />
              )}

              {/* Recent 3D Crafting Tickets Section */}
              <Section padding={4}>
                <VStack gap={4}>
                  <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
                    <VStack gap={0.5}>
                      <Heading level={2}>
                        {isEn ? 'Recent 3D Crafting Tickets' : 'Phiếu Chế Tác 3D Mới Tiếp Nhận'}
                      </Heading>
                      <Text type="supporting">
                        {isEn
                          ? 'Click "3D Ticket" on any row to inspect the customer’s 3D shell placement coordinates.'
                          : 'Bấm "Phiếu 3D" trên từng dòng để mở máy trạm kiểm tra tọa độ đính vỏ sò 3D của khách.'}
                      </Text>
                    </VStack>
                    <Button
                      label={isEn ? 'View All Orders' : 'Xem tất cả đơn hàng'}
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('orders')}
                    />
                  </HStack>

                  <Table
                    data={filteredOrders.slice(0, 5)}
                    columns={orderColumns}
                    idKey="orderCode"
                    density="balanced"
                    hasHover
                  />
                </VStack>
              </Section>
            </VStack>
          )}

          {/* =============================================================== */}
          {/* VIEW 2: ORDERS & 3D CRAFTING INSPECTOR                          */}
          {/* =============================================================== */}
          {activeTab === 'orders' && (
            <Section padding={4}>
              <VStack gap={4}>
                <HStack gap={3} vAlign="end" wrap="wrap">
                  <StackItem size="fill">
                    <TextInput
                      type="search"
                      label={isEn ? 'Search orders' : 'Tìm kiếm đơn hàng'}
                      value={orderSearch}
                      onChange={setOrderSearch}
                      placeholder={
                        isEn
                          ? 'Order code DTU-..., customer name, or phone...'
                          : 'Nhập mã đơn DTU-..., tên khách hàng hoặc SĐT...'
                      }
                      startIcon="search"
                      hasClear
                      width="100%"
                    />
                  </StackItem>

                  <Selector
                    label={isEn ? 'Filter by Crafting Status' : 'Lọc theo trạng thái chế tác'}
                    value={orderStatusFilter}
                    onChange={setOrderStatusFilter}
                    width={240}
                    options={[
                      { value: 'all', label: isEn ? 'All statuses (7)' : 'Tất cả trạng thái (7)' },
                      { value: 'pending', label: t('status.pending') },
                      { value: 'confirmed', label: t('status.confirmed') },
                      { value: 'in_crafting', label: t('status.in_crafting') },
                      { value: 'quality_check', label: t('status.quality_check') },
                      { value: 'shipping', label: t('status.shipping') },
                      { value: 'delivered', label: t('status.delivered') },
                      { value: 'cancelled', label: t('status.cancelled') },
                    ]}
                  />

                  {(orderSearch || orderStatusFilter !== 'all') && (
                    <Button
                      label={isEn ? 'Reset filters' : 'Xóa bộ lọc'}
                      variant="ghost"
                      onClick={() => {
                        setOrderSearch('');
                        setOrderStatusFilter('all');
                      }}
                    />
                  )}
                </HStack>

                <Table
                  data={filteredOrders}
                  columns={orderColumns}
                  idKey="orderCode"
                  density="balanced"
                  hasHover
                />
              </VStack>
            </Section>
          )}

          {/* =============================================================== */}
          {/* VIEW 3: PRODUCTS & CLOUDINARY IMAGES                            */}
          {/* =============================================================== */}
          {activeTab === 'products' && (
            <Section padding={4}>
              <VStack gap={4}>
                <HStack gap={3} vAlign="end" wrap="wrap">
                  <StackItem size="fill">
                    <TextInput
                      type="search"
                      label={isEn ? 'Search products' : 'Tìm kiếm sản phẩm'}
                      value={productSearch}
                      onChange={setProductSearch}
                      placeholder={
                        isEn
                          ? 'Search product by name...'
                          : 'Nhập tên túi lưới, giỏ, ví, vòng tay...'
                      }
                      startIcon="search"
                      hasClear
                      width="100%"
                    />
                  </StackItem>

                  <Selector
                    label={isEn ? 'Product Category' : 'Danh mục sản phẩm'}
                    value={productCatFilter}
                    onChange={setProductCatFilter}
                    width={220}
                    options={[
                      { value: 'all', label: t('categories.all') },
                      { value: 'bag', label: t('categories.bag') },
                      { value: 'basket', label: t('categories.basket') },
                      { value: 'wallet', label: t('categories.wallet') },
                      { value: 'apparel', label: t('categories.apparel') },
                      { value: 'bracelet', label: t('categories.bracelet') },
                      { value: 'accessory', label: t('categories.accessory') },
                    ]}
                  />
                </HStack>

                <Table
                  data={filteredProducts}
                  columns={productColumns}
                  idKey="_id"
                  density="balanced"
                  hasHover
                />
              </VStack>
            </Section>
          )}

          {/* =============================================================== */}
          {/* VIEW 4: MATERIALS BOM INVENTORY                                 */}
          {/* =============================================================== */}
          {activeTab === 'materials' && (
            <Section padding={4}>
              <VStack gap={4}>
                <HStack gap={3} vAlign="end" wrap="wrap">
                  <StackItem size="fill">
                    <TextInput
                      type="search"
                      label={isEn ? 'Search shells, snails, charms' : 'Tìm kiếm nguyên liệu BOM'}
                      value={materialSearch}
                      onChange={setMaterialSearch}
                      placeholder={
                        isEn
                          ? 'Search scallop shell, spiral snail, starfish...'
                          : 'Tìm vỏ sò điệp, ốc xoắn, sao biển...'
                      }
                      startIcon="search"
                      hasClear
                      width="100%"
                    />
                  </StackItem>

                  <Selector
                    label={isEn ? 'Material Group' : 'Nhóm phụ kiện'}
                    value={materialTypeFilter}
                    onChange={setMaterialTypeFilter}
                    width={220}
                    options={[
                      { value: 'all', label: isEn ? 'All groups' : 'Tất cả nhóm phụ kiện' },
                      { value: 'shell', label: 'Vỏ sò (Shell)' },
                      { value: 'snail', label: 'Ốc biển (Snail)' },
                      { value: 'charm', label: 'Charm biển (Charm)' },
                      { value: 'bead', label: 'Ngọc trai / Hạt (Bead)' },
                      { value: 'cord', label: 'Nút dây lưới (Cord)' },
                    ]}
                  />
                </HStack>

                <Table
                  data={filteredMaterials}
                  columns={materialColumns}
                  idKey="_id"
                  density="balanced"
                  hasHover
                />
              </VStack>
            </Section>
          )}
        </VStack>
      </AppShell>

      {/* =================================================================== */}
      {/* ASTRYX DRAWER: 3D CRAFTING INSPECTOR WORKSTATION (BR-07 & BR-05)    */}
      {/* =================================================================== */}
      <Drawer
        isOpen={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        label={isEn ? '3D Crafting Inspector Workstation' : 'Máy trạm chế tác 3D Inspector'}
        width={820}
      >
        <Layout
          header={
            <DrawerHeader
              title={
                inspectedOrder
                  ? `${isEn ? '3D Ticket:' : 'Phiếu chế tác:'} ${inspectedOrder.orderCode}`
                  : isEn
                  ? '3D Crafting Inspector'
                  : 'Máy Trạm Chế Tác 3D'
              }
              subtitle={
                inspectedOrder
                  ? `${inspectedOrder.customerInfo.fullName} • ${inspectedOrder.customerInfo.phone}`
                  : undefined
              }
              onOpenChange={setIsInspectorOpen}
            />
          }
          content={
            <LayoutContent>
              {inspectedOrder && (
                <VStack gap={4}>
                  <OrderStatusStepper
                    currentStatus={inspectedOrder.status}
                    interactive={true}
                    onStatusChange={(nextStatus) => handleStepOrderStatus(inspectedOrder, nextStatus)}
                    updatedAt={inspectedOrder.updatedAt}
                  />

                  {inspectedCustomItem && inspectedCustomItem.customDesignSnapshot ? (
                    <VStack gap={4}>
                      <div
                        style={{
                          height: 360,
                          width: '100%',
                          borderRadius: 12,
                          overflow: 'hidden',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <ThreeCanvasViewer
                          mode="inspector"
                          productPreset={
                            inspectedCustomItem.customDesignSnapshot.meshPreset || 'tote_bag'
                          }
                          productGlbUrl={inspectedCustomItem.customDesignSnapshot.glbUrl}
                          baseColor={inspectedCustomItem.customDesignSnapshot.baseColor}
                          strapColor={inspectedCustomItem.customDesignSnapshot.strapColor}
                          placements={inspectedCustomItem.customDesignSnapshot.placements}
                          braceletConfig={inspectedCustomItem.customDesignSnapshot.braceletConfig}
                          selectedPlacementId={selectedInspectorPlacementId}
                          onSelectPlacement={setSelectedInspectorPlacementId}
                          className="h-full w-full"
                        />
                      </div>

                      {inspectedCustomItem.customDesignSnapshot.artisanNote && (
                        <Banner
                          status="info"
                          container="card"
                          collapsible={false}
                          title={
                            isEn ? 'Customer note for artisan' : 'Ghi chú của khách cho nghệ nhân'
                          }
                          description={inspectedCustomItem.customDesignSnapshot.artisanNote}
                        />
                      )}

                      <BomPriceBreakdownCard
                        variant="crafting_checklist"
                        baseProductName={inspectedCustomItem.productName}
                        basePrice={inspectedCustomItem.customDesignSnapshot.basePrice}
                        craftFee={inspectedCustomItem.customDesignSnapshot.craftFee}
                        placements={inspectedCustomItem.customDesignSnapshot.placements}
                        quantity={inspectedCustomItem.quantity}
                        checkedMaterialIds={checkedMaterialIds}
                        onToggleChecklist={(matId) => {
                          setCheckedMaterialIds((prev) =>
                            prev.includes(matId)
                              ? prev.filter((id) => id !== matId)
                              : [...prev, matId]
                          );
                        }}
                      />
                    </VStack>
                  ) : (
                    <Card variant="muted">
                      <Text type="supporting">
                        {isEn
                          ? 'This order contains standard ready-made blanks (no 3D shell attachments).'
                          : 'Đơn hàng này gồm các sản phẩm phôi tiêu chuẩn (không đính phụ kiện Chế tác 3D).'}
                      </Text>
                    </Card>
                  )}
                </VStack>
              )}
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label={isEn ? 'Close Workstation' : 'Đóng máy trạm'}
                  variant="secondary"
                  onClick={() => setIsInspectorOpen(false)}
                />
                {inspectedOrder && NEXT_ORDER_STATUS[inspectedOrder.status] && (
                  <Button
                    label={
                      isEn
                        ? `Advance to "${NEXT_ORDER_STATUS[inspectedOrder.status]}"`
                        : `Chuyển sang bước "${
                            getOrderStatusBadge(
                              NEXT_ORDER_STATUS[inspectedOrder.status] as OrderStatus,
                              false
                            ).label
                          }"`
                    }
                    variant="primary"
                    onClick={() => {
                      const nextSt = NEXT_ORDER_STATUS[inspectedOrder.status];
                      if (nextSt) handleStepOrderStatus(inspectedOrder, nextSt);
                    }}
                  />
                )}
              </HStack>
            </LayoutFooter>
          }
        />
      </Drawer>

      {/* =================================================================== */}
      {/* ASTRYX DIALOG: CREATE / EDIT PRODUCT + CLOUDINARY IMAGE FIELD       */}
      {/* =================================================================== */}
      <Dialog
        isOpen={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        purpose="form"
        width={680}
        maxHeight="88dvh"
      >
        <Layout
          header={
            <DialogHeader
              title={
                editingProduct
                  ? isEn
                    ? 'Update Product & Cloudinary Image'
                    : 'Cập Nhật Sản Phẩm & Hình Ảnh Cloudinary'
                  : isEn
                  ? 'Create New Product & Cloudinary Image'
                  : 'Thêm Sản Phẩm Mới & Hình Ảnh Cloudinary'
              }
              subtitle={
                isEn
                  ? 'Product image is stored in the `image` field and uploaded to Cloudinary.'
                  : 'Trường hình ảnh (`image`) của sản phẩm được đồng bộ trực tiếp với Cloudinary.'
              }
              onOpenChange={setIsProductModalOpen}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={4}>
                {/* Cloudinary Image Uploader Field */}
                <S3ImageUploader
                  folder="products"
                  label={
                    isEn
                      ? 'Product Image Field (`image` • Cloudinary Upload)'
                      : 'Trường hình ảnh sản phẩm (`image` • Tải lên Cloudinary)'
                  }
                  value={prodForm.imageUrl}
                  onChange={(newUrl) => setProdForm({ ...prodForm, imageUrl: newUrl })}
                />

                <Grid columns={2} gap={3}>
                  <TextInput
                    label={isEn ? 'Product Name' : 'Tên sản phẩm'}
                    isRequired
                    value={prodForm.name}
                    onChange={(val) => setProdForm({ ...prodForm, name: val })}
                    placeholder="Túi Xách Lưới Đại Dương Sơn Trà"
                    width="100%"
                  />

                  <TextInput
                    label="Slug URL"
                    isOptional
                    value={prodForm.slug}
                    onChange={(val) => setProdForm({ ...prodForm, slug: val })}
                    placeholder="tui-xach-luoi-dai-duong-son-tra"
                    width="100%"
                  />

                  <Selector
                    label={isEn ? 'Category' : 'Danh mục'}
                    value={prodForm.category}
                    onChange={(val) =>
                      setProdForm({ ...prodForm, category: val as ProductCategory })
                    }
                    width="100%"
                    options={[
                      { value: 'bag', label: 'Túi xách lưới (bag)' },
                      { value: 'basket', label: 'Giỏ đựng đồ (basket)' },
                      { value: 'wallet', label: 'Ví tiền (wallet)' },
                      { value: 'apparel', label: 'Áo quần (apparel)' },
                      { value: 'bracelet', label: 'Vòng tay (bracelet)' },
                      { value: 'accessory', label: 'Phụ kiện (accessory)' },
                    ]}
                  />

                  <Selector
                    label="Mesh Preset 3D (BR-09)"
                    value={prodForm.meshPreset}
                    onChange={(val) => setProdForm({ ...prodForm, meshPreset: val })}
                    width="100%"
                    options={[
                      { value: 'tote_bag', label: 'tote_bag (Túi xách lưới)' },
                      { value: 'market_basket', label: 'market_basket (Giỏ tròn đan lưới)' },
                      { value: 'zip_wallet', label: 'zip_wallet (Ví cầm tay)' },
                      { value: 'ocean_vest', label: 'ocean_vest (Áo khoác Upcycled)' },
                      { value: 'braided_bracelet', label: 'braided_bracelet (Vòng tay dây lưới)' },
                      { value: 'shell_charm_holder', label: 'shell_charm_holder (Móc khóa phao)' },
                    ]}
                  />

                  <NumberInput
                    label={isEn ? 'Base Price' : 'Giá phôi gốc'}
                    value={prodForm.basePrice}
                    onChange={(val) => setProdForm({ ...prodForm, basePrice: val ?? 0 })}
                    min={0}
                    step={10000}
                    units="VNĐ"
                    isWheelEnabled={false}
                    width="100%"
                  />

                  <NumberInput
                    label={isEn ? '3D Craft Fee' : 'Phí đan & khâu 3D'}
                    value={prodForm.craftFee}
                    onChange={(val) => setProdForm({ ...prodForm, craftFee: val ?? 0 })}
                    min={0}
                    step={5000}
                    units="VNĐ"
                    isWheelEnabled={false}
                    width="100%"
                  />

                  <NumberInput
                    label={isEn ? 'Blank Stock' : 'Tồn kho phôi'}
                    value={prodForm.stock}
                    onChange={(val) => setProdForm({ ...prodForm, stock: val ?? 0 })}
                    min={0}
                    step={1}
                    isIntegerOnly
                    units={t('common.pieces')}
                    isWheelEnabled={false}
                    width="100%"
                  />

                  <NumberInput
                    label={isEn ? 'Recovered Net Weight' : 'Lượng lưới thu hồi'}
                    value={prodForm.netWeightGrams}
                    onChange={(val) => setProdForm({ ...prodForm, netWeightGrams: val ?? 0 })}
                    min={0}
                    step={10}
                    units="gram"
                    isWheelEnabled={false}
                    width="100%"
                  />
                </Grid>

                <TextInput
                  label={
                    isEn
                      ? 'External 3D .glb URL (Optional — BR-09)'
                      : 'Đường dẫn file 3D .glb ngoài (Tùy chọn — BR-09)'
                  }
                  isOptional
                  value={prodForm.glbUrl}
                  onChange={(val) => setProdForm({ ...prodForm, glbUrl: val })}
                  placeholder="/models/custom-bag.glb"
                  width="100%"
                />

                <TextArea
                  label={isEn ? 'Short Description' : 'Mô tả ngắn sản phẩm'}
                  value={prodForm.shortDescription}
                  onChange={(val) => setProdForm({ ...prodForm, shortDescription: val })}
                  rows={2}
                  width="100%"
                />

                <Switch
                  label={
                    isEn
                      ? 'Allow 3D Studio Customization'
                      : 'Cho phép khách tùy biến đính ốc trong 3D Studio'
                  }
                  value={prodForm.isCustomizable}
                  onChange={(checked) => setProdForm({ ...prodForm, isCustomizable: checked })}
                />
              </VStack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label={t('common.cancel')}
                  variant="secondary"
                  onClick={() => setIsProductModalOpen(false)}
                />
                <Button
                  label={isEn ? 'Save Product' : 'Lưu sản phẩm'}
                  variant="primary"
                  onClick={handleSaveProduct}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>

      {/* =================================================================== */}
      {/* ASTRYX DIALOG: CREATE / EDIT CUSTOM MATERIAL (VỎ SÒ / ỐC BOM)       */}
      {/* =================================================================== */}
      <Dialog
        isOpen={isMaterialModalOpen}
        onOpenChange={setIsMaterialModalOpen}
        purpose="form"
        width={620}
        maxHeight="85dvh"
      >
        <Layout
          header={
            <DialogHeader
              title={
                editingMaterial
                  ? isEn
                    ? 'Update Shell / Snail Material'
                    : 'Cập Nhật Nguyên Liệu Vỏ Sò / Ốc Biển'
                  : isEn
                  ? 'Add New Marine Accessory'
                  : 'Thêm Phụ Kiện Biển Mới'
              }
              onOpenChange={setIsMaterialModalOpen}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={4}>
                <S3ImageUploader
                  folder="materials"
                  compact
                  label={
                    isEn
                      ? 'Shell / Snail Image (Cloudinary Upload)'
                      : 'Hình ảnh vỏ sò / ốc biển (Tải lên Cloudinary)'
                  }
                  value={matForm.thumbnail}
                  onChange={(newUrl) => setMatForm({ ...matForm, thumbnail: newUrl })}
                />

                <Grid columns={2} gap={3}>
                  <TextInput
                    label={isEn ? 'Material Name' : 'Tên vỏ sò / ốc / charm'}
                    isRequired
                    value={matForm.name}
                    onChange={(val) => setMatForm({ ...matForm, name: val })}
                    width="100%"
                  />

                  <Selector
                    label={isEn ? 'Material Group' : 'Nhóm phụ kiện'}
                    value={matForm.materialType}
                    onChange={(val) =>
                      setMatForm({ ...matForm, materialType: val as MaterialCategory })
                    }
                    width="100%"
                    options={[
                      { value: 'shell', label: 'Vỏ sò (shell)' },
                      { value: 'snail', label: 'Ốc biển (snail)' },
                      { value: 'charm', label: 'Charm biển (charm)' },
                      { value: 'bead', label: 'Ngọc trai / Hạt (bead)' },
                      { value: 'cord', label: 'Nút dây lưới (cord)' },
                    ]}
                  />

                  <Selector
                    label="Mesh Preset 3D"
                    value={matForm.meshPreset}
                    onChange={(val) => setMatForm({ ...matForm, meshPreset: val })}
                    width="100%"
                    options={[
                      { value: 'scallop_shell', label: 'scallop_shell (Vỏ sò điệp)' },
                      { value: 'cowrie_shell', label: 'cowrie_shell (Ốc sứ)' },
                      { value: 'spiral_snail', label: 'spiral_snail (Ốc xoắn)' },
                      { value: 'conch_snail', label: 'conch_snail (Ốc xà cừ)' },
                      { value: 'starfish_charm', label: 'starfish_charm (Sao biển)' },
                      { value: 'turtle_charm', label: 'turtle_charm (Rùa biển)' },
                      { value: 'pearl_bead', label: 'pearl_bead (Ngọc trai)' },
                      { value: 'fishing_cord', label: 'fishing_cord (Nút dây lưới)' },
                    ]}
                  />

                  <NumberInput
                    label={isEn ? 'Unit Price' : 'Đơn giá đính 3D'}
                    value={matForm.unitPrice}
                    onChange={(val) => setMatForm({ ...matForm, unitPrice: val ?? 0 })}
                    min={0}
                    step={1000}
                    units="VNĐ"
                    isWheelEnabled={false}
                    width="100%"
                  />

                  <NumberInput
                    label={isEn ? 'Stock Quantity (BR-04)' : 'Số lượng tồn kho (BR-04)'}
                    value={matForm.stockQuantity}
                    onChange={(val) => setMatForm({ ...matForm, stockQuantity: val ?? 0 })}
                    min={0}
                    step={1}
                    isIntegerOnly
                    units={t('common.pieces')}
                    isWheelEnabled={false}
                    width="100%"
                  />

                  <TextInput
                    label={isEn ? 'Color Hex' : 'Mã màu Hex 3D'}
                    value={matForm.colorHex}
                    onChange={(val) => setMatForm({ ...matForm, colorHex: val })}
                    width="100%"
                  />
                </Grid>
              </VStack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label={t('common.cancel')}
                  variant="secondary"
                  onClick={() => setIsMaterialModalOpen(false)}
                />
                <Button
                  label={isEn ? 'Save Material' : 'Lưu nguyên liệu'}
                  variant="primary"
                  onClick={handleSaveMaterial}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>

      {/* =================================================================== */}
      {/* ASTRYX ALERT DIALOG: CONFIRM DELETE                                 */}
      {/* =================================================================== */}
      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={
          isEn
            ? `Delete ${deleteTarget?.type === 'product' ? 'product' : 'material'}?`
            : `Xóa ${deleteTarget?.type === 'product' ? 'sản phẩm' : 'nguyên liệu'}?`
        }
        description={
          isEn
            ? `Are you sure you want to delete "${deleteTarget?.name}" from the catalog?`
            : `Bạn có chắc chắn muốn xóa "${deleteTarget?.name}" khỏi danh mục hệ thống?`
        }
        actionLabel={
          isEn
            ? `Delete ${deleteTarget?.type === 'product' ? 'product' : 'material'}`
            : `Xóa ${deleteTarget?.type === 'product' ? 'sản phẩm' : 'nguyên liệu'}`
        }
        cancelLabel={t('common.cancel')}
        actionVariant="destructive"
        onAction={handleConfirmDelete}
      />
    </Theme>
  );
}
