"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Building2, Lock } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Home() {
  const [logoError, setLogoError] = useState(false);

  return (
    <main className="login-page-background flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md mb-8 flex justify-center">
        {!logoError ? (
          <Image
            src="/logo.png"
            alt="OAC Logo"
            width={150}
            height={150}
            className="login-logo"
            onError={() => setLogoError(true)}
            priority
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full bg-primary/10 text-primary">
            <Building2 size={48} />
            <Lock size={24} className="mt-2" />
            <div className="mt-2 font-semibold text-sm">OAC</div>
          </div>
        )}
      </div>
      
      <LoginForm />
      
      <div className="mt-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Organización y Administración Comunitaria (OAC). Todos los derechos reservados.
      </div>
    </main>
  );
}
