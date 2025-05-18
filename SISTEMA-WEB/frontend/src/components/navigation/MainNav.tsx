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
} from "lucide-react";

/**
 * Componente de navegación principal adaptable según el rol y departamento del usuario
 * - Muestra enlaces específicos según el rol (admin/básico)
 * - Adapta opciones según el departamento (OAC, Farmacia, Servicios Médicos)
 * - Incluye menú desplegable de usuario con logout
 */
export function MainNav() {
  const { userData, isAdmin, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determinar el departamento del usuario
  const userDepartment = userData?.department || "";

  // Determinar si el usuario es admin
  const userIsAdmin =
    isAdmin ||
    userData?.status === "admin" ||
    userData?.status === "superAdmin";

  // Manejar cierre del dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Manejar cierre de sesión
  const handleLogout = async () => {
    await logout();
    // Redirección manejada por AuthProvider
  };

  // Generar enlaces según departamento y rol
  const getNavLinks = () => {
    // Enlaces comunes para todos los usuarios
    const commonLinks = [
      {
        href: "/dashboard",
        label: "Inicio",
        icon: <Home className="h-4 w-4 mr-1" />,
      },
    ];

    // Enlaces específicos por departamento y rol
    const departmentLinks = [];

    // OAC
    if (userDepartment === "oac") {
      if (userIsAdmin) {
        departmentLinks.push(
          {
            href: "/dashboard/oac/admin/inventario",
            label: "Inventario",
            icon: <Package className="h-4 w-4 mr-1" />,
          },
          {
            href: "/dashboard/oac/admin/solicitudes",
            label: "Solicitudes",
            icon: <ClipboardList className="h-4 w-4 mr-1" />,
          },
          {
            href: "/dashboard/oac/admin/usuarios/registrar",
            label: "Registrar Usuarios",
            icon: <UserPlus className="h-4 w-4 mr-1" />,
          }
        );
      } else {
        departmentLinks.push({
          href: "/dashboard/oac",
          label: "Panel OAC",
          icon: <Home className="h-4 w-4 mr-1" />,
        });
      }
    }

    // Farmacia
    else if (userDepartment === "farmacia") {
      if (userIsAdmin) {
        departmentLinks.push(
          {
            href: "/dashboard/farmacia/admin",
            label: "Panel Farmacia",
            icon: <Pill className="h-4 w-4 mr-1" />,
          },
          {
            href: "/dashboard/farmacia/admin/usuarios/registrar",
            label: "Registrar Usuarios",
            icon: <UserPlus className="h-4 w-4 mr-1" />,
          }
        );
      } else {
        departmentLinks.push({
          href: "/dashboard/farmacia",
          label: "Panel Farmacia",
          icon: <Pill className="h-4 w-4 mr-1" />,
        });
      }
    }

    // Servicios Médicos
    else if (userDepartment === "servicios-medicos") {
      if (userIsAdmin) {
        departmentLinks.push(
          {
            href: "/dashboard/servicios-medicos/admin",
            label: "Panel Médico",
            icon: <Stethoscope className="h-4 w-4 mr-1" />,
          },
          {
            href: "/dashboard/servicios-medicos/admin/usuarios/registrar",
            label: "Registrar Usuarios",
            icon: <UserPlus className="h-4 w-4 mr-1" />,
          }
        );
      } else {
        departmentLinks.push({
          href: "/dashboard/servicios-medicos",
          label: "Panel Médico",
          icon: <Stethoscope className="h-4 w-4 mr-1" />,
        });
      }
    }

    return [...commonLinks, ...departmentLinks];
  };

  // Obtener los enlaces de navegación
  const navLinks = getNavLinks();

  return (
    <nav className="bg-gray-800 text-white p-4 w-full">
      <ul className="flex space-x-4 items-center w-full">
        {navLinks.map((link, index) => (
          <li
            key={link.href}
            className={`inline-block ${index === 0 ? "pr-4 border-r-2" : ""}`}
          >
            <Link
              href={link.href}
              className="flex items-center hover:text-gray-300 transition-colors"
            >
              {link.icon}
              {link.label}
            </Link>
          </li>
        ))}

        {/* User dropdown - right aligned */}
        <li className="inline-block ml-auto relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-1 hover:bg-gray-700 px-3 py-1 rounded-md transition-colors"
          >
            <User className="h-4 w-4" />
            <span>{userData?.username || "Usuario"}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <div className="font-medium">
                  {userData?.username || "Usuario"}
                </div>
                <div className="text-gray-500 text-xs">
                  {userData?.department_display || userData?.department}
                </div>
                <div className="text-gray-500 text-xs">
                  Rol: {userIsAdmin ? "Administrador" : "Usuario Básico"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
