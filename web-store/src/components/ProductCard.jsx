import LocalizedContent from './LocalizedContent.jsx';
import { Link } from 'react-router-dom';
import { useApp } from '../controllers/AppProvider.jsx';
import { getLocalizedProductField, useLanguage } from '../controllers/LanguageProvider.jsx';

export const formatPrice = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0);

const categoryLabels = { bag: 'Túi xách', basket: 'Giỏ đan', wallet: 'Ví cầm tay', apparel: 'Thời trang', bracelet: 'Vòng tay', accessory: 'Phụ kiện' };

export default function ProductCard({ product, isDemo = false }) {
  const { addToCart } = useApp();
  const { language, t } = useLanguage();
  const displayName = getLocalizedProductField(product, 'name', language, t);
  const image = product.thumbnail || product.images?.[0];
  const detailsPath = '/shop/' + (product.slug || product._id);
  return <LocalizedContent><article className="product-card card">
    <Link className="product-image-wrap" to={detailsPath} aria-label={'Xem ' + displayName}>
      {image ? <img className="product-image thumb" src={image} alt={displayName} loading="lazy" /> : <div className="image-placeholder">WAVO</div>}
      {product.isFeatured && <span className="product-badge">Được yêu thích</span>}
    </Link>
    <div className="product-info">
      <div className="product-kicker">{categoryLabels[product.category] || 'Sản phẩm Wavo'}</div>
      <Link to={detailsPath} className="product-name"><h3>{displayName}</h3></Link>
      <div className="product-meta-row meta"><span className="rating">★ <small>{Number(product.rating || 4.9).toFixed(1)}/5</small></span><span className="product-price price">{formatPrice(product.basePrice)}</span></div>
      <div className="product-actions actions">
        <Link className="button btn" to={detailsPath}>Chi tiết</Link>
        {product.isCustomizable && !isDemo
          ? <Link className="button btn btn-fill" to={'/design/' + (product.slug || product._id)}>Thiết kế</Link>
          : <button className="button btn btn-fill" disabled={isDemo} onClick={() => addToCart(product)}>Thêm giỏ</button>}
      </div>
    </div>
  </article></LocalizedContent>;
}
