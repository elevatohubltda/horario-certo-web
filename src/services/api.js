import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const isMobileApp = () =>
  typeof navigator !== "undefined" &&
  navigator.userAgent.includes("HorarioCertoApp");

api.interceptors.request.use(
  (config) => {
    if (config.withAuth) {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (isMobileApp() && config.url?.includes("/auth")) {
      config.headers["X-Client-Type"] = "mobile-app";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
