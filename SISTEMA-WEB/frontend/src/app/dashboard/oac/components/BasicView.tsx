import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BasicView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mis Solicitudes */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Mis Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Ver solicitudes activas</li>
                  <li>Historial de solicitudes</li>
                  <li>Estado de trámites</li>
                </ul>
              </div>
              <Button className="w-full" variant="outline">
                Ver mis solicitudes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nueva Solicitud */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Nueva Solicitud</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Crear nueva solicitud</li>
                  <li>Subir documentos</li>
                  <li>Consultar requisitos</li>
                </ul>
              </div>
              <Button className="w-full" variant="outline">
                Crear solicitud
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información y Ayuda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Información y Ayuda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Guías y Tutoriales</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Cómo realizar una solicitud</li>
                  <li>Documentos requeridos</li>
                  <li>Preguntas frecuentes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Soporte</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Centro de ayuda</li>
                  <li>Contacto de soporte</li>
                  <li>Reportar problemas</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

