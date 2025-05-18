"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";

interface Persona {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  edad: string;
}

interface RequestData {
  id: string | string[];
  solicitante: Persona;
  beneficiario: Persona;
  articulos: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    estado?: "pendiente" | "aprobado" | "rechazado";
  }>;
  estado?: "pendiente" | "aprobado" | "rechazado";
  fechaSolicitud?: string;
}

// Componente para el mensaje de error ya no es necesario, usamos Card en su lugar

// Función para formatear fechas
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RequestDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvedArticulos, setApprovedArticulos] = useState<{ [key: string]: number }>({});
  const [isApproving, setIsApproving] = useState(false);
  const [approvingArticulos, setApprovingArticulos] = useState<{ [key: string]: boolean }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showApproveAllDialog, setShowApproveAllDialog] = useState(false);
  const [selectedArticuloId, setSelectedArticuloId] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<RequestData | null>(null);

  // Validación del formulario con memoización
  const isFormValid = React.useMemo(() => {
    if (!requestData) return false;
    return Object.values(approvedArticulos).some((qty) => qty > 0);
  }, [approvedArticulos, requestData]);

  // Constante para los colores de estado
  const ESTADO_COLORS = {
    normal: "bg-green-600 hover:bg-green-700",
    processing: "bg-gray-400",
    error: "bg-red-600 hover:bg-red-700",
  } as const;

  //  para mostrar notificaciones
  const showNotification = (
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    const notification = document.createElement("div");
    notification.className = `
      fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg
      ${
        type === "success"
          ? "bg-green-500"
          : type === "error"
          ? "bg-red-500"
          : "bg-yellow-500"
      }
      text-white font-semibold
      transform translate-y-[-1rem] opacity-0
      transition-all duration-300 ease-out
      z-50
      flex items-center gap-2
    `;

    // Icono según el tipo de notificación
    const icons = {
      success:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>',
      error:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>',
      warning:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
    };

    notification.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${icons[type]}
      </svg>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);
    requestAnimationFrame(() => {
      notification.style.transform = "translateY(0)";
      notification.style.opacity = "1";
    });

    setTimeout(() => {
      notification.style.transform = "translateY(-1rem)";
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simular llamada a API
        const response = await new Promise<RequestData>((resolve) => {
          setTimeout(() => {
            resolve({
              id: params?.id,
              solicitante: {
                nombre: "Jose Fernando",
                apellido: "Bolivar Hurtado",
                cedula: "30799436",
                telefono: "04241931805",
                edad: "20",
              },
              beneficiario: {
                nombre: "Jose Fernando",
                apellido: "Bolivar Hurtado",
                cedula: "30799436",
                telefono: "04241931805",
                edad: "20",
              },
              articulos: [
                { id: "1", nombre: "Silla de ruedas", cantidad: 3 },
                { id: "2", nombre: "Pañales", cantidad: 5 },
                { id: "3", nombre: "Muletas", cantidad: 2 },
              ],
              fechaSolicitud: new Date().toISOString(),
            });
          }, 1000);
        });

        setRequestData(response);
        const initialApproved = response.articulos.reduce((acc, articulo) => {
          acc[articulo.id] = articulo.cantidad;
          return acc;
        }, {} as { [key: string]: number });
        setApprovedArticulos(initialApproved);
      } catch (error) {
        setError("Error al cargar los datos de la solicitud");
        showNotification("Error al cargar los datos", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params?.id, router]);

  // Validar cantidad
  const handleQuantityChange = (articuloId: string, value: number) => {
    if (!requestData) {
      return;
    }

    const articulo = requestData.articulos.find((item) => item.id === articuloId);
    if (!articulo) {
      return;
    }

    // Validar que el valor sea un número
    if (isNaN(value)) {
      value = 0;
    }

    const validValue = Math.max(0, Math.min(Math.floor(value), articulo.cantidad));
    
    setApprovedArticulos((prev) => ({
      ...prev,
      [articuloId]: validValue,
    }));
  };

  const handleArticuloApproval = async (articuloId: string) => {
    setSelectedArticuloId(articuloId);
    setShowConfirmDialog(true);
  };

  const confirmArticuloApproval = async () => {
    if (!selectedArticuloId || !requestData) {
      return;
    }

    const articulo = requestData.articulos.find((item) => item.id === selectedArticuloId);
    if (!articulo) {
      return;
    }

    setApprovingArticulos((prev) => ({ ...prev, [selectedArticuloId]: true }));
    setShowConfirmDialog(false);

    try {
      // Aquí iría la lógica real de aprobación
      console.log(
        `Aprobando articulo ${selectedArticuloId} con cantidad ${approvedArticulos[selectedArticuloId]}`
      );
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error al aprobar articulo:", error);
    } finally {
      setApprovingArticulos((prev) => ({ ...prev, [selectedArticuloId]: false }));
      setSelectedArticuloId(null);
    }
  };

  const handleApproveAll = () => {
    if (!requestData || Object.keys(approvedArticulos).length === 0) {
      return;
    }
    setShowApproveAllDialog(true);
  };

  const confirmApproveAll = async () => {
    setIsApproving(true);
    setShowApproveAllDialog(false);
    try {
      // Aquí iría la lógica real de aprobación masiva
      console.log("Aprobando todos los artículos:", approvedArticulos);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/dashboard/oac/admin/solicitudes/pendientes");
    } catch (error) {
      console.error("Error al aprobar artículos:", error);
    } finally {
      setIsApproving(false);
    }
  };

  // Dialog de confirmación para aprobar un artículo individual
  const renderConfirmDialog = () => (
    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Aprobación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas aprobar este artículo?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {requestData && selectedArticuloId && (
            <p>
              Artículo: {requestData.articulos.find(a => a.id === selectedArticuloId)?.nombre} 
              <br />
              Cantidad: {approvedArticulos[selectedArticuloId] || 0}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmArticuloApproval}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Dialog de confirmación para aprobar todos los artículos
  const renderApproveAllDialog = () => (
    <Dialog open={showApproveAllDialog} onOpenChange={setShowApproveAllDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Aprobación Masiva</DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas aprobar todos los artículos seleccionados?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {requestData && (
            <div className="space-y-2">
              {requestData.articulos.map(articulo => (
                <div key={articulo.id} className="flex justify-between">
                  <span>{articulo.nombre}</span>
                  <span>{approvedArticulos[articulo.id] || 0} de {articulo.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowApproveAllDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={confirmApproveAll}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando detalles de la solicitud...</p>
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <Card className="mx-auto max-w-2xl mt-8">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error || "No se encontraron datos de la solicitud"}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/oac/admin/solicitudes/pendientes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a solicitudes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Solicitud #{requestData.id}</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/oac/admin/solicitudes/pendientes")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Datos del Solicitante */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Solicitante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <p className="text-foreground">{requestData.solicitante.nombre}</p>
                  </div>
                  <div>
                    <Label>Apellido</Label>
                    <p className="text-foreground">{requestData.solicitante.apellido}</p>
                  </div>
                  <div>
                    <Label>Cédula</Label>
                    <p className="text-foreground">{requestData.solicitante.cedula}</p>
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <p className="text-foreground">{requestData.solicitante.telefono}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Edad</Label>
                    <p className="text-foreground">{requestData.solicitante.edad}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos del Beneficiario */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Beneficiario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <p className="text-foreground">{requestData.beneficiario.nombre}</p>
                  </div>
                  <div>
                    <Label>Apellido</Label>
                    <p className="text-foreground">{requestData.beneficiario.apellido}</p>
                  </div>
                  <div>
                    <Label>Cédula</Label>
                    <p className="text-foreground">{requestData.beneficiario.cedula}</p>
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <p className="text-foreground">{requestData.beneficiario.telefono}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Edad</Label>
                    <p className="text-foreground">{requestData.beneficiario.edad}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Artículos Solicitados */}
          <Card>
            <CardHeader>
              <CardTitle>Artículos Solicitados</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fecha de solicitud: {requestData.fechaSolicitud ? formatDate(requestData.fechaSolicitud) : "No disponible"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {requestData.articulos.map((articulo) => (
                  <Card key={articulo.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{articulo.nombre}</h4>
                          <p className="text-sm text-muted-foreground">
                            Cantidad solicitada: {articulo.cantidad}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            min="0"
                            max={articulo.cantidad}
                            value={approvedArticulos[articulo.id] || 0}
                            onChange={(e) => handleQuantityChange(articulo.id, parseInt(e.target.value) || 0)}
                            className="w-24"
                          />
                          <Button
                            variant="default"
                            disabled={approvingArticulos[articulo.id]}
                            onClick={() => handleArticuloApproval(articulo.id)}
                          >
                            {approvingArticulos[articulo.id] ? (
                              <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent" />
                                Procesando...
                              </>
                            ) : (
                              "Aprobar"
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => router.push("/dashboard/oac/admin/solicitudes/pendientes")}>
                Cancelar
              </Button>
              <Button
                variant="default"
                disabled={isApproving || !isFormValid}
                onClick={handleApproveAll}
              >
                {isApproving ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  "Aprobar Todo"
                )}
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>
      {renderConfirmDialog()}
      {renderApproveAllDialog()}
    </div>
  );
};

export default RequestDetailPage;
