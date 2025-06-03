import { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"

interface ErrorResponse {
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export function handleApiError(error: unknown, defaultMessage = "Ha ocurrido un error inesperado"): string {
  console.error("API Error:", error)

  // Handle Axios errors
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined

    // Handle validation errors
    if (data?.errors && Object.keys(data.errors).length > 0) {
      const firstErrorField = Object.keys(data.errors)[0]
      const firstErrorMessage = data.errors[firstErrorField][0]
      return `Error de validación: ${firstErrorMessage}`
    }

    // Handle error message from API
    if (data?.message) {
      return data.message
    }

    if (data?.error) {
      return data.error
    }

    // Handle common HTTP errors
    switch (error.response?.status) {
      case 400:
        return "Solicitud incorrecta. Por favor, verifica los datos enviados."
      case 401:
        return "No autorizado. Por favor, inicia sesión nuevamente."
      case 403:
        return "Acceso denegado. No tienes permisos para realizar esta acción."
      case 404:
        return "Recurso no encontrado."
      case 409:
        return "Conflicto con el estado actual del recurso."
      case 422:
        return "Datos de entrada inválidos."
      case 429:
        return "Demasiadas solicitudes. Por favor, intenta más tarde."
      case 500:
        return "Error del servidor. Por favor, intenta más tarde."
      default:
        return `Error de red: ${error.message}`
    }
  }

  // Handle standard errors
  if (error instanceof Error) {
    return error.message
  }

  // Handle unknown errors
  return defaultMessage
}

export function showErrorToast(error: unknown, title = "Error"): void {
  const message = handleApiError(error)

  toast({
    title,
    description: message,
    variant: "destructive",
  })
}

export function logError(error: unknown, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  console.error(`[${context || "Error"}]`, errorMessage)

  if (errorStack) {
    console.error(errorStack)
  }

  // Here you could also send the error to a monitoring service like Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   captureException(error)
  // }
}

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code = "APP_ERROR", statusCode = 400) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCode

    // This is needed for instanceof to work correctly
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class AuthError extends AppError {
  constructor(message = "Error de autenticación") {
    super(message, "AUTH_ERROR", 401)
    this.name = "AuthError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso denegado") {
    super(message, "FORBIDDEN", 403)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, "NOT_FOUND", 404)
    this.name = "NotFoundError"
  }
}
