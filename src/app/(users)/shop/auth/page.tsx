"use client";

import React, { useState, useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRoundPen, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { signup, login } from "./action";

export default function CustomerAuthPage() {
  // Toggle between Login and Signup
  const [isLogin, setIsLogin] = useState(true);

  // useActionState handles the server response (errors/success) automatically
  const [state, formAction, isPending] = useActionState(
    isLogin ? login : signup,
    null,
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/shop";
  const isConfirmed = searchParams.get("confirmed") === "true";

  // Handle successful login/signup
  useEffect(() => {
    if (state?.message && !state.error && !state.requiresConfirmation) {
      // Redirect to intended page after successful auth (only if no confirmation needed)
      router.push(redirectTo);
    }
  }, [state, router, redirectTo]);

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-1 focus:ring-radiance-goldColor outline-none transition-all";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-radiance-goldColor/10 rounded-full flex items-center justify-center text-radiance-goldColor mb-2">
            <UserRoundPen size={24} />
          </div>
          <h1 className="text-2xl font-black text-radiance-charcoalTextColor tracking-tight">
            {isLogin ? "Welcome Back" : "Join JRADIANCE"}
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Organic Beauty & Care
          </p>
        </div>

        {/* Display Messages from Server Action */}
        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in zoom-in duration-200">
            {state.error}
          </div>
        )}

        {/* Email Confirmation Success Message */}
        {isConfirmed && !state?.error && (
          <div className="p-3 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-xl animate-in fade-in zoom-in duration-200">
            <p>🎉 Your email has been successfully confirmed!</p>
            <p className="mt-1">You can now sign in with your credentials.</p>
          </div>
        )}

        {/* Success Message for Signup */}
        {state?.message && !state.error && !isConfirmed && (
          <div className="p-3 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-xl animate-in fade-in zoom-in duration-200">
            {state.message}
            {state.requiresConfirmation && state.email && (
              <div className="mt-2 text-xs">
                <p>
                  We&apos;ve sent a confirmation link to:{" "}
                  <strong>{state.email}</strong>
                </p>
                <p className="mt-1">
                  Please check your email and click the link to complete your
                  registration.
                </p>
                <p className="mt-1 text-orange-600">
                  Note: The confirmation link will expire in 1 hour.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Auth Forms */}
        <form action={formAction} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  name="full_name"
                  type="text"
                  placeholder="Full Name"
                  className={inputClass}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  className={inputClass}
                  required
                  disabled={isPending}
                />
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              className={inputClass}
              required
              disabled={isPending}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className={inputClass}
              required
              disabled={isPending}
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-radiance-charcoalTextColor text-white font-bold py-4 rounded-xl hover:bg-radiance-goldColor transition-all shadow-lg text-sm"
          >
            {isPending && <Loader2 size={18} className="animate-spin" />}
            {isLogin ? "LogIn" : "Create Account"}
          </button>
        </form>

        <div>
          {/* Forgot Password Link (only show on login) */}
          {isLogin && (
            <div className="text-center pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() => router.push("/shop/auth/forgot-password")}
                className="text-xs font-bold text-radiance-goldColor hover:underline underline-offset-4"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Toggle between Signup and Login */}
          <div className="text-center pt-2 border-t border-gray-50">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-radiance-goldColor hover:underline underline-offset-4"
            >
              {isLogin
                ? "New to JRADIANCE? SignUp"
                : "Already have an account? LogIn"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
