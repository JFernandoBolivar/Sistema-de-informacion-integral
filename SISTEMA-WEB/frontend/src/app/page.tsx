"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Home() {
  return (
    <main className="login-page-background flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <LoginForm />

      <div className="mt-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Información Integral Integral. Todos los
        derechos reservados.
      </div>
    </main>
  );
}
