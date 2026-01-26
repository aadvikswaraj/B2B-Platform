"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    setError,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      let serverResponse = await (
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      ).json();

      if (serverResponse.success) {
        router.push("/");
      } else if (serverResponse.message === "Invalid password") {
        setError("password", { type: "manual", message: "Invalid password" });
      } else if (serverResponse.message === "User not found") {
        setError("email", { type: "manual", message: "User not found" });
      } else {
        setError("root", {
          type: "manual",
          message: serverResponse.message || "An error occurred",
        });
      }
    } catch (err) {
      setError("root", {
        type: "manual",
        message: "Network error, please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white sm:bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Card Container - Reduced padding for compactness */}
        <div className="bg-white sm:shadow-xl sm:rounded-2xl overflow-hidden ring-1 ring-black/5">
          <div className="px-6 py-8 sm:p-8">
            {/* Header - Compact */}
            <div className="text-center mb-6">
              <div className="inline-flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src="/logo/logo-s-2.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h2>
            </div>

            {/* Form - Reduced spacing */}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Global Error */}
              {errors.root && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  {errors.root.message}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Email address"
                    className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200 text-sm ${
                      errors.email
                        ? "ring-red-300 focus:ring-red-500 bg-red-50"
                        : ""
                    }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
                    className={`block w-full pl-11 pr-12 py-3 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200 text-sm ${
                      errors.password
                        ? "ring-red-300 focus:ring-red-500 bg-red-50"
                        : ""
                    }`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Min 6 characters" },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="px-2 bg-white text-gray-400 font-semibold">
                    Or
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => console.log("Google login")}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all text-sm active:scale-[0.99]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          {/* Footer Card Section */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              New here?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
