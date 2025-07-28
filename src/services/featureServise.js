import api from './api';

const featureService = {
  getAll: () => api.get('/features'),
  getById: (id) => api.get(`/features/${id}`),
  create: (data) => api.post('/features', data),
  update: (id, data) => api.put(`/features/${id}`, data),
  delete: (id) => api.delete(`/features/${id}`),
};

export default featureService;
