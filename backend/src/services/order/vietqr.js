const Order = require('../../models/Order');
const env = require('../../config/env');
const { buildVietQrImageUrl } = require('../../config/assets');

/**
 * BR-10: Generate unique order code DTU-YYYYMMDD-XXXX
 */
const generateOrderCode = async () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  for (let attempt = 0; attempt < 10; attempt++) {
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `DTU-${yyyy}${mm}${dd}-${suffix}`;
    const exists = await Order.exists({ orderCode: code });
    if (!exists) return code;
  }
  return `DTU-${yyyy}${mm}${dd}-${Date.now().toString().slice(-4)}`;
};

/**
 * Build VietQR info (BR-10) using centralized env & assets config
 */
const buildVietQrInfo = (orderCode, totalAmount) => {
  const qrImageUrl = buildVietQrImageUrl({
    bankId: env.VIETQR_BANK_ID,
    accountNo: env.VIETQR_ACCOUNT_NO,
    template: env.VIETQR_TEMPLATE,
    amount: totalAmount,
    transferContent: orderCode,
    accountName: env.VIETQR_ACCOUNT_NAME,
  });

  return {
    bankId: env.VIETQR_BANK_ID,
    bankName: env.VIETQR_BANK_NAME,
    accountNo: env.VIETQR_ACCOUNT_NO,
    accountName: env.VIETQR_ACCOUNT_NAME,
    amount: totalAmount,
    transferContent: orderCode,
    qrImageUrl,
  };
};

module.exports = {
  generateOrderCode,
  buildVietQrInfo,
};
