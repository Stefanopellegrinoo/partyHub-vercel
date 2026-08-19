"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getUser,
  refreshToken,
} from "@/services/auth-service"
import type { User, UserProfileUpdate, ChangePasswordRequest } from "@/types/user"
import { useRouter, usePathname } from "next/navigation"
import { setLocalStorage, getLocalStorage, removeLocalStorage } from "@/lib/utils"
import { showErrorToast } from "@/lib/error-handler"
import { setSessionCookie, removeSessionCookie } from "@/lib/cookie"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (name: string, username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: UserProfileUpdate) => Promise<void>
  changePassword: (data: ChangePasswordRequest) => Promise<void>
  refreshUserData: () => Promise<void>
  updateUserContext: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if token is expired
  const isTokenExpired = () => {
    const expiresAt = getLocalStorage<string | null>("expiresAt", null)
    if (!expiresAt) return true

    return new Date(expiresAt) <= new Date()
  }

  // Try to refresh the token if it's expired
  const tryRefreshToken = async () => {
    try {
      const response = await refreshToken()
      if (response) {
        setLocalStorage("authToken", response.accessToken)
        setLocalStorage("expiresAt", response.expiresAt)
        setLocalStorage("user", response.user)
        setSessionCookie()

        setUser(response.user)
        setIsAuthenticated(true)
        return true
      }

      return false
    } catch (error) {
      console.error("Error refreshing token:", error)
      return false
    }
  }

  useEffect(() => {
    async function loadUser() {
      try {
        // 💻 Desarrollo sin backend
      
        // 🌐 Modo producción / con backend
        const rawToken = localStorage.getItem("authToken");
        const refreshToken = localStorage.getItem("refreshToken");
    
    
        if (!refreshToken) {
            return null
          }
        // Verificamos expiración del token
        if (isTokenExpired()) {
          const refreshed = await tryRefreshToken();
          
          if (!refreshed) throw new Error("Token expirado y no se pudo refrescar");
        }

        if (!rawToken) {
          throw new Error("No token or user in localStorage");
        }
    
        // Token válido o refrescado. Consultamos al backend para confirmarlo.
        const userData = await getUser(); 
        setUser(userData);
        setIsAuthenticated(true);
        // setLocalStorage("user", userData);
      } catch (error) {
        console.error("🔒 Error al cargar el usuario:", error);
    
        // Limpieza total
        // removeLocalStorage("authToken");
        // removeLocalStorage("refreshToken");
        // removeLocalStorage("expiresAt");
        removeLocalStorage("user");
    
        setUser(null);
        setIsAuthenticated(false);
    
        // Redirigir si la ruta actual no es pública
        // if (pathname && !PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        //   router.push("/login?session=expired");
        // }
      } finally {
        setIsLoading(false);
      }
    }
    

    loadUser()
  }, [pathname, router])

  const login = async (email: string, password: string, remember = false) => {
    try {
      const response = await loginService(email, password)

      // Store auth data
      setLocalStorage("authToken", response.accessToken)
      setLocalStorage("refreshToken", response.refreshToken)
      setLocalStorage("expiresAt", response.expiresAt)
      setSessionCookie()
      
      // Only store user data if remember me is checked
      if (remember) {
        setLocalStorage("user", response.user)
      }

      setUser(response.user)
      setIsAuthenticated(true)

      return response
    } catch (error) {
      showErrorToast(error, "Error de inicio de sesión")
      throw error
    }
  }

  const register = async (name: string, username: string, email: string, password: string) => {
    try {
      const response = await registerService(name, username, email, password)
      return response
    } catch (error) {
      showErrorToast(error, "Error de registro")
      throw error
    }
  }

  const logout = async () => {
    try {
      await logoutService()
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      // Clear local storage
      removeLocalStorage("authToken")
      removeLocalStorage("refreshToken")
      
      removeLocalStorage("expiresAt")
      removeLocalStorage("user")
      removeSessionCookie()

      setUser(null)
      setIsAuthenticated(false)

      // Redirect to login
      router.push("/login")
    }
  }

  const updateProfile = async (data: UserProfileUpdate) => {
    try {
      // This would be implemented in a real auth-service
      // const updatedUser = await updateUserProfile(data)

      // For now, just update the local user
      const updatedUser = {
        ...user,
        ...data,
        updatedAt: new Date().toISOString(),
      } as User

      setUser(updatedUser)
      setLocalStorage("user", updatedUser)

      return updatedUser
    } catch (error) {
      showErrorToast(error, "Error al actualizar perfil")
      throw error
    }
  }

  const changePassword = async (data: ChangePasswordRequest) => {
    try {
      // This would be implemented in a real auth-service
      // await changeUserPassword(data)

      // For now, just simulate a successful password change
      await new Promise((resolve) => setTimeout(resolve, 800))

      return true
    } catch (error) {
      showErrorToast(error, "Error al cambiar contraseña")
      throw error
    }
  }

  const refreshUserData = async () => {
    try {
      const userData = await getUser()
      setUser(userData)
      setLocalStorage("user", userData)
      return userData
    } catch (error) {
      console.error("Error refreshing user data:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUserData,
        updateUserContext: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
