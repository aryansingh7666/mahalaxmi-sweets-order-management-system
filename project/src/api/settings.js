import apiRequest from './config';

export const settingsApi = {
  getSettings: () => apiRequest('/settings/'),
  updateSettings: (data) => apiRequest('/settings/', { method: 'PUT', body: JSON.stringify(data) }),
};
