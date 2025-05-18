"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Importar servicio de autenticación y contexto
import { login } from "@/services/auth";
import { useAuth } from "@/components/AuthProvider";

// Define el esquema del formulario con Zod
const loginFormSchema = z.object({
  cedula: z
    .string()
    .min(1, { message: "La cédula es requerida" })
    .refine((val) => /^\d+$/.test(val), {
      message: "La cédula debe contener solo números",
    }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

// Define el tipo para los valores del formulario
type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const { isLoggedIn } = useAuth(); // Usar el contexto de autenticación
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar el formulario
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      cedula: "",
      password: "",
    },
  });

  // Manejar el envío del formulario
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar conectividad con el servidor primero
      console.log('Verificando conectividad con el servidor...');
      
      // Llamar al servicio de autenticación con las credenciales
      const response = await login({
        cedula: data.cedula,
        password: data.password,
      });
      
      // Login exitoso, mostrar información para depuración
      console.log("Login exitoso:", response);
      
      // Mostrar mensaje de éxito temporal
      setError(null);
      
      // Usar el enrutador de Next.js para navegar al dashboard
      // La ruta depende del rol del usuario
      let dashboardRoute = "/dashboard/oac";
      
      if (response.status === "superAdmin" || response.status === "admin") {
        dashboardRoute = "/dashboard/oac/admin";
      }
      
      console.log(`Redirigiendo a: ${dashboardRoute}`);
      
      // Breve pausa para mostrar mensaje de éxito
      setTimeout(() => {
        router.push(dashboardRoute);
        // Guardar la ruta inicial como última ruta válida
        sessionStorage.setItem('lastValidRoute', dashboardRoute);
      }, 500);
      
      // El estado de carga se mantendrá durante la navegación
      return;
    } catch (err: any) {
      // Manejar errores específicos
      if (err && err.message) {
        if (err.message.includes("inválidas") || 
            err.message.includes("no encontrado")) {
          setError("Cédula o contraseña incorrecta");
        } else if (err.message.includes("red") || err.message.includes("conexión")) {
          setError("Error de conexión con el servidor. Intente más tarde.");
        } else {
          setError("Error al iniciar sesión: " + err.message);
        }
      } else {
        setError("Error al iniciar sesión. Intente nuevamente.");
      }
      console.error("Error de login:", err);
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">OAC Sistema</CardTitle>
        <CardDescription className="text-center">
          Ingrese sus credenciales para acceder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: 12345678"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Ej: password123"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <div className="text-xs text-muted-foreground mt-2 text-center">
              <p>Para pruebas use:</p>
              <p className="font-medium">Cédula: 12345678 | Contraseña: password123</p>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Sistema de Organización y Administración Comunitaria
      </CardFooter>
    </Card>
  );
}
