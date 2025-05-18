"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AccessDeniedMessageProps {
  message?: string;
  redirectPath?: string;
  redirectLabel?: string;
}

/**
 * Componente para mostrar mensaje de acceso denegado con opción de redirección
 */
export function AccessDeniedMessage({
  message = "No tiene permisos para acceder a esta sección. Esta área está restringida al departamento correspondiente.",
  redirectPath = "/dashboard",
  redirectLabel = "Volver al inicio",
}: AccessDeniedMessageProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-6">
          {message}
        </p>
        <Button 
          variant="default" 
          onClick={() => router.push(redirectPath)}
        >
          {redirectLabel}
        </Button>
      </div>
    </div>
  );
}

