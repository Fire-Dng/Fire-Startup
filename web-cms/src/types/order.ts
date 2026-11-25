import type { ProductCategory } from './category';
import type { CustomDesignSnapshot } from './material';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_crafting'
  | 'quality_check'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'vietqr';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface BomSummaryItem {
  materialId: string;
  materialName: string;
  meshPreset?: string;
  colorHex?: string;
  unitPrice: number;
  quantityPerUnit: number;
  totalQuantity: number;
  subtotal: number;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  productSlug: string;
  productName: string;
  productCategory: ProductCategory;
  thumbnail: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  unitPrice: number;
  netWeightGrams: number;
  isCustom: boolean;
  customDesignId?: string;
  customDesign?: CustomDesignSnapshot;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug?: string;
  category?: ProductCategory;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  unitPrice: number;
  subtotal: number;
  isCustom: boolean;
  customDesignId?: string;
  customDesignSnapshot?: CustomDesignSnapshot;
  bomSummary?: BomSummaryItem[];
}

export interface VietQRPaymentInfo {
  bankBin?: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  transferContent: string;
  qrImageUrl: string;
}

export interface Order {
  _id: string;
  orderCode: string;
  customerInfo: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    note?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  totalNetWeightGrams: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  vietQrInfo?: VietQRPaymentInfo;
  status: OrderStatus;
  statusHistory?: Array<{
    status: OrderStatus;
    note?: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
