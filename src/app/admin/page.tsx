"use client";

import AdminSidePanel from "@/component/AdminSidePanel";
import { useUser, useIsAdmin } from "@/context/UserContext";
import { redirect } from "next/navigation";

export default function AdminDashboard() {
  const user = useUser();
  const isAdmin = useIsAdmin();

  // Verify user has admin role
  if (!user || !isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-radiance-charcoalTextColor">
          Welcome, {user.email}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Role: <span className="capitalize font-semibold">{user.role}</span>
        </p>
      </div>

      <AdminSidePanel />
    </div>
  );
}
