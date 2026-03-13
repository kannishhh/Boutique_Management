import {
  API_BASE_URL,
  API_ENDPOINTS,
  HTTP_STATUS,
} from "../constants/api.constants";
import { buildApiUrl } from "../api/baseUrl";

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  getAuthToken() {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("auth_token")
    );
  }

  buildHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.error || data?.message || "An error occurred";

      if (status === HTTP_STATUS.UNAUTHORIZED) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }

      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(error.message || "Request failed");
    }
  }

  async get(endpoint, params = {}) {
    try {
      const url = new URL(
        buildApiUrl(endpoint),
        typeof window !== "undefined" ? window.location.origin : "http://localhost",
      );
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key]),
      );

      const response = await fetch(url, {
        method: "GET",
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: "PUT",
        headers: this.buildHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  async patch(endpoint, data = {}) {
    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: "PATCH",
        headers: this.buildHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method: "DELETE",
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadFile(endpoint, file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(buildApiUrl(endpoint), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const apiClient = new APIClient();
