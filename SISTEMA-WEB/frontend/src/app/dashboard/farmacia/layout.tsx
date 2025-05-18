"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

/**
 * Layout específico para el departamento de Farmacia
 * - Verifica que el usuario pertenezca al departamento de Farmacia
 * - Redirige a /dashboard si no tiene permisos
 */
export default function FarmaciaLayout({ children }: { children: ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userData?.department !== 'farmacia') {
      console.log('No tiene acceso al departamento de Farmacia');
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  // Mientras se valida o si no tiene permisos, no mostrar nada
  if (loading || userData?.department !== 'farmacia') return null;

  // Usuario del departamento correcto: mostrar contenido
  return <>{children}</>;
}

