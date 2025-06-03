import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Calendar, CreditCard, Users, Shield, BarChart } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">PartyHub</h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Organiza tus fiestas y gestiona la venta de entradas de forma sencilla y eficiente. La plataforma
                    completa para organizadores de eventos.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">Iniciar sesión</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/register">
                      Crear cuenta
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-[350px] md:h-[420px] lg:h-[450px] overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 p-4">
                  <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=800')] bg-cover bg-center opacity-50"></div>
                  <div className="relative z-10 flex h-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm p-6 text-center shadow-lg">
                    <Calendar className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-bold">Gestión de Eventos</h3>
                    <p className="text-gray-500 mt-2">Crea y administra tus fiestas con facilidad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Características principales</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Todo lo que necesitas para organizar eventos exitosos y gestionar tus ventas de entradas
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Calendar className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Gestión de Eventos</h3>
                <p className="text-center text-gray-500">Crea y administra tus fiestas con facilidad</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <CreditCard className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Venta de Entradas</h3>
                <p className="text-center text-gray-500">Configura diferentes tandas y precios para tus entradas</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Users className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Equipo de Ventas</h3>
                <p className="text-center text-gray-500">Invita a vendedores y gestiona sus permisos</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <BarChart className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Reportes y Estadísticas</h3>
                <p className="text-center text-gray-500">Analiza tus ventas y el rendimiento de tus eventos</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Shield className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Seguridad</h3>
                <p className="text-center text-gray-500">Control de acceso y verificación de entradas</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <ArrowRight className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Tiempo Real</h3>
                <p className="text-center text-gray-500">Actualizaciones instantáneas de ventas y reservas</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Comienza a organizar tus eventos hoy mismo
                </h2>
                <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                  Regístrate gratis y descubre cómo PartyHub puede ayudarte a gestionar tus eventos de manera eficiente
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/register">Crear cuenta gratuita</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-white border-t">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">PartyHub</h3>
              <p className="text-sm text-gray-500">
                La plataforma completa para la gestión de eventos y venta de entradas.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Enlaces</h3>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>
                  <Link href="/login" className="hover:underline">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:underline">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Soporte</h3>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>
                  <Link href="#" className="hover:underline">
                    Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>
                  <Link href="#" className="hover:underline">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PartyHub. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
