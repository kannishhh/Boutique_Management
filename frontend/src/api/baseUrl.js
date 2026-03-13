const DEFAULT_RENDER_API_URL = "https://boutique-api-0sog.onrender.com";

function normalizeBaseUrl(value) {
  return value?.trim().replace(/\/+$/, "") || "";
}

function isRenderHosted() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.location.hostname.endsWith("onrender.com");
}

function isSameOrigin(value) {
  if (!value || typeof window === "undefined") {
    return false;
  }

  try {
    return new URL(value, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function getApiBaseUrl() {
  const envApiUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);

  if (import.meta.env.DEV) {
    return "/api";
  }

  if (envApiUrl && !(isRenderHosted() && isSameOrigin(envApiUrl))) {
    return envApiUrl;
  }

  if (isRenderHosted()) {
    return DEFAULT_RENDER_API_URL;
  }

  if (envApiUrl) {
    return envApiUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_RENDER_API_URL;
}

export const API_BASE_URL = getApiBaseUrl();

export function buildApiUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
}

export function buildUploadUrl(path) {
  return buildApiUrl(path);
}