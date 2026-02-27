const BASE_URL = import.meta.env.VITE_API_URL;

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
    const res = await fetch(`${BASE_URL}${endpoint}`, {
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
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to server. Please check if the backend is running.",
      );
    }
    throw error;
  }
}
