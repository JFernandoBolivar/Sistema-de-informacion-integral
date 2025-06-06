"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RegisterUserForm } from "@/components/auth/RegisterUserForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterOACUserPage() {
  const router = useRouter();
  const { isAdmin, userData, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // Verificar si el usuario tiene acceso a esta página
  useEffect(() => {
    if (!loading) {
      const isOACAdmin = (userData?.status === 'admin' || userData?.status === 'superAdmin') && 
                       userData?.department === 'oac';
      setHasAccess(isOACAdmin);
      
      // Redirigir si no tiene permisos
      if (!isOACAdmin && !loading) {
        console.log('No tiene permisos para registrar usuarios de OAC');
        router.push('/dashboard/oac');
      }
    }
  }, [userData, loading, router]);

  // Navegación de regreso
  const handleBack = () => {
    router.push('/dashboard/oac/admin');
  };

  // Si está cargando o no tiene acceso, mostrar mensaje
  if (loading || !hasAccess) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Verificando permisos...</h1>
          <p className="text-muted-foreground">
            Por favor espere mientras verificamos sus credenciales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al panel</span>
        </Button>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Registro de Usuarios OAC</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Registra nuevos usuarios básicos para el departamento de Organización y Administración Comunitaria
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <RegisterUserForm 
          department="oac" 
          onSuccess={() => {
            // Opcional: Puedes implementar alguna acción adicional al registrar exitosamente
            console.log('Usuario OAC registrado exitosamente');
          }} 
        />
      </div>
    </div>
  );
}

