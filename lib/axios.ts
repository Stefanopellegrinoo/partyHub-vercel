import { refreshToken } from "@/services/auth-service";
import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios"

// Create a base URL that works in both development and production
// const baseURL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   (typeof window !== "undefined" && window.location.origin) ||
//   "http://localhost:3003/api"

export const baseURL =
  "https://party.fratellipastas.com"
// como no tengo url propia hay que tirar por consola
// cloudflared tunnel --url http://localhost:3000
// cloudflared tunnel --url http://localhost:3000 --loglevel debug
// va a generar una nueva url 
// const baseURL =
//   "https://pichunter-cardiovascular-revelation-stupid.trycloudflare.com"

const instance = axios.create({
  baseURL,
  withCredentials: true,

})

// Modificar el interceptor de solicitud para un manejo más robusto del token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    console.log("📦 Token enviado:", token); // Verificá que esto se imprima
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Request-Time"] = new Date().toISOString();

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Si es 401 y no se reintentó aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Hacer request a refresh
        const refreshResponse = await refreshToken()

        const newAccessToken = refreshResponse.accessToken;
        if (newAccessToken) {
          // Guardar el nuevo token
          localStorage.setItem("authToken", newAccessToken);
        localStorage.setItem("expiresAt", refreshResponse.expiresAt)
         localStorage.setItem("user", refreshResponse.user)

          // Agregar nuevo token al header del request original
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
          };

          // Reintentar el request original
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // El refresh falló, eliminar token
        localStorage.removeItem("authToken");
        localStorage.removeItem("expiresAt");
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// Helper functions for common API operations
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.get<T, AxiosResponse<T>>(url, config).then((response) => response.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    instance.post<T, AxiosResponse<T>>(url, data, config).then((response) => response.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    instance.put<T, AxiosResponse<T>>(url, data, config).then((response) => response.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    instance.patch<T, AxiosResponse<T>>(url, data, config).then((response) => response.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.delete<T, AxiosResponse<T>>(url, config).then((response) => response.data),
}

export default instance
