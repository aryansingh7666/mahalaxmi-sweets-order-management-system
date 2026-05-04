import apiRequest from './config';

export const customersApi = {
  findOrCreate: (data) => apiRequest('/customers/find-or-create/', { method: 'POST', body: JSON.stringify(data) }),
  getCustomers: (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/customers/${query}`);
  },
  getCustomer: (id) => apiRequest(`/customers/${id}/`),
  getCustomerOrders: (id) => apiRequest(`/customers/${id}/orders/`),
  getCustomerBalance: (id) => apiRequest(`/customers/${id}/balance/`),
};
