'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { AppShell } from '@astryxdesign/core/AppShell';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import {
  SideNav,
  SideNavSection,
  SideNavItem,
  SideNavCollapseButton,
} from '@astryxdesign/core/SideNav';
import { Layout, LayoutHeader, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
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
import { FormLayout } from '@astryxdesign/core/FormLayout';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { List, ListItem } from '@astryxdesign/core/List';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Center } from '@astryxdesign/core/Center';
import { Avatar } from '@astryxdesign/core/Avatar';

import { themes, defaultThemeSlug } from '@/astryx-themes';
import { ThreeCanvasViewer } from '@/components/three/ThreeCanvasViewer';
import { S3ImageUploader } from '@/components/common/S3ImageUploader';
import {
  formatVnd,
  formatCompactVnd,
  formatNumberInputVnd,
  validateCurrencyAmount,
} from '@/lib/validators';
import { ASSETS, resolveAssetUrl } from '@/config/assets';
import { ENV } from '@/config/env';
import { PRODUCT_COLOR_PRESETS } from '@/config/theme';
import { useI18n } from '@/i18n/I18nContext';
import {
  type CmsAuthUser,
  FALLBACK_CATEGORIES,
  FALLBACK_MATERIALS,
  FALLBACK_PRODUCTS,
  clearCmsSession,
  createCategoryAdmin,
  createMaterialAdmin,
  createProductAdmin,
  deleteCategoryAdmin,
  deleteMaterialAdmin,
  deleteProductAdmin,
  getAdminDashboard,
  getAdminOrders,
  getCategoriesAdmin,
  getCustomMaterials,
  getMediaStatus,
  getProducts,
  getStoredCmsSession,
  loginCmsAdmin,
  updateCategoryAdmin,
  updateMaterialAdmin,
  updateOrderPaymentStatus,
  updateOrderStatus,
  updateProductAdmin,
} from '@/lib/api';
import {
  CategoryItem,
  CustomMaterial,
  MaterialCategory,
  MediaStorageStatus,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
} from '@/types';

type AdminTab = 'dashboard' | 'orders' | 'categories' | 'products' | 'materials';
type OrderRow = Order & Record<string, unknown>;
type CategoryRow = CategoryItem & Record<string, unknown>;
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

const ORDER_STAGE_STEPS: OrderStatus[] = [
  'pending',
  'confirmed',
  'in_crafting',
  'quality_check',
  'shipping',
  'delivered',
];

function getOrderStatusInfo(
  status: OrderStatus,
  isEn: boolean
): {
  label: string;
  badgeVariant: 'neutral' | 'blue' | 'orange' | 'teal' | 'green' | 'error';
  progressPct: number;
} {
  const map: Record<
    OrderStatus,
    {
      vi: string;
      en: string;
      badgeVariant: 'neutral' | 'blue' | 'orange' | 'teal' | 'green' | 'error';
      progressPct: number;
    }
  > = {
    pending: { vi: '1. Chờ xác nhận', en: '1. Pending', badgeVariant: 'neutral', progressPct: 16 },
    confirmed: { vi: '2. Đã duyệt BOM', en: '2. Confirmed', badgeVariant: 'blue', progressPct: 33 },
    in_crafting: {
      vi: '3. Đang đan & đính 3D',
      en: '3. In 3D Crafting',
      badgeVariant: 'orange',
      progressPct: 55,
    },
    quality_check: {
      vi: '4. Kiểm định QC',
      en: '4. Quality Check',
      badgeVariant: 'teal',
      progressPct: 75,
    },
    shipping: { vi: '5. Đang giao hàng', en: '5. Shipping', badgeVariant: 'blue', progressPct: 90 },
    delivered: {
      vi: '6. Đã hoàn thành',
      en: '6. Delivered',
      badgeVariant: 'green',
      progressPct: 100,
    },
    cancelled: { vi: 'Đã hủy', en: 'Cancelled', badgeVariant: 'error', progressPct: 0 },
  };
  const entry = map[status] || map.pending;
  return {
    label: isEn ? entry.en : entry.vi,
    badgeVariant: entry.badgeVariant,
    progressPct: entry.progressPct,
  };
}

const NEXT_ORDER_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'in_crafting',
  in_crafting: 'quality_check',
  quality_check: 'shipping',
  shipping: 'delivered',
};

function AnimatedCounter({
  value,
  formatter,
  duration = 720,
}: {
  value: number;
  formatter: (val: number) => string;
  duration?: number;
}) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const startVal = 0;
    const endVal = Number(value) || 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplayVal(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplayVal(endVal);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return <>{formatter(displayVal)}</>;
}

function MiniSparkline({
  points,
  color = 'var(--color-accent)',
}: {
  points: number[];
  color?: string;
}) {
  const width = 120;
  const height = 34;
  const min = Math.min(...points);
  const max = Math.max(...points, min + 1);
  const coords = points.map((pt, i) => {
    const x = (i / Math.max(1, points.length - 1)) * (width - 8) + 4;
    const y = height - 5 - ((pt - min) / (max - min)) * (height - 10);
    return { x, y };
  });
  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height} L ${coords[0].x.toFixed(1)} ${height} Z`;
  const last = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d={areaPath} fill={color} fillOpacity={0.12} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last && <circle cx={last.x} cy={last.y} r={3.2} fill={color} />}
    </svg>
  );
}

export default function AdminCmsPage() {
  const { t, locale, setLocale } = useI18n();
  const isEn = locale === 'en';

  const [isHydrated, setIsHydrated] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);
  const [chartWindow, setChartWindow] = useState<'6m' | 'q4'>('6m');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>('T11');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // CMS Authentication State
  const [currentUser, setCurrentUser] = useState<CmsAuthUser | null>(null);
  const [loginEmail, setLoginEmail] = useState(ENV.DEFAULT_ADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState(ENV.DEFAULT_ADMIN_PASSWORD);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data States
  const [orders, setOrders] = useState<Order[]>([DEMO_CRAFTING_ORDER]);
  const [categories, setCategories] = useState<CategoryItem[]>(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [materials, setMaterials] = useState<CustomMaterial[]>(FALLBACK_MATERIALS);
  const [mediaStatus, setMediaStatus] = useState<MediaStorageStatus | null>(null);

  // Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all');
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
  const [checkedPlacementIds, setCheckedPlacementIds] = useState<string[]>([]);

  // Category Form Dialog State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    nameEn: '',
    slug: '',
    type: 'product' as 'product' | 'material',
    meshPresetDefault: 'tote_bag',
    description: '',
    sortOrder: 1,
    isActive: true,
  });

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
    type: 'category' | 'product' | 'material';
    id: string;
    name: string;
  } | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

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
        setOrders(serverOrders);
        setInspectedOrder(serverOrders[0]);
      }
      if (catList && catList.length > 0) setCategories(catList);
      if (prodList.length > 0) setProducts(prodList);
      if (matList.length > 0) setMaterials(matList);
      if (cloudStatus) setMediaStatus(cloudStatus);
    });
  };

  useEffect(() => {
    setIsHydrated(true);
    const { token, user } = getStoredCmsSession();
    if (token && user) {
      setCurrentUser(user);
      loadCmsData();
    }
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
      loadCmsData();
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

  // Controlled collapse config shared between TopNav toggle button and SideNav
  const sideNavCollapseConfig = useMemo(
    () => ({
      isCollapsed: isSideNavCollapsed,
      onCollapsedChange: setIsSideNavCollapsed,
      hasButton: false, // Hide bottom toggle button since toggle is placed at the top bar
    }),
    [isSideNavCollapsed]
  );

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

  const filteredCategories = useMemo<CategoryRow[]>(() => {
    return categories
      .filter((c) => {
        if (categoryTypeFilter !== 'all' && c.type !== categoryTypeFilter) return false;
        if (categorySearch) {
          const q = categorySearch.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            (c.nameEn || '').toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .map((c) => {
        const computedCount =
          c.type === 'material'
            ? materials.filter((m) => m.materialType === c.slug).length
            : products.filter((p) => p.category === c.slug).length;
        const computedStock =
          c.type === 'material'
            ? materials
              .filter((m) => m.materialType === c.slug)
              .reduce((s, m) => s + m.stockQuantity, 0)
            : products.filter((p) => p.category === c.slug).reduce((s, p) => s + p.stock, 0);
        return {
          ...c,
          itemCount: computedCount,
          totalStock: computedStock,
        } as CategoryRow;
      });
  }, [categories, categoryTypeFilter, categorySearch, products, materials]);

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

  // Dashboard Computed KPIs & Chart Data
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

    // Category Revenue & Stock Chart Breakdown
    const productCategories = categories.filter((c) => c.type === 'product');
    const categoryBreakdown = productCategories.map((cat) => {
      const catProducts = products.filter((p) => p.category === cat.slug);
      const totalStock = catProducts.reduce((s, p) => s + (p.stock || 0), 0);
      const avgValue = catProducts.reduce(
        (s, p) => s + (p.basePrice || 0) * Math.max(1, p.stock || 1),
        0
      );
      return {
        slug: cat.slug,
        name: isEn ? cat.nameEn || cat.name : cat.name,
        productCount: catProducts.length,
        totalStock,
        inventoryValue: avgValue,
      };
    });

    // 6-Month Workshop Revenue & Net Recovery Trend for SVG Bar/Area Chart
    const monthlyTrend = [
      { month: 'T06', revenue: 9200000, netsKg: 11.4 },
      { month: 'T07', revenue: 12450000, netsKg: 13.8 },
      { month: 'T08', revenue: 14800000, netsKg: 15.2 },
      { month: 'T09', revenue: 13900000, netsKg: 14.6 },
      { month: 'T10', revenue: 16750000, netsKg: 16.5 },
      {
        month: 'T11',
        revenue: Math.max(revenue + 17500000, 18268000),
        netsKg: Number((totalNetsGrams / 1000).toFixed(2)),
      },
    ];

    return {
      revenue,
      totalOrders: orders.length,
      craftingCount,
      totalNetsGrams,
      lowStockMats,
      categoryBreakdown,
      monthlyTrend,
    };
  }, [orders, materials, categories, products, isEn]);

  // Validation States for Currency Inputs
  const basePriceValidation = useMemo(
    () =>
      validateCurrencyAmount(prodForm.basePrice, {
        min: 10000,
        max: 100_000_000,
        allowZero: false,
        fieldName: isEn ? 'Base price' : 'Giá phôi gốc',
        locale,
      }),
    [prodForm.basePrice, isEn, locale]
  );

  const craftFeeValidation = useMemo(
    () =>
      validateCurrencyAmount(prodForm.craftFee, {
        min: 0,
        max: 50_000_000,
        allowZero: true,
        fieldName: isEn ? '3D craft fee' : 'Phí khâu 3D',
        locale,
      }),
    [prodForm.craftFee, isEn, locale]
  );

  const matUnitPriceValidation = useMemo(
    () =>
      validateCurrencyAmount(matForm.unitPrice, {
        min: 1000,
        max: 20_000_000,
        allowZero: false,
        fieldName: isEn ? 'Unit price' : 'Đơn giá phụ kiện',
        locale,
      }),
    [matForm.unitPrice, isEn, locale]
  );

  // Order Status Step Handler (BR-05)
  const handleStepOrderStatus = async (order: Order, nextStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(order._id, nextStatus);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? updated : o)));
      if (inspectedOrder?._id === order._id) setInspectedOrder(updated);
      notify(
        isEn
          ? `Order ${order.orderCode} moved to "${nextStatus}"`
          : `Đã chuyển đơn ${order.orderCode} sang trạng thái mới`
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
          ? `Order ${order.orderCode} moved to "${nextStatus}"`
          : `Đã chuyển đơn ${order.orderCode} sang trạng thái mới`
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
        ? `Updated payment status for ${order.orderCode}`
        : `Đã cập nhật thanh toán cho đơn ${order.orderCode}`
    );
  };

  // Save Category (Create / Edit)
  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return;
    const cleanSlug =
      catForm.slug.trim() ||
      catForm.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const payload: Partial<CategoryItem> = {
      name: catForm.name.trim(),
      nameEn: catForm.nameEn.trim() || catForm.name.trim(),
      slug: cleanSlug,
      type: catForm.type,
      meshPresetDefault: catForm.meshPresetDefault,
      description: catForm.description,
      sortOrder: Number(catForm.sortOrder) || 1,
      isActive: catForm.isActive,
    };

    try {
      if (editingCategory) {
        const updated = await updateCategoryAdmin(editingCategory._id, payload);
        setCategories((prev) => prev.map((c) => (c._id === editingCategory._id ? updated : c)));
      } else {
        const created = await createCategoryAdmin(payload);
        setCategories((prev) => [...prev, created]);
      }
    } catch {
      const localCat: CategoryItem = {
        ...(editingCategory || ({ _id: `cat-${Date.now()}` } as CategoryItem)),
        ...(payload as CategoryItem),
      };
      if (editingCategory) {
        setCategories((prev) => prev.map((c) => (c._id === editingCategory._id ? localCat : c)));
      } else {
        setCategories((prev) => [...prev, localCat]);
      }
    }

    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    notify(isEn ? 'Saved category successfully' : 'Đã lưu thông tin danh mục thành công');
  };

  // Save Product (Create / Edit)
  const handleSaveProduct = async () => {
    if (!prodForm.name.trim() || !basePriceValidation.isValid || !craftFeeValidation.isValid) {
      return;
    }
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
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]+/g, '-'),
      category: prodForm.category,
      basePrice: basePriceValidation.value,
      craftFee: craftFeeValidation.value,
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
        ? 'Saved product & Cloudinary image'
        : 'Đã lưu sản phẩm & hình ảnh Cloudinary thành công'
    );
  };

  // Save Material (Create / Edit)
  const handleSaveMaterial = async () => {
    if (!matForm.name.trim() || !matUnitPriceValidation.isValid) return;
    const payload: Partial<CustomMaterial> = {
      name: matForm.name,
      materialType: matForm.materialType,
      unitPrice: matUnitPriceValidation.value,
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
        ? 'Saved material & BOM inventory'
        : 'Đã cập nhật nguyên liệu vỏ sò / ốc biển & tồn kho BOM'
    );
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'category') {
      try {
        await deleteCategoryAdmin(deleteTarget.id);
      } catch {
        // Fallback local removal
      }
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget.id));
      notify(isEn ? `Deleted category "${deleteTarget.name}"` : `Đã xóa danh mục "${deleteTarget.name}"`);
    } else if (deleteTarget.type === 'product') {
      try {
        await deleteProductAdmin(deleteTarget.id);
      } catch {
        // Fallback local removal
      }
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget.id));
      notify(isEn ? `Deleted "${deleteTarget.name}"` : `Đã xóa sản phẩm "${deleteTarget.name}"`);
    } else {
      try {
        await deleteMaterialAdmin(deleteTarget.id);
      } catch {
        // Fallback local removal
      }
      setMaterials((prev) => prev.filter((m) => m._id !== deleteTarget.id));
      notify(isEn ? `Deleted "${deleteTarget.name}"` : `Đã xóa nguyên liệu "${deleteTarget.name}"`);
    }
    setDeleteTarget(null);
  };

  // =========================================================================
  // TABLE COLUMNS (Generous column widths so buttons & text NEVER truncate)
  // =========================================================================

  const orderColumns: TableColumn<OrderRow>[] = [
    {
      key: 'orderCode',
      header: isEn ? 'Order Code' : 'Mã đơn hàng',
      width: proportional(1.2, { minWidth: 160 }),
      renderCell: (row) => (
        <VStack gap={0.5}>
          <Text type="code" weight="semibold">
            {row.orderCode}
          </Text>
          <Text type="supporting" hasTabularNumbers>
            {isHydrated ? formatDateTimeDisplay(row.createdAt, isEn) : row.createdAt.slice(0, 10)}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'customerInfo',
      header: isEn ? 'Customer' : 'Khách hàng',
      width: proportional(1.2, { minWidth: 165 }),
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
      header: isEn ? 'Order Type' : 'Phân loại đơn',
      width: proportional(1.1, { minWidth: 150 }),
      renderCell: (row) => {
        const customItem = row.items.find((i) => i.isCustom);
        const charmCount = customItem?.customDesignSnapshot?.placements?.length || 0;
        return customItem ? (
          <VStack gap={0.5}>
            <Text weight="medium">{isEn ? '3D Custom Craft' : 'Chế tác 3D'}</Text>
            <Text type="supporting">
              {charmCount > 0
                ? isEn
                  ? `${charmCount} attached shells`
                  : `Đính ${charmCount} vỏ sò / charm`
                : isEn
                  ? 'Custom color / size'
                  : 'Tùy chỉnh màu dây'}
            </Text>
          </VStack>
        ) : (
          <Text type="supporting">{isEn ? 'Standard Blank' : 'Phôi tiêu chuẩn'}</Text>
        );
      },
    },
    {
      key: 'finalAmount',
      header: isEn ? 'Total & Payment' : 'Tổng tiền & Thanh toán',
      width: proportional(1.1, { minWidth: 160 }),
      align: 'end',
      renderCell: (row) => (
        <VStack gap={0.5} hAlign="end">
          <Text weight="semibold" hasTabularNumbers>
            {formatVnd(row.finalAmount)}
          </Text>
          <HStack gap={1} vAlign="center" hAlign="end">
            <StatusDot
              variant={row.paymentStatus === 'paid' ? 'success' : 'warning'}
              label={row.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            />
            <Text type="supporting">
              {row.paymentStatus === 'paid'
                ? isEn
                  ? 'Paid (VietQR)'
                  : 'Đã thanh toán'
                : isEn
                  ? 'Unpaid (COD)'
                  : 'Chưa thu tiền'}
            </Text>
          </HStack>
        </VStack>
      ),
    },
    {
      key: 'status',
      header: isEn ? 'Crafting Stage' : 'Tiến độ chế tác',
      width: proportional(1.1, { minWidth: 160 }),
      renderCell: (row) => {
        const st = getOrderStatusInfo(row.status, isEn);
        return <Badge variant={st.badgeVariant} label={st.label} />;
      },
    },
    {
      key: '_id',
      header: isEn ? 'Actions' : 'Thao tác',
      width: pixel(270),
      align: 'end',
      renderCell: (row) => {
        const nextSt = NEXT_ORDER_STATUS[row.status];
        return (
          <HStack gap={1.5} hAlign="end" vAlign="center">
            {nextSt && (
              <StackItem size="static">
                <Button
                  label={isEn ? 'Next Stage' : 'Bước kế tiếp'}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStepOrderStatus(row, nextSt)}
                />
              </StackItem>
            )}
            <StackItem size="static">
              <Button
                label={isEn ? 'Open 3D Ticket' : 'Mở phiếu 3D'}
                variant="primary"
                size="sm"
                onClick={() => {
                  setInspectedOrder(row);
                  setCheckedPlacementIds([]);
                  setSelectedInspectorPlacementId(null);
                  setIsInspectorOpen(true);
                }}
              />
            </StackItem>
          </HStack>
        );
      },
    },
  ];

  const categoryColumns: TableColumn<CategoryRow>[] = [
    {
      key: 'name',
      header: isEn ? 'Category Name & Slug' : 'Tên danh mục & Mã định danh',
      width: proportional(1.8, { minWidth: 220 }),
      renderCell: (row) => (
        <VStack gap={0.5}>
          <Text weight="semibold">{isEn ? row.nameEn || row.name : row.name}</Text>
          <Text type="code">{row.slug}</Text>
        </VStack>
      ),
    },
    {
      key: 'description',
      header: isEn ? 'Description & 3D Preset' : 'Mô tả & Phôi 3D mặc định',
      width: proportional(2, { minWidth: 240 }),
      renderCell: (row) => (
        <VStack gap={0.5}>
          <Text type="supporting">{row.description || '—'}</Text>
          <Text type="supporting">
            Preset 3D: <Text type="code">{row.meshPresetDefault || 'tote_bag'}</Text>
          </Text>
        </VStack>
      ),
    },
    {
      key: 'itemCount',
      header: isEn ? 'Products / Items' : 'Số sản phẩm',
      width: proportional(0.9, { minWidth: 120 }),
      align: 'end',
      renderCell: (row) => (
        <Text weight="semibold" hasTabularNumbers>
          {row.itemCount ?? 0} {isEn ? 'items' : 'mẫu'}
        </Text>
      ),
    },
    {
      key: 'totalStock',
      header: isEn ? 'Total Stock' : 'Tổng tồn kho',
      width: proportional(0.9, { minWidth: 120 }),
      align: 'end',
      renderCell: (row) => (
        <Text hasTabularNumbers>
          {row.totalStock ?? 0} {t('common.pieces')}
        </Text>
      ),
    },
    {
      key: 'isActive',
      header: isEn ? 'Status' : 'Trạng thái',
      width: proportional(0.8, { minWidth: 120 }),
      renderCell: (row) => (
        <HStack gap={1.5} vAlign="center">
          <StatusDot
            variant={row.isActive ? 'success' : 'neutral'}
            label={row.isActive ? 'Active' : 'Hidden'}
          />
          <Text type="supporting">{row.isActive ? (isEn ? 'Active' : 'Hiển thị') : isEn ? 'Hidden' : 'Đang ẩn'}</Text>
        </HStack>
      ),
    },
    {
      key: '_id',
      header: isEn ? 'Actions' : 'Thao tác',
      width: pixel(190),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} hAlign="end">
          <StackItem size="static">
            <Button
              label={isEn ? 'Edit' : 'Chỉnh sửa'}
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingCategory(row);
                setCatForm({
                  name: row.name,
                  nameEn: row.nameEn || '',
                  slug: row.slug,
                  type: row.type || 'product',
                  meshPresetDefault: row.meshPresetDefault || 'tote_bag',
                  description: row.description || '',
                  sortOrder: row.sortOrder || 1,
                  isActive: row.isActive,
                });
                setIsCategoryModalOpen(true);
              }}
            />
          </StackItem>
          <StackItem size="static">
            <Button
              label={isEn ? 'Delete' : 'Xóa'}
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget({ type: 'category', id: row._id, name: row.name })}
            />
          </StackItem>
        </HStack>
      ),
    },
  ];

  const productColumns: TableColumn<ProductRow>[] = [
    {
      key: 'name',
      header: isEn ? 'Product & Cloudinary Image' : 'Sản phẩm & Hình ảnh Cloudinary',
      width: proportional(2.2, { minWidth: 260 }),
      renderCell: (row) => {
        const rawImg = row.image || row.imageUrl || row.thumbnail || row.images?.[0];
        return (
          <HStack gap={3} vAlign="center">
            <div
              style={{
                width: 44,
                height: 44,
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
              <Text type="supporting">
                Mesh: {row.model3D?.meshPreset || 'tote_bag'} • {row.ecoImpact?.netWeightGrams || 350}g lưới thu hồi
              </Text>
            </VStack>
          </HStack>
        );
      },
    },
    {
      key: 'category',
      header: isEn ? 'Category' : 'Danh mục',
      width: proportional(0.9, { minWidth: 120 }),
      renderCell: (row) => {
        const matchedCat = categories.find((c) => c.slug === row.category);
        return (
          <Badge
            variant="neutral"
            label={matchedCat ? (isEn ? matchedCat.nameEn || matchedCat.name : matchedCat.name) : row.category}
          />
        );
      },
    },
    {
      key: 'basePrice',
      header: isEn ? 'Base Price & 3D Fee' : 'Giá phôi & Phí khâu 3D',
      width: proportional(1.1, { minWidth: 160 }),
      align: 'end',
      renderCell: (row) => (
        <VStack gap={0.5} hAlign="end">
          <Text weight="semibold" hasTabularNumbers>
            {formatVnd(row.basePrice)}
          </Text>
          <Text type="supporting" hasTabularNumbers>
            +{formatVnd(row.craftFee)} phí đan 3D
          </Text>
        </VStack>
      ),
    },
    {
      key: 'stock',
      header: isEn ? 'Stock' : 'Tồn kho phôi',
      width: proportional(0.9, { minWidth: 120 }),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} vAlign="center" hAlign="end">
          <StatusDot
            variant={row.stock <= 0 ? 'error' : row.stock <= 10 ? 'warning' : 'success'}
            label={row.stock <= 0 ? 'Out of stock' : 'In stock'}
          />
          <Text hasTabularNumbers>
            {row.stock} {t('common.pieces')}
          </Text>
        </HStack>
      ),
    },
    {
      key: '_id',
      header: isEn ? 'Actions' : 'Thao tác',
      width: pixel(190),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} hAlign="end">
          <StackItem size="static">
            <Button
              label={isEn ? 'Edit' : 'Chỉnh sửa'}
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
          </StackItem>
          <StackItem size="static">
            <Button
              label={isEn ? 'Delete' : 'Xóa'}
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget({ type: 'product', id: row._id, name: row.name })}
            />
          </StackItem>
        </HStack>
      ),
    },
  ];

  const materialColumns: TableColumn<MaterialRow>[] = [
    {
      key: 'name',
      header: isEn ? 'Marine Shell / Snail Material' : 'Nguyên liệu vỏ sò / ốc biển',
      width: proportional(2.1, { minWidth: 240 }),
      renderCell: (row) => (
        <HStack gap={3} vAlign="center">
          <div
            style={{
              width: 40,
              height: 40,
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
          <VStack gap={0.5}>
            <Text weight="semibold">{row.name}</Text>
            <Text type="supporting">
              Preset 3D: {row.model3D?.meshPreset} • Màu {row.colorHex}
            </Text>
          </VStack>
        </HStack>
      ),
    },
    {
      key: 'materialType',
      header: isEn ? 'Group' : 'Nhóm phụ kiện',
      width: proportional(0.9, { minWidth: 120 }),
      renderCell: (row) => <Badge variant="neutral" label={row.materialType} />,
    },
    {
      key: 'unitPrice',
      header: isEn ? 'Unit Price' : 'Đơn giá đính 3D',
      width: proportional(1, { minWidth: 145 }),
      align: 'end',
      renderCell: (row) => (
        <Text weight="medium" hasTabularNumbers>
          {formatVnd(row.unitPrice)} / {t('common.pieces')}
        </Text>
      ),
    },
    {
      key: 'stockQuantity',
      header: isEn ? 'BOM Inventory' : 'Tồn kho BOM',
      width: proportional(1, { minWidth: 140 }),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} vAlign="center" hAlign="end">
          <StatusDot
            variant={
              row.stockQuantity <= 0
                ? 'error'
                : row.stockQuantity <= 15
                  ? 'warning'
                  : 'success'
            }
            label={row.stockQuantity <= 15 ? 'Low stock' : 'In stock'}
          />
          <Text hasTabularNumbers weight={row.stockQuantity <= 15 ? 'semibold' : 'normal'}>
            {row.stockQuantity} {t('common.pieces')}
          </Text>
        </HStack>
      ),
    },
    {
      key: '_id',
      header: isEn ? 'Actions' : 'Thao tác',
      width: pixel(190),
      align: 'end',
      renderCell: (row) => (
        <HStack gap={1.5} hAlign="end">
          <StackItem size="static">
            <Button
              label={isEn ? 'Edit' : 'Chỉnh sửa'}
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
          </StackItem>
          <StackItem size="static">
            <Button
              label={isEn ? 'Delete' : 'Xóa'}
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget({ type: 'material', id: row._id, name: row.name })}
            />
          </StackItem>
        </HStack>
      ),
    },
  ];

  const inspectedCustomItem = inspectedOrder?.items.find((i) => i.isCustom && i.customDesignSnapshot);
  const inspectedStatusInfo = inspectedOrder
    ? getOrderStatusInfo(inspectedOrder.status, isEn)
    : null;

  const cloudStorageLabel = mediaStatus?.isCloudinaryConfigured
    ? `Cloudinary (${mediaStatus.cloudName || ENV.CLOUDINARY_CLOUD_NAME})`
    : `Cloudinary (${ENV.CLOUDINARY_CLOUD_NAME || 'fbemz6fi'})`;

  const productCategoryOptions = useMemo(() => {
    const prodCats = categories.filter((c) => c.type === 'product');
    return prodCats.map((c) => ({
      value: c.slug,
      label: `${isEn ? c.nameEn || c.name : c.name} (${c.slug})`,
    }));
  }, [categories, isEn]);

  if (!isHydrated) {
    return null;
  }

  // =========================================================================
  // ASTRYX NEUTRAL LOGIN SCREEN (When Admin / Artisan is not signed in)
  // =========================================================================
  if (!currentUser) {
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
          {/* Minimal Top Bar for Language & Theme Switching */}
          <HStack gap={2} vAlign="center" hAlign="between" padding={4}>
            <HStack gap={2} vAlign="center">
              <StatusDot variant="accent" isPulsing label="WAVO CMS" />
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
            <div
              className="cms-anim-enter"
              style={{ width: '100%', maxWidth: 440 }}
            >
              <VStack gap={5}>
                <VStack gap={1} hAlign="center">
                  <Badge variant="neutral" label="Astryx Neutral Admin Portal" />
                  <Heading level={1}>
                    {isEn ? 'Sign in to NetLoop CMS' : 'Đăng Nhập Quản Trị Xưởng 3D'}
                  </Heading>
                  <Text type="supporting">
                    {isEn
                      ? 'Enter your Admin or Artisan credentials to manage orders, 3D tickets, and Cloudinary catalog.'
                      : 'Đăng nhập tài khoản Quản trị viên hoặc Nghệ nhân để quản lý đơn hàng, phiếu 3D & kho Cloudinary.'}
                  </Text>
                </VStack>

                <Card padding={6} width="100%">
                  <form onSubmit={handleLoginSubmit}>
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
                          onChange={setLoginEmail}
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
                          onChange={setLoginPassword}
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

                      {/* Quick Demo Role Switcher */}
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
                              setLoginEmail(ENV.DEFAULT_ADMIN_EMAIL);
                              setLoginPassword(ENV.DEFAULT_ADMIN_PASSWORD);
                              setLoginError(null);
                            }}
                          />
                          <Button
                            label="Artisan / Staff (Xưởng 3D)"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setLoginEmail('artisan@dtu-upcycled.vn');
                              setLoginPassword(ENV.DEFAULT_ADMIN_PASSWORD);
                              setLoginError(null);
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
          <TopNav
            label="NetLoop CMS Top Navigation"
            heading={
              <HStack gap={2} vAlign="center">
                {/* Drawer / SideNav Collapse Button placed at the TOP as requested */}
                <SideNavCollapseButton
                  collapsible={sideNavCollapseConfig}
                  size="sm"
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
                    onClick={handleLogout}
                  />
                </HStack>
              </HStack>
            }
          />
        }
        sideNav={
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
                endContent={<Badge variant="neutral" label={String(orders.length)} />}
                onClick={() => setActiveTab('orders')}
              />
            </SideNavSection>

            <SideNavSection title={isEn ? 'Catalog & Cloudinary' : 'Danh mục & Cloudinary'}>
              <SideNavItem
                label={isEn ? 'Category Management' : 'Quản lý danh mục'}
                icon="funnel"
                isSelected={activeTab === 'categories'}
                endContent={<Badge variant="neutral" label={String(categories.length)} />}
                onClick={() => setActiveTab('categories')}
              />
              <SideNavItem
                label={isEn ? 'Products' : 'Sản phẩm'}
                icon="viewColumns"
                isSelected={activeTab === 'products'}
                endContent={<Badge variant="neutral" label={String(products.length)} />}
                onClick={() => setActiveTab('products')}
              />
              <SideNavItem
                label={isEn ? 'Materials BOM' : 'Kho Vỏ sò / Ốc BOM'}
                icon="wrench"
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
        <Layout
          height="fill"
          padding={6}
          header={
            <LayoutHeader hasDivider>
              <HStack gap={4} vAlign="center" hAlign="between" wrap="wrap">
                <VStack gap={1}>
                  <Heading level={1}>
                    {activeTab === 'dashboard' &&
                      (isEn
                        ? 'Workshop Analytics & 3D Crafting Operations'
                        : 'Tổng Quan Xưởng Thủ Công & Biểu Đồ Phân Tích')}
                    {activeTab === 'orders' &&
                      (isEn
                        ? 'Orders & 3D Crafting Tickets'
                        : 'Quản Lý Đơn Hàng & Phiếu Chế Tác 3D')}
                    {activeTab === 'categories' &&
                      (isEn
                        ? 'Product & Material Category Management'
                        : 'Quản Lý Danh Mục Sản Phẩm & Phân Nhóm 3D')}
                    {activeTab === 'products' &&
                      (isEn
                        ? 'Upcycled Product Catalog & Cloudinary Media'
                        : 'Danh Mục Sản Phẩm Tái Chế & Hình Ảnh Cloudinary')}
                    {activeTab === 'materials' &&
                      (isEn
                        ? 'Marine Shell & Snail BOM Inventory'
                        : 'Kho Nguyên Liệu Vỏ Sò & Ốc Biển BOM')}
                  </Heading>
                  <Text type="supporting">
                    {activeTab === 'dashboard' &&
                      (isEn
                        ? 'Real-time revenue charts, category distribution, ghost net recovery impact, and 3D crafting tickets.'
                        : 'Biểu đồ doanh thu, tỷ trọng danh mục sản phẩm, sản lượng lưới cá thu hồi và tiến độ chế tác 3D.')}
                    {activeTab === 'orders' &&
                      (isEn
                        ? 'Inspect 3D custom shell attachments, verify VietQR payments, and advance crafting stages.'
                        : 'Kiểm tra bản vẽ đính vỏ sò 3D của khách, đối soát thanh toán VietQR và cập nhật tiến độ chế tác.')}
                    {activeTab === 'categories' &&
                      (isEn
                        ? 'Organize product categories, slugs, default 3D mesh presets, and display order.'
                        : 'Thêm, chỉnh sửa, sắp xếp các danh mục sản phẩm tái chế và cấu hình phôi 3D mặc định.')}
                    {activeTab === 'products' &&
                      (isEn
                        ? 'Manage 3D product blanks, validated VND prices, crafting fees, and Cloudinary images.'
                        : 'Quản lý phôi sản phẩm 3D, kiểm tra định dạng tiền tệ VNĐ và trường hình ảnh (`image`) trên Cloudinary.')}
                    {activeTab === 'materials' &&
                      (isEn
                        ? 'Track marine shell, snail, and charm stock levels used in the 3D Customizer Studio.'
                        : 'Quản lý định mức tồn kho các loại vỏ sò, ốc biển và charm đính trong phòng thiết kế 3D Studio.')}
                  </Text>
                </VStack>

                <HStack gap={2} vAlign="center">
                  {activeTab === 'categories' && (
                    <Button
                      label={isEn ? 'New Category' : 'Thêm danh mục mới'}
                      variant="primary"
                      onClick={() => {
                        setEditingCategory(null);
                        setCatForm({
                          name: '',
                          nameEn: '',
                          slug: '',
                          type: 'product',
                          meshPresetDefault: 'tote_bag',
                          description: '',
                          sortOrder: categories.length + 1,
                          isActive: true,
                        });
                        setIsCategoryModalOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'products' && (
                    <Button
                      label={isEn ? 'New Product' : 'Thêm sản phẩm mới'}
                      variant="primary"
                      onClick={() => {
                        setEditingProduct(null);
                        setProdForm({
                          name: '',
                          slug: '',
                          category: categories[0]?.slug || 'bag',
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
                      label={isEn ? 'New Material' : 'Thêm nguyên liệu BOM'}
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
                  {(activeTab === 'dashboard' || activeTab === 'orders') && (
                    <Button
                      label={isEn ? 'Open 3D Inspector' : 'Mở Máy Trạm 3D Inspector'}
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
            </LayoutHeader>
          }
          content={
            <LayoutContent>
              {/* =========================================================== */}
              {/* VIEW 1: DASHBOARD WITH ANIMATED KPIs & INTERACTIVE CHARTS   */}
              {/* =========================================================== */}
              {activeTab === 'dashboard' && (
                <VStack gap={6}>
                  {/* 4 Responsive Metric Cards with Animated Counters & Sparklines */}
                  <Grid columns={{ minWidth: 220, repeat: 'fit' }} gap={4}>
                    <div className="cms-anim-enter cms-anim-delay-1 cms-kpi-lift">
                      <Card>
                        <VStack gap={2}>
                          <HStack gap={2} vAlign="center" hAlign="between">
                            <Text type="supporting">
                              {isEn ? 'Total Workshop Revenue' : 'Tổng doanh thu đơn hiện tại'}
                            </Text>
                            <Badge variant="green" label="+18.4%" />
                          </HStack>
                          <HStack gap={2} vAlign="end" hAlign="between">
                            <Heading level={2}>
                              <AnimatedCounter
                                value={kpiStats.revenue}
                                formatter={(v) => formatVnd(Math.round(v))}
                              />
                            </Heading>
                            <MiniSparkline points={[280, 340, 310, 420, 490, 560, 768]} />
                          </HStack>
                          <Text type="supporting">
                            {isEn
                              ? `Cumulative Q4: ${formatCompactVnd(18268000, locale)}`
                              : `Lũy kế quý IV: ${formatVnd(18268000)}`}
                          </Text>
                        </VStack>
                      </Card>
                    </div>

                    <div className="cms-anim-enter cms-anim-delay-2 cms-kpi-lift">
                      <Card>
                        <VStack gap={2}>
                          <HStack gap={2} vAlign="center" hAlign="between">
                            <Text type="supporting">
                              {isEn ? 'Total Orders' : 'Tổng đơn đặt hàng'}
                            </Text>
                            <StatusDot variant="success" isPulsing label="Live Orders" />
                          </HStack>
                          <HStack gap={2} vAlign="end" hAlign="between">
                            <Heading level={2}>
                              <AnimatedCounter
                                value={kpiStats.totalOrders}
                                formatter={(v) =>
                                  `${Math.round(v)} ${isEn ? 'orders' : 'đơn hàng'}`
                                }
                              />
                            </Heading>
                            <MiniSparkline points={[12, 16, 15, 22, 28, 35, 42]} />
                          </HStack>
                          <Text type="supporting">
                            {isEn ? 'Synced VietQR & COD' : 'Đồng bộ thanh toán VietQR & COD'}
                          </Text>
                        </VStack>
                      </Card>
                    </div>

                    <div className="cms-anim-enter cms-anim-delay-3 cms-kpi-lift">
                      <Card>
                        <VStack gap={2}>
                          <HStack gap={2} vAlign="center" hAlign="between">
                            <Text type="supporting">
                              {isEn ? 'Active 3D Crafting Tickets' : 'Phiếu đang chế tác 3D'}
                            </Text>
                            <StatusDot variant="accent" isPulsing label="3D Workstation Active" />
                          </HStack>
                          <HStack gap={2} vAlign="end" hAlign="between">
                            <Heading level={2}>
                              <AnimatedCounter
                                value={kpiStats.craftingCount}
                                formatter={(v) =>
                                  `${Math.round(v)} ${isEn ? 'tickets' : 'phiếu 3D'}`
                                }
                              />
                            </Heading>
                            <MiniSparkline points={[3, 5, 4, 7, 6, 8, 9]} />
                          </HStack>
                          <Text type="supporting">
                            {isEn ? 'In progress on 3D workstation' : 'Đang đan & đính ốc tại xưởng'}
                          </Text>
                        </VStack>
                      </Card>
                    </div>

                    <div className="cms-anim-enter cms-anim-delay-4 cms-kpi-lift">
                      <Card>
                        <VStack gap={2}>
                          <HStack gap={2} vAlign="center" hAlign="between">
                            <Text type="supporting">
                              {isEn ? 'Ghost Nets Recovered' : 'Lưới đánh cá thu hồi'}
                            </Text>
                            <Badge variant="teal" label="Eco Impact" />
                          </HStack>
                          <HStack gap={2} vAlign="end" hAlign="between">
                            <Heading level={2}>
                              <AnimatedCounter
                                value={kpiStats.totalNetsGrams / 1000}
                                formatter={(v) => `${v.toFixed(2)} kg`}
                              />
                            </Heading>
                            <MiniSparkline points={[9.5, 11.2, 12.8, 14.1, 15.3, 16.4, 17.16]} />
                          </HStack>
                          <Text type="supporting" hasTabularNumbers>
                            {kpiStats.totalNetsGrams.toLocaleString(isEn ? 'en-US' : 'vi-VN')} gram lưới biển tái sinh
                          </Text>
                        </VStack>
                      </Card>
                    </div>
                  </Grid>

                  {/* ANALYTICS CHARTS BAND (2 Interactive Visual Charts side by side) */}
                  <Grid columns={{ minWidth: 380, repeat: 'fit' }} gap={4}>
                    {/* Chart 1: Interactive 6-Month Revenue & Ghost Net Recovery Chart */}
                    <div className="cms-anim-enter cms-anim-delay-2">
                      <Card>
                        <VStack gap={4}>
                          <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
                            <VStack gap={0.5}>
                              <Heading level={3}>
                                {isEn
                                  ? 'Workshop Revenue & Net Recovery'
                                  : 'Biểu Đồ Doanh Thu & Sản Lượng Lưới Thu Hồi'}
                              </Heading>
                              <Text type="supporting">
                                {isEn
                                  ? 'Hover any month column to inspect detailed revenue & ocean net weight'
                                  : 'Di chuột vào từng cột tháng để xem chi tiết doanh thu & lượng lưới tái chế'}
                              </Text>
                            </VStack>
                            <SegmentedControl
                              size="sm"
                              label={isEn ? 'Time range' : 'Khoảng thời gian'}
                              value={chartWindow}
                              onChange={(val) => setChartWindow(val as '6m' | 'q4')}
                            >
                              <SegmentedControlItem
                                value="6m"
                                label={isEn ? '6 Months' : '6 Tháng'}
                              />
                              <SegmentedControlItem
                                value="q4"
                                label={isEn ? 'Quarter 4' : 'Quý IV'}
                              />
                            </SegmentedControl>
                          </HStack>

                          {/* Active Hovered Point Callout Bar */}
                          {(() => {
                            const visiblePoints =
                              chartWindow === 'q4'
                                ? kpiStats.monthlyTrend.slice(-3)
                                : kpiStats.monthlyTrend;
                            const activePoint =
                              visiblePoints.find((p) => p.month === hoveredMonth) ||
                              visiblePoints[visiblePoints.length - 1];

                            return (
                              <>
                                <HStack gap={3} vAlign="center" hAlign="between" wrap="wrap">
                                  <HStack gap={2} vAlign="center">
                                    <StatusDot
                                      variant="accent"
                                      isPulsing
                                      label={activePoint.month}
                                    />
                                    <Text weight="semibold">
                                      {isEn
                                        ? `Month ${activePoint.month}:`
                                        : `Tháng ${activePoint.month}:`}{' '}
                                      {formatVnd(activePoint.revenue)}
                                    </Text>
                                  </HStack>
                                  <Badge
                                    variant="blue"
                                    label={`${isEn ? 'Recovered:' : 'Thu hồi:'} ${activePoint.netsKg} kg lưới`}
                                  />
                                </HStack>

                                {/* Responsive Animated Column Chart */}
                                <div
                                  style={{
                                    width: '100%',
                                    height: 220,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                    gap: 16,
                                    paddingTop: 24,
                                    paddingBottom: 8,
                                    borderBottom: '1px solid var(--color-border)',
                                  }}
                                >
                                  {visiblePoints.map((point, idx) => {
                                    const maxRev = 20_000_000;
                                    const heightPct = Math.max(
                                      20,
                                      Math.min(100, Math.round((point.revenue / maxRev) * 100))
                                    );
                                    const isHighlighted = activePoint.month === point.month;
                                    return (
                                      <div
                                        key={point.month}
                                        onMouseEnter={() => setHoveredMonth(point.month)}
                                        style={{
                                          flex: 1,
                                          height: '100%',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          justifyContent: 'flex-end',
                                          gap: 6,
                                        }}
                                      >
                                        <Text
                                          type="supporting"
                                          weight={isHighlighted ? 'semibold' : 'normal'}
                                          hasTabularNumbers
                                        >
                                          {formatCompactVnd(point.revenue, locale)}
                                        </Text>
                                        <div
                                          className="cms-chart-bar"
                                          title={`${point.month}: ${formatVnd(point.revenue)} • ${point.netsKg}kg`}
                                          style={{
                                            width: '100%',
                                            maxWidth: chartWindow === 'q4' ? 68 : 46,
                                            height: `${heightPct}%`,
                                            animationDelay: `${idx * 65}ms`,
                                            borderRadius: '8px 8px 3px 3px',
                                            background: isHighlighted
                                              ? 'var(--color-accent)'
                                              : 'var(--color-border-emphasized, rgba(120,120,128,0.32))',
                                          }}
                                        />
                                        <Text
                                          type="label"
                                          weight={isHighlighted ? 'semibold' : 'normal'}
                                          hasTabularNumbers
                                        >
                                          {point.month}
                                        </Text>
                                        <Text type="supporting" hasTabularNumbers>
                                          {point.netsKg}kg
                                        </Text>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}

                          <HStack gap={4} vAlign="center" hAlign="between" wrap="wrap">
                            <HStack gap={2} vAlign="center">
                              <StatusDot variant="accent" label="Selected Month" />
                              <Text type="supporting">
                                {isEn
                                  ? 'Interactive bar selection'
                                  : 'Chạm hoặc rê chuột lên cột để đối chiếu'}
                              </Text>
                            </HStack>
                            <Text type="supporting" hasTabularNumbers>
                              {isEn ? 'Average ticket value:' : 'Giá trị đơn trung bình:'}{' '}
                              {formatVnd(
                                kpiStats.totalOrders > 0
                                  ? Math.round(kpiStats.revenue / kpiStats.totalOrders)
                                  : 384000
                              )}
                            </Text>
                          </HStack>
                        </VStack>
                      </Card>
                    </div>

                    {/* Chart 2: Category Distribution & Click-to-Filter Progress Chart */}
                    <div className="cms-anim-enter cms-anim-delay-3">
                      <Card>
                        <VStack gap={4}>
                          <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
                            <VStack gap={0.5}>
                              <Heading level={3}>
                                {isEn
                                  ? 'Category Stock & Inventory Value Distribution'
                                  : 'Tỷ Trọng Tồn Kho & Giá Trị Theo Danh Mục'}
                              </Heading>
                              <Text type="supporting">
                                {isEn
                                  ? 'Click any category row to filter products in that category'
                                  : 'Bấm vào từng dòng danh mục để mở danh sách sản phẩm thuộc nhóm đó'}
                              </Text>
                            </VStack>
                            <Button
                              label={isEn ? 'Manage Categories' : 'Quản lý danh mục'}
                              variant="secondary"
                              size="sm"
                              onClick={() => setActiveTab('categories')}
                            />
                          </HStack>

                          <VStack gap={2}>
                            {kpiStats.categoryBreakdown.map((cat) => {
                              const maxStock = 100;
                              return (
                                <div
                                  key={cat.slug}
                                  className="cms-category-row"
                                  onClick={() => {
                                    setProductCatFilter(cat.slug);
                                    setActiveTab('products');
                                  }}
                                >
                                  <VStack gap={1.5}>
                                    <HStack gap={2} vAlign="center" hAlign="between">
                                      <HStack gap={1.5} vAlign="center">
                                        <Text weight="medium">{cat.name}</Text>
                                        <Badge
                                          variant="neutral"
                                          label={`${cat.productCount} ${isEn ? 'SKUs' : 'mẫu'}`}
                                        />
                                      </HStack>
                                      <Text type="supporting" hasTabularNumbers>
                                        {cat.totalStock} {t('common.pieces')} •{' '}
                                        {formatVnd(cat.inventoryValue)}
                                      </Text>
                                    </HStack>
                                    <ProgressBar
                                      label={cat.name}
                                      isLabelHidden
                                      value={Math.min(maxStock, cat.totalStock)}
                                      max={maxStock}
                                      variant={cat.totalStock <= 15 ? 'warning' : 'accent'}
                                    />
                                  </VStack>
                                </div>
                              );
                            })}
                          </VStack>
                        </VStack>
                      </Card>
                    </div>
                  </Grid>

                  {/* Low Stock Material Alert Banner */}
                  {kpiStats.lowStockMats.length > 0 && (
                    <Banner
                      status="warning"
                      container="card"
                      collapsible={false}
                      title={
                        isEn
                          ? `Low Stock BOM Alert (${kpiStats.lowStockMats.length} items below safety threshold)`
                          : `Cảnh báo tồn kho BOM (${kpiStats.lowStockMats.length} nguyên liệu vỏ sò / ốc dưới ngưỡng an toàn ≤ 15 cái)`
                      }
                      description={
                        isEn
                          ? 'Restock these materials so customers can continue attaching them in the 3D Studio.'
                          : 'Bấm vào nguyên liệu bên dưới để cập nhật bổ sung số lượng tồn kho cho phòng 3D Studio.'
                      }
                      endContent={
                        <Button
                          label={isEn ? 'Open BOM Inventory' : 'Quản lý kho BOM'}
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveTab('materials')}
                        />
                      }
                    >
                      <List density="compact" hasDividers>
                        {kpiStats.lowStockMats.map((m) => (
                          <ListItem
                            key={m._id}
                            label={m.name}
                            description={`${isEn ? '3D Preset:' : 'Mã 3D:'} ${m.model3D?.meshPreset} • ${formatVnd(m.unitPrice)} / ${t('common.pieces')}`}
                            endContent={
                              <Badge
                                variant="warning"
                                label={`${m.stockQuantity} ${t('common.pieces')}`}
                              />
                            }
                            onClick={() => {
                              setEditingMaterial(m);
                              setMatForm({
                                name: m.name,
                                materialType: m.materialType,
                                unitPrice: m.unitPrice,
                                stockQuantity: m.stockQuantity,
                                colorHex: m.colorHex,
                                thumbnail: m.thumbnail || ASSETS.materials.scallopShell,
                                meshPreset: m.model3D?.meshPreset || 'scallop_shell',
                                glbUrl: m.model3D?.glbUrl || '',
                                description: m.description || '',
                              });
                              setIsMaterialModalOpen(true);
                            }}
                          />
                        ))}
                      </List>
                    </Banner>
                  )}

                  <Divider />

                  {/* Recent 3D Crafting Tickets */}
                  <VStack gap={4}>
                    <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
                      <VStack gap={0.5}>
                        <Heading level={2}>
                          {isEn ? 'Recent 3D Crafting Tickets' : 'Phiếu Chế Tác 3D Mới Tiếp Nhận'}
                        </Heading>
                        <Text type="supporting">
                          {isEn
                            ? 'Click "Open 3D Ticket" on any order to inspect the customer’s 3D blueprint.'
                            : 'Bấm "Mở phiếu 3D" trên từng đơn hàng để kiểm tra mô hình 3D và danh sách vỏ sò cần đính.'}
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
                </VStack>
              )}

              {/* =========================================================== */}
              {/* VIEW 2: ORDERS & 3D CRAFTING INSPECTOR                      */}
              {/* =========================================================== */}
              {activeTab === 'orders' && (
                <VStack gap={5}>
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
                      label={isEn ? 'Crafting Stage' : 'Lọc theo tiến độ chế tác'}
                      value={orderStatusFilter}
                      onChange={setOrderStatusFilter}
                      width={240}
                      options={[
                        { value: 'all', label: isEn ? 'All stages (7)' : 'Tất cả trạng thái (7)' },
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
                        label={isEn ? 'Reset' : 'Xóa lọc'}
                        variant="ghost"
                        onClick={() => {
                          setOrderSearch('');
                          setOrderStatusFilter('all');
                        }}
                      />
                    )}
                  </HStack>

                  {filteredOrders.length === 0 ? (
                    <EmptyState
                      title={isEn ? 'No matching orders found' : 'Không tìm thấy đơn hàng phù hợp'}
                      description={
                        isEn
                          ? 'Try clearing your search query or status filter.'
                          : 'Hãy thử xóa từ khóa tìm kiếm hoặc chọn lại bộ lọc trạng thái.'
                      }
                      actions={
                        <Button
                          label={isEn ? 'Reset Filters' : 'Đặt lại bộ lọc'}
                          variant="secondary"
                          onClick={() => {
                            setOrderSearch('');
                            setOrderStatusFilter('all');
                          }}
                        />
                      }
                    />
                  ) : (
                    <Table
                      data={filteredOrders}
                      columns={orderColumns}
                      idKey="orderCode"
                      density="balanced"
                      hasHover
                    />
                  )}
                </VStack>
              )}

              {/* =========================================================== */}
              {/* VIEW 3: CATEGORY MANAGEMENT                                 */}
              {/* =========================================================== */}
              {activeTab === 'categories' && (
                <VStack gap={5}>
                  <HStack gap={3} vAlign="end" wrap="wrap">
                    <StackItem size="fill">
                      <TextInput
                        type="search"
                        label={isEn ? 'Search categories' : 'Tìm kiếm danh mục'}
                        value={categorySearch}
                        onChange={setCategorySearch}
                        placeholder={
                          isEn
                            ? 'Search by category name or slug...'
                            : 'Nhập tên danh mục hoặc mã định danh (bag, basket, wallet...)'
                        }
                        startIcon="search"
                        hasClear
                        width="100%"
                      />
                    </StackItem>

                    <Selector
                      label={isEn ? 'Category Scope' : 'Loại danh mục'}
                      value={categoryTypeFilter}
                      onChange={setCategoryTypeFilter}
                      width={220}
                      options={[
                        { value: 'all', label: isEn ? 'All categories' : 'Tất cả danh mục' },
                        { value: 'product', label: isEn ? 'Product Categories' : 'Danh mục sản phẩm' },
                        { value: 'material', label: isEn ? 'Material Groups' : 'Nhóm nguyên liệu BOM' },
                      ]}
                    />
                  </HStack>

                  <Table
                    data={filteredCategories}
                    columns={categoryColumns}
                    idKey="_id"
                    density="balanced"
                    hasHover
                  />
                </VStack>
              )}

              {/* =========================================================== */}
              {/* VIEW 4: PRODUCTS & CLOUDINARY IMAGES                        */}
              {/* =========================================================== */}
              {activeTab === 'products' && (
                <VStack gap={5}>
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
                      label={isEn ? 'Category' : 'Danh mục sản phẩm'}
                      value={productCatFilter}
                      onChange={setProductCatFilter}
                      width={240}
                      options={[
                        { value: 'all', label: t('categories.all') },
                        ...productCategoryOptions,
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
              )}

              {/* =========================================================== */}
              {/* VIEW 5: MATERIALS BOM INVENTORY                             */}
              {/* =========================================================== */}
              {activeTab === 'materials' && (
                <VStack gap={5}>
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
              )}
            </LayoutContent>
          }
        />
      </AppShell>

      {/* =================================================================== */}
      {/* ASTRYX DRAWER: 3D CRAFTING INSPECTOR WORKSTATION                    */}
      {/* =================================================================== */}
      <Drawer
        isOpen={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        label={isEn ? '3D Crafting Inspector Workstation' : 'Máy trạm chế tác 3D Inspector'}
        width={760}
      >
        <Layout
          header={
            <DrawerHeader
              title={
                inspectedOrder
                  ? `${isEn ? '3D Crafting Ticket:' : 'Phiếu chế tác 3D:'} ${inspectedOrder.orderCode}`
                  : isEn
                    ? '3D Crafting Inspector'
                    : 'Máy Trạm Chế Tác 3D'
              }
              subtitle={
                inspectedOrder
                  ? `${inspectedOrder.customerInfo.fullName} • ${inspectedOrder.customerInfo.phone}`
                  : undefined
              }
              endContent={
                inspectedStatusInfo ? (
                  <Badge
                    variant={inspectedStatusInfo.badgeVariant}
                    label={inspectedStatusInfo.label}
                  />
                ) : undefined
              }
              onOpenChange={setIsInspectorOpen}
            />
          }
          content={
            <LayoutContent>
              {inspectedOrder && (
                <VStack gap={5}>
                  <Card>
                    <VStack gap={3}>
                      <ProgressBar
                        label={isEn ? 'Crafting Progress (BR-05)' : 'Tiến độ chế tác đơn hàng (BR-05)'}
                        value={inspectedStatusInfo?.progressPct || 0}
                        max={100}
                        hasValueLabel
                        variant={inspectedOrder.status === 'delivered' ? 'success' : 'accent'}
                      />
                      <HStack gap={1.5} wrap="wrap">
                        {ORDER_STAGE_STEPS.map((st) => {
                          const info = getOrderStatusInfo(st, isEn);
                          const isCurrent = inspectedOrder.status === st;
                          return (
                            <Button
                              key={st}
                              label={info.label}
                              variant={isCurrent ? 'primary' : 'secondary'}
                              size="sm"
                              onClick={() => handleStepOrderStatus(inspectedOrder, st)}
                            />
                          );
                        })}
                      </HStack>
                    </VStack>
                  </Card>

                  <MetadataList columns={2}>
                    <MetadataListItem label={isEn ? 'Customer' : 'Khách hàng'}>
                      {inspectedOrder.customerInfo.fullName} ({inspectedOrder.customerInfo.phone})
                    </MetadataListItem>
                    <MetadataListItem label={isEn ? 'Shipping Address' : 'Địa chỉ giao hàng'}>
                      {inspectedOrder.customerInfo.address}
                    </MetadataListItem>
                    <MetadataListItem label={isEn ? 'Total Amount' : 'Tổng thanh toán'}>
                      <Text weight="semibold" hasTabularNumbers>
                        {formatVnd(inspectedOrder.finalAmount)} ({inspectedOrder.paymentMethod.toUpperCase()})
                      </Text>
                    </MetadataListItem>
                    <MetadataListItem label={isEn ? 'Payment Status' : 'Trạng thái thu tiền'}>
                      <Button
                        label={
                          inspectedOrder.paymentStatus === 'paid'
                            ? isEn
                              ? 'Paid — Click to toggle'
                              : 'Đã thu tiền (Chạm để đổi)'
                            : isEn
                              ? 'Unpaid — Click to mark paid'
                              : 'Chưa thu tiền (Bấm xác nhận thu)'
                        }
                        variant="secondary"
                        size="sm"
                        onClick={() => handleTogglePayment(inspectedOrder)}
                      />
                    </MetadataListItem>
                  </MetadataList>

                  {inspectedCustomItem && inspectedCustomItem.customDesignSnapshot ? (
                    <VStack gap={4}>
                      <Heading level={3}>
                        {isEn
                          ? 'Interactive 3D Blueprint & Shell Coordinates'
                          : 'Mô hình 3D & Tọa độ đính Vỏ sò / Ốc biển'}
                      </Heading>

                      <div
                        style={{
                          height: 340,
                          width: '100%',
                          borderRadius: 12,
                          overflow: 'hidden',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-background-surface)',
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
                            isEn ? 'Customer Note for Artisan' : 'Ghi chú của khách cho nghệ nhân'
                          }
                          description={inspectedCustomItem.customDesignSnapshot.artisanNote}
                        />
                      )}

                      <Card>
                        <VStack gap={3}>
                          <HStack gap={2} vAlign="center" hAlign="between">
                            <Heading level={4}>
                              {isEn
                                ? 'Artisan BOM Attachment Checklist'
                                : 'Checklist phụ kiện Vỏ sò / Ốc cần đính (BOM)'}
                            </Heading>
                            <Badge
                              variant="neutral"
                              label={`${checkedPlacementIds.length}/${inspectedCustomItem.customDesignSnapshot.placements.length}`}
                            />
                          </HStack>

                          <Divider />

                          <VStack gap={2}>
                            {inspectedCustomItem.customDesignSnapshot.placements.map((pl, idx) => {
                              const isChecked = checkedPlacementIds.includes(pl.placementId);
                              return (
                                <HStack
                                  key={pl.placementId}
                                  gap={3}
                                  vAlign="center"
                                  hAlign="between"
                                >
                                  <CheckboxInput
                                    label={`#${idx + 1} ${pl.materialName}`}
                                    description={`Tọa độ 3D: (${pl.position
                                      .map((n) => n.toFixed(2))
                                      .join(', ')}) • Góc xoay: ${pl.rotation}° • Tỉ lệ: ${pl.scale}x`}
                                    value={isChecked}
                                    onChange={(checked) => {
                                      setSelectedInspectorPlacementId(pl.placementId);
                                      setCheckedPlacementIds((prev) =>
                                        checked
                                          ? [...prev, pl.placementId]
                                          : prev.filter((id) => id !== pl.placementId)
                                      );
                                    }}
                                  />
                                  <Text type="code" hasTabularNumbers>
                                    +{formatVnd(pl.unitPrice)}
                                  </Text>
                                </HStack>
                              );
                            })}
                          </VStack>

                          <Divider />

                          <MetadataList columns={3}>
                            <MetadataListItem label={isEn ? 'Base Blank' : 'Giá phôi lưới'}>
                              {formatVnd(inspectedCustomItem.customDesignSnapshot.basePrice)}
                            </MetadataListItem>
                            <MetadataListItem label={isEn ? '3D Craft Fee' : 'Phí khâu 3D'}>
                              +{formatVnd(inspectedCustomItem.customDesignSnapshot.craftFee)}
                            </MetadataListItem>
                            <MetadataListItem label={isEn ? 'BOM Materials' : 'Tổng phụ kiện'}>
                              +{formatVnd(inspectedCustomItem.customDesignSnapshot.materialsTotal)}
                            </MetadataListItem>
                          </MetadataList>
                        </VStack>
                      </Card>
                    </VStack>
                  ) : (
                    <EmptyState
                      isCompact
                      title={
                        isEn
                          ? 'Standard Ready-Made Product Blank'
                          : 'Đơn hàng phôi tiêu chuẩn (Không đính phụ kiện 3D)'
                      }
                      description={
                        isEn
                          ? 'This order does not include custom 3D shell attachments.'
                          : 'Khách đặt phôi tiêu chuẩn, nghệ nhân có thể chuyển thẳng sang bước kiểm định QC & đóng gói.'
                      }
                    />
                  )}
                </VStack>
              )}
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label={isEn ? 'Close' : 'Đóng'}
                  variant="secondary"
                  onClick={() => setIsInspectorOpen(false)}
                />
                {inspectedOrder && NEXT_ORDER_STATUS[inspectedOrder.status] && (
                  <Button
                    label={
                      isEn
                        ? `Advance to Next Stage`
                        : `Chuyển sang "${getOrderStatusInfo(
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
      {/* ASTRYX DIALOG: CREATE / EDIT CATEGORY                               */}
      {/* =================================================================== */}
      <Dialog
        isOpen={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        purpose="form"
        width={600}
        maxHeight="85dvh"
      >
        <Layout
          header={
            <DialogHeader
              title={
                editingCategory
                  ? isEn
                    ? 'Update Category'
                    : 'Cập Nhật Danh Mục Sản Phẩm'
                  : isEn
                    ? 'Create New Category'
                    : 'Thêm Danh Mục Mới'
              }
              subtitle={
                isEn
                  ? 'Configure category slug, default 3D mesh preset, and display order.'
                  : 'Cấu hình mã định danh (slug), phôi 3D mặc định và thứ tự hiển thị trên cửa hàng.'
              }
              onOpenChange={setIsCategoryModalOpen}
            />
          }
          content={
            <LayoutContent>
              <FormLayout defaultOptionality="required">
                <FormLayout direction="horizontal">
                  <TextInput
                    label={isEn ? 'Category Name (VI)' : 'Tên danh mục (Tiếng Việt)'}
                    isRequired
                    value={catForm.name}
                    onChange={(val) => setCatForm({ ...catForm, name: val })}
                    placeholder="Túi xách lưới đại dương"
                    width="100%"
                  />

                  <TextInput
                    label={isEn ? 'Category Name (EN)' : 'Tên danh mục (Tiếng Anh)'}
                    isOptional
                    value={catForm.nameEn}
                    onChange={(val) => setCatForm({ ...catForm, nameEn: val })}
                    placeholder="Upcycled Net Bags"
                    width="100%"
                  />
                </FormLayout>

                <FormLayout direction="horizontal">
                  <TextInput
                    label={isEn ? 'Category Slug' : 'Mã định danh (Slug)'}
                    isOptional
                    value={catForm.slug}
                    onChange={(val) => setCatForm({ ...catForm, slug: val })}
                    placeholder="bag"
                    width="100%"
                  />

                  <Selector
                    label={isEn ? 'Default 3D Mesh Preset' : 'Phôi 3D mặc định'}
                    value={catForm.meshPresetDefault}
                    onChange={(val) => setCatForm({ ...catForm, meshPresetDefault: val })}
                    width="100%"
                    options={[
                      { value: 'tote_bag', label: 'tote_bag (Túi xách lưới)' },
                      { value: 'storage_basket', label: 'storage_basket (Giỏ đựng đồ)' },
                      { value: 'zip_wallet', label: 'zip_wallet (Ví khóa kéo)' },
                      { value: 'eco_shirt', label: 'eco_shirt (Áo khoác tái chế)' },
                      { value: 'woven_bracelet', label: 'woven_bracelet (Vòng tay dây lưới)' },
                      { value: 'shell_charm_set', label: 'shell_charm_set (Phụ kiện charm)' },
                    ]}
                  />
                </FormLayout>

                <FormLayout direction="horizontal">
                  <Selector
                    label={isEn ? 'Category Type' : 'Phân nhóm'}
                    value={catForm.type}
                    onChange={(val) =>
                      setCatForm({ ...catForm, type: val as 'product' | 'material' })
                    }
                    width="100%"
                    options={[
                      { value: 'product', label: isEn ? 'Product Category' : 'Danh mục sản phẩm' },
                      { value: 'material', label: isEn ? 'BOM Material Group' : 'Nhóm nguyên liệu BOM' },
                    ]}
                  />

                  <NumberInput
                    label={isEn ? 'Display Order' : 'Thứ tự ưu tiên hiển thị'}
                    value={catForm.sortOrder}
                    onChange={(val) => setCatForm({ ...catForm, sortOrder: val ?? 1 })}
                    min={1}
                    step={1}
                    isIntegerOnly
                    isWheelEnabled={false}
                    width="100%"
                  />
                </FormLayout>

                <TextArea
                  label={isEn ? 'Description' : 'Mô tả danh mục'}
                  isOptional
                  value={catForm.description}
                  onChange={(val) => setCatForm({ ...catForm, description: val })}
                  rows={2}
                  width="100%"
                />

                <Switch
                  label={isEn ? 'Display Category on Storefront' : 'Hiển thị danh mục trên Web Store'}
                  value={catForm.isActive}
                  onChange={(checked) => setCatForm({ ...catForm, isActive: checked })}
                />
              </FormLayout>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button
                  label={t('common.cancel')}
                  variant="secondary"
                  onClick={() => setIsCategoryModalOpen(false)}
                />
                <Button
                  label={isEn ? 'Save Category' : 'Lưu danh mục'}
                  variant="primary"
                  onClick={handleSaveCategory}
                />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>

      {/* =================================================================== */}
      {/* ASTRYX DIALOG: CREATE / EDIT PRODUCT + CURRENCY VALIDATOR           */}
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
                  ? 'Currency fields are automatically formatted & validated via shared validators.'
                  : 'Các trường giá tiền được tự động định dạng & kiểm tra hợp lệ bằng bộ validator dùng chung.'
              }
              onOpenChange={setIsProductModalOpen}
            />
          }
          content={
            <LayoutContent>
              <FormLayout defaultOptionality="required">
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

                <FormLayout direction="horizontal">
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
                </FormLayout>

                <FormLayout direction="horizontal">
                  <Selector
                    label={isEn ? 'Category' : 'Danh mục'}
                    value={prodForm.category}
                    onChange={(val) =>
                      setProdForm({ ...prodForm, category: val as ProductCategory })
                    }
                    width="100%"
                    options={
                      productCategoryOptions.length > 0
                        ? productCategoryOptions
                        : [
                          { value: 'bag', label: 'Túi xách lưới (bag)' },
                          { value: 'basket', label: 'Giỏ đựng đồ (basket)' },
                          { value: 'wallet', label: 'Ví tiền (wallet)' },
                          { value: 'apparel', label: 'Áo quần (apparel)' },
                          { value: 'bracelet', label: 'Vòng tay (bracelet)' },
                          { value: 'accessory', label: 'Phụ kiện (accessory)' },
                        ]
                    }
                  />

                  <Selector
                    label="Mesh Preset 3D"
                    value={prodForm.meshPreset}
                    onChange={(val) => setProdForm({ ...prodForm, meshPreset: val })}
                    width="100%"
                    options={[
                      { value: 'tote_bag', label: 'tote_bag (Túi xách lưới)' },
                      { value: 'storage_basket', label: 'storage_basket (Giỏ tròn đan lưới)' },
                      { value: 'zip_wallet', label: 'zip_wallet (Ví cầm tay)' },
                      { value: 'eco_shirt', label: 'eco_shirt (Áo khoác Upcycled)' },
                      { value: 'woven_bracelet', label: 'woven_bracelet (Vòng tay dây lưới)' },
                      { value: 'shell_charm_set', label: 'shell_charm_set (Móc khóa phao)' },
                    ]}
                  />
                </FormLayout>

                <FormLayout direction="horizontal">
                  <NumberInput
                    label={isEn ? 'Base Price' : 'Giá phôi gốc'}
                    description={`${isEn ? 'Formatted:' : 'Hiển thị:'} ${formatVnd(prodForm.basePrice)}`}
                    value={prodForm.basePrice}
                    onChange={(val) => setProdForm({ ...prodForm, basePrice: val ?? 0 })}
                    formatValue={formatNumberInputVnd}
                    status={
                      !basePriceValidation.isValid
                        ? { type: 'error', message: basePriceValidation.message }
                        : undefined
                    }
                    min={0}
                    step={10000}
                    units="VNĐ"
                    isWheelEnabled={false}
                    width="100%"
                  />

                  <NumberInput
                    label={isEn ? '3D Craft Fee' : 'Phí đan & khâu 3D'}
                    description={`${isEn ? 'Formatted:' : 'Hiển thị:'} ${formatVnd(prodForm.craftFee)}`}
                    value={prodForm.craftFee}
                    onChange={(val) => setProdForm({ ...prodForm, craftFee: val ?? 0 })}
                    formatValue={formatNumberInputVnd}
                    status={
                      !craftFeeValidation.isValid
                        ? { type: 'error', message: craftFeeValidation.message }
                        : undefined
                    }
                    min={0}
                    step={5000}
                    units="VNĐ"
                    isWheelEnabled={false}
                    width="100%"
                  />
                </FormLayout>

                <FormLayout direction="horizontal">
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
                </FormLayout>

                <TextInput
                  label={isEn ? 'External 3D .glb URL' : 'Đường dẫn file 3D .glb ngoài'}
                  isOptional
                  value={prodForm.glbUrl}
                  onChange={(val) => setProdForm({ ...prodForm, glbUrl: val })}
                  placeholder="/models/custom-bag.glb"
                  width="100%"
                />

                <TextArea
                  label={isEn ? 'Short Description' : 'Mô tả ngắn sản phẩm'}
                  isOptional
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
              </FormLayout>
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
                  isDisabled={!basePriceValidation.isValid || !craftFeeValidation.isValid}
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
              <FormLayout defaultOptionality="required">
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

                <FormLayout direction="horizontal">
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
                </FormLayout>

                <FormLayout direction="horizontal">
                  <Selector
                    label="Mesh Preset 3D"
                    value={matForm.meshPreset}
                    onChange={(val) => setMatForm({ ...matForm, meshPreset: val })}
                    width="100%"
                    options={[
                      { value: 'scallop_shell', label: 'scallop_shell (Vỏ sò điệp)' },
                      { value: 'cowrie_shell', label: 'cowrie_shell (Ốc sứ)' },
                      { value: 'spiral_snail', label: 'spiral_snail (Ốc xoắn)' },
                      { value: 'turban_snail', label: 'turban_snail (Ốc xà cừ)' },
                      { value: 'starfish_charm', label: 'starfish_charm (Sao biển)' },
                      { value: 'turtle_charm', label: 'turtle_charm (Rùa biển)' },
                      { value: 'pearl_bead', label: 'pearl_bead (Ngọc trai)' },
                      { value: 'fishing_cord_knot', label: 'fishing_cord_knot (Nút dây lưới)' },
                    ]}
                  />

                  <TextInput
                    label={isEn ? 'Color Hex' : 'Mã màu Hex 3D'}
                    value={matForm.colorHex}
                    onChange={(val) => setMatForm({ ...matForm, colorHex: val })}
                    width="100%"
                  />
                </FormLayout>

                <FormLayout direction="horizontal">
                  <NumberInput
                    label={isEn ? 'Unit Price' : 'Đơn giá đính 3D'}
                    description={`${isEn ? 'Formatted:' : 'Hiển thị:'} ${formatVnd(matForm.unitPrice)}`}
                    value={matForm.unitPrice}
                    onChange={(val) => setMatForm({ ...matForm, unitPrice: val ?? 0 })}
                    formatValue={formatNumberInputVnd}
                    status={
                      !matUnitPriceValidation.isValid
                        ? { type: 'error', message: matUnitPriceValidation.message }
                        : undefined
                    }
                    min={0}
                    step={1000}
                    units="VNĐ"
                    isWheelEnabled={false}
                    width="100%"
                  />

                  <NumberInput
                    label={isEn ? 'Stock Quantity (BOM)' : 'Số lượng tồn kho (BOM)'}
                    value={matForm.stockQuantity}
                    onChange={(val) => setMatForm({ ...matForm, stockQuantity: val ?? 0 })}
                    min={0}
                    step={1}
                    isIntegerOnly
                    units={t('common.pieces')}
                    isWheelEnabled={false}
                    width="100%"
                  />
                </FormLayout>
              </FormLayout>
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
                  isDisabled={!matUnitPriceValidation.isValid}
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
            ? `Delete ${deleteTarget?.type}?`
            : `Xóa ${deleteTarget?.type === 'category'
              ? 'danh mục'
              : deleteTarget?.type === 'product'
                ? 'sản phẩm'
                : 'nguyên liệu'
            }?`
        }
        description={
          isEn
            ? `Are you sure you want to delete "${deleteTarget?.name}" from the catalog?`
            : `Bạn có chắc chắn muốn xóa "${deleteTarget?.name}" khỏi danh mục hệ thống?`
        }
        actionLabel={
          isEn
            ? `Delete`
            : `Xóa ${deleteTarget?.type === 'category'
              ? 'danh mục'
              : deleteTarget?.type === 'product'
                ? 'sản phẩm'
                : 'nguyên liệu'
            }`
        }
        cancelLabel={t('common.cancel')}
        actionVariant="destructive"
        onAction={handleConfirmDelete}
      />
    </Theme>
  );
}
