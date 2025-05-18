"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
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
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export function Sidebar() {
  const { userData, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Menú móvil
  const [isCollapsed, setIsCollapsed] = useState(false); // Modo colapsado
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );

  const userDepartment = userData?.department || "";
  // Determina permisos administrativos
  const userIsAdmin =
    isAdmin ||
    userData?.status === "admin" ||
    userData?.status === "superAdmin";

  const toggleSubmenu = (href: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const handleLogout = async () => {
    await logout();
  };

  interface NavLink {
    href: string;
    label: string;
    icon: React.ReactNode;
    subItems?: Array<{
      href: string;
      label: string;
    }>;
  }

  const getNavLinks = () => {
    const commonLinks: NavLink[] = [
      {
        href: "/dashboard",
        label: "Inicio",
        icon: <Home className="h-5 w-5" />,
      },
    ];

    const departmentLinks = [];

    // Navegación OAC según rol
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
            href: "/dashboard/oac/admin/reportes",
            label: "Reportes",
            icon: <FileText className="h-5 w-5" />,
            subItems: [
              {
                href: "/dashboard/oac/admin/reportes/ayuda-tecnica",
                label: "Ayuda Técnica",
              },
              {
                href: "/dashboard/oac/admin/reportes/ayuda-social",
                label: "Ayuda Social",
              },
              {
                href: "/dashboard/oac/admin/reportes/ayuda-medica",
                label: "Ayuda Médica",
              },
              {
                href: "/dashboard/oac/admin/reportes/proyectos",
                label: "Proyectos",
              },
            ],
          },
          {
            href: "/dashboard/oac/admin/usuarios/registrar",
            label: "Registrar Usuarios",
            icon: <UserPlus className="h-5 w-5" />,
          },
          {
            href: "/dashboard/oac/admin/Config-users",
            label: "Configurar Usuarios",
            icon: <Bot className="h-5 w-5" />,
          }
        );
      } else {
        departmentLinks.push({
          href: "/dashboard/oac",
          label: "Panel OAC",
          icon: <Home className="h-5 w-5" />,
        });
      }
    }

    // Navegación Farmacia
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
        );
      } else {
        departmentLinks.push({
          href: "/dashboard/farmacia",
          label: "Panel Farmacia",
          icon: <Pill className="h-5 w-5" />,
        });
      }
    }

    // Navegación Servicios Médicos
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
        );
      } else {
        departmentLinks.push({
          href: "/dashboard/servicios-medicos",
          label: "Panel Médico",
          icon: <Stethoscope className="h-5 w-5" />,
        });
      }
    }

    return [...commonLinks, ...departmentLinks];
  };

  const navLinks = getNavLinks();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex flex-col flex-grow justify-between py-2">
        <div className="px-2 space-y-4">
          <div className="flex flex-col gap-2 mb-4">
            <div className="hidden lg:flex items-center justify-end px-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-9 w-9 hover:bg-accent/90 transition-colors duration-200"
                aria-label={isCollapsed ? "Expandir" : "Colapsar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Perfil */}
            <div className="px-2">
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
            </div>
          </div>

          <Separator className="mb-3" />

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <div key={link.href}>
                {link.subItems ? (
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSubmenu(link.href)}
                      className={`${
                        isCollapsed
                          ? "w-10 px-0 justify-center mx-auto hover:scale-105"
                          : "w-full justify-start px-3"
                      } py-2 hover:bg-accent/90 transition-all duration-200`}
                    >
                      {link.icon && (
                        <div
                          className={`transition-transform duration-200 ${
                            isCollapsed ? "scale-105" : ""
                          }`}
                        >
                          {link.icon}
                        </div>
                      )}
                      {!isCollapsed && (
                        <>
                          <span className="ml-2 flex-1 text-left">
                            {link.label}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedMenus[link.href] ? "rotate-180" : ""
                            }`}
                          />
                        </>
                      )}
                    </Button>

                    {/* Submenú */}
                    {!isCollapsed && expandedMenus[link.href] && (
                      <div className="ml-6 space-y-1 mt-1 mb-2">
                        {link.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className="block"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start px-3 py-1 text-sm"
                            >
                              {subItem.label}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
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
                      {link.icon && (
                        <div
                          className={`transition-transform duration-200 ${
                            isCollapsed ? "scale-105" : ""
                          }`}
                        >
                          {link.icon}
                        </div>
                      )}
                      {!isCollapsed && (
                        <span className="ml-2">{link.label}</span>
                      )}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

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
  );

  return (
    <>
      {/* Navegación móvil */}
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
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <ScrollArea className="h-full">
            <SidebarContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Navegación escritorio */}
      <div className="hidden lg:block">
        <div
          className={`h-screen border-r bg-background ${
            isCollapsed ? "w-[70px]" : "w-64"
          }
        } transition-all duration-300 ease-in-out`}
        >
          <ScrollArea className="h-full">
            <SidebarContent />
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
