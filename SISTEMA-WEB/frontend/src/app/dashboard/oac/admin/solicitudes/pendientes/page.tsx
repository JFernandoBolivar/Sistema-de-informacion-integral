"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";

const SolicitudesPendientes = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingRequests = [
    {
      id: "12345",
      solicitante: "José Fernando",
      beneficiario: "Bolivar Hurtado",
      departamento: "Tecnología",
      fecha: new Date().toLocaleDateString(),
      cantidadArticulos: 5,
    },
    {
      id: "12346",
      solicitante: "María González",
      beneficiario: "Carlos Ramírez",
      departamento: "Recursos Humanos",
      fecha: new Date().toLocaleDateString(),
      cantidadArticulos: 3,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <Card className="border-none shadow-none">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Solicitudes Pendientes</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/oac/admin/solicitudes")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {pendingRequests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-md transition-all duration-200 cursor-pointer border border-border/50"
              onClick={() => router.push(`/dashboard/oac/admin/solicitudes/pendientes/${request.id}`)}
            >
              <CardHeader className="relative pb-2">
                <div className="absolute right-6 top-6">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {currentTime}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold">
                  Solicitud #{request.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between md:justify-start md:gap-2">
                    <span className="font-medium text-muted-foreground">Solicitante:</span>
                    <span>{request.solicitante}</span>
                  </div>
                  <div className="flex items-center justify-between md:justify-start md:gap-2">
                    <span className="font-medium text-muted-foreground">Beneficiario:</span>
                    <span>{request.beneficiario}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between md:justify-start md:gap-2">
                    <span className="font-medium text-muted-foreground">Departamento:</span>
                    <span>{request.departamento}</span>
                  </div>
                  <div className="flex items-center justify-between md:justify-start md:gap-2">
                    <span className="font-medium text-muted-foreground">Fecha:</span>
                    <span>{request.fecha}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end pt-2">
                <Badge>
                  {request.cantidadArticulos} artículos
                </Badge>
              </CardFooter>
            </Card>
          ))}

          {pendingRequests.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-muted-foreground">
                  No hay solicitudes pendientes
                </CardTitle>
              </CardHeader>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SolicitudesPendientes;
