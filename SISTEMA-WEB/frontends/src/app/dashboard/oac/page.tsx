"use client";

import { useState } from "react";
import AdminView from "./components/AdminView";
import BasicView from "./components/BasicView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OACPage() {
  // Temporary role state - in production this would come from auth
  const [userRole, setUserRole] = useState<"admin" | "basic">("basic");

  const toggleRole = () => {
    setUserRole(prev => prev === "admin" ? "basic" : "admin");
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Oficina de Atención al Ciudadano (OAC)</span>
            {/* Temporary role switcher - remove in production */}
            <Button onClick={toggleRole} variant="outline" size="sm">
              Cambiar a rol {userRole === "admin" ? "básico" : "admin"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRole === "admin" ? <AdminView /> : <BasicView />}
        </CardContent>
      </Card>
    </div>
  );
}

