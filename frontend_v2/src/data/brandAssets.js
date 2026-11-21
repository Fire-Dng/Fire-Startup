import logoWhite from '../../brand_assets/layout_home_html/wavo-shop-layout/img/logo-wavo-white.png';
import logoNavy from '../../brand_assets/layout_home_html/wavo-shop-layout/img/logo-wavo.png';
import logoEcoGreen from '../../brand_assets/layout_home_html/wavo-shop-layout/img/logo-ecogreen.png';
import oceanHero from '../../brand_assets/layout_home_html/wavo-shop-layout/img/hero-home.jpg';
import shopHero from '../../brand_assets/layout_home_html/wavo-shop-layout/img/hero-shop.jpg';
import storyImage from '../../brand_assets/layout_home_html/wavo-shop-layout/img/story-factory.jpg';
import creativeBag from '../../brand_assets/layout_home_html/wavo-shop-layout/img/creative-bag.jpg';
import designProcess from '../../brand_assets/layout_home_html/wavo-shop-layout/img/banner-process.jpg';
import productOne from '../../brand_assets/layout_home_html/wavo-shop-layout/img/product-1.jpg';
import productTwo from '../../brand_assets/layout_home_html/wavo-shop-layout/img/product-2.jpg';
import productThree from '../../brand_assets/layout_home_html/wavo-shop-layout/img/product-3.jpg';
import productFour from '../../brand_assets/layout_home_html/wavo-shop-layout/img/product-4.jpg';
import productFive from '../../brand_assets/layout_home_html/wavo-shop-layout/img/product-5.jpg';
import realOne from '../../brand_assets/layout_home_html/wavo-shop-layout/img/real-1.jpg';
import realTwo from '../../brand_assets/layout_home_html/wavo-shop-layout/img/real-2.jpg';
import realThree from '../../brand_assets/layout_home_html/wavo-shop-layout/img/real-3.jpg';
import realFour from '../../brand_assets/layout_home_html/wavo-shop-layout/img/real-4.jpg';
import cartIcon from '../../brand_assets/layout_home_html/wavo-shop-layout/img/icon-cart.png';
import searchIcon from '../../brand_assets/layout_home_html/wavo-shop-layout/img/icon-find.png';
import userIcon from '../../brand_assets/layout_home_html/wavo-shop-layout/img/icon-user.png';
import facebookIcon from '../../brand_assets/layout_home_html/wavo-shop-layout/img/icon-fb.png';
import xIcon from '../../brand_assets/layout_home_html/wavo-shop-layout/img/icon-x.png';
import tiktokIcon from '../../brand_assets/layout_home_html/wavo-shop-layout/img/icon-tiktok.png';
import handsIcon from '../../brand_assets/layout_home_html/wavo-shop-layout/img/emblem-hands.png';

export const brandAssets = {
  logoWhite,
  logoNavy,
  logoEcoGreen,
  oceanHero,
  shopHero,
  storyImage,
  creativeBag,
  designProcess,
  productOne,
  productTwo,
  productThree,
  productFour,
  productFive,
  realProducts: [realOne, realTwo, realThree, realFour],
  cartIcon,
  searchIcon,
  userIcon,
  facebookIcon,
  xIcon,
  tiktokIcon,
  handsIcon,
};

export const localProducts = [
  { _id: 'demo-1', name: 'Túi Lưới Đại Dương', slug: 'tui-luoi-dai-duong', category: 'bag', basePrice: 420000, thumbnail: productOne, images: [productOne], rating: 4.9, soldCount: 128, isCustomizable: true, isFeatured: true, stock: 24, shortDescription: 'Tái sinh từ lưới biển thu hồi tại miền Trung.' },
  { _id: 'demo-2', name: 'Túi Đan Bản Lưới', slug: 'tui-dan-ban-luoi', category: 'bag', basePrice: 320000, thumbnail: productTwo, images: [productTwo], rating: 4.8, soldCount: 86, isCustomizable: true, isFeatured: true, stock: 18, shortDescription: 'Sợi lưới thủ công, nhẹ và bền.' },
  { _id: 'demo-3', name: 'Túi Chéo Sắc Màu', slug: 'tui-cheo-sac-mau', category: 'accessory', basePrice: 530000, thumbnail: productThree, images: [productThree], rating: 4.9, soldCount: 63, isCustomizable: true, isFeatured: false, stock: 9, shortDescription: 'Một điểm nhấn rực rỡ từ vật liệu tái chế.' },
  { _id: 'demo-4', name: 'Ví Biển Trong Xanh', slug: 'vi-bien-trong-xanh', category: 'wallet', basePrice: 280000, thumbnail: productFour, images: [productFour], rating: 4.7, soldCount: 55, isCustomizable: false, isFeatured: true, stock: 14, shortDescription: 'Phụ kiện nhỏ cho những ngày gần biển.' },
  { _id: 'demo-5', name: 'Túi Đựng Nắng', slug: 'tui-dung-nang', category: 'bag', basePrice: 390000, thumbnail: productFive, images: [productFive], rating: 4.8, soldCount: 42, isCustomizable: false, isFeatured: false, stock: 20, shortDescription: 'Tái sử dụng mỗi ngày, nhẹ nhàng với biển.' },
];

export const storyFallback = {
  hero: {
    badgeText: 'WAVO • THIẾT KẾ BỀN VỮNG',
    title: 'Biển đẹp tái sinh',
    subtitle: 'Từ những tấm lưới cũ, chúng tôi tạo nên những món đồ mới mang theo câu chuyện của đại dương.',
    primaryCtaText: 'Khám phá sản phẩm',
    primaryCtaLink: '/shop',
    secondaryCtaText: 'Thiết kế riêng',
    secondaryCtaLink: '/shop?customizable=true',
    heroImage: oceanHero,
  },
  impactStats: { ghostNetsCollectedKg: 3480, marineLifeProtected: 15200, upcycledProductsCreated: 6850, localArtisansSupported: 42 },
  processSteps: [
    { stepNumber: 1, title: 'Thu gom lưới ma', description: 'Cùng cộng đồng ven biển thu hồi lưới đánh cá trôi dạt.', iconName: '01' },
    { stepNumber: 2, title: 'Làm sạch & phân loại', description: 'Lưới được xử lý, phân loại và chuẩn bị cho vòng đời mới.', iconName: '02' },
    { stepNumber: 3, title: 'Đan bằng đôi tay lành nghề', description: 'Nghệ nhân địa phương tạo nên từng sản phẩm thủ công.', iconName: '03' },
    { stepNumber: 4, title: 'Tùy biến theo dấu ấn riêng', description: 'Chọn màu, vật liệu và chi tiết để tạo món đồ của riêng bạn.', iconName: '04' },
  ],
};
