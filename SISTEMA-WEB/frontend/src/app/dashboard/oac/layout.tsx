"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

/**
 * Layout específico para el departamento OAC
 * - Verifica que el usuario pertenezca al departamento OAC
 * - Redirige a /dashboard si no tiene permisos
 */
export default function OACLayout({ children }: { children: ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userData?.department !== 'oac') {
      console.log('No tiene acceso al departamento OAC');
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  // Mientras se valida o si no tiene permisos, no mostrar nada
  if (loading || userData?.department !== 'oac') return null;

  // Usuario del departamento correcto: mostrar contenido
  return <>{children}</>;
}

