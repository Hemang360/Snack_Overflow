import { create } from 'zustand'
import { authAPI } from '../services/api'

// Auth store
export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const response = await authAPI.login(credentials)
      const { user, token, permissions } = response.data
      
      localStorage.setItem('authToken', token)
      set({ 
        user, 
        token, 
        permissions, 
        isAuthenticated: true, 
        isLoading: false 
      })
      
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  },

  logout: async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      set({ 
        user: null, 
        token: null, 
        permissions: [], 
        isAuthenticated: false 
      })
    }
  },

  refreshProfile: async () => {
    try {
      const response = await authAPI.getProfile()
      const { user, permissions } = response.data
      set({ user, permissions })
    } catch (error) {
      console.error('Profile refresh error:', error)
      get().logout()
    }
  },

  hasPermission: (permission) => {
    const { permissions } = get()
    return permissions.some(p => p.permission === permission)
  },

  // Initialize from localStorage on app start
  initializeAuth: () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      set({ token, isAuthenticated: true })
      // Optionally refresh profile here
    }
  },
}))

// App store for global state
export const useAppStore = create((set, get) => ({
  // UI state
  sidebarOpen: false,
  theme: 'light',
  notifications: [],

  // Data cache
  dashboardStats: null,
  recentActivity: [],
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  
  addNotification: (notification) => {
    const id = Date.now()
    set(state => ({ 
      notifications: [...state.notifications, { ...notification, id }] 
    }))
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      set(state => ({ 
        notifications: state.notifications.filter(n => n.id !== id) 
      }))
    }, 5000)
  },
  
  removeNotification: (id) => {
    set(state => ({ 
      notifications: state.notifications.filter(n => n.id !== id) 
    }))
  },
  
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  setRecentActivity: (activity) => set({ recentActivity: activity }),
}))

// QR Scanner store
export const useQRStore = create((set) => ({
  scannedData: null,
  scanHistory: [],
  isScanning: false,
  
  setScannedData: (data) => set({ scannedData: data }),
  setIsScanning: (scanning) => set({ isScanning: scanning }),
  
  addToHistory: (data) => {
    set(state => {
      const newHistory = [data, ...state.scanHistory.slice(0, 9)] // Keep last 10
      return { scanHistory: newHistory }
    })
  },
  
  clearHistory: () => set({ scanHistory: [] }),
}))

// Product store for traceability data
export const useProductStore = create((set) => ({
  currentProduct: null,
  traceabilityData: null,
  isLoading: false,
  
  setCurrentProduct: (product) => set({ currentProduct: product }),
  setTraceabilityData: (data) => set({ traceabilityData: data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  clearProduct: () => set({ 
    currentProduct: null, 
    traceabilityData: null 
  }),
}))