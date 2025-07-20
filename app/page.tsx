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
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value;
    const mobile = (form.elements.namedItem("mobile") as HTMLInputElement)?.value;

    if (mode === "signup") {
      // Pass name and mobile as user_metadata if supported by your Supabase setup
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, mobile },
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setShowVerificationMessage(true);
        setTimeout(() => {
          setShowVerificationMessage(false);
          setMode("signin");
        }, 3000);
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
        // Fetch the user's name from metadata if available
        let userName = data.user.user_metadata?.name;
        if (!userName) {
          // If not in metadata, fallback to email prefix
          userName = (data.user.email || "User").split("@")[0];
        }
        const userObj = {
          name: userName,
          id: data.user.id,
        };
        localStorage.setItem("gyaan_user", JSON.stringify(userObj));
        router.push("/dashboard");
      }
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
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
            <span className="ml-2 text-2xl font-bold text-gray-900">AlfaNumrik</span>
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
              Log In
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
            <div className="text-center">
              <p className="mb-4">Verification email sent. Please check your inbox.</p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => { setShowVerificationMessage(false); setMode("signin"); }}
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              {mode === "signup" && (
                <>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
                    </span>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"/><path d="M16 3v2M8 3v2M3 9h18"/></svg>
                    </span>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      pattern="[0-9]{10,15}"
                      placeholder="Mobile Phone Number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </>
              )}
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

          {/* Google Login Button (moved below divider) */}
          <div className="flex justify-center gap-4 mb-6 mt-0 w-full">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_17_40)">
                  <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.5H37.5C36.8 33.1 34.2 36.1 30.7 37.9V44H38.2C43.1 39.5 47.5 32.8 47.5 24.5Z" fill="#4285F4"/>
                  <path d="M24 48C30.6 48 36.2 45.8 40.2 42.2L32.7 36.1C30.6 37.4 28 38.2 24 38.2C18.7 38.2 14.1 34.7 12.5 30.1H4.7V36.4C8.7 43.1 15.7 48 24 48Z" fill="#34A853"/>
                  <path d="M12.5 30.1C11.9 28.4 11.5 26.6 11.5 24.7C11.5 22.8 11.9 21 12.5 19.3V13H4.7C2.7 16.6 1.5 20.6 1.5 24.7C1.5 28.8 2.7 32.8 4.7 36.4L12.5 30.1Z" fill="#FBBC05"/>
                  <path d="M24 11.8C27.2 11.8 29.7 13 31.3 14.5L38.3 7.5C36.2 5.5 30.6 2 24 2C15.7 2 8.7 6.9 4.7 13L12.5 19.3C14.1 14.7 18.7 11.8 24 11.8Z" fill="#EA4335"/>
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="48" height="48" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Removed the three icon buttons below divider */}

          {/* Footer */}
          <p className="text-xs text-gray-400 text-center">
          Join thousands of motivated students using our AI-powered platform to stay ahead in their studies. Log in to access personalized learning paths, track your progress, and prepare smarter for every exam.
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
