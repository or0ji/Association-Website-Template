"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { RequireAuth } from "@/lib/auth";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-muted/30">
        <Sidebar />
        <main className="ml-64 min-h-screen p-6">{children}</main>
      </div>
    </RequireAuth>
  );
}

