import { ENV } from '@/config/env';
import { API_BASE_URL, CmsAuthUser, setCmsSession } from './client';

export async function loginCmsAdmin(
  email: string,
  password: string
): Promise<{ token: string; user: CmsAuthUser }> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.message || 'Email hoặc mật khẩu không chính xác.');
    }

    const token: string = json?.data?.token || json?.token;
    const user: CmsAuthUser = json?.data?.user || json?.user;
    if (!token || !user) {
      throw new Error('Phản hồi đăng nhập từ máy chủ không hợp lệ.');
    }
    if (!['admin', 'staff'].includes(user.role)) {
      throw new Error(
        'Tài khoản này không có quyền truy cập hệ thống Quản trị CMS (yêu cầu quyền Admin hoặc Nghệ nhân/Staff).'
      );
    }

    setCmsSession(token, user);
    return { token, user };
  } catch (err) {
    const isNetworkError =
      err instanceof TypeError ||
      (err instanceof Error && /fetch|network|failed to fetch/i.test(err.message));

    if (
      isNetworkError &&
      (cleanEmail === ENV.DEFAULT_ADMIN_EMAIL.toLowerCase() ||
        cleanEmail === 'artisan@dtu-upcycled.vn') &&
      password === ENV.DEFAULT_ADMIN_PASSWORD
    ) {
      const demoUser: CmsAuthUser = {
        _id: cleanEmail.startsWith('admin') ? 'usr-admin-demo' : 'usr-staff-demo',
        fullName: cleanEmail.startsWith('admin')
          ? 'Quản Trị Viên WAVO'
          : 'Nghệ Nhân Nguyễn Thị Lành',
        email: cleanEmail,
        role: cleanEmail.startsWith('admin') ? 'admin' : 'staff',
      };
      const demoToken = 'demo-offline-jwt-token';
      setCmsSession(demoToken, demoUser);
      return { token: demoToken, user: demoUser };
    }
    throw err;
  }
}
