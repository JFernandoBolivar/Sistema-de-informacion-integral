"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUserData, logout as logoutService } from '@/services/auth';

// Define el tipo para el contexto de autenticación
interface AuthContextType {
  isLoggedIn: boolean;
  userData: any | null;
  loading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userData: null,
  loading: true,
  userRole: null,
  isAdmin: false,
  logout: async () => {},
});

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Mapeo de roles a rutas
  const roleBasedRoutes = {
    // Rutas para todos los usuarios autenticados
    base: '/dashboard/oac',
    // Rutas específicas para administradores
    admin: '/dashboard/oac/admin',
    superAdmin: '/dashboard/oac/admin',
  };
  
  // Rutas protegidas que requieren roles específicos
  const adminRoutes = [
    '/dashboard/oac/admin',
    '/dashboard/oac/admin/inventario',
    '/dashboard/oac/admin/solicitudes'
  ];
  
  // Obtener la ruta base por rol
  const getHomeRouteByRole = (role: string | null): string => {
    if (!role) return roleBasedRoutes.base;
    
    const route = roleBasedRoutes[role as keyof typeof roleBasedRoutes];
    return route || roleBasedRoutes.base;
  };

  // Verificar estado de autenticación cuando se carga el componente
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        const user = getUserData();
        setUserData(user);
        
        // Determinar el rol del usuario
        const role = user?.status || null;
        setUserRole(role);
        setIsAdmin(['admin', 'superAdmin'].includes(role));
      } else {
        setUserData(null);
        setUserRole(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    // Redirigir basado en el estado de autenticación y rol
    const handleAuthRedirect = () => {
      if (loading) return; // Esperar a que termine la carga
      
      const publicRoutes = ['/', '/login', '/register'];
      const isPublicRoute = publicRoutes.some(route => pathname === route);
      
      // Verificar si el usuario tiene acceso a la ruta actual
      const isAdminRoute = adminRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`));
        
      // Casos de redirección
      if (!isLoggedIn && !isPublicRoute) {
        // No autenticado intentando acceder a ruta protegida
        console.log('Redirigiendo a login: usuario no autenticado');
        router.push('/');
      } else if (isLoggedIn && isPublicRoute) {
        // Autenticado en ruta pública, redirigir a su dashboard según rol
        const homeRoute = getHomeRouteByRole(userRole);
        console.log(`Redirigiendo a dashboard: ${homeRoute}`);
        router.push(homeRoute);
      } else if (isLoggedIn && isAdminRoute && !isAdmin) {
        // Autenticado intentando acceder a ruta de admin sin ser admin
        console.log('Redirigiendo a ruta básica: no tiene permisos de admin');
        router.push(roleBasedRoutes.base);
      }
      
      // Histórico de navegación para el botón de retroceso
      if (isLoggedIn && !loading && !isPublicRoute) {
        // Guardar la ruta actual como última ruta válida según rol
        if (isAdmin || !isAdminRoute) {
          sessionStorage.setItem('lastValidRoute', pathname);
        }
      }
    };
    
    handleAuthRedirect();
  }, [isLoggedIn, pathname, loading, router, userRole, isAdmin]);

  // Monitor para el botón de retroceso
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoggedIn && !loading) {
      // Cuando se usa el botón de retroceso
      const handlePopState = () => {
        const currentPath = window.location.pathname;
        
        // Verificar si es ruta de admin y el usuario no es admin
        const isAdminRoute = adminRoutes.some(route => 
          currentPath === route || currentPath.startsWith(`${route}/`));
        
        if (isAdminRoute && !isAdmin) {
          // Si intenta acceder a ruta de admin sin ser admin, redirigir
          const lastValidRoute = sessionStorage.getItem('lastValidRoute') || roleBasedRoutes.base;
          console.log(`Redirigiendo tras botón atrás: ${lastValidRoute}`);
          router.push(lastValidRoute);
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isLoggedIn, loading, isAdmin, router]);
  
  // Función para cerrar sesión
  const handleLogout = async () => {
    await logoutService();
    setIsLoggedIn(false);
    setUserData(null);
    setUserRole(null);
    setIsAdmin(false);
    sessionStorage.removeItem('lastValidRoute');
    router.push('/');
  };

  // Valor que se proporcionará al contexto
  const contextValue: AuthContextType = {
    isLoggedIn,
    userData,
    loading,
    userRole,
    isAdmin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

