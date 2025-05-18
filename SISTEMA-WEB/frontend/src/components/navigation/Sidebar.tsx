"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"
import {
  LogOut,
  User,
  ChevronDown,
  Home,
  Package,
  ClipboardList,
  UserPlus,
  Pill,
  Stethoscope,
  Menu,
  Bot,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

/**
 * Componente de navegación sidebar adaptable según el rol y departamento del usuario
 * - Muestra enlaces específicos según el rol (admin/básico)
 * - Adapta opciones según el departamento (OAC, Farmacia, Servicios Médicos)
 * - Incluye menú desplegable de usuario con logout
 * - Responsive: sidebar en desktop, drawer en mobile
 */
export function Sidebar() {
  const { userData, isAdmin, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const userDepartment = userData?.department || ""
  const userIsAdmin = isAdmin || userData?.status === "admin" || userData?.status === "superAdmin"


  const handleLogout = async () => {
    await logout()
  }

  const getNavLinks = () => {
    const commonLinks = [
      {
        href: "/dashboard",
        label: "Inicio",
        icon: <Home className="h-5 w-5" />,
      },
    ]

    const departmentLinks = []

    // OAC Department Links
    if (userDepartment === "oac") {
      if (userIsAdmin) {
        departmentLinks.push(
          {
            href: "/dashboard/oac/admin/inventario",
            label: "Inventario",
            icon: <Package className="h-5 w-5" />,
          },
          {
            href: "/dashboard/oac/admin/solicitudes",
            label: "Solicitudes",
            icon: <ClipboardList className="h-5 w-5" />,
          },
          {
            href: "/dashboard/oac/admin/usuarios/registrar",
            label: "Registrar Usuarios",
            icon: <UserPlus className="h-5 w-5" />,
          },
          {
            href: "/dashboard/oac/admin/ai-permissions",
            label: "Permisos IA",
            icon: <Bot className="h-5 w-5" />,
          }
        )
      } else {
        departmentLinks.push({
          href: "/dashboard/oac",
          label: "Panel OAC",
          icon: <Home className="h-5 w-5" />,
        })
      }
    }
    
    // Farmacia Department Links
    else if (userDepartment === "farmacia") {
      if (userIsAdmin) {
        departmentLinks.push(
          {
            href: "/dashboard/farmacia/admin",
            label: "Panel Farmacia",
            icon: <Pill className="h-5 w-5" />,
          },
          {
            href: "/dashboard/farmacia/admin/usuarios/registrar",
            label: "Registrar Usuarios",
            icon: <UserPlus className="h-5 w-5" />,
          }
        )
      } else {
        departmentLinks.push({
          href: "/dashboard/farmacia",
          label: "Panel Farmacia",
          icon: <Pill className="h-5 w-5" />,
        })
      }
    }
    
    // Servicios Médicos Department Links
    else if (userDepartment === "servicios-medicos") {
      if (userIsAdmin) {
        departmentLinks.push(
          {
            href: "/dashboard/servicios-medicos/admin",
            label: "Panel Médico",
            icon: <Stethoscope className="h-5 w-5" />,
          },
          {
            href: "/dashboard/servicios-medicos/admin/usuarios/registrar",
            label: "Registrar Usuarios",
            icon: <UserPlus className="h-5 w-5" />,
          }
        )
      } else {
        departmentLinks.push({
          href: "/dashboard/servicios-medicos",
          label: "Panel Médico",
          icon: <Stethoscope className="h-5 w-5" />,
        })
      }
    }

    return [...commonLinks, ...departmentLinks]
  }

  const navLinks = getNavLinks()

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex flex-col flex-grow justify-between py-2">
        <div className="px-2 space-y-4">
          {/* Top section with user info and collapse button */}
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center justify-between">
              {!isCollapsed ? (
                <div className="flex flex-col">
                  <div className="font-medium truncate">
                    {userData?.username || "Usuario"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {userData?.department_display || userData?.department}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    Rol: {userIsAdmin ? "Administrador" : "Usuario Básico"}
                  </div>
                </div>
              ) : (
                <div className="relative group mx-auto w-full flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-accent/90 transition-colors duration-200"
                    title={userData?.username || "Usuario"}
                  >
                    <User className="h-5 w-5 scale-105" />
                  </Button>
                  <div className="hidden group-hover:block absolute left-full top-0 ml-3 w-56 bg-background rounded-md border shadow-md p-3 z-[200] animate-in fade-in-0 zoom-in-95">
                    <div className="px-2 py-1.5">
                      <div className="font-medium">
                        {userData?.username || "Usuario"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {userData?.department_display || userData?.department}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rol: {userIsAdmin ? "Administrador" : "Usuario Básico"}
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              )}
              {/* Hide collapse button on mobile completely */}
              <div className="hidden lg:flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-9 w-9 hover:bg-accent/90 transition-colors duration-200"
                  aria-label={isCollapsed ? "Expandir" : "Colapsar"}
                >
                  {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          <Separator className="mb-3" />

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? link.label : undefined}
                className="block"
              >
                <Button
                  variant="ghost"
                  className={`${
                    isCollapsed 
                      ? "w-10 px-0 justify-center mx-auto hover:scale-105" 
                      : "w-full justify-start px-3"
                  } py-2 hover:bg-accent/90 transition-all duration-200`}
                >
                  {link.icon && <div className={`transition-transform duration-200 ${isCollapsed ? "scale-105" : ""}`}>{link.icon}</div>}
                  {!isCollapsed && <span className="ml-2">{link.label}</span>}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button at Bottom */}
        <div className="mt-auto px-2 pt-4 pb-2">
          <Separator className="mb-3" />
          {!isCollapsed ? (
            <Button
              variant="ghost"
              className="w-full justify-start px-3 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Cerrar Sesión</span>
            </Button>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 px-0 justify-center hover:scale-105 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 h-9 w-9"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SheetTitle className="sr-only">
            Menú de navegación
          </SheetTitle>
          <ScrollArea className="h-full">
            <SidebarContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className={`h-screen border-r bg-background ${
          isCollapsed ? 'w-[70px]' : 'w-64'}
        } transition-all duration-300 ease-in-out`}>
          <ScrollArea className="h-full">
            <SidebarContent />
          </ScrollArea>
        </div>
      </div>
    </>
  )
}

