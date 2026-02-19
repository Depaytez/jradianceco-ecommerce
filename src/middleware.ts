import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Initialize the Supabase client using the SSR package
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value),
          );
          res = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Get session using getUser to secure server-side verification
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = req.nextUrl.clone();

  // Admin Routes Protection
  const adminRoutes = [
    "/admin/dashboard",
    "/admin/roles",
    "/admin/users",
    "/admin/agents",
    "/admin/sales-log",
    "/admin/audit-log",
    "/admin/catalog",
    "/admin/issues",
    "/admin/orders",
  ];

  if (url.pathname.startsWith("/admin") && url.pathname !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Fetch role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Allow admin, agent, and chief_admin roles
    const allowedRoles = ["admin", "agent", "chief_admin"];
    if (!profile?.role || !allowedRoles.includes(profile.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Role-based access control for specific admin routes
    const chiefAdminOnlyRoutes = ["/admin/users", "/admin/roles", "/admin/agents"];
    if (chiefAdminOnlyRoutes.some((route) => url.pathname.startsWith(route))) {
      if (profile.role !== "chief_admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Agent restrictions
    const agentRestrictedRoutes = ["/admin/audit-log", "/admin/sales-log"];
    if (agentRestrictedRoutes.some((route) => url.pathname.startsWith(route))) {
      if (profile.role === "agent") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Log admin access for audit trail
    try {
      await supabase.from("admin_activity_logs").insert({
        admin_id: user.id,
        action: "dashboard_access",
        resource_type: "admin_dashboard",
        resource_id: null,
        changes: { path: url.pathname },
      });
    } catch (error) {
      // Don't block request if logging fails
      console.error("Failed to log admin access:", error);
    }
  }

  // Customer Routes Protection
  const protectedCustomerRoutes = [
    "/shop/history",
    "/shop/wishlist",
    "/shop/checkout",
  ];

  if (protectedCustomerRoutes.some((path) => url.pathname.startsWith(path))) {
    if (!user) {
      const redirectUrl = new URL("/shop/auth", req.url);
      redirectUrl.searchParams.set("redirect", url.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/shop/history", "/shop/wishlist", "/shop/checkout"],
};
