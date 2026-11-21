import LocalizedContent from '../components/LocalizedContent.jsx';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../controllers/AppProvider.jsx';
import { orderModel } from '../models/orderModel.js';
import { formatPrice } from '../components/ProductCard.jsx';
import Notice from '../components/Notice.jsx';

export default function CheckoutPage() {
  const { cart, subtotal, user, clearCart } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', email: user?.email || '', address: user?.address?.street || '', city: user?.address?.city || 'Đà Nẵng', note: '' });
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!cart.length) return setError('Giỏ hàng của bạn đang trống.');
    if (cart.some((item) => String(item.productId).startsWith('demo-'))) return setError('Ảnh mẫu đang được dùng vì máy chủ chưa kết nối. Hãy kết nối máy chủ để tạo đơn hàng.');
    setLoading(true);
    try {
      const order = await orderModel.create({
        customerInfo: form,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedStrapColor: item.selectedStrapColor,
          selectedSize: item.selectedSize,
          isCustom: item.isCustom,
          customDesignId: item.customDesignId || undefined,
          customDesignSnapshot: item.customDesignSnapshot || undefined,
        })),
      });
      clearCart();
      navigate('/orders/' + order.orderCode, { state: { order } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Không thể tạo đơn hàng.');
    } finally { setLoading(false); }
  };

  return <LocalizedContent><div className="page-container interior-page checkout-page"><div className="breadcrumbs"><Link to="/">Trang chủ</Link><span>/</span><Link to="/cart">Giỏ hàng</Link><span>/</span><strong>Thanh toán</strong></div><div className="checkout-heading"><span className="eyebrow">MỘT BƯỚC NHỎ, MỘT HÀNH TRÌNH MỚI</span><h1>Hoàn tất đơn hàng.</h1><p>Hãy cho chúng tôi biết nơi món đồ mới sẽ bắt đầu hành trình cùng bạn.</p></div>
    {error && <Notice tone="error">{error}</Notice>}
    {!cart.length ? <div className="empty-state"><h3>Không có sản phẩm trong giỏ.</h3><Link to="/shop" className="button button-dark">Quay lại cửa hàng</Link></div> : <form onSubmit={submit} className="checkout-layout"><div className="checkout-form-column"><section className="form-card"><div className="form-section-heading"><span>01</span><div><h2>Thông tin người nhận</h2><p>Các trường có dấu * là bắt buộc.</p></div></div><div className="form-grid"><label>Họ và tên *<input name="fullName" value={form.fullName} onChange={update} required placeholder="Tên người nhận" /></label><label>Số điện thoại *<input name="phone" value={form.phone} onChange={update} required placeholder="09xx xxx xxx" /></label><label>Thư điện tử<input type="email" name="email" value={form.email} onChange={update} placeholder="ban@email.com" /></label><label>Tỉnh / thành phố<input name="city" value={form.city} onChange={update} placeholder="Đà Nẵng" /></label><label className="form-span-two">Địa chỉ nhận hàng *<input name="address" value={form.address} onChange={update} required placeholder="Số nhà, đường, phường / xã" /></label><label className="form-span-two">Ghi chú giao hàng<textarea name="note" value={form.note} onChange={update} rows="3" placeholder="Khung giờ nhận hàng hoặc lưu ý khác" /></label></div></section>
      <section className="form-card"><div className="form-section-heading"><span>02</span><div><h2>Phương thức thanh toán</h2><p>Chọn cách thanh toán phù hợp với bạn.</p></div></div><div className="payment-options"><label className={paymentMethod === 'cod' ? 'payment-option payment-selected' : 'payment-option'}><input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={(event) => setPaymentMethod(event.target.value)} /><span className="radio-dot" /><span><strong>Thanh toán khi nhận hàng</strong><small>Khi nhận hàng · trả tiền khi sản phẩm đến tay bạn</small></span></label><label className={paymentMethod === 'vietqr' ? 'payment-option payment-selected' : 'payment-option'}><input type="radio" value="vietqr" checked={paymentMethod === 'vietqr'} onChange={(event) => setPaymentMethod(event.target.value)} /><span className="radio-dot" /><span><strong>Chuyển khoản VietQR</strong><small>Mã QR và thông tin chuyển khoản hiển thị sau khi đặt hàng</small></span></label></div></section></div>
      <aside className="checkout-summary"><span className="eyebrow">TÓM TẮT</span><h2>Đơn hàng của bạn</h2><div className="checkout-item-list">{cart.map((item) => <div className="checkout-item" key={item.lineId}><img src={item.product.thumbnail || item.product.images?.[0]} alt="" /><div><strong>{item.product.name}</strong><small>Số lượng: {item.quantity}{item.isCustom ? ' · Bản thiết kế riêng' : ''}</small></div><b>{formatPrice(item.unitPrice * item.quantity)}</b></div>)}</div><div className="summary-row"><span>Tạm tính</span><strong>{formatPrice(subtotal)}</strong></div><div className="summary-row"><span>Giao hàng</span><strong>{shipping ? formatPrice(shipping) : 'Miễn phí'}</strong></div><div className="summary-total"><span>Tổng cộng</span><strong>{formatPrice(subtotal + shipping)}</strong></div><button className="button button-dark button-full" disabled={loading}>{loading ? 'Đang gửi đơn...' : 'Đặt hàng'}<span>→</span></button><p className="summary-secure">Bằng cách đặt hàng, bạn đồng ý với chính sách mua hàng của Wavo.</p></aside></form>}
  </div></LocalizedContent>;
}
