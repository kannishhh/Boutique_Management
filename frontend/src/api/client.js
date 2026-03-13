import { API_BASE_URL, buildApiUrl } from "./baseUrl";

async function parseApiResponse(response, requestUrl) {
  if (response.status === 204) {
    return {};
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return {};
  }

  const preview = rawBody.replace(/\s+/g, " ").slice(0, 120).toLowerCase();

  if (preview.startsWith("<!doctype") || preview.startsWith("<html")) {
    throw new Error(
      `Received HTML instead of JSON from ${requestUrl}. Check the deployed API URL configuration.`,
    );
  }

  throw new Error(
    `Expected JSON from ${requestUrl}, but received ${contentType || "an unknown content type"}.`,
  );
}

export async function apiFetch(endpoint, options = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const requestUrl = buildApiUrl(endpoint);

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(requestUrl, {
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

    const data = await parseApiResponse(res, requestUrl);

    if (!res.ok) {
      throw new Error(data.error || data.message || `API Error (${res.status})`);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to server (${API_BASE_URL}). Please check backend is running and CORS allows this origin.`,
      );
    }
    throw error;
  }
}
