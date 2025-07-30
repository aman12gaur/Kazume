"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowserClient";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check for error parameter from OAuth callback
    const error = searchParams.get('error');
    if (error) {
      setMessage(decodeURIComponent(error));
    }

    // Handle OAuth tokens from URL fragment (client-side)
    const handleOAuthTokens = async () => {
      // Check if we have tokens in the URL fragment
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        
        if (access_token && refresh_token) {
          console.log('Found OAuth tokens in URL fragment, setting session...');
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          
          if (!error && data.user) {
            console.log('Session established successfully:', data.user.email);
            const userObj = {
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email
            };
            localStorage.setItem('gyaan_user', JSON.stringify(userObj));
            
            // Clear the URL fragment and redirect to dashboard
            window.history.replaceState({}, document.title, window.location.pathname);
            router.replace("/dashboard");
            return;
          }
        }
      }

      // Check if user is already authenticated
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        console.log('User already authenticated:', data.user.email);
        setUser(data.user);
        // For OAuth users, we don't need email confirmation
        if (data.user.email_confirmed_at || data.user.app_metadata?.provider === 'google') {
          setIsVerified(true);
          // Store user data in localStorage for dashboard
          const userObj = {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email
          };
          localStorage.setItem('gyaan_user', JSON.stringify(userObj));
          router.replace("/dashboard");
        } else {
          setIsVerified(false);
        }
      }
    };

    handleOAuthTokens();
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Check your email for a login link or verification.");
    } else {
      // Check if email already exists in users table
      const { data: existing, error: selectError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();
      if (existing) {
        setMessage("This email is already registered. Please sign in.");
        setLoading(false);
        return;
      }
      // Sign up with email verification
      const { data: signupData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth` // redirect to auth page after verification
        }
      });
      if (error) {
        setMessage(error.message);
      } else {
        // Insert user into users table with UID
        let uid = signupData?.user?.id;
        if (!uid) {
          // If UID not in response, fetch user
          const { data: userData } = await supabase.auth.getUser();
          uid = userData?.user?.id;
        }
        if (uid) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', uid)
            .single();
          if (!existingUser) {
            const { error: insertError } = await supabase
              .from('users')
              .insert([{ id: uid, email }]);
            if (insertError) {
              setMessage("Failed to save user to database: " + insertError.message);
            } else {
              setMessage("Check your email to verify your account before logging in.");
            }
          } else {
            setMessage("Check your email to verify your account before logging in.");
          }
        } else {
          setMessage("Could not get user ID after signup.");
        }
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsVerified(false);
    setMessage("Signed out.");
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {user && isVerified ? (
        <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>Welcome, {user.email}</h2>
          <button
            onClick={handleSignOut}
            style={{ width: "100%", padding: 10, borderRadius: 4, background: "#b91c1c", color: "#fff", border: "none", fontWeight: 600 }}
          >
            Sign Out
          </button>
          {message && <div style={{ marginTop: 16, color: "#2563eb", textAlign: "center" }}>{message}</div>}
        </div>
      ) : (
        <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>{mode === "signin" ? "Sign In" : "Sign Up"}</h2>
          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: 10, borderRadius: 4, background: "#2563eb", color: "#fff", border: "none", fontWeight: 600 }}
            >
              {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>
          {/* Google Sign-In Button */}
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }}></div>
              <span style={{ margin: "0 16px", color: "#6b7280", fontSize: "14px" }}>Or continue with</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }}></div>
            </div>
            <button
              onClick={handleGoogleLogin}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 4,
                background: "#fff",
                color: "#374151",
                border: "1px solid #d1d5db",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
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
              Sign in with Google
            </button>
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}
            >
              {mode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
          {message && <div style={{ marginTop: 16, color: "#b91c1c", textAlign: "center" }}>{message}</div>}
        </div>
      )}
    </Suspense>
  );
} 