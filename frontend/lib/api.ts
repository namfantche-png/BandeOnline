import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Cliente HTTP configurado com interceptors
 */
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisição
 * Adiciona token de autenticação
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de resposta
 * Trata erros e refresh token
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Se token expirou, tenta refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh falhou, faz logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
};

// ============================================
// ADS API
// ============================================

export const adsApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; categoryId?: string; search?: string; city?: string; featured?: boolean }) => {
    const { category, categoryId, ...rest } = params || {};
    return api.get('/ads', { params: { ...rest, categoryId: categoryId ?? category } });
  },
  
  getById: (id: string) => api.get(`/ads/${id}`),
  
  create: (data: FormData) =>
    api.post('/ads', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  
  update: (id: string, data: any) => api.put(`/ads/${id}`, data),
  
  delete: (id: string) => api.delete(`/ads/${id}`),
  
  markAsSold: (id: string) => api.post(`/ads/${id}/sold`),
  
  highlight: (id: string) => api.post(`/ads/${id}/highlight`),
  unhighlight: (id: string) => api.post(`/ads/${id}/unhighlight`),
  
  getMyAds: (params?: { page?: number; limit?: number }) =>
    api.get('/ads/user/my-ads', { params }),

  listByUser: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/users/${userId}/ads`, { params }),
};

// ============================================
// CATEGORIES API
// ============================================

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  
  getById: (id: string) => api.get(`/categories/${id}`),
};

// ============================================
// USERS API
// ============================================

export const usersApi = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  
  updateProfile: (data: any) => api.put('/users/profile', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============================================
// MESSAGES API
// ============================================

export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  
  getConversation: (userId: string) => api.get(`/messages/conversation/${userId}`),
  
  send: (data: { receiverId: string; content: string; adId?: string }) =>
    api.post('/messages', data),
  
  markAsRead: (id: string) => api.post(`/messages/${id}/read`),
  
  getUnread: () => api.get('/messages/unread'),
};

// ============================================
// REVIEWS API
// ============================================

export const reviewsApi = {
  getForUser: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/reviews/user/${userId}`, { params }),
  
  create: (data: { reviewedUserId: string; rating: number; comment?: string; adId?: string }) =>
    api.post('/reviews', data),
  
  getStats: (userId: string) => api.get(`/reviews/stats/${userId}`),
};

// ============================================
// PLANS & SUBSCRIPTIONS API
// ============================================

export const plansApi = {
  getAll: () => api.get('/plans'),
  
  getActive: () => api.get('/subscriptions/active'),
  
  upgrade: (planId: string) => api.post('/subscriptions/upgrade', { planId }),
  
  getLimits: () => api.get('/subscriptions/limits/ads'),
};

// ============================================
// PAYMENTS API
// ============================================

export const paymentsApi = {
  initiate: (data: { planId: string; method: string }) =>
    api.post('/payments/initiate', data),
  
  confirm: (data: { paymentId: string; transactionId: string }) =>
    api.post('/payments/confirm', data),
  
  getHistory: (params?: { page?: number; limit?: number }) =>
    api.get('/payments/history', { params }),
};

// ============================================
// INVOICES API
// ============================================

export const invoicesApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/invoices', { params }),
  
  getById: (id: string) => api.get(`/invoices/${id}`),
  
  getPdf: (id: string) => api.get(`/invoices/${id}/pdf`),
};

// ============================================
// REPORTS API
// ============================================

export const reportsApi = {
  create: (data: { reason: string; description?: string; reportedUserId?: string; reportedAdId?: string }) =>
    api.post('/reports', data),
};

export default api;
