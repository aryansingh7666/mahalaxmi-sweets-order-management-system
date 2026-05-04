import apiRequest from './config';

export const authApi = {
  login: (data) => apiRequest('/auth/login/', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiRequest('/auth/logout/', { method: 'POST' }),
  refreshToken: (refresh) => apiRequest('/auth/refresh/', { method: 'POST', body: JSON.stringify({ refresh }) }),
};
