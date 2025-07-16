"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (mode === "signup") {
      const { error, data } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setShowVerificationMessage(true);
        setTimeout(() => {
          setShowVerificationMessage(false);
          setMode("signin");
        }, 5000);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message === "Invalid login credentials") {
          setError("Incorrect password.");
        } else if (error.message.includes("User not found")) {
          setError("No account found. Please sign up.");
        } else {
          setError(error.message);
        }
      } else if (data && data.user) {
        // Store user info in localStorage for dashboard
        const userEmail = data.user.email || "User";
        const userObj = {
          name: userEmail.split("@")[0],
          id: data.user.id,
        };
        localStorage.setItem("gyaan_user", JSON.stringify(userObj));
        router.push("/dashboard");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left side - Form */}
        <div className="flex flex-col justify-center items-center w-full max-w-md px-10 py-12">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#2563eb" />
              <path d="M12 20L20 12L28 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 28L20 20L28 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="ml-2 text-2xl font-bold text-gray-900">SmartSave</span>
          </div>

          {/* Welcome */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-gray-500">
              {mode === "signin"
                ? "Welcome Back, Please enter Your details"
                : "Sign up to get started"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg overflow-hidden mb-6 w-full">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-3 text-sm font-medium transition focus:outline-none ${
                mode === "signin"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 text-sm font-medium transition focus:outline-none ${
                mode === "signup"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          {showVerificationMessage ? (
            <div>
              <p>Verification email sent. Please check your inbox.</p>
              <button onClick={() => { setShowVerificationMessage(false); setMode("signin"); }}>
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.67 2.07-3.87 4.06-5.94M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .39-.07.76-.18 1.11M6.1 6.1l11.8 11.8"/><path d="M1 1l22 22"/></svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="8"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Continue
              </button>
            </form>
          )}

          {/* Or Continue With */}
          <div className="flex items-center my-6 w-full">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="mx-3 text-gray-400 text-sm">Or Continue With</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex justify-center gap-4 mb-6">
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
              <img src="https://unsplash.com/photos/young-professional-photographer-working-on-tablet-in-creative-workplace-NNLxyZUqLR0" alt="Google" className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
              <svg width="20" height="20" fill="currentColor" className="text-black" viewBox="0 0 20 20"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 14.5A6.5 6.5 0 1 1 10 3.5a6.5 6.5 0 0 1 0 13zm0-10.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
              <svg width="20" height="20" fill="currentColor" className="text-blue-900" viewBox="0 0 20 20"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm2.5 7.5h-1V7a1 1 0 0 0-2 0v2.5h-1A.5.5 0 0 0 8 10v1a.5.5 0 0 0 .5.5h1V13a1 1 0 0 0 2 0v-1.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/></svg>
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 text-center">
            Join the millions of smart investors who trust us to manage their finances. Login to access your personalized dashboard, track your portfolio performance, and make informed investment decisions.
          </p>
        </div>

        {/* Right side - Illustration (now visible on all screens) */}
        <div className="flex flex-1 relative min-h-[200px]">
          <img
            src="https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg"
            alt="Woman writing on tablet"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-blue-900 opacity-30"></div>
        </div>
      </div>
    </div>
  );
}
