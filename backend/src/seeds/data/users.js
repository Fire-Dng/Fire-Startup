const env = require('../../config/env');

const initialUsers = [
  {
    fullName: 'Quản Trị Viên Nét Biển DTU',
    email: env.SEED_ADMIN_EMAIL,
    phone: '0905111222',
    password: env.SEED_DEFAULT_PASSWORD,
    role: 'admin',
    address: {
      street: '254 Nguyễn Văn Linh',
      ward: 'Thạc Gián',
      district: 'Thanh Khê',
      city: 'Đà Nẵng',
    },
  },
  {
    fullName: 'Nghệ Nhân Nguyễn Thị Lành',
    email: env.SEED_STAFF_EMAIL,
    phone: '0905333444',
    password: env.SEED_DEFAULT_PASSWORD,
    role: 'staff',
    address: {
      street: 'Làng chài Thanh Khê',
      ward: 'Thanh Khê Đông',
      district: 'Thanh Khê',
      city: 'Đà Nẵng',
    },
  },
  {
    fullName: 'Lê Minh Hải (Khách hàng)',
    email: env.SEED_CUSTOMER_EMAIL,
    phone: '0905888999',
    password: env.SEED_DEFAULT_PASSWORD,
    role: 'customer',
    address: {
      street: '12 Bạch Đằng',
      ward: 'Thạch Thang',
      district: 'Hải Châu',
      city: 'Đà Nẵng',
    },
  },
];


module.exports = initialUsers;
