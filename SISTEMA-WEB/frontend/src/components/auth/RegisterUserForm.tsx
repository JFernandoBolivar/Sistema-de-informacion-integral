"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";

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

import { registerUser } from "@/services/auth";

// Nombres descriptivos para los departamentos en la interfaz
const departmentLabels: Record<string, string> = {
  'oac': 'Organización y Administración Comunitaria',
  'farmacia': 'Farmacia',
  'servicios-medicos': 'Servicios Médicos'
};

// Esquema de validación del formulario
const registrationFormSchema = z.object({
  cedula: z
    .string()
    .min(1, { message: "La cédula es requerida" })
    .refine((val) => /^\d+$/.test(val), {
      message: "La cédula debe contener solo números",
    }),
  nombre: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede exceder 50 caracteres" }),
  apellido: z
    .string()
    .min(2, { message: "El apellido debe tener al menos 2 caracteres" })
    .max(50, { message: "El apellido no puede exceder 50 caracteres" }),
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Ingrese un correo electrónico válido" }),
  phone: z
    .string()
    .min(1, { message: "El teléfono es requerido" })
    .regex(/^\+?[0-9]{8,}$/, { message: "Ingrese un número de teléfono válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z
    .string()
    .min(1, { message: "Confirme la contraseña" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Tipo para los valores del formulario
type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface RegisterUserFormProps {
  department: string; // Departamento para el registro
  onSuccess?: () => void; // Callback opcional al completar registro
}

export function RegisterUserForm({ department, onSuccess }: RegisterUserFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [registeredUser, setRegisteredUser] = useState<string | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      cedula: "",
      nombre: "",
      apellido: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Procesa el envío del formulario
  async function onSubmit(data: RegistrationFormValues) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepara datos para el registro
      const registrationData = {
        cedula: data.cedula,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        department: department,
        status: 'basic',
        username: `user_${data.cedula}`,
      };

      const response = await registerUser(registrationData);
      
      // Manejo del registro exitoso
      setSuccess(true);
      setRegisteredUser(`${data.nombre} ${data.apellido}`);
      
      form.reset({
        cedula: "",
        nombre: "",
        apellido: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      if (err && err.message) {
        setError(err.message);
      } else {
        setError("Error al registrar usuario. Intente nuevamente.");
      }
      console.error("Error de registro:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Registrar nuevo usuario</CardTitle>
        <CardDescription>
          Departamento: {departmentLabels[department] || department}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-6 flex items-center space-x-2 text-sm text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span>
              Usuario <strong>{registeredUser}</strong> registrado exitosamente en {departmentLabels[department] || department}.
            </span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <FormDescription>
                    Número de cédula sin puntos ni guiones
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Juan"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Pérez"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: usuario@ejemplo.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Para notificaciones y recuperación de cuenta
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: 04141234567"
                      type="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de teléfono sin espacios ni guiones
                  </FormDescription>
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
                        placeholder="Mínimo 6 caracteres"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repita la contraseña"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword
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
              <div className="rounded-md bg-red-50 p-3 flex items-center space-x-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando usuario...
                </>
              ) : (
                "Registrar Usuario"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        <p>El usuario será registrado como usuario básico del departamento {departmentLabels[department] || department}</p>
      </CardFooter>
    </Card>
  );
}

