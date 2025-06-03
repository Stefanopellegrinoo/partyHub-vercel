# PartyHub - Sistema de Gestión de Fiestas y Venta de Entradas

PartyHub es una aplicación web desarrollada con Next.js y TypeScript que permite organizar fiestas y gestionar la venta de entradas mediante vendedores asociados.

## Características

- **Autenticación de usuarios**: Registro, inicio de sesión y recuperación de contraseña
- **Gestión de fiestas**: Crear y unirse a fiestas mediante códigos de invitación
- **Sistema de tandas de entradas**: Configuración de diferentes categorías y precios
- **Reservas temporales**: Sistema de reserva de entradas con tiempo limitado (5 minutos)
- **Panel de vendedor**: Interfaz para reservar y confirmar ventas de entradas
- **Reportes y estadísticas**: Visualización de ventas por tanda y por vendedor
- **Actualizaciones en tiempo real**: Notificaciones y cambios de stock mediante WebSockets

## Tecnologías utilizadas

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Estado y formularios**: React Hook Form, Zod, Context API
- **Comunicación**: Axios, Socket.IO
- **Visualización de datos**: Recharts
- **Mock API**: json-server

## Estructura del proyecto

\`\`\`
/app                → Rutas y layouts de Next.js (App Router)
/components         → Componentes reutilizables
/context            → Contextos globales (auth, socket)
/hooks              → Custom hooks
/services           → Servicios de API
/types              → Tipos de TypeScript
/mock-api           → Servidor API de prueba
\`\`\`

## Instalación y ejecución

1. Clona el repositorio
2. Instala las dependencias:
   \`\`\`bash
   npm install
   \`\`\`
3. Inicia el servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Inicia el servidor mock API en otra terminal:
   \`\`\`bash
   npm run mock-api
   \`\`\`

## Variables de entorno

Crea un archivo `.env.local` con las siguientes variables:

\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

## Usuarios de prueba

- **Usuario regular**:
  - Email: test@example.com
  - Contraseña: password123

- **Administrador**:
  - Email: admin@example.com
  - Contraseña: admin123
