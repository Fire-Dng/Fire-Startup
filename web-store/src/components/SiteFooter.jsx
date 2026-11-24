import LocalizedContent from './LocalizedContent.jsx';
import { Link } from 'react-router-dom';
import { brandAssets } from '../data/brandAssets.js';
import { useLanguage } from '../controllers/LanguageProvider.jsx';

export default function SiteFooter() {
  const { t } = useLanguage();
  return <LocalizedContent><footer className="site-footer">
    <div className="footer-main">
      <div className="footer-brand"><Link to="/"><img className="footer-logo" src={brandAssets.logoNavy} alt="Wavo" /></Link><p>{t('Thiết kế · Sáng tạo · Trao quyền')}</p><div className="social-links"><a href="#facebook" aria-label="Facebook"><img src={brandAssets.facebookIcon} alt="" /></a><a href="#x" aria-label="X"><img src={brandAssets.xIcon} alt="" /></a><a href="#tiktok" aria-label="TikTok"><img src={brandAssets.tiktokIcon} alt="" /></a></div></div>
      <div className="footer-column"><h3>{t('Sản phẩm')}</h3><Link to="/shop?category=bag">{t('Túi xách')}</Link><Link to="/shop?category=bracelet">{t('Vòng tay')}</Link><Link to="/shop?category=accessory">{t('Phụ kiện')}</Link><Link to="/shop">{t('Tất cả sản phẩm')}</Link></div>
      <div className="footer-column"><h3>{t('Chính sách')}</h3><Link to="/policies/shipping">{t('Vận chuyển')}</Link><Link to="/policies/returns">{t('Đổi trả hàng')}</Link><Link to="/policies/privacy">{t('Bảo mật riêng tư')}</Link><Link to="/policies/terms">{t('Điều khoản sử dụng')}</Link></div>
      <form className="newsletter" onSubmit={(event) => event.preventDefault()}><h3>{t('Nhận tin từ đại dương')}</h3><p>{t('Chuyện mới, thiết kế mới và những điều tốt lành.')}</p><div className="newsletter-row"><input type="email" placeholder={t('Email của bạn')} aria-label={t('Email của bạn')} required /><button type="submit">{t('Đăng ký')}</button></div></form>
    </div>
    <div className="footer-bottom"><span>{t('© 2026 Wavo · Đồ thủ công tái sinh từ đại dương')}</span><span>{t('Được tạo nên từ những vòng đời mới')}</span></div>
  </footer></LocalizedContent>;
}
