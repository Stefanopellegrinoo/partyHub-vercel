import * as z from "zod"

// Validation schemas for forms
export const loginSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede tener más de 100 caracteres"),
    email: z.string().min(1, "El correo electrónico es requerido").email("Correo electrónico inválido"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(100, "La contraseña no puede tener más de 100 caracteres"),
    confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida"),
    terms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Correo electrónico inválido"),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(100, "La contraseña no puede tener más de 100 caracteres"),
    confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export const createPartySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  location: z
    .string()
    .min(1, "La ubicación es requerida")
    .min(3, "La ubicación debe tener al menos 3 caracteres")
    .max(200, "La ubicación no puede tener más de 200 caracteres"),
  date: z
    .string()
    .min(1, "La fecha es requerida")
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime()) && date > new Date()
    }, "La fecha debe ser posterior a hoy"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  isPrivate: z.boolean().optional(),
})

export const updatePartySchema = createPartySchema.extend({
  id: z.string().min(1, "El ID de la fiesta es requerido"),
})

export const joinPartySchema = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .min(6, "El código debe tener al menos 6 caracteres")
    .max(10, "El código no puede tener más de 10 caracteres"),
})

export const createTicketBatchSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede tener más de 100 caracteres"),
    category: z.string().min(1, "La categoría es requerida"),
    quantity: z.coerce
      .number()
      .int("La cantidad debe ser un número entero")
      .positive("La cantidad debe ser un número positivo")
      .max(10000, "La cantidad no puede ser mayor a 10,000"),
    price: z.coerce
      .number()
      .min(0, "El precio no puede ser negativo")
      .max(1000000, "El precio no puede ser mayor a 1,000,000")
      .transform((val) => Number.parseFloat(val.toFixed(2))),
    startDate: z
      .string()
      .min(1, "La fecha de inicio es requerida")
      .refine((val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      }, "Fecha de inicio inválida"),
    endDate: z
      .string()
      .min(1, "La fecha de fin es requerida")
      .refine((val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      }, "Fecha de fin inválida"),
    description: z.string().max(200, "La descripción no puede tener más de 200 caracteres").optional(),
    color: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      return endDate > startDate
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["endDate"],
    },
  )

export const userProfileSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  email: z.string().min(1, "El correo electrónico es requerido").email("Correo electrónico inválido"),
  bio: z.string().max(160, "La biografía no puede tener más de 160 caracteres").optional().or(z.literal("")),
  phone: z.string().max(20, "El teléfono no puede tener más de 20 caracteres").optional().or(z.literal("")),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(1, "La nueva contraseña es requerida")
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres")
      .max(100, "La nueva contraseña no puede tener más de 100 caracteres"),
    confirmPassword: z.string().min(1, "La confirmación de contraseña es requerida"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  })

export const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  newParty: z.boolean(),
  ticketSales: z.boolean(),
  reservationExpiration: z.boolean(),
  marketingEmails: z.boolean(),
})

export const appearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Por favor selecciona un tema",
  }),
})

export const reserveTicketsSchema = z.object({
  batchId: z.string().min(1, "La tanda es requerida"),
  quantity: z
    .number()
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser un número positivo")
    .max(100, "No puedes reservar más de 100 entradas a la vez"),
})

export const confirmTicketSaleSchema = z.object({
  reservationId: z.string().min(1, "El ID de reserva es requerido"),
  customerName: z
    .string()
    .min(1, "El nombre del cliente es requerido")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .optional(),
  customerEmail: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  customerPhone: z.string().max(20, "El teléfono no puede tener más de 20 caracteres").optional().or(z.literal("")),
  notes: z.string().max(200, "Las notas no pueden tener más de 200 caracteres").optional().or(z.literal("")),
})

export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "El término de búsqueda es requerido")
    .max(100, "El término de búsqueda no puede tener más de 100 caracteres"),
})

export const dateRangeSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})
