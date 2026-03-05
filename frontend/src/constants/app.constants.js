export const APP_CONFIG = {
  NAME: "Boutique Management",
  VERSION: "1.0.0",
  DESCRIPTION: "Complete boutique management solution",
};

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  ACCENT_COLOR: "#C9A961",
};

export const TABLE_CONFIG = {
  ROWS_PER_PAGE: 10,
  MAX_ROWS_PER_PAGE: 50,
};

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif"],
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/gif"],
};

export const TIMERS = {
  NOTIFICATION_REFRESH_INTERVAL: 30000,
  AUTO_LOGOUT_TIME: 60 * 60 * 1000,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
};

export const MESSAGES = {
  CREATED_SUCCESS: "Created successfully",
  UPDATED_SUCCESS: "Updated successfully",
  DELETED_SUCCESS: "Deleted successfully",
  SAVED_SUCCESS: "Saved successfully",

  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  INVALID_INPUT: "Please check your input and try again.",
  UNAUTHORIZED: "Please login to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",

  ARE_YOU_SURE: "Are you sure?",
  ITEM_DELETE_CONFIRM: "This action cannot be undone.",
};

export const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
};

export const ENVIRONMENT = {
  DEV: "development",
  PROD: "production",
  STAGING: "staging",
  CURRENT: import.meta.env.MODE,
};

export const CACHE_DURATIONS = {
  CUSTOMER_LIST: 5 * 60 * 1000,
  ORDER_LIST: 2 * 60 * 1000,
  MEASUREMENTS: 10 * 60 * 1000,
  USER_PROFILE: 60 * 60 * 1000,
  SETTINGS: 60 * 60 * 1000,
};
