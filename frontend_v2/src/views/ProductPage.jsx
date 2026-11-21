import LocalizedContent from '../components/LocalizedContent.jsx';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productModel } from '../models/productModel.js';
import { localProducts } from '../data/brandAssets.js';
import { useApp } from '../controllers/AppProvider.jsx';
import ProductCard, { formatPrice } from '../components/ProductCard.jsx';
import Notice from '../components/Notice.jsx';
import Icon from '../components/Icon.jsx';

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const gallery = product ? [product.thumbnail, ...(product.images || [])].filter((value, index, list) => value && list.indexOf(value) === index) : [];

  useEffect(() => {
    let alive = true;
    setLoading(true);
    productModel.getBySlug(slug).then((data) => {
      if (!alive) return;
      setProduct(data);
      setRelated(data.relatedProducts || []);
      setIsDemo(false);
    }).catch(() => {
      if (!alive) return;
      const fallback = localProducts.find((item) => item.slug === slug) || localProducts[0];
      setProduct(fallback);
      setRelated(localProducts.filter((item) => item._id !== fallback._id).slice(0, 4));
      setIsDemo(true);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  if (loading) return <LocalizedContent><div className="page-container page-loading"><div className="skeleton-detail" /></div></LocalizedContent>;
  if (!product) return <LocalizedContent><div className="page-container empty-state"><h2>Không tìm thấy sản phẩm</h2><Link className="button button-dark" to="/shop">Quay lại cửa hàng</Link></div></LocalizedContent>;
  const buy = () => { addToCart(product, quantity, { selectedColor: color, selectedSize: size }); navigate('/cart'); };
  const categoryLabel = ({ bag: 'Túi xách', basket: 'Giỏ đan', wallet: 'Ví cầm tay', apparel: 'Thời trang', bracelet: 'Vòng tay', accessory: 'Phụ kiện' })[product.category] || product.category || 'Thiết kế';

  return <LocalizedContent><div className="product-page page-container">
    <div className="breadcrumbs"><Link to="/">Trang chủ</Link><span>/</span><Link to="/shop">Cửa hàng</Link><span>/</span><strong>{product.name}</strong></div>
    {isDemo && <Notice tone="info">Đang dùng ảnh mẫu. Hãy kết nối máy chủ để tải thông tin sản phẩm và đặt hàng.</Notice>}
    <section className="product-detail-layout">
      <div className="product-gallery"><div className="product-main-image">{gallery.length ? <img src={gallery[activeImage] || gallery[0]} alt={product.name} /> : <div className="image-placeholder">WAVO</div>}<span className="gallery-count">0{activeImage + 1} / 0{gallery.length || 1}</span></div><div className="product-thumbnails">{(gallery.length ? gallery : [null]).map((image, index) => <button key={image || index} className={activeImage === index ? 'thumb-active' : ''} onClick={() => setActiveImage(index)}>{image ? <img src={image} alt={product.name + ' ' + (index + 1)} /> : 'WAVO'}</button>)}</div></div>
      <div className="product-detail-copy"><span className="eyebrow">SẢN PHẨM WAVO · {categoryLabel}</span><h1>{product.name}</h1><div className="detail-rating"><span>★★★★★</span><small>{Number(product.rating || 4.9).toFixed(1)} · Được khách hàng yêu thích</small></div><div className="detail-price">{formatPrice(product.basePrice)}</div><p className="detail-description">{product.shortDescription || product.description || 'Một thiết kế Wavo được đan thủ công từ vật liệu tái sinh, mang vẻ đẹp bền bỉ và riêng biệt.'}</p>
        <div className="detail-divider" />
        {product.availableColors?.length > 0 && <div className="option-group"><div className="option-title">Màu sắc <span>{color || product.availableColors[0]?.name}</span></div><div className="color-swatches">{product.availableColors.map((item) => <button key={item.hex + item.name} title={item.name} aria-label={item.name} className={(color === item.name || (!color && item === product.availableColors[0])) ? 'swatch selected' : 'swatch'} style={{ backgroundColor: item.hex }} onClick={() => setColor(item.name)} />)}</div></div>}
        {product.availableSizes?.length > 0 && <div className="option-group"><div className="option-title">Kích thước <span>{size || product.availableSizes[0]}</span></div><div className="size-options">{product.availableSizes.map((item) => <button key={item} className={(size === item || (!size && item === product.availableSizes[0])) ? 'size-option selected' : 'size-option'} onClick={() => setSize(item)}>{item}</button>)}</div></div>}
        <div className="detail-actions"><div className="quantity-stepper"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Giảm số lượng">−</button><span>{quantity}</span><button onClick={() => setQuantity((value) => value + 1)} aria-label="Tăng số lượng">+</button></div><button className="button button-dark detail-add" disabled={isDemo} onClick={buy}>Thêm vào giỏ <Icon name="bag" size={18} /></button></div>
        {product.isCustomizable && <Link className="customize-callout" to={'/design/' + product.slug}><span className="callout-number">01</span><span><strong>Tạo dấu ấn riêng</strong><small>Tùy biến màu sắc và chi tiết 3D</small></span><Icon name="arrow" size={20} /></Link>}
        <div className="product-trust"><span><Icon name="leaf" size={18} /> Chất liệu tái sinh</span><span><Icon name="pin" size={18} /> Tạo tác tại Việt Nam</span></div>
      </div>
    </section>
    <section className="product-story-row"><div><span className="eyebrow">TỪNG CHI TIẾT CÓ Ý NGHĨA</span><h2>Thiết kế để đồng hành dài lâu.</h2><p>{product.description || 'Mỗi sản phẩm đều là sự giao thoa giữa thiết kế hiện đại, vật liệu được tái sinh và sự tỉ mỉ của nghệ nhân địa phương.'}</p></div><div className="eco-card"><Icon name="leaf" size={28} /><strong>{product.ecoImpact?.netWeightGrams || 150}g</strong><span>vật liệu tái sinh trong sản phẩm</span></div></section>
    {related.length > 0 && <section className="related-section section-space"><div className="section-topline"><div><span className="eyebrow">CÓ THỂ BẠN CŨNG THÍCH</span><h2>Khám phá thêm</h2></div><Link className="text-link desktop-link" to="/shop">Tất cả sản phẩm <Icon name="arrow" size={17} /></Link></div><div className="product-grid">{related.slice(0, 4).map((item) => <ProductCard key={item._id} product={item} isDemo={item._id?.startsWith('demo-')} />)}</div></section>}
  </div></LocalizedContent>;
}
