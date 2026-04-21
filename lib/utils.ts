import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  if (!date) return "---"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    const d = dateObj.getDate().toString().padStart(2, '0');
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const y = dateObj.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  } catch (error) {
    return "---"
  }
}

export function formatDateTime(date: string | Date): string {
  if (!date) return "---"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    const d = dateObj.getDate().toString().padStart(2, '0');
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const y = dateObj.getFullYear().toString().slice(-2);
    const hour = dateObj.getHours().toString().padStart(2, '0');
    const min = dateObj.getMinutes().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${hour}:${min}`;
  } catch (error) {
    return "---"
  }
}

/**
 * Verifica si la fecha de la fiesta es estrictamente anterior a hoy.
 * Si la fiesta es HOY (independientemente de la hora), devuelve false (no ha pasado).
 */
export function isPartyPast(partyDate: string | Date): boolean {
  if (!partyDate) return false;
  const party = new Date(partyDate);
  party.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return party < today;
}

export function generateRandomCode(length = 6): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export function calculateTimeLeft(expiryDate: Date | string | number): number {
  const now = new Date().getTime()
  const expiry = new Date(expiryDate).getTime()
  const difference = expiry - now
  return Math.max(0, Math.floor(difference / 1000))
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getInitials(name: string): string {
  if (!name) return "?"

  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export function generateQRValue(ticketId: string, eventId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || "https://partyhub.com"}/verify/${eventId}/${ticketId}`
}

export function getRandomColor(): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function calculateTicketStats(sold: number, total: number) {
  const percentage = total > 0 ? Math.round((sold / total) * 100) : 0
  const remaining = total - sold

  return {
    sold,
    total,
    remaining,
    percentage,
  }
}

// Reemplazar la función getLocalStorage actual con esta versión más robusta
export function getLocalStorage<T>(key: string, defaultValue: string): string {
  if (typeof window === "undefined") return defaultValue

  try {
    const item = window.localStorage.getItem(key)

    // Si el item es null o undefined, retornar el valor por defecto
    if (item === null || item === undefined) {
      return defaultValue
    }

    // Intentar parsear el JSON, pero con manejo de errores adicional
    try {
      // Para valores que no son JSON válidos
      return item as string
    } catch (parseError) {
      console.warn(`Error parsing JSON for key "${key}":`, parseError)
      // Si no se puede parsear, devolver el valor como string si es compatible con T
      // o el valor por defecto en caso contrario
      return (typeof defaultValue === "string" ? item : defaultValue) as string
    }
  } catch (error) {
    console.error(`Error accessing localStorage key "${key}":`, error)
    return defaultValue
  }
}

export function setLocalStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, value); // ✅ ya es string
  } catch (error) {
    console.warn("Error setting localStorage:", error);
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
  }
}
