"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import StatusChart from "@/components/reports/StatusChart";
import { ArrowLeft, FileBarChart, Clock, Download } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AyudaSocialReportPage() {
  const router = useRouter();

  // Datos de muestra para reporte de ayuda social
  const statusData = [
    { label: 'Pendiente', count: 20, color: '#FBBF24' },
    { label: 'Aprobada', count: 30, color: '#34D399' },
    { label: 'Rechazada', count: 12, color: '#F87171' },
    { label: 'Vencida', count: 7, color: '#8B5CF6' },
  ];

  // Datos de evolución mensual por estado
  const timelineData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      // Tendencia de solicitudes pendientes
      {
        label: 'Pendientes',
        data: [15, 18, 12, 20, 18, 20],
        color: 'rgba(251, 191, 36, 0.5)',
        borderColor: 'rgb(251, 191, 36)',
      },
      // Tendencia de solicitudes aprobadas
      {
        label: 'Aprobadas',
        data: [22, 25, 28, 26, 30, 30],
        color: 'rgba(52, 211, 153, 0.5)',
        borderColor: 'rgb(52, 211, 153)',
      },
      // Tendencia de solicitudes rechazadas
      {
        label: 'Rechazadas',
        data: [8, 10, 12, 9, 14, 12],
        color: 'rgba(248, 113, 113, 0.5)',
        borderColor: 'rgb(248, 113, 113)',
      },
      // Tendencia de solicitudes vencidas
      {
        label: 'Vencidas',
        data: [3, 5, 6, 7, 8, 7],
        color: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
      },
    ],
  };

  // Calcular total para referencia
  const totalRequests = statusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Ayuda Social</h1>
          <p className="text-muted-foreground">
            Estadísticas y datos sobre las solicitudes de ayuda social.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/oac/admin/reportes")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-amber-700">Pendientes</h3>
            <p className="text-4xl font-bold text-amber-600">{statusData[0].count}</p>
            <p className="text-sm text-amber-600 mt-1">{((statusData[0].count / totalRequests) * 100).toFixed(1)}% del total</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-green-700">Aprobadas</h3>
            <p className="text-4xl font-bold text-green-600">{statusData[1].count}</p>
            <p className="text-sm text-green-600 mt-1">{((statusData[1].count / totalRequests) * 100).toFixed(1)}% del total</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-red-700">Rechazadas</h3>
            <p className="text-4xl font-bold text-red-600">{statusData[2].count}</p>
            <p className="text-sm text-red-600 mt-1">{((statusData[2].count / totalRequests) * 100).toFixed(1)}% del total</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-purple-700">Vencidas</h3>
            <p className="text-4xl font-bold text-purple-600">{statusData[3].count}</p>
            <p className="text-sm text-purple-600 mt-1">{((statusData[3].count / totalRequests) * 100).toFixed(1)}% del total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Gráficos Estadísticos
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tendencia Temporal
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Estados</CardTitle>
              <CardDescription>
                Análisis porcentual de solicitudes de ayuda social por estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <StatusChart
                  type="pie"
                  statusData={statusData}
                  height="100%"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-5 pb-3">
              <p className="text-sm text-muted-foreground">
                Actualizado: {new Date().toLocaleDateString()}
              </p>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Exportar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia Temporal</CardTitle>
              <CardDescription>
                Evolución mensual de solicitudes de ayuda social por estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <StatusChart
                  type="line"
                  timelineData={timelineData}
                  height="100%"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-5 pb-3">
              <p className="text-sm text-muted-foreground">
                Período: Enero - Junio 2025
              </p>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Exportar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

