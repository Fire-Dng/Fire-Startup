import LocalizedContent from '../components/LocalizedContent.jsx';
import { Link } from 'react-router-dom';
import { useApp } from '../controllers/AppProvider.jsx';
import { formatPrice } from '../components/ProductCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Icon from '../components/Icon.jsx';

export default function CartPage() {
  const { cart, subtotal, removeFromCart, setQuantity } = useApp();
  const shipping = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  return <LocalizedContent><div className="page-container interior-page cart-page">
    <div className="breadcrumbs"><Link to="/">Trang chủ</Link><span>/</span><strong>Giỏ hàng</strong></div>
    <SectionHeading eyebrow="NHỮNG LỰA CHỌN CỦA BẠN" title="Giỏ hàng của bạn" description="Mỗi món đồ là một lựa chọn tử tế hơn với đại dương." />
    {!cart.length ? <div className="empty-state cart-empty"><span className="empty-mark"><Icon name="bag" size={28} /></span><h3>Giỏ hàng đang chờ câu chuyện mới.</h3><p>Khám phá những thiết kế được tạo nên từ vật liệu tái sinh.</p><Link to="/shop" className="button button-dark">Khám phá sản phẩm <Icon name="arrow" size={17} /></Link></div> : <div className="cart-layout">
      <div className="cart-lines">{cart.map((item) => <article className="cart-line" key={item.lineId}><Link className="cart-line-image" to={'/shop/' + (item.product.slug || item.product._id)}><img src={item.product.thumbnail || item.product.images?.[0]} alt={item.product.name} /></Link><div className="cart-line-info"><span className="eyebrow">{item.isCustom ? 'THIẾT KẾ CỦA BẠN' : 'SẢN PHẨM WAVO'}</span><Link to={'/shop/' + (item.product.slug || item.product._id)}><h3>{item.product.name}</h3></Link>{item.shareCode && <p>Mã thiết kế: {item.shareCode}</p>}<p>{item.selectedSize || 'Tiêu chuẩn'} · {item.selectedColor || 'Màu tự nhiên'}</p><button className="remove-line" onClick={() => removeFromCart(item.lineId)}>Xóa sản phẩm</button></div><div className="cart-line-controls"><div className="quantity-stepper"><button onClick={() => setQuantity(item.lineId, item.quantity - 1)} aria-label="Giảm">−</button><span>{item.quantity}</span><button onClick={() => setQuantity(item.lineId, item.quantity + 1)} aria-label="Tăng">+</button></div><strong>{formatPrice(item.unitPrice * item.quantity)}</strong></div></article>)}</div>
      <aside className="cart-summary"><span className="eyebrow">TÓM TẮT ĐƠN HÀNG</span><h2>Món đồ của bạn</h2><div className="summary-row"><span>Tạm tính</span><strong>{formatPrice(subtotal)}</strong></div><div className="summary-row"><span>Phí giao hàng</span><strong>{shipping ? formatPrice(shipping) : 'Miễn phí'}</strong></div><div className="shipping-progress"><span>{subtotal >= 500000 ? 'Bạn được miễn phí giao hàng.' : 'Đơn từ 500.000₫ được miễn phí giao hàng.'}</span><div><i style={{ width: Math.min(100, (subtotal / 500000) * 100) + '%' }} /></div></div><div className="summary-total"><span>Tổng cộng dự kiến</span><strong>{formatPrice(subtotal + shipping)}</strong></div><Link className="button button-dark button-full" to="/checkout">Tiến hành đặt hàng <Icon name="arrow" size={18} /></Link><p className="summary-secure">Giá và tồn kho sẽ được xác nhận bởi Wavo khi đặt hàng.</p></aside>
    </div>}
  </div></LocalizedContent>;
}
