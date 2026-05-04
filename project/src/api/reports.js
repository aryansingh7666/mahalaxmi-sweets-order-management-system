import apiRequest from './config';

export const reportsApi = {
  getSummary: () => apiRequest('/reports/summary/'),
  getDailySales: () => apiRequest('/reports/daily-sales/'),
  getTopItems: () => apiRequest('/reports/top-items/'),
  getOutstanding: () => apiRequest('/reports/outstanding/'),
};
