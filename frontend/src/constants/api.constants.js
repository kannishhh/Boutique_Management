
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';


export const API_ENDPOINTS = {
  
  LOGIN: '/login',
  LOGOUT: '/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  GET_CURRENT_USER: '/auth/me',


  GET_CUSTOMERS: '/customers',
  CREATE_CUSTOMER: '/customers',
  UPDATE_CUSTOMER: (id) => `/customers/${id}`,
  DELETE_CUSTOMER: (id) => `/customers/${id}`,
  GET_CUSTOMER_MEASUREMENTS: (id) => `/customers/${id}/measurements`,


  GET_ORDERS: '/orders',
  CREATE_ORDER: '/orders',
  UPDATE_ORDER: (id) => `/orders/${id}`,
  DELETE_ORDER: (id) => `/orders/${id}`,
  UPDATE_ORDER_STATUS: (id) => `/orders/${id}/status`,
  UPDATE_ORDER_PAYMENT: (id) => `/orders/${id}/payment`,
  GET_BILL: (id) => `/bill/${id}`,
  GET_DUE_ORDERS: '/orders/due',

  
  ADD_PAYMENT: (id) => `/orders/${id}/payments`,
  GET_PAYMENTS: (id) => `/orders/${id}/payments`,

  
  GET_MEASUREMENTS: '/measurements',
  CREATE_MEASUREMENT: '/measurements',
  UPDATE_MEASUREMENT: (id) => `/measurements/${id}`,
  DELETE_MEASUREMENT: (id) => `/measurements/${id}`,
  GET_MEASUREMENT_TEMPLATES: '/api/templates',

 
  GET_DASHBOARD_STATS: '/dashboard/stats',
  GET_REVENUE_DASHBOARD: '/dashboard/revenue',
  GET_DAILY_REPORT: '/reports/daily',
  GET_EARNINGS_REPORT: '/reports/earnings',
  EXPORT_ORDERS: '/reports/export/orders',

  
  GET_CALENDAR_ORDERS: '/calendar/orders',


  GET_SETTINGS: '/settings',
  UPDATE_PROFILE: '/settings/profile',
  UPDATE_BOUTIQUE: '/settings/boutique',
  UPDATE_NOTIFICATIONS: '/settings/notifications',
  UPDATE_APPEARANCE: '/settings/appearance',
  CHANGE_PASSWORD: '/settings/change-password',
  UPLOAD_PROFILE_PICTURE: '/settings/upload/profile',

  
  GET_NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/mark-all',

  
  GENERATE_REMINDERS: '/reminders/generate',

  
  GET_PROFILE_IMAGE: (filename) => `/uploads/profile/${filename}`,
};


export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};


export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};


export const ORDER_STATUSES = [
  'PENDING',
  'CUTTING',
  'STITCHING',
  'TRIAL',
  'READY',
  'DELIVERED',
];


export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
};


export const VALIDATION_RULES = {
  MOBILE_REGEX: /^\d{10}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DATE_FORMAT: 'DD-MM-YYYY',
};


export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  RECENT_CUSTOMERS: 'recent_customers',
};


export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};


export const DATE_FORMATS = {
  DISPLAY: 'DD-MM-YYYY',
  ISO: 'YYYY-MM-DD',
};


export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
};


export const EMPTY_STATES = {
  NO_CUSTOMERS: 'No customers found',
  NO_ORDERS: 'No orders found',
  NO_MEASUREMENTS: 'No measurements found',
  NO_NOTIFICATIONS: 'No notifications',
};


export const FEATURES = {
  ENABLE_ANALYTICS: true,
  ENABLE_REPORTS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_REMINDERS: true,
};
