"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserRoundPen, Shield } from "lucide-react";
import ProfileSettingsOverlay from "./ProfileSettingsOverlay";
import { usePathname } from "next/navigation";
import { useUser, useIsAdmin } from "@/context/UserContext";

export default function TopBar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const user = useUser();
  const isAdmin = useIsAdmin();

  // Hide Top Bar on /admin routes
  if (pathname?.startsWith("/admin")) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-2 flex items-center justify-between">
          {/* Logo container */}
          <Link
            href="/"
            className="relative h-10 w-32 md:h-14 md:w-30 max-w-[10vw] flex items-center group transition-transform hover:scale-105"
          >
            <Image
              src="/logo-removebg.png"
              alt="JRADIANCE logo"
              fill
              // priority
              className="object-contain object-left"
              loading="eager"
              // width="176"
              // height="56"
            />
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-radiance-goldColor transition-all duration-300 group-hover:w-1/2" />
          </Link>

          {/* Admin info */}
          {user && isAdmin && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-radiance-charcoalTextColor">
                  {user.email}
                </p>
                <p className="text-[9px] text-gray-500 capitalize">
                  {user.role}
                </p>
              </div>
              <div className="h-9 w-9 rounded-full bg-radiance-goldColor flex items-center justify-center text-white">
                <Shield size={18} />
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-2 flex items-center justify-between">
        {/* Logo container */}
        <Link
          href="/"
          className="relative h-10 w-32 md:h-14 md:w-44 max-w-[40vw] flex items-center group transition-transform hover:scale-105"
        >
          <Image
            src="/logo-removebg.png"
            alt="JRADIANCE logo"
            fill
            // priority
            className="object-contain object-left"
            loading="eager"
            // width="176"
            // height="56"
          />
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-radiance-goldColor transition-all duration-300 group-hover:w-1/2" />
        </Link>

        {/* Navigation and profile */}
        <div className="flex items-center gap-4">
          {/* Navigation links for authenticated users */}
          {user && (
            <>
              <Link
                href="/shop/history"
                className="text-xs font-semibold text-gray-600 hover:text-radiance-goldColor transition-colors hidden"
              >
                Orders
              </Link>
              <Link
                href="/shop/wishlist"
                className="text-xs font-semibold text-gray-600 hover:text-radiance-goldColor transition-colors hidden"
              >
                Wishlist
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs font-semibold text-radiance-goldColor hover:text-radiance-charcoalTextColor transition-colors px-3 py-1 border border-radiance-goldColor rounded"
                >
                  Dashboard
                </Link>
              )}
            </>
          )}

          {/* Profile button */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex flex-col items-center gap-0.5 group"
            >
              {user ? (
                <div className="h-9 w-9 rounded-full bg-radiance-goldColor flex items-center justify-center text-white font-bold">
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full bg-radiance-goldColor/10 flex items-center justify-center text-radiance-goldColor group-hover:bg-radiance-goldColor group-hover:text-white transition-all">
                  <UserRoundPen size={18} />
                </div>
              )}
              <span className="text-[9px] font-bold text-radiance-charcoalTextColor group-hover:text-radiance-goldColor transition-colors">
                {user ? user.email?.split("@")[0] || "Account" : "Account"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile & Settings Overlay */}
      <ProfileSettingsOverlay
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />
    </header>
  );
}
