
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SolicitudesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Solicitudes</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/oac/admin")}
            >
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => router.push("/dashboard/oac/admin/solicitudes/pendientes")}
            >
              <CardHeader>
                <CardTitle className="text-lg">Solicitudes Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>Nuevas solicitudes</li>
                  <li>En proceso</li>
                  <li>Requieren revisión</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => router.push("/dashboard/oac/admin/solicitudes/aprobadas")}
            >
              <CardHeader>
                <CardTitle className="text-lg">Solicitudes Aprobadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>Últimas aprobaciones</li>
                  <li>En ejecución</li>
                  <li>Completadas</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => router.push("/dashboard/oac/admin/solicitudes/rechazadas")}
            >
              <CardHeader>
                <CardTitle className="text-lg">Solicitudes Rechazadas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>Denegadas</li>
                  <li>Requieren modificación</li>
                  <li>Canceladas</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
