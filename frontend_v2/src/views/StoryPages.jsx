import LocalizedContent from '../components/LocalizedContent.jsx';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { brandAssets } from '../data/brandAssets.js';
import { useLandingData } from '../controllers/useSiteData.js';
import { useLanguage } from '../controllers/LanguageProvider.jsx';
import Notice from '../components/Notice.jsx';
import Icon from '../components/Icon.jsx';

export function StoryPage() {
  const { landing } = useLandingData();
  const { t } = useLanguage();
  const pageRef = useRef(null);
  const story = landing.artisanStory || {};
  const steps = landing.recyclingSteps || landing.processSteps || [];
  const stats = landing.impactStats || {};
  const storyImage = story.workshopImageUrl || brandAssets.storyImage;
  const heroImage = landing.hero?.heroImage || brandAssets.oceanHero;

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;
    const elements = [...page.querySelectorAll('[data-story-reveal]')];
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [steps.length]);

  const metricCards = [
    { value: stats.ghostNetsCollectedKg, suffix: 'kg', label: t('lưới ma được thu hồi') },
    { value: stats.marineLifeProtected, suffix: '+', label: t('sinh vật biển được bảo vệ') },
    { value: stats.upcycledProductsCreated, suffix: '+', label: t('sản phẩm được tái sinh') },
    { value: stats.localArtisansSupported, suffix: '', label: t('nghệ nhân địa phương đồng hành') },
  ];
  const stepImages = [brandAssets.oceanHero, brandAssets.storyImage, brandAssets.creativeBag, brandAssets.designProcess];

  return <LocalizedContent><div className="story-v2" ref={pageRef}>
    <section className="story-v2-hero" aria-labelledby="story-v2-title">
      <img className="story-v2-hero-image" src={heroImage} alt="Đại dương và sinh vật biển, nguồn cảm hứng của Wavo" />
      <div className="story-v2-hero-shade" />
      <div className="story-v2-hero-top"><span>{t('WAVO · CÂU CHUYỆN CỦA CHÚNG TÔI')}</span><span>{t('Biển đẹp, tâm sáng')}</span></div>
      <div className="story-v2-hero-title" data-story-reveal>
        <p>{t('MỘT KHỦNG HOẢNG CẦN ĐƯỢC NHÌN THẤY')}</p>
        <h1 id="story-v2-title"><span>{t('ĐẠI DƯƠNG')}</span><span className="story-v2-title-offset">{t('KHÔNG RÁC')}</span></h1>
      </div>
      <div className="story-v2-hero-bottom">
        <p>{t('Rác thải đại dương là một câu chuyện về hệ sinh thái, cộng đồng ven biển và những lựa chọn nhỏ trong đời sống mỗi ngày.')}</p>
        <a href="#story-origin">{t('Bắt đầu hành trình')} <span aria-hidden="true">↓</span></a>
        <span className="story-v2-hero-signature">{t('Thiết kế · Tái sinh · Trao quyền')}</span>
      </div>
      <nav className="story-v2-anchor-nav" aria-label={t('Điều hướng câu chuyện')}>
        <a href="#story-origin">{t('Vấn đề')}</a><a href="#story-island">{t('Đảo rác')}</a><a href="#story-help">{t('Hành động')}</a>
      </nav>
    </section>

    <section className="story-v2-origin page-container" id="story-origin">
      <div className="story-v2-origin-heading" data-story-reveal>
        <span className="story-v2-kicker">01 / {t('Vấn đề')}</span>
        <h2>{t('Ô nhiễm đại dương — một khủng hoảng không thể quay lưng.')}</h2>
      </div>
      <div className="story-v2-origin-body" data-story-reveal>
        <p className="story-v2-origin-lead">{t('Sức khỏe của hệ sinh thái và cuộc sống con người đều gắn chặt với tình trạng của đại dương.')}</p>
        <p>{t('Nhựa dùng một lần, ngư cụ thất lạc, hóa chất và nhiều loại chất thải khác tích tụ trong môi trường biển. Một phần rác bắt nguồn từ đất liền, một phần theo hoạt động khai thác và vận tải trên biển trôi dạt vào đại dương.')}</p>
        <span className="story-v2-tag-label">{t('Các dạng ô nhiễm thường gặp')}</span>
        <ul className="story-v2-tags"><li>{t('Nhựa')}</li><li>{t('Ngư cụ thất lạc')}</li><li>{t('Hóa chất')}</li><li>{t('Dầu tràn')}</li><li>{t('Rác sinh hoạt')}</li><li>{t('Vi nhựa')}</li></ul>
      </div>
      <figure className="story-v2-workshop" data-story-reveal>
        <img src={heroImage} alt="Sinh vật biển giữa môi trường bị ảnh hưởng bởi rác thải" loading="lazy" />
        <figcaption><span>01 — 06</span><span>{t('Đại dương cần được bảo vệ')}</span></figcaption>
      </figure>
    </section>

    <section className="story-v2-impact" id="story-impact">
      <div className="story-v2-impact-head page-container" data-story-reveal>
        <span className="story-v2-kicker story-v2-kicker-light">02 / {t('Những con số có ý nghĩa')}</span>
        <h2>{t('Một thay đổi nhỏ')}<br />{t('có thể lan xa.')}</h2>
        <p>{t('Dữ liệu tác động được cập nhật từ nội dung Wavo, cho thấy nỗ lực chung của cộng đồng và những người đồng hành.')}</p>
      </div>
      <div className="story-v2-stats page-container">
        {metricCards.map((metric, index) => <article className="story-v2-stat" data-story-reveal key={metric.label} style={{ '--story-delay': `${index * 90}ms` }}>
          <span className="story-v2-stat-index">0{index + 1}</span>
          <strong>{Number(metric.value || 0).toLocaleString('vi-VN')}<small>{metric.suffix}</small></strong>
          <p>{metric.label}</p>
        </article>)}
      </div>
      <div className="story-v2-impact-note"><span>WAVO × {t('Cộng đồng ven biển')}</span><span>{t('Giá trị được tạo nên cùng nhau')}</span></div>
    </section>

    <section className="story-v2-life page-container">
      <div className="story-v2-life-image" data-story-reveal>
        <img src={heroImage} alt="Rác thải nhựa và ngư cụ có thể đe dọa đời sống sinh vật biển" loading="lazy" />
        <span className="story-v2-image-stamp">{t('ĐẠI DƯƠNG')}<br />{t('CẦN ĐƯỢC')}<br />{t('BẢO VỆ')}</span>
      </div>
      <div className="story-v2-life-copy" data-story-reveal>
        <span className="story-v2-kicker">03 / {t('Sinh vật biển')}</span>
        <h2>{t('Rác thải nhựa đe dọa sự sống dưới mặt nước.')}</h2>
        <p>{t('Rùa biển, cá voi, cá heo và nhiều loài khác có thể nhầm mảnh nhựa với thức ăn hoặc bị mắc vào dây, lưới trôi nổi. Ngư cụ thất lạc tiếp tục tồn tại ngoài khơi và gây hại ngay cả khi không còn được sử dụng.')}</p>
        <p>{t('Giảm rác thải từ nguồn và thu gom đúng cách giúp hạn chế nguy cơ động vật bị thương, mắc kẹt hoặc mất môi trường sống.')}</p>
        <div className="story-v2-warning"><strong>{t('Hậu quả')}</strong><span>{t('Chấn thương · Mất môi trường sống · Suy giảm đa dạng sinh học')}</span></div>
      </div>
    </section>

    <section className="story-v2-island" id="story-island">
      <div className="story-v2-island-image"><img src={brandAssets.oceanHero} alt="Lưới đánh cá và rác thải trôi nổi giữa đại dương" loading="lazy" /></div>
      <div className="story-v2-island-copy page-container" data-story-reveal>
        <span className="story-v2-kicker story-v2-kicker-light">04 / {t('Rác thải tích tụ ngoài khơi')}</span>
        <h2><span>{t('VÙNG RÁC THẢI')}</span><span>{t('THÁI BÌNH DƯƠNG')}</span></h2>
        <div><p>{t('Dòng hải lưu có thể gom rác nổi vào những vùng rộng lớn giữa đại dương. Đây không phải một hòn đảo rắn để có thể bước lên, mà là khu vực có nhiều mảnh nhựa và vật liệu trôi dạt ở các kích thước khác nhau.')}</p><p>{t('Mảnh lớn có thể vỡ dần thành vi nhựa, khiến việc thu gom và xử lý ngày càng khó khăn.')}</p></div>
      </div>
      <span className="story-v2-island-index">{t('THÁI BÌNH DƯƠNG · RÁC TRÔI NỔI')}</span>
    </section>

    <section className="story-v2-human page-container">
      <div className="story-v2-human-copy" data-story-reveal>
        <span className="story-v2-kicker">05 / {t('Từ biển đến đời sống')}</span>
        <h2>{t('Những gì trôi trong biển có thể đi vào chuỗi thức ăn.')}</h2>
        <p>{t('Vi nhựa đã được tìm thấy trong nhiều môi trường và sinh vật biển. Chúng có thể di chuyển qua chuỗi thức ăn; tác động lâu dài đến sức khỏe con người vẫn đang được nghiên cứu.')}</p>
        <p>{t('Hạn chế đồ nhựa dùng một lần, phân loại rác và chọn sản phẩm có vòng đời dài hơn là những việc thiết thực có thể bắt đầu ngay hôm nay.')}</p>
        <div className="story-v2-human-quote"><span>“</span><blockquote>{story.quote || t('Những tấm lưới cũ có thể được trao một công dụng mới bằng đôi tay của cộng đồng ven biển.')}</blockquote><small>{story.name || t('Cộng đồng nghệ nhân Wavo')}{story.village ? ` · ${story.village}` : ''}</small></div>
      </div>
      <figure className="story-v2-human-image" data-story-reveal><img src={storyImage} alt={story.village ? `Nghệ nhân địa phương tại ${story.village}` : 'Nghệ nhân Wavo tái sinh vật liệu từ biển'} loading="lazy" /><figcaption>{t('WAVO · VẬT LIỆU CÓ VÒNG ĐỜI MỚI')}</figcaption></figure>
    </section>

    <section className="story-v2-help" id="story-help">
      <div className="story-v2-process-head page-container" data-story-reveal>
        <span className="story-v2-kicker">06 / {t('Hành động mỗi ngày')}</span>
        <h2>{t('Chăm sóc thiên nhiên,')}<br />{t('từng chút một.')}</h2>
        <p>{t('Ba lựa chọn nhỏ giúp giảm rác thải và giữ gìn những nơi chúng ta cùng chia sẻ.')}</p>
      </div>
      <div className="story-v2-help-grid page-container">
        {[
          ['01', t('Giảm nhựa dùng một lần'), t('Mang theo túi cá nhân, bình nước có thể tái sử dụng và từ chối những món đồ nhựa không cần thiết.')],
          ['02', t('Phân loại rác đúng cách'), t('Tách riêng vật liệu có thể tái chế và đưa đến điểm tiếp nhận phù hợp tại địa phương.')],
          ['03', t('Cùng dọn sạch bờ biển'), t('Tham gia hoạt động làm sạch bãi biển, rừng và khu phố cùng cộng đồng quanh bạn.')],
        ].map(([number, title, description]) => <article className="story-v2-help-card" data-story-reveal key={number}>
          <span>{number}</span><h3>{title}</h3><p>{description}</p><i aria-hidden="true">↗</i>
        </article>)}
      </div>
    </section>

    <section className="story-v2-process" id="story-process">
      <div className="story-v2-process-head page-container" data-story-reveal>
        <span className="story-v2-kicker">WAVO / {t('Hành trình tái sinh')}</span>
        <h2>{t('Từ đại dương,')}<br />{t('qua bàn tay, đến bạn.')}</h2>
        <p>{t('Mỗi công đoạn đều có một vai trò riêng trong hành trình tạo nên sản phẩm Wavo.')}</p>
      </div>
      <div className="story-v2-steps page-container">
        {steps.slice(0, 4).map((step, index) => <article className="story-v2-step" data-story-reveal key={step._id || step.stepNumber || index} style={{ '--story-delay': `${index * 80}ms` }}>
          <div className="story-v2-step-image"><img src={step.imageUrl || stepImages[index]} alt={step.title || `Công đoạn ${index + 1} trong hành trình Wavo`} loading="lazy" /><span>/ {String(step.stepNumber || index + 1).padStart(2, '0')}</span></div>
          <h3>{step.title || ['Thu gom lưới ma', 'Làm sạch & phân loại', 'Chế tác thủ công', 'Hoàn thiện thiết kế'][index]}</h3>
          <p>{step.description || 'Vật liệu được xử lý cẩn thận để sẵn sàng bước vào vòng đời mới.'}</p>
        </article>)}
      </div>
    </section>

    <section className="story-v2-cta" data-story-reveal>
      <img src={brandAssets.oceanHero} alt="Ánh sáng xuyên qua làn nước biển" loading="lazy" />
      <div className="story-v2-cta-overlay" />
      <div className="story-v2-cta-copy"><span className="story-v2-kicker story-v2-kicker-light">{t('Cùng nhau gìn giữ đại dương')}</span><h2>{t('Mỗi lựa chọn')}<br />{t('đều tạo khác biệt.')}</h2><Link className="button button-mint" to="/shop">{t('Khám phá bộ sưu tập')} <Icon name="arrow" size={17} /></Link></div>
      <span className="story-v2-cta-mark">{t('WAVO · ĐƯỢC TẠO NÊN BẰNG SỰ TRÂN TRỌNG')}</span>
    </section>
  </div></LocalizedContent>;
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (event) => { event.preventDefault(); setSent(true); };
  return <LocalizedContent><div className="page-container interior-page contact-page"><div className="contact-hero"><span className="eyebrow eyebrow-light">KẾT NỐI CÙNG WAVO</span><h1>Chúng tôi luôn<br />sẵn lòng lắng nghe.</h1><p>Một câu hỏi, một ý tưởng hay đơn giản là lời chào — hãy gửi đến chúng tôi.</p></div><div className="contact-layout"><div className="contact-details"><div><span className="eyebrow">LIÊN HỆ</span><h2>Chuyện của bạn<br />rất quan trọng.</h2></div><a href="mailto:hello@wavo.vn"><span>Thư điện tử</span><strong>hello@wavo.vn</strong></a><a href="tel:+842363555555"><span>Điện thoại</span><strong>+84 236 355 5555</strong></a><div><span>Giờ làm việc</span><strong>Thứ Hai – Thứ Sáu · 8:30 – 17:30</strong></div><div className="contact-location"><Icon name="pin" size={20} /><span>Đà Nẵng, Việt Nam</span></div></div><form className="contact-form" onSubmit={submit}><span className="eyebrow">GỬI LỜI NHẮN</span><h2>Wavo có thể giúp gì?</h2>{sent && <Notice>Đã ghi nhận lời nhắn. Đội ngũ Wavo sẽ liên hệ bạn sớm.</Notice>}<div className="form-grid"><label>Họ và tên<input required placeholder="Tên của bạn" /></label><label>Thư điện tử<input type="email" required placeholder="ban@email.com" /></label><label className="form-span-two">Chủ đề<select defaultValue="Đơn hàng"><option>Đơn hàng</option><option>Sản phẩm</option><option>Hợp tác</option><option>Khác</option></select></label><label className="form-span-two">Lời nhắn<textarea rows="5" required placeholder="Hãy kể cho chúng tôi nghe..." /></label></div><button className="button button-dark" type="submit">Gửi lời nhắn <Icon name="arrow" size={18} /></button><small className="form-disclaimer">Biểu mẫu hiện chỉ hiển thị trạng thái gửi thành công; máy chủ chưa có điểm tiếp nhận liên hệ.</small></form></div></div></LocalizedContent>;
}

export function PolicyPage({ type }) {
  const policies = {
    shipping: { title: 'Giao hàng có trách nhiệm.', lead: 'Chúng tôi chuẩn bị từng đơn hàng cẩn thận và gửi đến bạn với sự trân trọng như khi tạo ra sản phẩm.', items: [['Thời gian chuẩn bị', 'Sản phẩm có sẵn thường được chuẩn bị trong 1–3 ngày làm việc. Sản phẩm tùy biến có thêm thời gian chế tác; tiến độ được cập nhật theo trạng thái đơn hàng.'], ['Phí giao hàng', 'Phí giao hàng hiện được tính tự động: 30.000₫ cho đơn dưới 500.000₫ và miễn phí giao hàng với đơn từ 500.000₫.'], ['Theo dõi đơn hàng', 'Dùng mã đơn hàng trong email hoặc tin nhắn xác nhận tại mục Tra cứu đơn hàng trên website.']] },
    returns: { title: 'Đổi trả minh bạch.', lead: 'Mỗi món đồ thủ công có những nét riêng. Nếu sản phẩm gặp lỗi từ quá trình chế tác, Wavo sẽ cùng bạn tìm cách xử lý.', items: [['Điều kiện', 'Sản phẩm còn nguyên trạng, chưa qua sử dụng và có thông tin đơn hàng. Sản phẩm tùy biến theo yêu cầu được hỗ trợ khi có lỗi kỹ thuật hoặc sai khác so với xác nhận.'], ['Thời hạn', 'Liên hệ Wavo trong vòng 7 ngày kể từ khi nhận hàng, kèm hình ảnh và mã đơn để đội ngũ hỗ trợ.'], ['Hỗ trợ', 'Email hello@wavo.vn hoặc dùng trang Liên hệ. Chúng tôi sẽ hướng dẫn phương án đổi, sửa hoặc hoàn tiền phù hợp.']] },
    privacy: { title: 'Quyền riêng tư của bạn.', lead: 'Thông tin cá nhân chỉ được sử dụng để phục vụ tài khoản, đơn hàng và chăm sóc khách hàng.', items: [['Dữ liệu được thu thập', 'Tên, email, số điện thoại và địa chỉ giao hàng được cung cấp khi đăng ký hoặc đặt hàng.'], ['Cách sử dụng', 'Thông tin dùng để xác nhận đơn, giao hàng, hỗ trợ khách hàng và cải thiện trải nghiệm Wavo.'], ['Bảo vệ thông tin', 'Không nhập dữ liệu nhạy cảm vào ghi chú đơn hàng. Liên hệ Wavo nếu bạn muốn cập nhật thông tin tài khoản.']] },
    terms: { title: 'Mua hàng với sự rõ ràng.', lead: 'Giá, tồn kho và thời gian chế tác được xác nhận lại bởi hệ thống khi bạn đặt hàng.', items: [['Giá sản phẩm', 'Giá tùy biến được tính theo sản phẩm nền, phí chế tác và từng vật liệu được chọn. Giá cuối cùng hiển thị ở trang thanh toán.'], ['Thiết kế thủ công', 'Màu sắc và chi tiết có thể khác nhẹ do đặc tính vật liệu tái sinh và quy trình thủ công.'], ['Đơn hàng', 'Đơn được xác nhận khi bạn hoàn tất bước đặt hàng. Việc hủy đơn phụ thuộc trạng thái xử lý và quy trình chế tác.']] },
  };
  const page = policies[type] || policies.shipping;
  return <LocalizedContent><div className="page-container interior-page policy-page"><div className="breadcrumbs"><Link to="/">Trang chủ</Link><span>/</span><strong>Chính sách</strong></div><div className="policy-hero"><span className="eyebrow eyebrow-light">WAVO · CHĂM SÓC</span><h1>{page.title}</h1><p>{page.lead}</p><img src={brandAssets.handsIcon} alt="" /></div><div className="policy-content">{page.items.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</div><div className="policy-help"><span>Cần hỗ trợ thêm?</span><Link className="text-link" to="/contact">Liên hệ Wavo <Icon name="arrow" size={17} /></Link></div></div></LocalizedContent>;
}

export function NotFoundPage() {
  return <LocalizedContent><div className="page-container not-found-page"><span className="eyebrow">404 · LẠC GIỮA ĐẠI DƯƠNG</span><h1>Trang này chưa được tìm thấy.</h1><p>Hãy quay lại bờ và tiếp tục hành trình cùng Wavo.</p><Link to="/" className="button button-dark">Về trang chủ <Icon name="arrow" size={17} /></Link></div></LocalizedContent>;
}
