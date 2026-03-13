const BASE_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_URL?.trim() || "http://127.0.0.1:5000";

function buildApiUrl(endpoint) {
  const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export async function apiFetch(endpoint, options = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(buildApiUrl(endpoint), {
      headers,
      ...options,
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }

      throw new Error("Session expired. Please login again.");
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "API Error");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to server (${BASE_URL}). Please check backend is running and CORS allows this origin.`,
      );
    }
    throw error;
  }
}
