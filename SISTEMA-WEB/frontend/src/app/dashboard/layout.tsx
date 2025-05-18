"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Sidebar } from "@/components/navigation/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout base para todas las rutas bajo /dashboard
 * - Incluye navegación sidebar responsive
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
      console.log("Usuario no autenticado, redirigiendo a la página de inicio");
      router.push("/");
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

  // Usuario autenticado: mostrar layout completo con navegación sidebar
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-grow p-6 pt-16 lg:pt-6 overflow-auto">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
        <footer className="bg-muted/50 p-4 text-center text-sm text-muted-foreground">
          Sistema de Informacion Integral © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
