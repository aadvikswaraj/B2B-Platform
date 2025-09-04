"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineUser,
  AiOutlinePhone,
} from "react-icons/ai";
import { useForm } from "react-hook-form";
import { useAlert } from "@/components/ui/AlertManager";

export default function SignupPage() {
  const router = useRouter();
  const pushAlert = useAlert();
  // Main signup form
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm({
    defaultValues: { terms: true },
  });

  // OTP form (separate RHF instance for clarity)
  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    setError: setOtpError,
    setValue: setOtpValue,
    formState: { errors: otpErrors, isSubmitting: isOtpSubmitting },
  } = useForm();

  const [showOtp, setShowOtp] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");

  const onSubmit = async (data) => {
    let serverResponse = await (
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action:"send-verification", ...data }),
      })
    ).json();
    if (serverResponse.success) {
      // Successfully sent OTP, proceed to OTP verification
      setEmailForOtp(data.email);
      setShowOtp(true);
    }
    else {
      pushAlert("error","Something went wrong!");
    };
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
          body: JSON.stringify({ action: "verify-otp", email: emailForOtp, otp: data.otp }),
        })
      ).json();

      if (serverResponse.success) {
        let serverResponse2 = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emailForOtp, key: serverResponse.data.key }),
        })).json();
        if (serverResponse2.success) {
          pushAlert("success", "Account created successfully!");
          router.push("/");
        } else {
          pushAlert("error", "Something went wrong!");
        }
      } else if (serverResponse.message) {
        setOtpError('otp', { message: serverResponse.message });
      }
    } catch (e) {
      pushAlert("error", "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Image
            src="/logo/logo-s-2.png"
            alt="Logo"
            width={150}
            height={100}
            className="mx-auto"
          />
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!showOtp ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* ...existing code... (signup form fields) */}
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                        message: "Email is not valid",
                      },
                    })}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <AiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* Name */}
              <div>
                <label
                  htmlFor="Name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <div className="mt-1 relative">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    {...register("name", {
                      required: "Name is required",
                      maxLength: {
                        value: 50,
                        message: "Name must be less than 50 characters",
                      },
                    })}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    {...register("phone", {
                      required: "Phone Number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Phone Number must be 10 digits",
                      },
                    })}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <AiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Create Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* Terms and Conditions */}
              <div className="block">
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    {...register("terms", {
                      required: "You must accept the Terms and Conditions",
                    })}
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      Terms and Conditions
                    </a>
                  </label>
                </div>
                {errors.terms && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.terms.message}
                  </p>
                )}
              </div>
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? "Submitting..." : "Create Account"}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOtpSubmit(onOtpSubmit)}>
              <div className="text-center">
                <AiOutlineMail className="mx-auto h-12 w-12 text-blue-500" />
                <h3 className="mt-2 text-xl font-bold text-gray-900">
                  Verify your email
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  We have sent a 6-digit OTP to{" "}
                  <span className="font-medium text-blue-600">
                    {emailForOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => {setShowOtp(false); setOtpValue('otp', ''); }}
                    className="ml-2 text-red-600 hover:text-red-500 hover:underline font-medium"
                  >
                    Change email?
                  </button>
                </p>
              </div>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 w-full mx-auto"
                >
                  Enter OTP
                </label>
                <div className="mt-2 relative mx-auto max-w-full">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    {...registerOtp("otp", {
                      required: "Please enter the verification code",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: "Please enter 6 digits",
                      },
                    })}
                  />
                </div>
                {otpErrors.otp && (
                  <p className="mt-2 text-sm text-red-600">
                    {otpErrors.otp.message}
                  </p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isOtpSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 disabled:opacity-60 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isOtpSubmitting ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
