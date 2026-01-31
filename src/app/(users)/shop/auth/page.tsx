"use client";

import React, { useState } from "react";
import { UserRoundPen, Mail, Lock, User, Phone } from "lucide-react";

export default function CustomerAuthPage() {
  // Toggle between Login and Signup
  const [isLogin, setIsLogin] = useState(true);

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

        {/* Auth Forms */}
        <form className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  className={inputClass}
                  required
                />
              </div>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className={inputClass}
                  required
                />
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              className={inputClass}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              className={inputClass}
              required
            />
          </div>
          <button className="w-full bg-radiance-charcoalTextColor text-white font-bold py-4 rounded-xl hover:bg-radiance-goldColor transition-all shadow-lg text-sm">
            {isLogin ? "LogIn" : "Create Account"}
          </button>
        </form>

        {/* Toggle between Signup and Login */}
        <div className="text-center pt-4 border-t border-gray-50">
          <button
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
  );
}
