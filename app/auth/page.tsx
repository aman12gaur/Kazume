"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowserClient";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        // Check if user is confirmed
        const { data: userDetails } = await supabase.auth.getUser();
        if (userDetails.user && userDetails.user.email_confirmed_at) {
          setIsVerified(true);
          router.replace("/protected");
        } else {
          setIsVerified(false);
        }
      }
    });
  }, []);

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

  if (user && isVerified) {
    return (
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
    );
  }

  return (
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
  );
} 