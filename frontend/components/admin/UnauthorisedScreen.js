"use client";
import React from 'react';
import Link from 'next/link';
import { LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * UnauthorisedScreen (403/401)
 *
 * A clean, responsive screen for admin routes when the user lacks permissions.
 *
 * Props:
 * - code: '401' | '403' (default: '403')
 * - title: string (default: 'Access denied')
 * - message: string (default: friendly explanation)
 * - homeHref: string (default: '/')
 * - loginHref: string (default: '/login')
 * - adminHref: string (default: '/admin')
 * - showLogin: boolean (default: true) — whether to show Login CTA
 */
export default function UnauthorisedScreen({
  code = '403',
  title = 'Access denied',
  message = "You don't have permission to view this page. If you believe this is a mistake, please contact your administrator.",
  homeHref = '/',
  loginHref = '/login',
  adminHref = '/admin',
}) {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-[2px] shadow-lg">
          <div className="h-full w-full rounded-2xl bg-white flex items-center justify-center">
            <LockClosedIcon className="h-9 w-9 text-indigo-600" />
          </div>
        </div>

        <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">{code}</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">{message}</p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={adminHref}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-white text-sm font-semibold shadow hover:bg-indigo-500 transition"
          >
            Go to Admin
          </Link>
          <Link
            href={homeHref}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go to Homepage
          </Link>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowPathIcon className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    </div>
  );
}
