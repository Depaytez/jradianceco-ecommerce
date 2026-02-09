"use client";
import React from "react";
import {
  X,
  Share2,
  Headset,
  KeyRound,
  LogOut,
  Instagram,
  Facebook,
  Twitter,
  UserRoundPen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { AuthUser } from "@/types";

interface ProfileSettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
}

export default function ProfileSettingsOverlay({
  isOpen,
  onClose,
  user,
}: ProfileSettingsOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      {/* Overlay Content Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 pointer-events-auto border border-gray-100 mt-16 flex flex-col overflow-y-auto max-h-[90vh]">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-bold text-radiance-charcoalTextColor">
            Account Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conditional Header: User Data or Auth Links */}
        {user ? (
          /* Displayed when User is Signed In */
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="relative h-14 w-14 rounded-full bg-radiance-goldColor overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
                <span className="text-lg">
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-radiance-charcoalTextColor text-sm">
                  {user.email || "User"}
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-medium">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="px-2 space-y-2 text-xs text-gray-600">
              <p>
                <strong>Email:</strong>{" "}
                <span className="text-radiance-charcoalTextColor">
                  {user.email}
                </span>
              </p>
              {user.role && (
                <p>
                  <strong>Role:</strong>{" "}
                  <span className="capitalize text-radiance-goldColor font-semibold">
                    {user.role}
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Displayed when User is NOT Signed In */
          <div className="mb-8 p-4 bg-radiance-goldColor/5 border border-radiance-goldColor/10 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-radiance-goldColor/10 flex items-center justify-center text-radiance-goldColor">
                <UserRoundPen size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-radiance-charcoalTextColor">
                  Welcome Guest
                </p>
                <p className="text-[10px] text-gray-500">
                  Join JRADIANCE for a better experience
                </p>
              </div>
            </div>
            <Link
              href="/shop/auth"
              onClick={onClose}
              className="flex items-center justify-between w-full bg-radiance-goldColor text-white text-xs font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign In / Sign Up
              <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="space-y-1 text-radiance-charcoalTextColor">
          <button className="w-full flex items-center gap-3 p-3 text-xs font-medium hover:bg-gray-50 rounded-xl transition-colors">
            <Share2 size={16} className="text-radiance-goldColor" /> Share
            Jradiance Website
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-xs font-medium hover:bg-gray-50 rounded-xl transition-colors">
            <Headset size={16} className="text-radiance-goldColor" /> Report an
            issue
          </button>
          {user && (
            <button className="w-full flex items-center gap-3 p-3 text-xs font-medium hover:bg-gray-50 rounded-xl transition-colors">
              <KeyRound size={16} className="text-radiance-goldColor" /> Reset
              Password
            </button>
          )}
        </div>

        {/* Social Media Handles */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Follow Us
          </p>
          <div className="flex gap-4">
            <Link
              href={"https://www.instagram.com/jradiancecosmetics/?hl=de"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram
                size={18}
                className="text-radiance-charcoalTextColor hover:text-radiance-goldColor cursor-pointer transition-colors"
              />
            </Link>

            <Link
              href={"https://www.instagram.com/jradiancecosmetics/?hl=de"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook
                size={18}
                className="text-radiance-charcoalTextColor hover:text-radiance-goldColor cursor-pointer transition-colors"
              />
            </Link>

            <Link
              href={"https://www.instagram.com/jradiancecosmetics/?hl=de"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter
                size={18}
                className="text-radiance-charcoalTextColor hover:text-radiance-goldColor cursor-pointer transition-colors"
              />
            </Link>
          </div>
        </div>

        {/* Logout Button (Only visible if user exists) */}
        {user && (
          <button className="mt-8 flex items-center gap-2 text-red-500 text-xs font-bold p-2 hover:bg-red-50 rounded-lg w-fit transition-colors">
            <LogOut size={16} /> Logout
          </button>
        )}
      </div>
    </div>
  );
}
