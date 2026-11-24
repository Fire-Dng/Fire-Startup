import LocalizedContent from '../components/LocalizedContent.jsx';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { orderModel } from '../models/orderModel.js';
import { formatPrice } from '../components/ProductCard.jsx';
import Notice from '../components/Notice.jsx';
import Icon from '../components/Icon.jsx';

const statusLabels = { pending: 'Đã tiếp nhận', confirmed: 'Đã xác nhận', in_crafting: 'Đang chế tác', quality_check: 'Đang kiểm tra', shipping: 'Đang giao hàng', delivered: 'Đã giao thành công', cancelled: 'Đã hủy' };
const timeline = ['pending', 'confirmed', 'in_crafting', 'quality_check', 'shipping', 'delivered'];

export function OrderSummary({ order, allowCancel = false, onCancelled }) {
  const [phone, setPhone] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const activeIndex = timeline.indexOf(order.status);
  const cancel = async () => {
    setCancelLoading(true); setCancelError('');
    try {
      const updated = await orderModel.cancel(order.orderCode, { phone, reason: 'Khách hàng yêu cầu hủy đơn' });
      onCancelled?.(updated);
    } catch (error) { setCancelError(error.response?.data?.message || error.message); }
    finally { setCancelLoading(false); }
  };
  return <LocalizedContent><section className="order-result-card"><div className="order-result-top"><div><span className="eyebrow">MÃ ĐƠN HÀNG</span><h2>{order.orderCode}</h2></div><span className={'status-pill status-' + order.status}>{statusLabels[order.status] || order.status}</span></div><div className="order-timeline">{timeline.map((status, index) => <div className={'timeline-step' + (index <= activeIndex && order.status !== 'cancelled' ? ' timeline-done' : '')} key={status}><span className="timeline-dot">{index < activeIndex ? <Icon name="check" size={13} /> : String(index + 1).padStart(2, '0')}</span><small>{statusLabels[status]}</small></div>)}</div><div className="order-result-body"><div><span>Người nhận</span><strong>{order.customerInfo?.fullName}</strong></div><div><span>Địa chỉ giao hàng</span><strong>{order.customerInfo?.address}, {order.customerInfo?.city}</strong></div><div><span>Thanh toán</span><strong>{order.paymentMethod === 'vietqr' ? 'VietQR' : 'Thanh toán khi nhận hàng'} · {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</strong></div><div><span>Tổng đơn</span><strong className="order-grand-total">{formatPrice(order.totalAmount)}</strong></div></div>{order.paymentMethod === 'vietqr' && order.vietqrInfo?.qrImageUrl && order.paymentStatus !== 'paid' && <div className="vietqr-info"><img src={order.vietqrInfo.qrImageUrl} alt="Mã QR thanh toán" /><div><span className="eyebrow">THANH TOÁN VIETQR</span><strong>{order.vietqrInfo.accountName}</strong><p>{order.vietqrInfo.bankName} · {order.vietqrInfo.accountNo}</p><p>Nội dung: <b>{order.vietqrInfo.transferContent}</b></p></div></div>}{order.statusHistory?.length > 0 && <div className="order-history"><h3>Cập nhật gần đây</h3>{order.statusHistory.slice().reverse().slice(0, 4).map((item, index) => <div key={index}><span>{new Date(item.updatedAt).toLocaleString('vi-VN')}</span><strong>{statusLabels[item.status] || item.status}</strong><small>{item.note}</small></div>)}</div>}{allowCancel && ['pending', 'confirmed'].includes(order.status) && <div className="cancel-order-box"><label>Số điện thoại xác nhận (không bắt buộc)<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Nhập số điện thoại trên đơn" /></label><button className="button button-outline" onClick={cancel} disabled={cancelLoading}>{cancelLoading ? 'Đang xử lý...' : 'Yêu cầu hủy đơn'}</button>{cancelError && <Notice tone="error">{cancelError}</Notice>}</div>}</section></LocalizedContent>;
}

export default function OrderLookupPage() {
  const [params] = useSearchParams();
  const [orderCode, setOrderCode] = useState(params.get('code') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lookup = async (event) => { event?.preventDefault(); setLoading(true); setError(''); setOrder(null); try { setOrder(await orderModel.lookup(orderCode.trim(), phone.trim())); } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'Không tìm thấy đơn hàng.'); } finally { setLoading(false); } };
  useEffect(() => { if (params.get('code')) { setOrderCode(params.get('code')); } }, [params]);
  return <LocalizedContent><div className="page-container interior-page lookup-page"><div className="breadcrumbs"><Link to="/">Trang chủ</Link><span>/</span><strong>Tra cứu đơn hàng</strong></div><div className="lookup-page-hero"><span className="eyebrow eyebrow-light">WAVO · LUÔN Ở ĐÂY CÙNG BẠN</span><h1>Mỗi hành trình<br />đều đáng mong chờ.</h1><p>Theo dõi hành trình của món đồ mới từ xưởng thủ công đến tay bạn.</p><div className="lookup-mark">W</div></div><div className="lookup-form-card"><form onSubmit={lookup}><label>Mã đơn hàng<input value={orderCode} onChange={(event) => setOrderCode(event.target.value)} placeholder="VD: DTU-20261115-ABCD" required /></label><label>Số điện thoại (tùy chọn)<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Số điện thoại đặt hàng" /></label><button className="button button-dark" disabled={loading}>{loading ? 'Đang tra cứu...' : 'Tra cứu đơn hàng'} <Icon name="arrow" size={18} /></button></form>{error && <Notice tone="error">{error}</Notice>}{order && <OrderSummary order={order} allowCancel onCancelled={setOrder} />}</div></div></LocalizedContent>;
}

export function OrderDetailPage() {
  const { orderCode } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (order) return;
    orderModel.getById(orderCode).then(setOrder).catch((requestError) => setError(requestError.response?.data?.message || requestError.message));
  }, [orderCode]);
  return <LocalizedContent><div className="page-container interior-page order-detail-page"><div className="breadcrumbs"><Link to="/">Trang chủ</Link><span>/</span><strong>Đơn hàng</strong></div><div className="order-success-heading"><span className="success-mark"><Icon name="check" size={26} /></span><span className="eyebrow">CẢM ƠN BẠN ĐÃ CHỌN WAVO</span><h1>Đơn hàng đang bắt đầu hành trình.</h1><p>Thông tin đơn hàng của bạn đã được gửi đến đội ngũ Wavo.</p></div>{error && <Notice tone="error">{error}</Notice>}{order ? <OrderSummary order={order} allowCancel onCancelled={setOrder} /> : !error && <div className="loading-line">Đang tải trạng thái đơn hàng...</div>}<div className="order-next-actions"><Link className="button button-outline" to="/shop">Tiếp tục khám phá</Link><Link className="text-link" to="/order-lookup">Tra cứu đơn khác <Icon name="arrow" size={16} /></Link></div></div></LocalizedContent>;
}
