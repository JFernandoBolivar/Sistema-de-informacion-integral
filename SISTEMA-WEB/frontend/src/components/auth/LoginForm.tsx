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

import { login } from "@/services/auth";
import { useAuth } from "@/components/AuthProvider";

// Esquema de validación del formulario
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

// Tipo para los valores del formulario
type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      cedula: "",
      password: "",
    },
  });

  // Maneja el proceso de inicio de sesión
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login({
        cedula: data.cedula,
        password: data.password,
      });

      setError(null);

      // Determina la ruta según el rol del usuario
      let dashboardRoute = "/dashboard/oac";

      if (response.status === "superAdmin" || response.status === "admin") {
        dashboardRoute = "/dashboard/oac/admin";
      }

      // Redirección con breve pausa
      setTimeout(() => {
        router.push(dashboardRoute);
        // Almacena la última ruta válida
        sessionStorage.setItem("lastValidRoute", dashboardRoute);
      }, 500);

      return;
    } catch (err: any) {
      // Manejo de errores específicos de autenticación
      if (err && err.message) {
        if (
          err.message.includes("inválidas") ||
          err.message.includes("no encontrado")
        ) {
          setError("Cédula o contraseña incorrecta");
        } else if (
          err.message.includes("red") ||
          err.message.includes("conexión")
        ) {
          setError("Error de conexión con el servidor. Intente más tarde.");
        } else {
          setError("Error al iniciar sesión: " + err.message);
        }
      } else {
        setError("Error al iniciar sesión. Intente nuevamente.");
      }
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">I2 Sistema</CardTitle>
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
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Sistema de Información Integral © {new Date().getFullYear()}
      </CardFooter>
    </Card>
  );
}
