import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "") : "") ||
  "http://127.0.0.1:8000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// 🔐 Attach Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 🔄 Auto Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${API_BASE_URL}/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccess = res.data.access;

        localStorage.setItem("access_token", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function logout() {
  localStorage.clear();
  window.location.href = "/";
}

export default api;