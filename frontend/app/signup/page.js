"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useAlert } from "@/components/ui/AlertManager";

export default function SignupPage() {
  const router = useRouter();
  const pushAlert = useAlert();

  // Registration data state
  const [step, setStep] = useState(1); // 1: Info, 2: Security, 3: OTP
  const [formData, setFormData] = useState({});
  const [slideDirection, setSlideDirection] = useState("right");
  const [animationClass, setAnimationClass] = useState("animate-fade-in-up");

  // Step 1 Form
  const {
    register: registerStep1,
    formState: { errors: errorsStep1 },
    handleSubmit: handleSubmitStep1,
    trigger: triggerStep1,
  } = useForm({ mode: "onTouched" });

  // Step 2 Form
  const {
    register: registerStep2,
    formState: { errors: errorsStep2, isSubmitting: isSubmittingStep2 },
    handleSubmit: handleSubmitStep2,
    watch: watchStep2,
  } = useForm({ mode: "onTouched" });

  // OTP Form
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp, isSubmitting: isSubmittingOtp },
    setError: setOtpError,
  } = useForm();

  const [emailForOtp, setEmailForOtp] = useState("");

  const handleNextStep1 = async (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setSlideDirection("right");
    setAnimationClass("opacity-0 transform -translate-x-full");
    setTimeout(() => {
      setStep(2);
      setAnimationClass("animate-fade-in-up");
    }, 200);
  };

  const handleBackToStep1 = () => {
    setSlideDirection("left");
    setAnimationClass("opacity-0 transform translate-x-full");
    setTimeout(() => {
      setStep(1);
      setAnimationClass("animate-fade-in-up");
    }, 200);
  };

  const onRegisterSubmit = async (data) => {
    // Combine data
    const finalData = { ...formData, ...data };
    delete finalData.terms;
    // Store it just in case needed for retry
    setFormData(finalData);

    try {
      let serverResponse = await (
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "send-verification", ...finalData }),
        })
      ).json();

      if (serverResponse.success) {
        setEmailForOtp(finalData.email);
        setStep(3);
      } else {
        pushAlert("error", serverResponse.message || "Something went wrong!");
      }
    } catch (e) {
      pushAlert("error", "Network error. Please try again.");
    }
  };

  const onOtpSubmit = async (data) => {
    try {
      let serverResponse = await (
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "verify-otp",
            email: emailForOtp,
            otp: data.otp,
          }),
        })
      ).json();

      if (serverResponse.success) {
        let serverResponse2 = await (
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
            credentials: "include",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ key: serverResponse.data.key }),
          })
        ).json();

        if (serverResponse2.success) {
          pushAlert("success", "Account created successfully!");
          router.push("/");
        } else {
          pushAlert(
            "error",
            serverResponse2.message || "Something went wrong!",
          );
        }
      } else if (serverResponse.message) {
        setOtpError("otp", { message: serverResponse.message });
      }
    } catch (e) {
      pushAlert("error", "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-white sm:bg-gray-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md transition-all duration-300 ${animationClass}`}
      >
        <div className="bg-white sm:shadow-xl sm:rounded-2xl overflow-hidden ring-1 ring-black/5 min-h-[500px] flex flex-col">
          <div className="px-6 py-8 sm:p-10 flex-1 flex flex-col">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                {step === 3 ? "Verify Email" : "Create Account"}
              </h2>
              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-4 mb-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? "w-8 bg-blue-600" : "w-2 bg-gray-200"}`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <form
                id="step1-form"
                className="space-y-4 flex-1 flex flex-col"
                onSubmit={handleSubmitStep1(handleNextStep1)}
              >
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200 sm:text-sm ${errorsStep1.name ? "ring-red-300 bg-red-50" : ""}`}
                      placeholder="John Doe"
                      defaultValue={formData.name}
                      {...registerStep1("name", {
                        required: "Name is required",
                        maxLength: { value: 50, message: "Max 50 chars" },
                      })}
                    />
                  </div>
                  {errorsStep1.name && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {errorsStep1.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200 sm:text-sm ${errorsStep1.email ? "ring-red-300 bg-red-50" : ""}`}
                      placeholder="you@example.com"
                      defaultValue={formData.email}
                      {...registerStep1("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                          message: "Invalid email",
                        },
                      })}
                    />
                  </div>
                  {errorsStep1.email && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {errorsStep1.email.message}
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all active:scale-[0.98]"
                  >
                    Continue <ChevronRight className="ml-1 w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Security */}
            {step === 2 && (
              <form
                id="step2-form"
                className="space-y-4 flex-1 flex flex-col"
                onSubmit={handleSubmitStep2(onRegisterSubmit)}
              >
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
                    Phone
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200 sm:text-sm ${errorsStep2.phone ? "ring-red-300 bg-red-50" : ""}`}
                      placeholder="1234567890"
                      defaultValue={formData.phone}
                      {...registerStep2("phone", {
                        required: "Phone is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "10 digits required",
                        },
                      })}
                    />
                  </div>
                  {errorsStep2.phone && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {errorsStep2.phone.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200 sm:text-sm ${errorsStep2.password ? "ring-red-300 bg-red-50" : ""}`}
                      placeholder="••••••••"
                      {...registerStep2("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Min 8 chars" },
                      })}
                    />
                  </div>
                  {errorsStep2.password && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {errorsStep2.password.message}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start py-2">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      {...registerStep2("terms", { required: "Required" })}
                    />
                  </div>
                  <div className="ml-3 text-sm leading-tight">
                    <label htmlFor="terms" className="text-gray-600">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Conditions
                      </a>
                    </label>
                    {errorsStep2.terms && (
                      <p className="text-xs text-red-500 mt-1">
                        You must agree to continue
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="flex-none px-4 py-3.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingStep2}
                    className="flex-1 flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 transition-all active:scale-[0.98]"
                  >
                    {isSubmittingStep2 ? "Processing..." : "Create Account"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: OTP */}
            {step === 3 && (
              <form
                className="space-y-6 flex-1 flex flex-col justify-center"
                onSubmit={handleSubmitOtp(onOtpSubmit)}
              >
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-6">
                    Enter the code sent to{" "}
                    <span className="font-medium text-gray-900">
                      {emailForOtp}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className={`block w-full py-4 text-center text-3xl tracking-[0.5em] font-bold bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all duration-200 ${errorsOtp.otp ? "ring-red-300 bg-red-50" : ""}`}
                    {...registerOtp("otp", {
                      required: "Code is required",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: "Must be 6 digits",
                      },
                    })}
                  />
                  {errorsOtp.otp && (
                    <p className="text-xs text-center text-red-500 font-medium">
                      {errorsOtp.otp.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOtp}
                  className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 transition-all active:scale-[0.98] mt-6"
                >
                  {isSubmittingOtp ? "Verifying..." : "Verify & Complete"}
                </button>
              </form>
            )}
          </div>

          {/* Footer - Only show on steps 1 & 2 */}
          {step < 3 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer info (optional) */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
