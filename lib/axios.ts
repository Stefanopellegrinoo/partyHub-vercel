import { refreshToken } from "@/services/auth-service";
import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios"

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== "undefined") {
    // Usamos el protocolo actual (https: o http:) para evitar Mixed Content
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Si estamos en localhost, mantenemos el puerto 3055
    if (hostname === "localhost") return "http://localhost:3055";
    
    // En producción, intentamos pegarle al mismo dominio pero al puerto del Gateway
    // OJO: Esto asume que el backend está mapeado o accesible vía HTTPS
    return `${protocol}//${hostname}:3055`;
  }
  return "http://localhost:3055";
}

// Create a base URL that works in both development and production
export const baseURL = getBaseUrl();

const instance = axios.create({
  baseURL,
  withCredentials: true,

})

// Modificar el interceptor de solicitud para un manejo más robusto del token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  // Prevenir que mande la string "undefined" o "null" literal
  if (token && token !== "undefined" && token !== "null") {
    console.log("📦 Token enviado:", token.substring(0, 15) + "..."); // Solo imprimir el principio por seguridad
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
