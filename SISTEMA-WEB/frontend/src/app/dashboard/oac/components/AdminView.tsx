import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminView() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solicitudes */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Gestión de Solicitudes</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Solicitudes pendientes</li>
                  <li>Aprobación de solicitudes</li>
                  <li>Historial de trámites</li>
                </ul>
              </div>
              <div className="pt-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push("/dashboard/oac/solicitudes")}
                >
                  Ir a Solicitudes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Admin Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Herramientas Administrativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Reportes diarios</li>
                  <li>Métricas de rendimiento</li>
                  <li>Análisis de datos</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Gestión de permisos</li>
                  <li>Registro de actividades</li>
                  <li>Control de acceso</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuración</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Parámetros del sistema</li>
                  <li>Respaldos</li>
                  <li>Notificaciones</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
