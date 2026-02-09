/**
 * User Context Provider
 * Manages authentication state (client-side only)
 * Database operations should use Server Actions
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { AuthUser, UserRole } from "@/types";

const UserContext = createContext<AuthUser | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | undefined>(undefined);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          setAuthUser({
            id: data.user.id,
            email: data.user.email || "",
            role: (data.user.user_metadata?.role as UserRole) || "customer",
          });
        } else {
          setAuthUser(undefined);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthUser(undefined);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthUser({
            id: session.user.id,
            email: session.user.email || "",
            role: (session.user.user_metadata?.role as UserRole) || "customer",
          });
        } else {
          setAuthUser(undefined);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={authUser}>{children}</UserContext.Provider>
  );
}
/**
 * Hook to get current authenticated user
 * Returns AuthUser with id, email, and role, or null if not authenticated
 */
export function useUser(): AuthUser | null {
  const context = useContext(UserContext);
  return context || null;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const user = useUser();
  return !!user;
}

/**
 * Hook to check if user has admin privileges
 */
export function useIsAdmin(): boolean {
  const user = useUser();
  return user ? ["admin", "agent", "chief_admin"].includes(user.role) : false;
}

/**
 * Hook to check if user is chief admin
 */
export function useIsChiefAdmin(): boolean {
  const user = useUser();
  return user?.role === "chief_admin";
}
