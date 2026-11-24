import LocalizedContent from '../components/LocalizedContent.jsx';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../controllers/AppProvider.jsx';
import { brandAssets } from '../data/brandAssets.js';
import Notice from '../components/Notice.jsx';

export function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try { const user = await login(form); navigate(location.state?.from || (['admin', 'staff'].includes(user.role) ? '/admin' : '/account'), { replace: true }); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'Đăng nhập chưa thành công.'); }
    finally { setLoading(false); }
  };
  return <LocalizedContent><AuthShell eyebrow="CHÀO MỪNG TRỞ LẠI" title="Một hành trình mới đang chờ bạn." image={brandAssets.productOne}>
    <form className="auth-form" onSubmit={submit}><span className="eyebrow">TÀI KHOẢN WAVO</span><h2>Đăng nhập</h2><p>Để tiếp tục hành trình cùng những thiết kế bền vững.</p>{error && <Notice tone="error">{error}</Notice>}<label>Thư điện tử<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="ban@email.com" autoComplete="email" /></label><label>Mật khẩu<input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" autoComplete="current-password" /></label><button className="button button-dark button-full" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'} <span>→</span></button><div className="auth-switch">Chưa có tài khoản? <Link to="/register">Tạo tài khoản mới</Link></div></form>
  </AuthShell></LocalizedContent>;
}

export function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try { await register(form); navigate('/account', { replace: true }); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'Không thể tạo tài khoản.'); }
    finally { setLoading(false); }
  };
  return <LocalizedContent><AuthShell eyebrow="CÙNG NHAU XANH HƠN" title="Chọn những điều có ý nghĩa." image={brandAssets.productTwo}>
    <form className="auth-form" onSubmit={submit}><span className="eyebrow">TẠO TÀI KHOẢN</span><h2>Tham gia Wavo</h2><p>Lưu lại thiết kế yêu thích và theo dõi đơn hàng của bạn.</p>{error && <Notice tone="error">{error}</Notice>}<label>Họ và tên<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Tên của bạn" autoComplete="name" /></label><label>Thư điện tử<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="ban@email.com" autoComplete="email" /></label><label>Số điện thoại<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="09xx xxx xxx" autoComplete="tel" /></label><label>Mật khẩu<input type="password" required minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Ít nhất 6 ký tự" autoComplete="new-password" /></label><button className="button button-dark button-full" disabled={loading}>{loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'} <span>→</span></button><div className="auth-switch">Đã là thành viên? <Link to="/login">Đăng nhập</Link></div></form>
  </AuthShell></LocalizedContent>;
}

function AuthShell({ eyebrow, title, image, children }) {
  return <LocalizedContent><div className="auth-page page-container"><section className="auth-story" style={{ backgroundImage: 'linear-gradient(180deg, rgba(2,36,45,.05), rgba(2,36,45,.88)), url(' + image + ')' }}><span className="eyebrow eyebrow-light">{eyebrow}</span><h1>{title}</h1><span className="auth-story-signature">WAVO · THIẾT KẾ · SÁNG TẠO · TRAO QUYỀN</span></section><div className="auth-form-wrap">{children}</div></div></LocalizedContent>;
}

export function AccountPage() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  if (!user) return <LocalizedContent><div className="page-container interior-page"><div className="empty-state"><h2>Đăng nhập để mở tài khoản.</h2><Link className="button button-dark" to="/login">Đăng nhập</Link></div></div></LocalizedContent>;
  return <LocalizedContent><div className="page-container interior-page account-page"><span className="eyebrow">TÀI KHOẢN WAVO</span><h1>Xin chào, {user.fullName}.</h1><p>Đây là không gian của bạn trong hành trình cùng Wavo.</p><div className="account-card"><div className="account-avatar">{user.fullName?.slice(0, 1) || 'W'}</div><div><strong>{user.fullName}</strong><span>{user.email}</span><span>{user.phone || 'Chưa thêm số điện thoại'}</span><span className="role-chip">{user.role}</span></div><button className="button button-outline" onClick={() => { logout(); navigate('/'); }}>Đăng xuất</button></div><div className="account-actions"><Link to="/order-lookup"><strong>Tra cứu đơn hàng</strong><span>Theo dõi đơn hàng bằng mã đơn.</span></Link><Link to="/shop"><strong>Khám phá sản phẩm</strong><span>Tìm thiết kế tiếp theo của bạn.</span></Link></div></div></LocalizedContent>;
}

