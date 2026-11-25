import type { LandingContent } from '@/types';
import { ASSETS } from '@/config/assets';

export const FALLBACK_LANDING_CONTENT: LandingContent = {
  heroTitle: 'Từ Lưới Ma Đại Dương Đến Phụ Kiện Thủ Công Độc Bản',
  heroSubtitle:
    'Mỗi chiếc túi, giỏ đựng đồ, ví tiền, áo khoác và vòng tay đều được đan tay từ lưới đánh cá thu hồi tại vùng biển miền Trung — kết hợp cùng xưởng thiết kế 3D Free-form giúp bạn tự tay đính từng vỏ sò, ốc biển lên sản phẩm.',
  heroCtaPrimary: 'Khám Phá Cửa Hàng Xanh',
  heroCtaSecondary: 'Mở Xưởng Thiết Kế 3D',
  heroBanner: {
    title: 'Từ Lưới Ma Đại Dương Đến Phụ Kiện Thủ Công Độc Bản',
    subtitle:
      'Mỗi chiếc túi, giỏ đựng đồ, ví tiền, áo khoác và vòng tay đều được đan tay từ lưới đánh cá thu hồi tại vùng biển miền Trung — kết hợp cùng xưởng thiết kế 3D Free-form giúp bạn tự tay đính từng vỏ sò, ốc biển lên sản phẩm.',
    ctaText: 'Khám Phá Cửa Hàng Xanh',
    ctaLink: '/shop',
    backgroundImageUrl: ASSETS.landing.oceanHero,
    secondaryImageUrl: ASSETS.landing.fishingNetClose,
    tertiaryImageUrl: ASSETS.products.toteBagMain,
  },
  impactCounters: {
    netsCollectedKg: 4850,
    marineLifeSaved: 19400,
    upcycledProductsCreated: 6230,
    localArtisansSupported: 48,
  },
  recyclingSteps: [
    {
      stepNumber: 1,
      title: 'Thu Gom Lưới Ma Đại Dương',
      description:
        'Hợp tác cùng ngư dân Đà Nẵng, Quảng Nam & Lý Sơn thu hồi lưới đánh cá bị rách hoặc trôi dạt trên rạn san hô.',
      badgeText: '100% Truy xuất vùng biển',
      imageUrl: ASSETS.landing.processSteps.step1OceanCollection,
    },
    {
      stepNumber: 2,
      title: 'Khử Khuẩn & Tái Tạo Sợi',
      description:
        'Làm sạch muối biển bằng thảo mộc tự nhiên, phân loại độ dày sợi HDPE/Nylon và nhuộm màu khoáng thân thiện.',
      badgeText: 'Zero-Chemical Wash',
      imageUrl: ASSETS.landing.processSteps.step2NetSorting,
    },
    {
      stepNumber: 3,
      title: 'Đan Thủ Công Làng Chài',
      description:
        'Các nghệ nhân làng chài sử dụng kỹ thuật gút lưới truyền thống để tạo phôi túi, giỏ, ví, áo khoác và vòng tay siêu bền.',
      badgeText: 'Bảo hành đường đan 3 năm',
      imageUrl: ASSETS.landing.processSteps.step3ArtisanWeaving,
    },
    {
      stepNumber: 4,
      title: 'Cá Nhân Hóa 3D Cùng Vỏ Sò & Ốc Biển',
      description:
        'Bạn tự do đính vỏ sò điệp, ốc xoắn, sao biển lên bề mặt 3D theo thời gian thực. Thợ thủ công sẽ khâu cố định chính xác theo bản vẽ 3D.',
      badgeText: 'Free-form 3D Raycasting',
      imageUrl: ASSETS.landing.processSteps.step4FinishedCraft,
    },
  ],
  processSteps: [
    {
      stepNumber: 1,
      title: 'Thu Gom Lưới Ma Đại Dương',
      description:
        'Hợp tác cùng ngư dân Đà Nẵng, Quảng Nam & Lý Sơn thu hồi lưới đánh cá bị rách hoặc trôi dạt trên rạn san hô.',
      imageUrl: ASSETS.landing.processSteps.step1OceanCollection,
      badgeText: '100% Truy xuất vùng biển',
    },
    {
      stepNumber: 2,
      title: 'Khử Khuẩn & Tái Tạo Sợi',
      description:
        'Làm sạch muối biển bằng thảo mộc tự nhiên, phân loại độ dày sợi HDPE/Nylon và nhuộm màu khoáng thân thiện.',
      imageUrl: ASSETS.landing.processSteps.step2NetSorting,
      badgeText: 'Zero-Chemical Wash',
    },
    {
      stepNumber: 3,
      title: 'Đan Thủ Công Làng Chài',
      description:
        'Các nghệ nhân làng chài sử dụng kỹ thuật gút lưới truyền thống để tạo phôi túi, giỏ, ví, áo khoác và vòng tay siêu bền.',
      imageUrl: ASSETS.landing.processSteps.step3ArtisanWeaving,
      badgeText: 'Bảo hành đường đan 3 năm',
    },
    {
      stepNumber: 4,
      title: 'Cá Nhân Hóa 3D Cùng Vỏ Sò & Ốc Biển',
      description:
        'Bạn tự do đính vỏ sò điệp, ốc xoắn, sao biển lên bề mặt 3D theo thời gian thực. Thợ thủ công sẽ khâu cố định chính xác theo bản vẽ 3D.',
      imageUrl: ASSETS.landing.processSteps.step4FinishedCraft,
      badgeText: 'Free-form 3D Raycasting',
    },
  ],
  galleryImages: [...ASSETS.landing.gallery],
  artisanStory: {
    headline: 'Đôi Bàn Tay Giữ Biển Xanh Từ Làng Chài Thọ Quang – Sơn Trà',
    heading: 'Đôi Bàn Tay Giữ Biển Xanh Từ Làng Chài Thọ Quang – Sơn Trà',
    villageName: 'Hợp tác xã Thủ công Tái chế Biển miền Trung (Đà Nẵng - Hội An)',
    quote:
      'Ngày trước lưới rách chỉ biết bỏ xó hoặc chôn lấp ngoài bãi cát. Giờ từng mắt lưới được tụi tui đan thành giỏ, thành túi đính ốc biển cho khách phương xa tự thiết kế trên 3D — vừa sạch biển, vừa giữ được nghề đan lưới của cha ông.',
    body: 'Hơn 48 phụ nữ làng chài và thợ đan lưới lành nghề tại bán đảo Sơn Trà, Cù Lao Chàm và Lý Sơn đang trực tiếp tham gia chế tác từng đơn hàng Custom 3D. Mỗi phiếu chế tác 3D gửi về xưởng đều hiển thị rõ tọa độ từng viên ngọc trai, vỏ sò điệp để nghệ nhân khâu tay tỉ mỉ.',
    bodyText:
      'Hơn 48 phụ nữ làng chài và thợ đan lưới lành nghề tại bán đảo Sơn Trà, Cù Lao Chàm và Lý Sơn đang trực tiếp tham gia chế tác từng đơn hàng Custom 3D. Mỗi phiếu chế tác 3D gửi về xưởng đều hiển thị rõ tọa độ từng viên ngọc trai, vỏ sò điệp để nghệ nhân khâu tay tỉ mỉ.',
    artisanName: 'Nghệ nhân Nguyễn Thị Lành',
    artisanRole: 'Tổ trưởng Tổ Đan Lưới Thủ Công Thọ Quang (28 năm kinh nghiệm)',
    avatarUrl: ASSETS.hero.artisanWeaver,
    workshopImageUrl: ASSETS.landing.fishingNetHarbor,
  },
};
