import LocalizedContent from '../components/LocalizedContent.jsx';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProductListing } from '../controllers/useSiteData.js';
import { brandAssets } from '../data/brandAssets.js';
import { productModel } from '../models/productModel.js';
import { materialModel } from '../models/materialModel.js';
import { designModel } from '../models/designModel.js';
import { useApp } from '../controllers/AppProvider.jsx';
import ProductCard, { formatPrice } from '../components/ProductCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Notice from '../components/Notice.jsx';
import Icon from '../components/Icon.jsx';

const materialTypeLabels = { shell: 'Vỏ sò', snail: 'Vỏ ốc', charm: 'Móc trang trí', bead: 'Hạt trang trí', cord: 'Dây đan' };

export function DesignLandingPage() {
  const { products, loading, isDemo } = useProductListing({ isCustomizable: 'true', limit: 50 });
  return <LocalizedContent><div className="design-landing page-container interior-page"><div className="design-landing-hero"><div><span className="eyebrow eyebrow-light">XƯỞNG THIẾT KẾ 3D WAVO</span><h1>Đưa ý tưởng<br />lên bề mặt.</h1><p>Chọn thiết kế nền, phối màu và thêm từng chi tiết để tạo nên món đồ mang dấu ấn riêng của bạn.</p><a href="#choose-design" className="button button-mint">Bắt đầu thiết kế <Icon name="arrow" size={17} /></a></div><div className="design-hero-object"><img src={brandAssets.productOne} alt="Tùy biến sản phẩm Wavo" /><span>01 · PHÔI THIẾT KẾ</span></div></div><section id="choose-design" className="design-choices"><SectionHeading eyebrow="CHỌN SẢN PHẨM NỀN" title="Mỗi ý tưởng bắt đầu từ một khung thiết kế." description="Các sản phẩm hỗ trợ tùy biến sẽ được tính giá theo phụ kiện và vật liệu bạn chọn." />{isDemo && <Notice>Ảnh đang ở chế độ mẫu; hãy kết nối máy chủ để lưu thiết kế.</Notice>}{loading ? <div className="loading-grid">{Array.from({ length: 3 }).map((_, i) => <div className="skeleton-card" key={i} />)}</div> : <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} isDemo={isDemo || product._id?.startsWith('demo-')} />)}</div>}</section></div></LocalizedContent>;
}

export function DesignStudioPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [product, setProduct] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [placements, setPlacements] = useState([]);
  const [baseColor, setBaseColor] = useState('');
  const [strapColor, setStrapColor] = useState('');
  const [size, setSize] = useState('');
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.allSettled([productModel.getBySlug(slug), materialModel.list({})]).then(([productResult, materialResult]) => {
      if (!alive) return;
      if (productResult.status === 'fulfilled') setProduct(productResult.value);
      else {
        const fallback = { ...brandAssetsProduct, _id: 'demo-1', slug, name: 'Túi Lưới Đại Dương', basePrice: 420000, craftFee: 20000, thumbnail: brandAssets.productOne, images: [brandAssets.productOne], isCustomizable: true, availableSizes: ['Tiêu chuẩn'], availableColors: [{ name: 'Xanh biển', hex: '#08b9b0' }, { name: 'Màu cát tự nhiên', hex: '#dac7a5' }], availableStrapColors: [{ name: 'Màu cát', hex: '#d6c3a1' }, { name: 'Màu biển', hex: '#19b5ab' }] };
        setProduct(fallback); setIsDemo(true);
      }
      if (materialResult.status === 'fulfilled') setMaterials(materialResult.value);
      else setMaterials([{ _id: 'demo-shell', name: 'Vỏ sò điệp', materialType: 'shell', unitPrice: 15000, thumbnail: brandAssets.productFour, isActive: true }, { _id: 'demo-pearl', name: 'Ngọc trai biển', materialType: 'bead', unitPrice: 22000, thumbnail: brandAssets.productFive, isActive: true }, { _id: 'demo-charm', name: 'Charm sao biển', materialType: 'charm', unitPrice: 18000, thumbnail: brandAssets.productThree, isActive: true }]);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    setBaseColor(product.model3D?.defaultBaseColor || product.availableColors?.[0]?.hex || '#0cb5aa');
    setStrapColor(product.model3D?.defaultStrapColor || product.availableStrapColors?.[0]?.hex || '#d7c5a2');
    setSize(product.availableSizes?.[0] || 'Tiêu chuẩn');
  }, [product]);

  useEffect(() => {
    if (!product || isDemo) return;
    const timer = window.setTimeout(() => {
      designModel.calculatePrice({ productId: product._id, placements }).then(setPricing).catch((requestError) => setError(requestError.response?.data?.message || requestError.message));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [product, placements, isDemo]);

  const placeMaterial = (event) => {
    if (!selectedMaterial) { setError('Hãy chọn một vật liệu trước khi đặt lên thiết kế.'); return; }
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
    const item = materials.find((material) => material._id === selectedMaterial);
    setError('');
    setPlacements((current) => [...current, { placementId: 'studio-' + Date.now(), materialId: selectedMaterial, materialName: item?.name, unitPrice: item?.unitPrice || 0, position: [Number((x - 0.5).toFixed(3)), Number((0.5 - y).toFixed(3)), 0], normal: [0, 0, 1], scale: 1, rotation: 0, color: item?.defaultColor || '', slotIndex: current.length, isDanglingCharm: false, x, y }]);
  };

  const removePlacement = (id) => setPlacements((current) => current.filter((placement) => placement.placementId !== id));
  const saveAndAdd = async () => {
    if (isDemo) { setNotice('Kết nối máy chủ để lưu thiết kế và thêm vào giỏ hàng.'); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      const saved = await designModel.save({ productId: product._id, name: 'Thiết kế riêng · ' + product.name, baseColor, strapColor, size, placements: placements.map(({ x, y, materialName, unitPrice, ...placement }) => placement), previewThumbnail: product.thumbnail });
      addToCart(product, 1, { customDesignId: saved._id, unitPrice: saved.pricingBreakdown?.estimatedPrice || pricing?.pricingBreakdown?.estimatedPrice || product.basePrice, selectedColor: baseColor, selectedStrapColor: strapColor, selectedSize: size, shareCode: saved.shareCode, customDesignSnapshot: saved });
      navigate('/cart');
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'Không thể lưu bản thiết kế.'); }
    finally { setSaving(false); }
  };

  if (loading) return <LocalizedContent><div className="page-container page-loading"><div className="skeleton-detail" /></div></LocalizedContent>;
  if (!product) return <LocalizedContent><div className="page-container interior-page"><Notice tone="error">Không tìm thấy sản phẩm nền.</Notice><Link to="/design">Chọn sản phẩm khác</Link></div></LocalizedContent>;

  return <LocalizedContent><div className="studio-page"><div className="studio-topbar page-container"><div className="breadcrumbs"><Link to="/shop">Cửa hàng</Link><span>/</span><Link to="/design">Xưởng thiết kế 3D</Link><span>/</span><strong>{product.name}</strong></div><span className="studio-step-tag">01 / 03 · TÙY CHỈNH</span></div><div className="studio-layout page-container"><section className="studio-canvas-column"><div className="studio-canvas-head"><div><span className="eyebrow">BẢN THIẾT KẾ CỦA BẠN</span><h1>{product.name}</h1></div><span className="canvas-hint">Chạm lên sản phẩm để đặt chi tiết</span></div><div className="studio-canvas" onClick={placeMaterial} style={{ '--product-color': baseColor }}><img src={product.thumbnail || product.images?.[0] || brandAssets.productOne} alt={product.name} />{placements.map((placement, index) => <span key={placement.placementId} className="canvas-charm" style={{ left: (placement.x * 100) + '%', top: (placement.y * 100) + '%', backgroundColor: placement.color || '#e2c78d' }}>{String(index + 1).padStart(2, '0')}</span>)}<div className="canvas-grid-overlay" /><span className="canvas-preview-label">XEM TRƯỚC THIẾT KẾ 360°</span></div><div className="studio-canvas-footer"><span><Icon name="leaf" size={16} /> Vật liệu được kiểm tra tồn kho khi đặt hàng</span><span>{placements.length} / 50 chi tiết</span></div>
      <div className="studio-color-controls"><div><label>Màu nền</label><div className="color-swatches">{(product.availableColors || []).map((item) => <button key={item.hex + item.name} className={baseColor === item.hex || baseColor === item.name ? 'swatch selected' : 'swatch'} title={item.name} style={{ background: item.hex }} onClick={() => setBaseColor(item.hex)} />)}</div></div><div><label>Màu quai / dây</label><div className="color-swatches">{(product.availableStrapColors || []).map((item) => <button key={item.hex + item.name} className={strapColor === item.hex || strapColor === item.name ? 'swatch selected' : 'swatch'} title={item.name} style={{ background: item.hex }} onClick={() => setStrapColor(item.hex)} />)}</div></div><div><label>Kích thước</label><select value={size} onChange={(event) => setSize(event.target.value)}>{(product.availableSizes || ['Tiêu chuẩn']).map((option) => <option key={option}>{option}</option>)}</select></div></div>
    </section><aside className="studio-controls"><div className="studio-panel-head"><span className="eyebrow">01 · CHI TIẾT PHỐI HỌA</span><h2>Chọn chất liệu</h2><p>Mỗi chi tiết được tính giá trực tiếp từ kho vật liệu.</p></div>{isDemo && <Notice>Chế độ xem mẫu. Máy chủ cần hoạt động để lưu thiết kế.</Notice>}{error && <Notice tone="error">{error}</Notice>}{notice && <Notice>{notice}</Notice>}<div className="material-list">{materials.map((material) => <button className={'material-option' + (selectedMaterial === material._id ? ' material-selected' : '')} key={material._id} onClick={() => setSelectedMaterial(material._id)}><span className="material-thumb">{material.thumbnail ? <img src={material.thumbnail} alt="" /> : <Icon name="leaf" size={21} />}</span><span className="material-info"><strong>{material.name}</strong><small>{materialTypeLabels[material.materialType] || material.materialType} · {formatPrice(material.unitPrice)}</small></span><span className="material-radio" /></button>)}</div><button className="button button-outline button-full place-button" disabled={!selectedMaterial || placements.length >= 50} onClick={() => setPlacements((current) => { const item = materials.find((material) => material._id === selectedMaterial); if (!item) return current; return [...current, { placementId: 'studio-' + Date.now(), materialId: selectedMaterial, materialName: item.name, unitPrice: item.unitPrice, position: [0, 0, 0], normal: [0, 0, 1], rotation: 0, scale: 1, slotIndex: current.length, color: item.defaultColor || '', isDanglingCharm: false, x: 0.5 + Math.random() * 0.25, y: 0.38 + Math.random() * 0.3 }]; })}><Icon name="plus" size={17} /> Thêm vào thiết kế</button><div className="placement-list"><div className="placement-heading"><strong>Chi tiết đã thêm</strong><span>{placements.length}</span></div>{placements.length ? placements.map((placement, index) => <div className="placement-row" key={placement.placementId}><span className="placement-index">{String(index + 1).padStart(2, '0')}</span><span>{placement.materialName || materials.find((item) => item._id === placement.materialId)?.name}</span><strong>{formatPrice(placement.unitPrice)}</strong><button onClick={() => removePlacement(placement.placementId)} aria-label="Xóa chi tiết">×</button></div>) : <p className="placement-empty">Chọn vật liệu rồi chạm lên sản phẩm để bắt đầu.</p>}</div><div className="pricing-card"><div className="pricing-line"><span>Giá sản phẩm</span><strong>{formatPrice(pricing?.pricingBreakdown?.basePrice ?? product.basePrice)}</strong></div><div className="pricing-line"><span>Phí chế tác</span><strong>{formatPrice(pricing?.pricingBreakdown?.craftFee ?? product.craftFee ?? 0)}</strong></div><div className="pricing-line"><span>Chi tiết phối họa</span><strong>{formatPrice(pricing?.pricingBreakdown?.materialsTotal ?? placements.reduce((sum, item) => sum + item.unitPrice, 0))}</strong></div><div className="pricing-total"><span>Giá dự kiến</span><strong>{formatPrice(pricing?.pricingBreakdown?.estimatedPrice ?? (product.basePrice + (product.craftFee || 0) + placements.reduce((sum, item) => sum + item.unitPrice, 0)))}</strong></div><p>{isDemo ? 'Giá mẫu; máy chủ sẽ tính lại khi kết nối.' : 'Giá được xác nhận theo dữ liệu hiện tại của máy chủ.'}</p></div><button className="button button-dark button-full" onClick={saveAndAdd} disabled={saving}>{saving ? 'Đang lưu thiết kế...' : 'Lưu & thêm vào giỏ'} <Icon name="arrow" size={18} /></button><Link to="/shop" className="studio-back-link">← Quay lại cửa hàng</Link></aside></div></div></LocalizedContent>;
}

const brandAssetsProduct = {};
