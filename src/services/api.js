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

/**
 * Ponte para o app nativo (React Native WebView): após o usuário conceder a
 * permissão de notificações no dispositivo, o app injeta uma chamada a
 * window.__horarioCertoPushBridge.registerToken(token) — esta função
 * registra o token no backend e ativa as notificações push para a empresa,
 * usando a mesma autenticação (cookie "token") já presente na página.
 */
if (typeof window !== "undefined") {
  window.__horarioCertoPushBridge = {
    registerToken: async (deviceToken) => {
      try {
        const companyUrl = Cookies.get("companyUrl");
        if (!companyUrl || !deviceToken) return;
        await api.post(
          `/push-notifications/register?companyUrl=${companyUrl}`,
          { token: deviceToken },
          { withAuth: true }
        );
        await api.put(
          `/push-notifications/settings?companyUrl=${companyUrl}`,
          { enabled: true },
          { withAuth: true }
        );
      } catch (err) {
        console.error("push bridge registerToken error", err);
      }
    },
  };
}

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
