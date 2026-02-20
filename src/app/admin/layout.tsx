/**
 * Admin Layout
 * 
 * Provides consistent layout for all admin pages with sidebar navigation.
 */

import AdminSidePanel from "@/components/AdminSidePanel";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    redirect("/admin/login");
  }

  const allowedRoles = ["admin", "agent", "chief_admin"];
  if (!allowedRoles.includes(profile.role)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-radiance-creamBackgroundColor">
      {/* Admin Sidebar */}
      <AdminSidePanel />

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        <div className="container mx-auto px-8 py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
