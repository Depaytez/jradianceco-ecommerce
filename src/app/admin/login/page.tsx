"use client";
import React from "react";
import { Lock, ShieldCheck, Mail } from "lucide-react";

export default function AdminLogInPage() {
  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-radiance-goldColor transition-colors";

  return (
    <div className="min-h-screen bg-radiance-charcoalTextColor flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <ShieldCheck className="mx-auto text-radiance-goldColor" size={48} />
          <h1 className="text-xl font-black text-white tracking-[0.2em] uppercase">
            Admin Portal
          </h1>
          <p className="text-[10px] text-white/40 font-bold uppercase">
            Authorized Access Only
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <form className="space-y-4">
            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-white/30"
                size={18}
              />
              <input
                type="email"
                placeholder="Admin Email"
                className={inputClass}
                required
              />
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-white/30"
                size={18}
              />
              <input
                type="password"
                placeholder="Master Password"
                className={inputClass}
                required
              />
            </div>
            <button className="w-full bg-radiance-goldColor text-radiance-charcoalTextColor font-black py-4 rounded-xl hover:bg-white transition-all text-xs uppercase tracking-widest">
              Authorize LogIn
            </button>
          </form>
        </div>
        <p className="text-center text-[9px] text-white/20 font-medium">
          SECURED BY SUPABASE AUTH
        </p>
      </div>
    </div>
  );
}
