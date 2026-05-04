import apiRequest from './config';

export const couponsApi = {
  getCoupons: () => apiRequest('/coupons/'),
  validateCoupon: (code) => apiRequest(`/coupons/validate/?code=${code}`),
};
