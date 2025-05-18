"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AccessDeniedMessage } from "@/components/AccessDeniedMessage";

/**
 * Layout específico para el departamento de Farmacia
 * - Verifica que el usuario pertenezca al departamento de Farmacia
 * - Muestra mensaje de acceso denegado si no tiene permisos
 */
export default function FarmaciaLayout({ children }: { children: ReactNode }) {
  const { userData, loading } = useAuth();
  const [verifyingAccess, setVerifyingAccess] = useState(true);

  useEffect(() => {
    if (!loading) {
      setVerifyingAccess(false);
    }
  }, [loading]);

  // Si está cargando, mostrar pantalla de carga
  if (loading || verifyingAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Verificando acceso...</h2>
          <p className="text-muted-foreground">Por favor espere</p>
        </div>
      </div>
    );
  }

  // Si no tiene permisos, mostrar mensaje de acceso denegado
  if (userData?.department !== 'farmacia') {
    return (
      <AccessDeniedMessage 
        message="No tiene permisos para acceder al área de Farmacia. Esta sección está restringida al personal del departamento de Farmacia."
      />
    );
  }

  // Usuario del departamento correcto: mostrar contenido
  return <>{children}</>;
}

