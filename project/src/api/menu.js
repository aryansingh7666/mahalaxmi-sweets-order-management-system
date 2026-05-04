import apiRequest from './config';

export const menuApi = {
  getCategories: () => apiRequest('/menu/categories/'),
  getItems: (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/menu/items/${query}`);
  },
  getItem: (id) => apiRequest(`/menu/items/${id}/`),
  createItem: (data) => apiRequest('/menu/items/', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, data) => apiRequest(`/menu/items/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id) => apiRequest(`/menu/items/${id}/`, { method: 'DELETE' }),
};
