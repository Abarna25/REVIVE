import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// API Service Methods
export const getEvents = () => api.get('/api/events');
export const getEventById = (id) => api.get(`/api/events/${id}`);
export const ingestEvent = (data) => api.post('/api/events/ingest', data);

export const getCases = () => api.get('/api/recovery-cases');
export const getCaseById = (id) => api.get(`/api/recovery-cases/${id}`);
export const analyzeCase = (id) => api.post(`/api/recovery-cases/${id}/analyze`);

export const getTwin = (id) => api.get(`/api/recovery-cases/${id}/twin`);
export const simulateTwin = (id, customerProfile = {}) => api.post(`/api/recovery-cases/${id}/simulate`, { customerProfile });

export const getStrategies = (id) => api.get(`/api/recovery-cases/${id}/strategies`);
export const selectStrategy = (id, strategyType) => api.post(`/api/recovery-cases/${id}/select-strategy`, { strategyType });

export const executeAction = (id, idempotencyKey = null, extra = {}) => {
  const headers = {};
  if (idempotencyKey) {
    headers['x-idempotency-key'] = idempotencyKey;
  }
  return api.post(`/api/recovery-cases/${id}/execute`, extra, { headers });
};

export const approveAction = (id) => api.post(`/api/recovery-cases/${id}/approve`);
export const confirmPayment = (id, paymentReference = null, status = 'CONFIRMED') => api.post(`/api/recovery-cases/${id}/confirm-payment`, { paymentReference, status });
export const stopRecovery = (id) => api.post(`/api/recovery-cases/${id}/stop`);

export const getSafetyChecks = (id) => api.get(`/api/recovery-cases/${id}/safety-checks`);
export const getPolicy = () => api.get('/api/recovery-policy/policy');
export const updatePolicy = (data) => api.put('/api/recovery-policy/policy', data);

export const getAuditLogs = (caseId = null) => caseId ? api.get(`/api/audit/${caseId}`) : api.get('/api/audit');

export const getDashboardMetrics = () => api.get('/api/analytics/dashboard');
export const getBatchPerformance = () => api.get('/api/analytics/batch-performance');
export const resetSeedData = () => api.post('/api/demo/reset-seed');

export default api;
