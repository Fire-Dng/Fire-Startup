import LocalizedContent from './LocalizedContent.jsx';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { brandAssets } from '../data/brandAssets.js';
import { useApp } from '../controllers/AppProvider.jsx';
import { useLanguage } from '../controllers/LanguageProvider.jsx';
import Icon from './Icon.jsx';

export default function SiteHeader({ overlay = false, clear = false }) {
  const [open, setOpen] = useState(false);
  const { user, cartCount } = useApp();
  const { language, toggleLanguage, t } = useLanguage();
  const navClass = ({ isActive }) => 'nav-link' + (isActive ? ' nav-link-active' : '');
  return <LocalizedContent><header className={'site-header' + (overlay ? ' site-header-overlay' : '') + (clear ? ' site-header--clear' : '')}>
    <div className="nav-pill">
      <button className="mobile-menu-button" onClick={() => setOpen(!open)} aria-label={t(open ? 'Đóng menu' : 'Mở menu')}><Icon name={open ? 'close' : 'menu'} /></button>
      <nav className={'nav-group nav-left' + (open ? ' nav-open' : '')}>
        <NavLink to="/" className={navClass} onClick={() => setOpen(false)}>{t('Trang chủ')}</NavLink>
        <NavLink to="/shop" className={navClass} onClick={() => setOpen(false)}>{t('Cửa hàng')}</NavLink>
        <NavLink to="/story" className={navClass} onClick={() => setOpen(false)}>{t('Câu chuyện')}</NavLink>
        <NavLink to="/design" className={navClass} onClick={() => setOpen(false)}>{t('Thiết kế')}</NavLink>
      </nav>
      <Link to="/" className="brand-lockup" aria-label="Wavo trang chủ"><img src={brandAssets.logoWhite} alt="Wavo" /></Link>
      <nav className="nav-group nav-right">
        <NavLink to="/contact" className={navClass}>{t('Liên hệ')}</NavLink>
        <Link to="/shop" className="nav-icon" aria-label={t('Tìm sản phẩm')}><img src={brandAssets.searchIcon} alt="" /></Link>
        <Link to={user ? '/account' : '/login'} className="nav-icon" aria-label={t('Tài khoản')}><img src={brandAssets.userIcon} alt="" /></Link>
        <Link to="/cart" className="nav-icon cart-nav" aria-label={t('Giỏ hàng')}><img src={brandAssets.cartIcon} alt="" />{cartCount > 0 && <span className="cart-count">{cartCount}</span>}</Link>
        <button className="nav-language-toggle" type="button" onClick={toggleLanguage} aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'} title={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}>{language === 'vi' ? 'VI' : 'EN'}</button>
      </nav>
    </div>
    {open && <button className="mobile-backdrop" aria-label="Đóng menu" onClick={() => setOpen(false)} />}
  </header></LocalizedContent>;
}
