"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AccessDeniedMessage } from "@/components/AccessDeniedMessage";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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

  // Verificar que el usuario tenga permisos de admin de OAC
  const hasAccess =
    (userData?.status === "admin" || userData?.status === "superAdmin") &&
    userData?.department === "oac";

  // Si no tiene permisos, mostrar mensaje de acceso denegado
  if (!hasAccess) {
    return (
      <AccessDeniedMessage 
        message="No tiene permisos administrativos para acceder a esta sección. Esta área está restringida a administradores del departamento de OAC."
        redirectPath="/dashboard/oac"
        redirectLabel="Volver al panel de OAC"
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
