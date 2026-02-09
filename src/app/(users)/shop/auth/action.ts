"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export interface AuthState {
  error: string | null;
  message?: string;
}

/**
 * Handle user signup
 * All users start as 'customer' role
 * Profile created automatically via database trigger
 */
export async function signup(
  prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;

    // Validation
    if (!email || !password || !fullName || !phone) {
      return { error: "All fields are required" };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }

    if (fullName.length < 2) {
      return { error: "Full name must be at least 2 characters" };
    }

    if (!email.includes("@")) {
      return { error: "Please enter a valid email address" };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: "customer", // Always customer on signup
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Redirect to success page or home
    redirect("/");
  } catch (error) {
    console.error("Signup error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during signup",
    };
  }
}

/**
 * Handle user login
 * Works for both customers and admins
 * Role check happens in middleware
 */
export async function login(
  prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState | null> {
  try {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validation
    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    const data = {
      email,
      password,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      return { error: error.message };
    }

    // Redirect to appropriate dashboard
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        profile?.role &&
        ["admin", "agent", "chief_admin"].includes(profile.role)
      ) {
        redirect("/admin");
      } else {
        redirect("/shop");
      }
    }

    redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during login",
    };
  }
}
