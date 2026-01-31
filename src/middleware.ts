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

  // Protect Admin Routes
  if (
    url.pathname.startsWith("/admin") &&
    !url.pathname.startsWith("/admin/login")
  ) {
    if (!user) return NextResponse.redirect(new URL("/admin/login", req.url));

    // Fetch role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url)); // Boot non-admins to home
    }
  }

  // Protect Customer Account Routes
  const protectedCustomerRoutes = ["/shop/history", "/shop/wish-list"];
  if (protectedCustomerRoutes.some((path) => url.pathname.startsWith(path))) {
    if (!user) return NextResponse.redirect(new URL("/shop/auth", req.url));
  }

  return res;
}

// export const config = {
//   // Matches all request paths except for the ones starting with:
//   // _next/static, _next/image, favicon.ico, and public images
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
// };

export const config = {
  matcher: ["/admin/:path*", "/shop/history", "/shop/wish-list"],
};
