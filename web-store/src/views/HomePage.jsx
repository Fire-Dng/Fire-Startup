import LocalizedContent from '../components/LocalizedContent.jsx';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLandingData } from '../controllers/useSiteData.js';
import { brandAssets } from '../data/brandAssets.js';
import { getLocalizedProductField, useLanguage } from '../controllers/LanguageProvider.jsx';

const swatches = [
  ['#dcbb9b'],
  ['#7ea5d8', '#ffe94a', '#ff9be0'],
  ['#7ea5d8'],
  ['#fff'],
];

export default function HomePage() {
  const homeRef = useRef(null);
  const { language, t } = useLanguage();
  const { landing, products } = useLandingData();
  const hero = landing.hero || {};
  const fallbackTitle = hero.title === 'Biển đẹp tái sinh' ? 'BIỂN ĐẸP\nTÂM SÁNG' : hero.title;
  const title = ('BIỂN ĐẸP\nTÂM SÁNG').split(/\n|\s\|\s/).filter(Boolean);
  const mission = landing.studioHighlight || {};
  const realProducts = products.slice(0, 4);

  useEffect(() => {
    const page = homeRef.current;
    if (!page) return undefined;

    const targets = [];
    const reveal = (selector, direction = 'up', stagger = 0) => {
      page.querySelectorAll(selector).forEach((element, index) => {
        element.classList.add('scroll-reveal');
        element.dataset.reveal = direction;
        element.style.setProperty('--reveal-delay', `${Math.min(index * stagger, 320)}ms`);
        targets.push(element);
      });
    };

    reveal('.home-hero', 'up');
    reveal('.mission-copy', 'left');
    reveal('.mission-visual', 'right');
    reveal('.real-products > h2');
    reveal('.real-products .real', 'up', 90);
    reveal('.effort-section > img', 'left');
    reveal('.effort-section > div', 'right');
    reveal('.brand-collab .collab-logos');
    reveal('.brand-collab > h2');
    reveal('.brand-collab > p');
    reveal('.process-section > img');

    if (!('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('is-visible'));
      return () => targets.forEach((element) => element.classList.remove('scroll-reveal', 'is-visible'));
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      targets.forEach((element) => {
        element.classList.remove('scroll-reveal', 'is-visible');
        element.style.removeProperty('--reveal-delay');
        delete element.dataset.reveal;
      });
    };
  }, [realProducts.length]);

  return <LocalizedContent><div className="home-page" ref={homeRef}>
    <section className="home-hero" aria-label="Wavo - biển đẹp, tâm sáng">
      <img className="home-hero-image" src={brandAssets.oceanHero} alt="Rùa biển giữa những tấm lưới dưới đại dương" />
      <div className="hero-copy">
        <h1>{title.map((line, index) => <span key={line} className={index ? 'hero-title-offset' : ''}>{t(line)}</span>)}</h1>
        <blockquote>{t('“WAVO tin rằng vẻ đẹp đích thực không chỉ nằm ở diện mạo, mà còn được phản chiếu qua tâm hồn thuần khiết và những điều ta lựa chọn gìn giữ.”')}</blockquote>
      </div>
      <div className="hero-scroll-note" aria-hidden="true">CUỘN XUỐNG <span>↓</span></div>
    </section>

    <section className="mission-section page-container">
      <div className="mission-copy">
        <h2>{t('SỨ MỆNH CỦA WAVO')}</h2>
        <p>{t('WAVO xây dựng nền tảng sáng tạo, nơi người trẻ tự do thiết kế và cá nhân hóa phụ kiện mang dấu ấn riêng từ vật liệu tái sinh của biển cả. Kết hợp tư duy sáng tạo, thiết kế cá nhân và kỹ thuật chế tác thủ công, WAVO mang đến sản phẩm độc đáo, giúp giới trẻ tiếp cận lối sống bền vững, đồng thời tạo thêm thu nhập cho bà con làng chài thông qua việc thu gom vật liệu và tham gia chế tác sản phẩm.')}</p>
        <Link className="button button-outline" to="/story">{t('Tìm hiểu thêm')}</Link>
      </div>
      <figure className="mission-visual"><img src={brandAssets.storyImage} alt="Nghệ nhân đang hoàn thiện sản phẩm từ lưới tái chế"/></figure>
    </section>

    <section className="real-products page-container" aria-labelledby="real-products-heading">
      <h2 id="real-products-heading">{t('SẢN PHẨM THỰC TẾ')}</h2>
      <ul className="real-grid">
        {realProducts.map((product, index) => {
          const demo = String(product._id || '').startsWith('demo-');
          const image = demo ? brandAssets.realProducts[index] : product.thumbnail || product.images?.[0] || brandAssets.realProducts[index];
          const productName = getLocalizedProductField(product, 'name', language, t);
          const content = <>
            {index % 2 === 1 && <Swatches colors={swatches[index]} />}
            {index % 2 === 1 && <p>{productName}</p>}
            <img src={image} alt={productName} loading="lazy" />
            {index % 2 === 0 && <p>{productName}</p>}
            {index % 2 === 0 && <Swatches colors={swatches[index]} />}
          </>;
          return <li className={'real' + (index % 2 ? ' real--dots-top' : '')} key={product._id || product.slug || index}>
            <Link className="real-product-link" to="/shop">{content}</Link>
          </li>;
        })}
      </ul>
    </section>

    <section className="effort-section">
      <img src={brandAssets.creativeBag} alt="Sản phẩm tái chế Wavo được chế tác thủ công" loading="lazy" />
      <div>
        <h2>{t('NỖ LỰC SÁNG TẠO')}</h2>
        <p>{t('WAVO không ngừng tìm kiếm những ý tưởng và phương thức sáng tạo mới để tái sinh vật liệu từ biển cả thành những sản phẩm thủ công độc đáo. Chúng tôi nỗ lực kết hợp tư duy thiết kế hiện đại với giá trị chế tác truyền thống, tạo không gian để người trẻ tự do thể hiện cá tính và biến ý tưởng thành sản phẩm thực tế. Với WAVO, mỗi đổi mới không chỉ mở ra giới hạn sáng tạo mà còn góp phần nâng cao giá trị vật liệu, tạo sinh kế cho cộng đồng làng chài và lan tỏa lối sống bền vững.')}</p>
        <Link className="button button-outline button-outline-light" to="/design">{t('Thiết kế ngay')}</Link>
      </div>
    </section>

    <section className="brand-collab page-container">
      <div className="collab-logos"><img className="collab-eco" src={brandAssets.logoEcoGreen} alt="EcoGreen" /><img className="collab-hands" src={brandAssets.handsIcon} alt="Chung tay tạo nên giá trị" /><img className="collab-wavo" src={brandAssets.logoNavy} alt="Wavo" /></div>
      <h2>{t('SỰ GIAO THOA GIỮA SÁNG TẠO VÀ LÀN SÓNG XANH')}</h2>
      <p>{t('Sự hợp tác giữa WAVO và ECO GREEN kết nối sức sáng tạo cá nhân với những giá trị phát triển bền vững.') }<br />{t('WAVO mang đến nền tảng để người dùng tự do thiết kế và cá nhân hóa các sản phẩm thời trang theo phong cách riêng. ECO GREEN hiện thực hóa những ý tưởng ấy bằng vật liệu xanh, thân thiện với thiên nhiên và bàn tay khéo léo của bà con làng chài.')}<br />{t('Cùng nhau, hai thương hiệu lan tỏa lối sống xanh, bảo vệ môi trường và tạo thêm sinh kế cho cộng đồng ven biển.')}</p>
    </section>

    <section className="process-section" aria-label="Quy trình tạo sản phẩm"><img src={brandAssets.designProcess} alt="Quy trình sáu bước từ chọn sản phẩm, thiết kế, chế tác đến đóng gói và giao hàng" loading="lazy" /></section>
  </div></LocalizedContent>;
}

function Swatches({ colors }) {
  return <LocalizedContent><ul className="swatches" aria-label="Màu sắc sản phẩm">{colors.map((color) => <li key={color} style={{ '--swatch': color }} />)}</ul></LocalizedContent>;
}
