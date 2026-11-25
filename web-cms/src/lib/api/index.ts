export {
  FALLBACK_LANDING_CONTENT,
  FALLBACK_PRODUCTS,
  FALLBACK_MATERIALS,
  FALLBACK_CATEGORIES,
} from '@/data/fallback';

export {
  CMS_TOKEN_STORAGE_KEY,
  CMS_USER_STORAGE_KEY,
  getStoredCmsSession,
  clearCmsSession,
  type CmsAuthUser,
} from './client';

export { loginCmsAdmin } from './auth';
export { getLandingContent, updateLandingContent } from './landing';
export { getMediaStatus, uploadMediaFile } from './media';
export {
  getProducts,
  getProductBySlug,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  type ProductQueryFilters,
} from './products';
export {
  getCustomMaterials,
  createMaterialAdmin,
  updateMaterialAdmin,
  deleteMaterialAdmin,
} from './materials';
export {
  getCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
} from './categories';
export {
  saveCustomDesign,
  createOrder,
  lookupOrderByCode,
  cancelOrderByCustomer,
  getAdminOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  type CreateOrderPayload,
} from './orders';
export { getAdminDashboard } from './dashboard';
export { pingServerKeepAlive } from './keepAlive';
