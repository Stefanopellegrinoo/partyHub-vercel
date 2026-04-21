import type { User, AuthResponse } from "@/types/user"
import { api } from "@/lib/axios"
import axios from "axios";

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", { identifier, password })
    return response
  } catch (error) {
    console.error("Error during login:", error)
    throw error
  }
}

export async function register(name: string, username: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/register", {
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password
    });
    return response
  } catch (error) {
    if (axios.isCancel(error)) {
      console.warn("🚫 Solicitud cancelada por el usuario o por timeout.");
    } else if (axios.isAxiosError(error)) {
      console.error("❌ Error en Axios:", error.message);
    } else {
      console.error("❗ Error inesperado:", error);
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout")
  } catch (error) {
    console.error("Error during logout:", error)
  }
}

export async function getUser(): Promise<User> {
  try {
    const response = await api.get<User>(`/auth/me`)
    return response
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

export async function refreshToken(): Promise<AuthResponse | null> {
  try {
    const response = await api.post("/auth/refresh-token", {
      refreshToken: localStorage.getItem("refreshToken"),
    });
    return response
  } catch (error) {
    console.error("Error refreshing token:", error)
    return null
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await api.post("/auth/forgot-password", { email })
  } catch (error) {
    console.error("Error requesting password reset:", error)
    throw error
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  try {
    await api.post("/auth/reset-password", { token, password })
  } catch (error) {
    console.error("Error resetting password:", error)
    throw error
  }
}

export async function verifyEmail(token: string): Promise<void> {
  try {
    await api.post("/auth/verify-email", { token })
  } catch (error) {
    console.error("Error verifying email:", error)
    throw error
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    await api.post("/auth/change-password", { currentPassword, newPassword })
  } catch (error) {
    console.error("Error changing password:", error)
    throw error
  }
}

export async function updateProfile(data: any): Promise<User> {
  try {
    const response = await api.patch<User>("/auth/profile", data)
    return response
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}