import apiRequest from './config';

export const ordersApi = {
  placeOrder: (data) => apiRequest('/orders/', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/orders/${query}`);
  },
  getOrder: (id) => apiRequest(`/orders/${id}/`),
  updateOrder: (id, data) => apiRequest(`/orders/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  recordPayment: (id, data) => apiRequest(`/orders/${id}/payment/`, { method: 'POST', body: JSON.stringify(data) }),
  updateKitchenStatus: (id, status) => apiRequest(`/orders/${id}/kitchen/`, { method: 'PATCH', body: JSON.stringify({ kitchen_status: status }) }),
  getInvoice: (id) => apiRequest(`/orders/${id}/invoice/`),
  generateInvoice: (id) => apiRequest(`/orders/${id}/generate_invoice/`),
};

