"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { MainNav } from "@/components/navigation/MainNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout base para todas las rutas bajo /dashboard
 * - Incluye navegación compartida (MainNav)
 * - Valida autenticación básica
 * - Mantiene estructura flex consistente
 * - Se hereda automáticamente por todas las rutas anidadas
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  // Verificación básica de autenticación
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      console.log('Usuario no autenticado, redirigiendo a la página de inicio');
      router.push('/');
    }
  }, [isLoggedIn, loading, router]);

  // Si está cargando, mostrar pantalla de carga
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Cargando...</h2>
          <p className="text-muted-foreground">Verificando sus credenciales</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (la redirección ocurrirá en el useEffect)
  if (!isLoggedIn && !loading) {
    return null;
  }

  // Usuario autenticado: mostrar layout completo con navegación
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-grow p-6">
        {children}
      </main>
      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-500">
        Sistema de Organización y Administración Comunitaria © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

