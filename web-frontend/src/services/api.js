import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    } else if (error.response?.status === 404) {
      toast.error('Requested resource not found (404 error)')
    } else if (error.response?.status >= 500) {
      toast.error('Server error occurred. Please try again.')
    } else if (error.response?.status >= 400) {
      toast.error(error.response?.data?.error || 'An error occurred. Please try again.')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/me'),
}

// Collection Events API
export const collectionAPI = {
  getAll: (params = {}) => api.get('/api/protected/collection-events', { params }),
  create: (data) => api.post('/api/protected/collection-events', data),
  exportCSV: (params = {}) => api.get('/api/protected/export/collection-events.csv', { 
    params,
    responseType: 'blob'
  }),
}

// Quality Tests API
export const qualityAPI = {
  getAll: (params = {}) => api.get('/api/protected/quality-tests', { params }),
  create: (data) => api.post('/api/protected/quality-tests', data),
  exportCSV: (params = {}) => api.get('/api/protected/export/quality-tests.csv', { 
    params,
    responseType: 'blob'
  }),
}

// Product Batches API
export const batchAPI = {
  get: (batchId) => api.get(`/api/protected/product-batches/${batchId}`),
  create: (data) => api.post('/api/protected/product-batches', data),
  getTraceability: (batchId) => api.get(`/api/protected/traceability/${batchId}`),
}

// Processing Steps API
export const processingAPI = {
  create: (data) => api.post('/api/protected/processing-steps', data),
}

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/api/protected/analytics/dashboard-stats'),
  getRecentActivity: () => api.get('/api/protected/analytics/recent-activity'),
  getMetrics: () => api.get('/api/protected/analytics/metrics'),
  getCollectionSummary: (params = {}) => api.get('/api/protected/analytics/collection-summary', { params }),
}

// Reports API
export const reportsAPI = {
  getCompliance: (params = {}) => api.get('/api/protected/reports/compliance', { params }),
}

// Recalls API
export const recallsAPI = {
  create: (data) => api.post('/api/protected/recalls', data),
  get: (batchId) => api.get(`/api/protected/recalls/${batchId}`),
}

// Permissions API
export const permissionsAPI = {
  getUserPermissions: () => api.get('/api/protected/permissions'),
}

// Public API (no auth required)
export const publicAPI = {
  getHealth: () => api.get('/health'),
  getConfig: () => api.get('/api/config'),
  getOpenAPI: () => api.get('/api/openapi.json'),
}

export default api