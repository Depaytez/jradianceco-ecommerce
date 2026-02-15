"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

// Inner component that uses useSearchParams - wrapped in Suspense
function EmailConfirmationContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const supabase = createClient();

        // Get the tokens from URL parameters
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (type === "signup" && tokenHash) {
          // Verify the confirmation tokens
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            setStatus("success");
            setMessage(
              "Your email has been successfully confirmed! You can now sign in with your credentials.",
            );

            // Redirect to login page after 3 seconds with success message
            setTimeout(() => {
              router.push("/shop/auth?confirmed=true");
            }, 3000);
          } else {
            throw new Error("Failed to confirm email");
          }
        } else if (type === "recovery") {
          // Handle password reset if needed
          setStatus("success");
          setMessage(
            "Password reset link processed. Please check your email for further instructions.",
          );
        } else {
          throw new Error("Invalid confirmation link");
        }
      } catch (error) {
        console.error("Confirmation error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to confirm email. The link may have expired.",
        );
      }
    };

    handleEmailConfirmation();
  }, [searchParams, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-radiance-goldColor/10 rounded-full flex items-center justify-center text-radiance-goldColor mb-2">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-black text-radiance-charcoalTextColor tracking-tight">
            Email Confirmation
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Verifying your email address
          </p>
        </div>

        {/* Status Display */}
        <div className="text-center space-y-4">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2
                size={48}
                className="animate-spin text-radiance-goldColor mx-auto"
              />
              <p className="text-gray-600">Confirming your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle size={48} className="text-green-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-green-700 font-semibold">Email Confirmed!</p>
                <p className="text-sm text-gray-600">{message}</p>
                <p className="text-xs text-gray-500">
                  Redirecting you to login...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle size={48} className="text-red-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-red-700 font-semibold">
                  Confirmation Failed
                </p>
                <p className="text-sm text-gray-600">{message}</p>
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => router.push("/shop/auth")}
                    className="w-full bg-radiance-charcoalTextColor text-white font-bold py-3 rounded-xl hover:bg-radiance-goldColor transition-all text-sm"
                  >
                    Back to Login
                  </button>
                  <p className="text-xs text-gray-500">
                    Need a new confirmation link? Try signing up again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-50">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 bg-radiance-goldColor/10 rounded-full flex items-center justify-center text-radiance-goldColor mb-2">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-black text-radiance-charcoalTextColor tracking-tight">
            Email Confirmation
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Verifying your email address
          </p>
        </div>
        <div className="text-center space-y-4">
          <Loader2
            size={48}
            className="animate-spin text-radiance-goldColor mx-auto"
          />
          <p className="text-gray-600">Confirming your email...</p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function EmailConfirmationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailConfirmationContent />
    </Suspense>
  );
}
