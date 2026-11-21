import LocalizedContent from '../components/LocalizedContent.jsx';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useProductListing } from '../controllers/useSiteData.js';
import { brandAssets } from '../data/brandAssets.js';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Notice from '../components/Notice.jsx';
import Icon from '../components/Icon.jsx';

const categories = [
  { key: 'all', label: 'Tất cả sản phẩm' },
  { key: 'bag', label: 'Túi xách' },
  { key: 'basket', label: 'Giỏ đan' },
  { key: 'wallet', label: 'Ví cầm tay' },
  { key: 'bracelet', label: 'Vòng tay' },
  { key: 'accessory', label: 'Phụ kiện' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [orderCode, setOrderCode] = useState('');
  const filters = useMemo(() => ({
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
    isCustomizable: searchParams.get('customizable') === 'true' ? 'true' : undefined,
    sort: searchParams.get('sort') || 'newest',
    limit: 50,
  }), [searchParams]);
  const { products, loading, isDemo } = useProductListing(filters);

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key); else next.set(key, value);
    setSearchParams(next);
  };

  return <LocalizedContent><div className="shop-page">
    <section className="shop-hero" aria-label="Bộ sưu tập Wavo">
      <img className="shop-hero-image" src={brandAssets.shopHero} alt="Túi lưới tái chế trên nền biển xanh" />
      <div className="hero-panel shop-hero-panel">
        <h1 className="page-title">Khởi nguồn sống xanh</h1>
        <form className="search-field" role="search" onSubmit={(event) => { event.preventDefault(); update('search', searchInput.trim()); }}>
          <Icon name="search" size={21} /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Tìm kiếm sản phẩm..." aria-label="Tìm kiếm sản phẩm" />
          <button type="submit" aria-label="Tìm kiếm"><Icon name="arrow" size={18} /></button>
        </form>
      </div>
    </section>

    <section className="shop-catalog page-container">
      <aside className="shop-sidebar" aria-label="Danh mục sản phẩm">
        <div className="sidebar-heading"><h2>Danh mục</h2><Icon name="plus" size={18} /></div>
        <div className="category-list">
          {categories.map((category, index) => <button key={category.key} className={'category-filter' + (filters.category === category.key ? ' category-active' : '')} onClick={() => update('category', category.key)} aria-pressed={filters.category === category.key}>
            <span className="category-index">{String(index + 1).padStart(2, '0')}</span><Icon name="bag" size={18} /><span>{category.label}</span><span className="category-arrow">›</span>
          </button>)}
        </div>
        <div className="filter-divider" />
        <label className="custom-check"><input type="checkbox" checked={filters.isCustomizable === 'true'} onChange={(event) => update('customizable', event.target.checked ? 'true' : '')} /><span className="custom-check-ui" /><span>Thiết kế tùy biến</span></label>
        <div className="sidebar-note"><img src={brandAssets.handsIcon} alt="" /><p>Mỗi lựa chọn của bạn góp phần làm đại dương xanh hơn.</p></div>
      </aside>

      <div className="shop-results">
        <div className="catalog-toolbar"><div><span className="eyebrow">BỘ SƯU TẬP</span><h2>{filters.category === 'all' ? 'Tất cả sản phẩm' : categories.find((item) => item.key === filters.category)?.label}</h2></div><div className="toolbar-right"><span>{products.length} thiết kế</span><select value={filters.sort} onChange={(event) => update('sort', event.target.value)} aria-label="Sắp xếp sản phẩm"><option value="newest">Mới nhất</option><option value="popular">Bán chạy</option><option value="price_asc">Giá thấp đến cao</option><option value="price_desc">Giá cao đến thấp</option></select></div></div>
        {isDemo && <Notice tone="info">Đang hiển thị sản phẩm mẫu. Hãy kết nối máy chủ để tải kho sản phẩm và hoàn tất đơn hàng.</Notice>}
        {loading ? <div className="loading-grid">{Array.from({ length: 6 }).map((_, index) => <div className="skeleton-card" key={index} />)}</div> : products.length ? <div className="product-grid shop-product-grid">{products.map((product) => <ProductCard key={product._id} product={product} isDemo={isDemo || product._id?.startsWith('demo-')} />)}</div> : <div className="empty-state"><span>✳</span><h3>Chưa tìm thấy sản phẩm phù hợp</h3><p>Hãy thử một từ khóa hoặc danh mục khác.</p><button className="button button-dark" onClick={() => { setSearchInput(''); setSearchParams({}); }}>Xóa bộ lọc</button></div>}
      </div>
    </section>

    <section className="recommended-section page-container section-space"><SectionHeading eyebrow="ĐƯỢC YÊU THÍCH" title="Khám phá sản phẩm đề xuất" description="Những thiết kế được cộng đồng Wavo lựa chọn nhiều nhất." /><div className="product-grid recommended-grid">{products.slice(0, 4).map((product) => <ProductCard key={'rec-' + product._id} product={product} isDemo={isDemo || product._id?.startsWith('demo-')} />)}</div></section>

    <section className="lookup-banner page-container" aria-labelledby="lookup-heading"><div className="lookup-art" aria-hidden="true">W</div><div className="lookup-copy"><h2 id="lookup-heading">Tra cứu đơn hàng<br />nhanh chóng tiện lợi.</h2></div><form className="lookup-form" onSubmit={(event) => { event.preventDefault(); if (orderCode.trim()) navigate('/order-lookup?code=' + encodeURIComponent(orderCode.trim())); }}><input value={orderCode} onChange={(event) => setOrderCode(event.target.value)} placeholder="Mã đơn hàng..." aria-label="Mã đơn hàng" /><button type="submit">Tra cứu <Icon name="arrow" size={18} /></button></form></section>
  </div></LocalizedContent>;
}
