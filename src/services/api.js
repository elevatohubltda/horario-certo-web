import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "https://teste.elevatohub.com.br/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Apenas adiciona o token se config.withAuth === true
    if (config.withAuth) {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
