import type { User, AuthResponse } from "@/types/user"
import { api } from "@/lib/axios"
import axios from "axios";
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    // In development without API, return mock data
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay

      // Mock response
      const mockResponse: AuthResponse = {
        user: {
          id: "mock-user-id",
          name: "Usuario de Prueba",
          email,
          role: "user",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        token: "mock-jwt-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      }

      return mockResponse
    }

    const response = await api.post<AuthResponse>("/auth/login", { email, password })
    return response
  } catch (error) {
    console.error("Error during login:", error)
    throw error
  }
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    // In development without API, return mock data
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay

      // Mock response
      const mockResponse: AuthResponse = {
        user: {
          id: "mock-user-id",
          name,
          email,
          role: "user",
          isVerified: false, // New users need to verify email
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        token: "mock-jwt-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      }

      return mockResponse
    }
      console.log(name, email, password)

      const response = await api.post<AuthResponse>("/auth/register", {
        name: name.trim(),
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
    // In development without API, just return
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate API delay
      return
    }

    await api.post("/auth/logout")
  } catch (error) {
    console.error("Error during logout:", error)
    // Still proceed with local logout even if API call fails
  }
}

export async function getUser(): Promise<User> {
  try {
    // In development without API, return mock data
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay

      // Mock user
      const mockUser: User = {
        id: "mock-user-id",
        name: "Usuario de Prueba",
        email: "test@example.com",
        role: "user",
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      return mockUser
    }
  
     const  refreshToken =  localStorage.getItem("refreshToken")// o donde lo tengas guardado
  
    const response = await api.get<User>(`/auth/me`)
    return response
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

export async function refreshToken(): Promise<AuthResponse | null> {
  try {
    // In development without API, return mock data
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay

      // Mock response
      const mockResponse: AuthResponse = {
        user: {
          id: "mock-user-id",
          name: "Usuario de Prueba",
          email: "test@example.com",
          role: "user",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        token: "mock-jwt-token-refreshed",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      }

      return mockResponse
    }

    const response = await api.post("/auth/refresh-token", {
      refreshToken: localStorage.getItem("refreshToken"), // o donde lo tengas guardado
    });
    return response
  } catch (error) {
    console.error("Error refreshing token:", error)
    return null
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    // In development without API, just return
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay
      return
    }

    await api.post("/auth/forgot-password", { email })
  } catch (error) {
    console.error("Error requesting password reset:", error)
    throw error
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  try {
    // In development without API, just return
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay
      return
    }

    await api.post("/auth/reset-password", { token, password })
  } catch (error) {
    console.error("Error resetting password:", error)
    throw error
  }
}

export async function verifyEmail(token: string): Promise<void> {
  try {
    // In development without API, just return
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay
      return
    }

    await api.post("/auth/verify-email", { token })
  } catch (error) {
    console.error("Error verifying email:", error)
    throw error
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    // In development without API, just return
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay
      return
    }

    await api.post("/auth/change-password", { currentPassword, newPassword })
  } catch (error) {
    console.error("Error changing password:", error)
    throw error
  }
}

export async function updateProfile(data: any): Promise<User> {
  try {
    // In development without API, return mock data
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay

      // Mock updated user
      const mockUser: User = {
        id: "mock-user-id",
        name: data.name || "Usuario de Prueba",
        email: data.email || "test@example.com",
        role: "user",
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        bio: data.bio,
        phone: data.phone,
      }

      return mockUser
    }

    const response = await api.put<User>("/auth/profile", data)
    return response
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}
