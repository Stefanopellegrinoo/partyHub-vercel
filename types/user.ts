export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatar?: string
  phone?: string
  bio?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
  isVerified: boolean
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system"
  emailNotifications: boolean
  pushNotifications: boolean
  newParty: boolean
  ticketSales: boolean
  reservationExpiration: boolean
  marketingEmails: boolean
}

export interface AuthResponse {
  accessT(arg0: string, accessT: any): unknown
  refreshToken(arg0: string, refreshToken: any): unknown
  accessToken(arg0: string, accessToken: any): unknown
  user: User
  token: string
  expiresAt: string
}

export interface UserStats {
  totalParties: number
  partiesOrganized: number
  partiesJoined: number
  ticketsSold: number
  totalRevenue: number
}

export interface UserSession {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  expiresAt: string | null
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordReset {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UserProfileUpdate {
  name?: string
  email?: string
  phone?: string
  bio?: string
  avatar?: File | null
}

export interface UserNotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  newParty: boolean
  ticketSales: boolean
  reservationExpiration: boolean
  marketingEmails: boolean
}
