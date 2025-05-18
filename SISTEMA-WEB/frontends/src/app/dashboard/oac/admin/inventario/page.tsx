"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// tipos de datos para el inventario
interface InventoryItem {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  estado: "Disponible" | "En uso" | "Por entregar" | "Dado de baja";
  factura: string;
  cantidad: number;
  fechaAdquisicion: string;
  ultimoMantenimiento?: string;
}

// manejo de datos de inventario (simulación de base de datos)
const inventoryData: InventoryItem[] = [
  {
    id: "1",
    codigo: "SR-001",
    nombre: "Silla de Ruedas Estándar",
    categoria: "Ayuda Técnica",
    descripcion: "Silla de ruedas manual plegable con reposabrazos removibles",
    estado: "Disponible",
    factura: "100",
    cantidad: 5,
    fechaAdquisicion: "2025-01-15",
    ultimoMantenimiento: "2025-04-20",
  },
  {
    id: "2",
    codigo: "SR-002",
    nombre: "Silla de Ruedas Eléctrica",
    categoria: "Ayuda Técnica",
    descripcion: "Silla de ruedas motorizada con control joystick",
    estado: "En uso",
    factura: "1000",
    cantidad: 2,
    fechaAdquisicion: "2024-11-30",
    ultimoMantenimiento: "2025-03-15",
  },
  {
    id: "3",
    codigo: "MUL-001",
    nombre: "Colchón Antiescara",
    categoria: "Ayuda Social",
    descripcion: "Previene escaras, alivia presión, mayor confort",
    estado: "Disponible",
    factura: "100",
    cantidad: 10,
    fechaAdquisicion: "2025-02-01",
  },
  {
    id: "6",
    codigo: "MUL-001",
    nombre: "Colchón Antiescara",
    categoria: "Ayuda Social",
    descripcion: "Previene escaras, alivia presión, mayor confort",
    estado: "Disponible",
    factura: "100",
    cantidad: 10,
    fechaAdquisicion: "2025-02-01",
  },
  {
    id: "4",
    codigo: "AND-001",
    nombre: "Andador Plegable",
    categoria: "Ayuda Técnica",
    descripcion: "Andador de aluminio con ruedas delanteras",
    estado: "Por entregar",
    factura: "Taller",
    cantidad: 3,
    fechaAdquisicion: "2024-12-15",
    ultimoMantenimiento: "2025-05-01",
  },
  {
    id: "5",
    codigo: "BAS-001",
    nombre: "Bastón de 4 Puntos",
    categoria: "Ayuda Técnica",
    descripcion: "Bastón cuádruple de aluminio con base amplia",
    estado: "Disponible",
    factura: "100",
    cantidad: 8,
    fechaAdquisicion: "2025-03-10",
  },
];

type DialogMode = "create" | "edit";

export default function InventarioPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    codigo: "",
    nombre: "",
    categoria: "",
    descripcion: "",
    estado: "Disponible",
    factura: "",
    cantidad: 0,
    fechaAdquisicion: new Date().toISOString().split("T")[0],
  });

  const handleOpenDialog = (mode: DialogMode, item?: InventoryItem) => {
    setDialogMode(mode);
    if (mode === "edit" && item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        codigo: "",
        nombre: "",
        categoria: "",
        descripcion: "",
        estado: "Disponible",
        factura: "",
        cantidad: 0,
        fechaAdquisicion: new Date().toISOString().split("T")[0],
      });
    }
    setDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí deberia de ir la logica para guardar en la base de datos
    console.log("Form submitted:", formData);
    setDialogOpen(false);
  };

  // filtro de busqueda de ayudas tecnicas
  const filteredItems = inventoryData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Inventario de Ayudas Técnicas y Sociales</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/oac")}
            >
              Volver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/*buscador y filtrador de busqueda*/}
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Buscar en inventario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">Exportar</Button>
              <Button onClick={() => handleOpenDialog("create")}>
                Nuevo Item
              </Button>
            </div>

            {/* Inventory Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.codigo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.nombre}</div>
                          <div className="text-sm text-gray-500">
                            {item.descripcion}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.estado === "Disponible"
                              ? "bg-green-100 text-green-800"
                              : item.estado === "En uso"
                              ? "bg-blue-100 text-blue-800"
                              : item.estado === "Por entregar"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.estado}
                        </span>
                      </TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>{item.factura}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog("edit", item)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Item Management Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {dialogMode === "create" ? "Nuevo Item" : "Editar Item"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid w-full gap-4">
                    <div className="grid w-full items-center gap-2">
                      <Input
                        placeholder="Código"
                        value={formData.codigo}
                        onChange={(e) =>
                          setFormData({ ...formData, codigo: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid w-full items-center gap-2">
                      <Input
                        placeholder="Nombre"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid w-full items-center gap-2">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        value={formData.categoria}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoria: e.target.value,
                          })
                        }
                      >
                        <option value="">Seleccione Categoría</option>
                        <option value="Ayuda Técnica">Ayuda Técnica</option>
                        <option value="Ayudas Social">Ayudas Social</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                    <div className="grid w-full items-center gap-2">
                      <Input
                        placeholder="Descripción"
                        value={formData.descripcion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descripcion: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid w-full items-center gap-2">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        value={formData.estado as string}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estado: e.target.value as any,
                          })
                        }
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="En uso">En uso</option>
                        <option value="En mantenimiento">
                          En mantenimiento
                        </option>
                        <option value="Dado de baja">Dado de baja</option>
                      </select>
                    </div>
                    <div className="grid w-full items-center gap-2">
                      <Input
                        placeholder="Factura"
                        value={formData.factura}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            factura: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid w-full items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={formData.cantidad}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cantidad: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="grid w-full items-center gap-2">
                      <Input
                        type="date"
                        value={formData.fechaAdquisicion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fechaAdquisicion: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {dialogMode === "create" ? "Crear" : "Guardar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {inventoryData.reduce(
                      (sum, item) => sum + item.cantidad,
                      0
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {inventoryData
                      .filter((item) => item.estado === "Disponible")
                      .reduce((sum, item) => sum + item.cantidad, 0)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">En Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {inventoryData
                      .filter((item) => item.estado === "En uso")
                      .reduce((sum, item) => sum + item.cantidad, 0)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por entregar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">
                    {inventoryData
                      .filter((item) => item.estado === "Por entregar")
                      .reduce((sum, item) => sum + item.cantidad, 0)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
