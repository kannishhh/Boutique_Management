import { apiClient } from './api.service';
import { buildApiUrl } from '../api/baseUrl';
import { API_ENDPOINTS } from '../constants/api.constants';

export const authService = {
  login: async (username, password) => {
    return apiClient.post(API_ENDPOINTS.LOGIN, { username, password });
  },

  logout: async () => {
    return apiClient.post(API_ENDPOINTS.LOGOUT);
  },

  getCurrentUser: async () => {
    return apiClient.get(API_ENDPOINTS.GET_CURRENT_USER);
  },

  forgotPassword: async (username) => {
    return apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { username });
  },

  resetPassword: async (token, password) => {
    return apiClient.post(API_ENDPOINTS.RESET_PASSWORD, { token, password });
  },
};


export const customerService = {
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.GET_CUSTOMERS, params);
  },

  create: async (data) => {
    return apiClient.post(API_ENDPOINTS.CREATE_CUSTOMER, data);
  },

  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.UPDATE_CUSTOMER(id), data);
  },

  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.DELETE_CUSTOMER(id));
  },

  getMeasurements: async (id) => {
    return apiClient.get(API_ENDPOINTS.GET_CUSTOMER_MEASUREMENTS(id));
  },
};


export const orderService = {
  getAll: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.GET_ORDERS, params);
  },

  create: async (data) => {
    return apiClient.post(API_ENDPOINTS.CREATE_ORDER, data);
  },

  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.UPDATE_ORDER(id), data);
  },

  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.DELETE_ORDER(id));
  },

  updateStatus: async (id, status) => {
    return apiClient.patch(API_ENDPOINTS.UPDATE_ORDER_STATUS(id), { status });
  },

  updatePayment: async (id, data) => {
    return apiClient.patch(API_ENDPOINTS.UPDATE_ORDER_PAYMENT(id), data);
  },

  getBill: async (id) => {
    return apiClient.get(API_ENDPOINTS.GET_BILL(id));
  },

  getDueOrders: async () => {
    return apiClient.get(API_ENDPOINTS.GET_DUE_ORDERS);
  },
};


export const paymentService = {
  add: async (orderId, data) => {
    return apiClient.post(API_ENDPOINTS.ADD_PAYMENT(orderId), data);
  },

  getByOrder: async (orderId) => {
    return apiClient.get(API_ENDPOINTS.GET_PAYMENTS(orderId));
  },
};


export const measurementService = {
  getAll: async () => {
    return apiClient.get(API_ENDPOINTS.GET_MEASUREMENTS);
  },

  create: async (data) => {
    return apiClient.post(API_ENDPOINTS.CREATE_MEASUREMENT, data);
  },

  update: async (id, data) => {
    return apiClient.put(API_ENDPOINTS.UPDATE_MEASUREMENT(id), data);
  },

  delete: async (id) => {
    return apiClient.delete(API_ENDPOINTS.DELETE_MEASUREMENT(id));
  },

  getTemplates: async () => {
    return apiClient.get(API_ENDPOINTS.GET_MEASUREMENT_TEMPLATES);
  },
};


export const dashboardService = {
  getStats: async () => {
    return apiClient.get(API_ENDPOINTS.GET_DASHBOARD_STATS);
  },

  getRevenueData: async () => {
    return apiClient.get(API_ENDPOINTS.GET_REVENUE_DASHBOARD);
  },

  getDailyReport: async () => {
    return apiClient.get(API_ENDPOINTS.GET_DAILY_REPORT);
  },

  getEarningsReport: async () => {
    return apiClient.get(API_ENDPOINTS.GET_EARNINGS_REPORT);
  },

  exportOrders: async () => {
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('auth_token');
    window.location.href = buildApiUrl(
      `${API_ENDPOINTS.EXPORT_ORDERS}?token=${token}`,
    );
  },
};


export const calendarService = {
  getOrders: async () => {
    return apiClient.get(API_ENDPOINTS.GET_CALENDAR_ORDERS);
  },
};


export const settingsService = {
  get: async () => {
    return apiClient.get(API_ENDPOINTS.GET_SETTINGS);
  },

  updateProfile: async (data) => {
    return apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, data);
  },

  updateBoutique: async (data) => {
    return apiClient.put(API_ENDPOINTS.UPDATE_BOUTIQUE, data);
  },

  updateNotifications: async (data) => {
    return apiClient.put(API_ENDPOINTS.UPDATE_NOTIFICATIONS, data);
  },

  updateAppearance: async (data) => {
    return apiClient.put(API_ENDPOINTS.UPDATE_APPEARANCE, data);
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiClient.put(API_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  uploadProfilePicture: async (file) => {
    return apiClient.uploadFile(API_ENDPOINTS.UPLOAD_PROFILE_PICTURE, file);
  },
};


export const notificationService = {
  getAll: async () => {
    return apiClient.get(API_ENDPOINTS.GET_NOTIFICATIONS);
  },

  markAsRead: async (id) => {
    return apiClient.put(API_ENDPOINTS.MARK_NOTIFICATION_READ(id));
  },

  markAllAsRead: async () => {
    return apiClient.put(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
  },
};


export const reminderService = {
  generate: async () => {
    return apiClient.post(API_ENDPOINTS.GENERATE_REMINDERS);
  },
};
