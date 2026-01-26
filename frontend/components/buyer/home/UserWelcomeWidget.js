"use client";
import React, { useContext } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/context";
import { FaUserCircle } from "react-icons/fa";

export default function UserWelcomeWidget() {
  const { loggedIn, user, loading } = useContext(AuthContext);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100/50 p-4 flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3 text-indigo-200">
          {loggedIn && user?.avatar ? (
            <img
              src={user.avatar}
              alt="User"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-8 h-8 text-indigo-300" />
          )}
        </div>

        <h3 className="text-gray-900 font-semibold text-sm mb-1">
          {loading
            ? "..."
            : loggedIn
              ? `Hi, ${user?.name || "Buyer"}`
              : "Welcome to B2B Platform"}
        </h3>
        <p className="text-xs text-gray-500 mb-4 px-2">
          {loggedIn
            ? "Get quotations and manage orders."
            : "Sign in for the best sourcing experience."}
        </p>

        {!loggedIn ? (
          <div className="flex flex-col w-full gap-2">
            <Link
              href="/login"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-full transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-full transition-colors"
            >
              Join for Free
            </Link>
          </div>
        ) : (
          <div className="flex flex-col w-full gap-2">
            <Link
              href="/myaccount/message-center"
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold py-2 rounded-full transition-colors"
            >
              Messages
            </Link>
            <Link
              href="/myaccount/orders"
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-full transition-colors"
            >
              Orders
            </Link>
          </div>
        )}
      </div>

      {/* RFQ / Promo Card */}
      <div className="bg-[#555555] rounded-lg shadow-sm p-4 flex-1 flex flex-col justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 z-0"></div>
        <div className="relative z-10">
          <h4 className="text-white font-semibold text-sm mb-2">
            Request for Quotation
          </h4>
          <p className="text-gray-300 text-xs mb-3 line-clamp-3">
            One request, multiple quotes. detailed specs.
          </p>
          <Link
            href="/myaccount/rfqs"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-lg"
          >
            Request Now
          </Link>
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
      </div>
    </div>
  );
}
