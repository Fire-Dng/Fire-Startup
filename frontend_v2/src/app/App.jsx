import LocalizedContent from '../components/LocalizedContent.jsx';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from '../controllers/AppProvider.jsx';
import { LanguageProvider } from '../controllers/LanguageProvider.jsx';
import SiteLayout from '../components/SiteLayout.jsx';
import HomePage from '../views/HomePage.jsx';
import ShopPage from '../views/ShopPage.jsx';
import ProductPage from '../views/ProductPage.jsx';
import CartPage from '../views/CartPage.jsx';
import CheckoutPage from '../views/CheckoutPage.jsx';
import OrderLookupPage, { OrderDetailPage } from '../views/OrderLookupPage.jsx';
import { LoginPage, RegisterPage, AccountPage } from '../views/AuthPages.jsx';
import { DesignLandingPage, DesignStudioPage } from '../views/DesignPages.jsx';
import { StoryPage, ContactPage, PolicyPage, NotFoundPage } from '../views/StoryPages.jsx';
import { AdminLayout, AdminDashboard, AdminOrdersPage, AdminProductsPage, AdminMaterialsPage, AdminLandingPage, AdminMediaPage } from '../views/AdminPages.jsx';

function AdminGate() {
  const { user, authLoading } = useApp();
  const location = useLocation();
  if (authLoading) return <LocalizedContent><div className="admin-loading">Đang xác thực tài khoản...</div></LocalizedContent>;
  if (!user) return <LocalizedContent><Navigate to="/login" replace state={{ from: location.pathname }} /></LocalizedContent>;
  if (!['admin', 'staff'].includes(user.role)) return <LocalizedContent><div className="page-container interior-page"><div className="empty-state"><span className="eyebrow">403 · KHÔNG CÓ QUYỀN TRUY CẬP</span><h2>Tài khoản của bạn chưa có quyền quản trị.</h2><Navigate to="/account" replace /></div></div></LocalizedContent>;
  return <LocalizedContent><Outlet /></LocalizedContent>;
}

function RouteTree() {
  return <Routes>
    <Route element={<SiteLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/:slug" element={<ProductPage />} />
      <Route path="/design" element={<DesignLandingPage />} />
      <Route path="/design/:slug" element={<DesignStudioPage />} />
      <Route path="/customizer/:slug" element={<Navigate to="/design" replace />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-lookup" element={<OrderLookupPage />} />
      <Route path="/orders/:orderCode" element={<OrderDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/policies/:type" element={<PolicyRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route path="/admin" element={<AdminGate />}>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="materials" element={<AdminMaterialsPage />} />
        <Route path="landing" element={<AdminLandingPage />} />
        <Route path="media" element={<AdminMediaPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Route>
  </Routes>;
}

function PolicyRoute() {
  const location = useLocation();
  const type = location.pathname.split('/').pop();
  return <PolicyPage type={type} />;
}

export default function App() {
  return <BrowserRouter future={{ v7_startTransition: true }}><AppProvider><LanguageProvider><RouteTree /></LanguageProvider></AppProvider></BrowserRouter>;
}
