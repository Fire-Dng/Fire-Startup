import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authModel } from '../models/authModel.js';
import { TOKEN_KEY } from '../models/apiClient.js';

const AppContext = createContext(null);

const readCart = () => {
  try { return JSON.parse(localStorage.getItem('dtu_wavo_cart') || '[]'); }
  catch { return []; }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [cart, setCart] = useState(readCart);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authModel.me().then(setUser).catch(() => {
      authModel.logout();
      setUser(null);
    }).finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => { localStorage.setItem('dtu_wavo_cart', JSON.stringify(cart)); }, [cart]);

  const login = async (credentials) => setUser(await authModel.login(credentials));
  const register = async (payload) => setUser(await authModel.register(payload));
  const logout = () => { authModel.logout(); setUser(null); };

  const addToCart = (product, quantity = 1, options = {}) => {
    const customDesignId = options.customDesignId || null;
    const lineId = customDesignId || [product._id, options.selectedColor || '', options.selectedStrapColor || '', options.selectedSize || ''].join(':');
    setCart((current) => {
      const found = current.find((item) => item.lineId === lineId);
      if (found && !customDesignId) return current.map((item) => item.lineId === lineId ? { ...item, quantity: item.quantity + quantity } : item);
      return [...current, {
        lineId,
        product,
        productId: product._id,
        quantity,
        unitPrice: options.unitPrice ?? product.basePrice,
        selectedColor: options.selectedColor || product.model3D?.defaultBaseColor || '',
        selectedStrapColor: options.selectedStrapColor || product.model3D?.defaultStrapColor || '',
        selectedSize: options.selectedSize || product.availableSizes?.[0] || 'Tiêu chuẩn',
        isCustom: Boolean(customDesignId),
        customDesignId,
        shareCode: options.shareCode || '',
        customDesignSnapshot: options.customDesignSnapshot || null,
      }];
    });
  };

  const removeFromCart = (lineId) => setCart((current) => current.filter((item) => item.lineId !== lineId));
  const setQuantity = (lineId, quantity) => setCart((current) => current.map((item) => item.lineId === lineId ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item));
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.unitPrice) || 0) * item.quantity, 0);

  const value = useMemo(() => ({ user, authLoading, login, register, logout, cart, cartCount, subtotal, addToCart, removeFromCart, setQuantity, clearCart }), [user, authLoading, cart, cartCount, subtotal]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp phải được gọi trong AppProvider');
  return value;
}
