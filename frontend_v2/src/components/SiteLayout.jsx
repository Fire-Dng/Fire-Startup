import LocalizedContent from './LocalizedContent.jsx';
import { Outlet, useLocation } from 'react-router-dom';
import { ViewTransition } from 'react';
import SiteHeader from './SiteHeader.jsx';
import SiteFooter from './SiteFooter.jsx';

export default function SiteLayout() {
  const { pathname } = useLocation();
  const overlay = pathname === '/' || pathname === '/shop';
  return <LocalizedContent><div className="site-shell"><SiteHeader overlay={overlay} clear={pathname === '/'} /><main><ViewTransition default="page-transition"><Outlet /></ViewTransition></main><SiteFooter /></div></LocalizedContent>;
}
