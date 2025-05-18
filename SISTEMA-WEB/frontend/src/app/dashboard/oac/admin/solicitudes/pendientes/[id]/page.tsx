"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mejorar las interfaces con tipos más específicos
interface RequestItem {
  id: string;
  nombre: string;
  cantidad: number;
  estado?: "pendiente" | "aprobado" | "rechazado";
}

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
  items: RequestItem[];
  estado?: "pendiente" | "aprobado" | "rechazado";
  fechaSolicitud?: string;
}

// Componente para el mensaje de error
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    role="alert"
  >
    <strong className="font-bold">Error: </strong>
    <span className="block sm:inline">{message}</span>
  </div>
);

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
  const [approvedItems, setApprovedItems] = useState<{ [key: string]: number }>(
    {}
  );
  const [isApproving, setIsApproving] = useState(false);
  const [approvingItems, setApprovingItems] = useState<{
    [key: string]: boolean;
  }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showApproveAllDialog, setShowApproveAllDialog] = useState(false);
  const [requestData, setRequestData] = useState<RequestData | null>(null);

  // Validación del formulario con memoización
  const isFormValid = React.useMemo(() => {
    if (!requestData) return false;
    return Object.values(approvedItems).some((qty) => qty > 0);
  }, [approvedItems, requestData]);

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
              items: [
                { id: "1", nombre: "Silla de ruedas", cantidad: 3 },
                { id: "2", nombre: "Pañales", cantidad: 5 },
                { id: "3", nombre: "Muletas", cantidad: 2 },
                { id: "4", nombre: "Silla", cantidad: 1 },
                { id: "5", nombre: "Silla", cantidad: 1 },
                { id: "6", nombre: "Silla", cantidad: 1 },
              ],
              fechaSolicitud: new Date().toISOString(),
            });
          }, 1000);
        });

        setRequestData(response);
        const initialApproved = response.items.reduce((acc, item) => {
          acc[item.id] = item.cantidad;
          return acc;
        }, {} as { [key: string]: number });
        setApprovedItems(initialApproved);
      } catch (error) {
        setError("Error al cargar los datos de la solicitud");
        showNotification("Error al cargar los datos", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params?.id]);

  // Validar cantidad
  const handleQuantityChange = (itemId: string, value: number) => {
    if (!requestData) {
      showNotification("Error: No hay datos de solicitud", "error");
      return;
    }

    const item = requestData.items.find((item) => item.id === itemId);
    if (!item) {
      showNotification("Error: Item no encontrado", "error");
      return;
    }

    // Validar que el valor sea un número
    if (isNaN(value)) {
      showNotification("Por favor ingrese un número válido", "warning");
      value = 0;
    }

    const validValue = Math.max(0, Math.min(Math.floor(value), item.cantidad));
    if (value !== validValue) {
      if (value > item.cantidad) {
        showNotification(
          `La cantidad máxima permitida es ${item.cantidad}`,
          "warning"
        );
      } else if (value < 0) {
        showNotification("La cantidad no puede ser negativa", "warning");
      } else if (value !== Math.floor(value)) {
        showNotification("La cantidad debe ser un número entero", "warning");
      }
    }

    setApprovedItems((prev) => ({
      ...prev,
      [itemId]: validValue,
    }));
  };

  const handleItemApproval = async (itemId: string) => {
    setSelectedItemId(itemId);
    setShowConfirmDialog(true);
  };

  const confirmItemApproval = async () => {
    if (!selectedItemId || !requestData) {
      showNotification("Error: Datos de solicitud no disponibles", "error");
      return;
    }

    const item = requestData.items.find((item) => item.id === selectedItemId);
    if (!item) {
      showNotification("Error: Ítem no encontrado", "error");
      return;
    }

    setApprovingItems((prev) => ({ ...prev, [selectedItemId]: true }));
    setShowConfirmDialog(false);

    try {
      // Aquí iría la lógica real de aprobación
      console.log(
        `Aprobando item ${selectedItemId} con cantidad ${approvedItems[selectedItemId]}`
      );
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mostrar notificación de éxito
      showNotification("Item aprobado exitosamente", "success");
    } catch (error) {
      console.error("Error al aprobar item:", error);
      // Mostrar notificación de error
      showNotification(
        `Error al aprobar: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        "error"
      );
    } finally {
      setApprovingItems((prev) => ({ ...prev, [selectedItemId]: false }));
      setSelectedItemId(null);
    }
  };

  const handleApproveAll = () => {
    if (!requestData || Object.keys(approvedItems).length === 0) {
      showNotification("No hay items para aprobar", "warning");
      return;
    }
    setShowApproveAllDialog(true);
  };

  const confirmApproveAll = async () => {
    setIsApproving(true);
    setShowApproveAllDialog(false);
    try {
      //  iría la lógica real de aprobación masiva
      console.log("Aprobando todos los items:", approvedItems);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showNotification(
        "Todos los items han sido aprobados exitosamente",
        "success"
      );
      router.push("/dashboard/oac/admin/solicitudes/pendientes");
    } catch (error) {
      console.error("Error al aprobar items:", error);
      showNotification("Error al aprobar todos los items", "error");
    } finally {
      setIsApproving(false);
    }
  };

  // Renderizado
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Cargando detalles de la solicitud...
          </p>
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="container mx-auto p-4">
        <ErrorMessage
          message={error || "No se encontraron datos de la solicitud"}
        />
        <Button
          variant="outline"
          onClick={() =>
            router.push("/dashboard/oac/admin/solicitudes/pendientes")
          }
          className="mt-4"
        >
          Volver a solicitudes
        </Button>
      </div>
    );
  }

  // componentes [para los items]
  const ItemList = React.memo(
    ({
      items,
      approvedItems,
      approvingItems,
      onApprove,
      onChange,
    }: {
      items: RequestItem[];
      approvedItems: { [key: string]: number };
      approvingItems: { [key: string]: boolean };
      onApprove: (id: string) => void;
      onChange: (id: string, value: number) => void;
    }) => {
      return (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {items.map((item) => (
            <li
              key={item.id}
              className="text-left flex flex-col gap-3 p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
            >
              <b className="text-xl text-gray-800 font-semibold">
                {item.nombre}
              </b>
              <span className="text-gray-600">
                Cantidad solicitada: {item.cantidad}
              </span>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="number"
                  min="0"
                  max={item.cantidad}
                  value={approvedItems[item.id] || 0}
                  onChange={(e) =>
                    onChange(item.id, parseInt(e.target.value) || 0)
                  }
                  aria-label={`Cantidad a aprobar para ${item.nombre}`}
                  aria-describedby={`cantidad-maxima-${item.id}`}
                  className={`
                  border border-gray-300 rounded-md p-2 w-24 
                  focus:ring-2 focus:ring-blue-400 focus:outline-none
                  transition-all duration-200 ease-in-out
                  hover:border-blue-300
                  ${
                    approvedItems[item.id] === item.cantidad
                      ? "bg-green-50 border-green-300 hover:border-green-400"
                      : approvedItems[item.id] === 0
                      ? "bg-red-50 border-red-300 hover:border-red-400"
                      : "bg-white hover:bg-gray-50"
                  }
                  ${
                    approvingItems[item.id]
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
                  disabled={approvingItems[item.id]}
                />
                <span id={`cantidad-maxima-${item.id}`} className="sr-only">
                  Cantidad máxima permitida: {item.cantidad}
                </span>
                <button
                  onClick={() => onApprove(item.id)}
                  disabled={approvingItems[item.id]}
                  title={`Aprobar ${item.cantidad} ${item.nombre}${
                    item.cantidad > 1 ? "s" : ""
                  }`}
                  aria-label={`Aprobar ${item.cantidad} ${item.nombre}${
                    item.cantidad > 1 ? "s" : ""
                  }`}
                  className={`
                  flex items-center justify-center
                  min-w-[120px]
                  ${
                    approvingItems[item.id]
                      ? ESTADO_COLORS.processing
                      : ESTADO_COLORS.normal
                  }
                  text-white font-semibold py-2 px-4 rounded-md
                  transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
                >
                  {approvingItems[item.id] ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    "Aprobar"
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      );
    }
  );

  ItemList.displayName = "ItemList";

  return (
    <>
      <div className="container mx-auto select-none p-4 bg-gray-100 border-2 no-underline hover:no-underline border-gray-500 mt-3 rounded-lg shadow-md mb-3 max-w-7xl transition-all duration-300 ease-in-out">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Solicitante */}
          <div className="w-full md:w-4/12 border-2 border-gray-300 rounded-lg shadow-md p-4 bg-white">
            <h1 className="text-center text-3xl font-serif p-2 font-semibold mt-4 mb-8 text-gray-800">
              Solicitante
            </h1>
            <div className="justify-items-center text-lg">
              <div className="flex flex-row md:flex-col md:justify-center justify-end gap-8 mb-4">
                <span>
                  <b>Nombre:</b> {requestData.solicitante.nombre}
                </span>
                <span className="mb-4">
                  <b>Apellido:</b> {requestData.solicitante.apellido}
                </span>
              </div>
              <div className="flex flex-row md:flex-col md:justify-center justify-end gap-8 mb-4">
                <span>
                  <b>Cédula:</b> {requestData.solicitante.cedula}
                </span>
                <span className="mb-4">
                  <b>Teléfono:</b> {requestData.solicitante.telefono}
                </span>
              </div>
              <div className="flex md:justify-center justify-end">
                <span>
                  <b>Edad:</b> {requestData.solicitante.edad}
                </span>
              </div>
            </div>
          </div>

          {/* Beneficiario y Beneficios */}
          <div className="w-full h-full bg-white border-2 md:w-8/12 border-gray-300 rounded-lg shadow-md p-4">
            <h1 className="text-center text-4xl font-serif font-semibold mt-4 mb-8 text-gray-800">
              Beneficiario
            </h1>
            <div className="justify-items-center text-lg">
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-4">
                <span>
                  <b>Nombre:</b> {requestData.beneficiario.nombre}
                </span>
                <span>
                  <b>Apellido:</b> {requestData.beneficiario.apellido}
                </span>
              </div>
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-4">
                <span>
                  <b>Cédula:</b> {requestData.beneficiario.cedula}
                </span>
                <span>
                  <b>Teléfono:</b> {requestData.beneficiario.telefono}
                </span>
              </div>
              <div className="flex justify-center">
                <span>
                  <b>Edad:</b> {requestData.beneficiario.edad}
                </span>
              </div>
            </div>

            {/* Beneficios Solicitados */}
            <div>
              <h1 className="text-center mb-15 mt-17 text-3xl font-serif font-semibold">
                Beneficios Solicitados
              </h1>
              <div className="text-center text-gray-600 mb-6">
                <span className="text-sm">
                  Fecha de solicitud:{" "}
                  {requestData.fechaSolicitud
                    ? formatDate(requestData.fechaSolicitud)
                    : "No disponible"}
                </span>
              </div>
              <div className="justify-items-center text-lg">
                <ItemList
                  items={requestData.items}
                  approvedItems={approvedItems}
                  approvingItems={approvingItems}
                  onApprove={handleItemApproval}
                  onChange={handleQuantityChange}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 mb-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push("/dashboard/oac/admin/solicitudes/pendientes")
                  }
                  className="w-full sm:w-auto text-gray-700 hover:bg-gray-100"
                  disabled={isApproving}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Volver</span>
                </Button>
                <Button
                  onClick={handleApproveAll}
                  disabled={isApproving || !isFormValid}
                  className={`
                  w-full sm:w-auto
                  ${
                    isApproving
                      ? "bg-gray-500"
                      : Object.values(approvedItems).every((qty) => qty === 0)
                      ? "bg-gray-400"
                      : ESTADO_COLORS.normal
                  }
                  text-white font-semibold py-2 px-8 rounded-md
                  transition-colors duration-200
                  disabled:opacity-70 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                  flex items-center justify-center gap-2
                `}
                >
                  {isApproving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Aprobar Todo</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/*items de confirmacion */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aprobación de Ítem</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea aprobar{" "}
              {selectedItemId &&
                requestData.items.find((item) => item.id === selectedItemId)
                  ?.nombre}{" "}
              con una cantidad de{" "}
              {selectedItemId && approvedItems[selectedItemId]}?
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Esta acción no se puede deshacer.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmItemApproval}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog for Approve All */}
      <Dialog
        open={showApproveAllDialog}
        onOpenChange={setShowApproveAllDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aprobación Total</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea aprobar todos los ítems con las siguientes
              cantidades?
            </DialogDescription>

            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {requestData.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.nombre}:</span>
                  <span className="font-semibold">
                    {approvedItems[item.id]} unidades
                  </span>
                </li>
              ))}
            </ul>
            <div className="text-sm text-gray-500 mt-4">
              Esta acción no se puede deshacer.
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveAllDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmApproveAll}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Confirmar Todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestDetailPage;
