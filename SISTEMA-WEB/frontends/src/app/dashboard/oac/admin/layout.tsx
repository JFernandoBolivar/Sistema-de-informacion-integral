import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-gray-800 text-white p-4 w-full">
        <ul className="flex space-x-4 items-center w-full">
          <li className="inline-block pr-4 border-r-2">
            <Link href="/">Inicio</Link>
          </li>
          {/* <li className="inline-block">
              <Link href="/login">Suspendidos</Link>
            </li> */}
          <li className="inline-block">
            <Link href="/dashboard/oac/admin/inventario">Inventario</Link>
          </li>
          <li className="inline-block">
            <Link href="/dashboard/oac/admin/solicitudes">Solicitudes</Link>
          </li>
          <li className="inline-block ml-auto">*Username*</li>
        </ul>
      </nav>
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
