"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const SolicitudesPendientes = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Demo data for pending requests
  const pendingRequests = [
    {
      id: "12345",
      solicitante: "José Fernando",
      beneficiario: "Bolivar Hurtado",
      departamento: "Tecnología",
      fecha: new Date().toLocaleDateString(),
      cantidadItems: 5,
    },
    {
      id: "12346",
      solicitante: "María González",
      beneficiario: "Carlos Ramírez",
      departamento: "Recursos Humanos",
      fecha: new Date().toLocaleDateString(),
      cantidadItems: 3,
    },
  ];

  return (
    <div className="container mx-auto p-6 bg-amber-100 my-12 rounded-xl  h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Solicitudes Pendientes</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/oac/admin/solicitudes")}
        >
          Volver
        </Button>
      </div>

      {pendingRequests.map((request) => (
        <div
          key={request.id}
          className="container shadow-xl/30 bg-gray-600   hover:border-gray-900 hover:bg-gray-700 mx-auto p-4 hover:shadow-xl/40 border border-gray-700 mt-6 rounded-xl select-none relative cursor-pointer"
          onClick={() => {
            router.push(
              `/dashboard/oac/admin/solicitudes/pendientes/${request.id}`
            );
          }}
        >
          <div className="h-50 relative">
            {/* Titulo de la solicitud */}
            <h2 className="text-center text-2xl font-serif font-semibold mt-2 text-white">
              <b>Solicitud #{request.id}</b>
            </h2>

            {/* Hora en la esquina superior derecha */}
            <div className="absolute top-2 right-2 text-white text-lg rounded-3xl bg-gray-900 p-2 shadow-md">
              {currentTime}
            </div>

            {/* Contenido centrado */}
            <div className="flex flex-col items-center justify-center h-full text-white py-4">
              <p className="text-xl font-bold mb-2">
                <b>Solicitante:</b> {request.solicitante}
              </p>
              <p className="text-xl font-bold mb-2">
                <b>Beneficiario:</b> {request.beneficiario}
              </p>
              <p className="text-xl font-bold mb-2">
                <b>Departamento:</b> {request.departamento}
              </p>
              <p className="text-xl font-bold mb-2">
                <b>Fecha:</b> {request.fecha}
              </p>
            </div>

            <p className="absolute right-2 bottom-2 text-xl font-bold p-2 text-white">
              <b>Cantidad de ítems:</b> {request.cantidadItems}
            </p>
          </div>
        </div>
      ))}

      {pendingRequests.length === 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-center">
              No hay solicitudes pendientes
            </CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default SolicitudesPendientes;
