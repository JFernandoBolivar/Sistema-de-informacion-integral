"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { MainNav } from "@/components/navigation/MainNav";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { userData, isAdmin, loading } = useAuth();
  const router = useRouter();

  // Verificar que el usuario tenga permisos de admin de OAC
  useEffect(() => {
    if (!loading) {
      const hasAccess =
        (userData?.status === "admin" || userData?.status === "superAdmin") &&
        userData?.department === "oac";

      if (!hasAccess) {
        console.log(
          "Redirigiendo: No tiene permisos para acceder al panel de admin OAC"
        );
        router.push("/dashboard/oac");
      }
    }
  }, [userData, loading, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
