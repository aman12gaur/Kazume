"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseBrowserClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("You need to be authenticated to update your password. Please use the reset link from your email.");
        return;
      }
      setUser(user);
    };

    checkUser();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage(error.message);
        setIsSuccess(false);
      } else {
        setMessage("Password updated successfully!");
        setIsSuccess(true);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
      setIsSuccess(false);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Update Password</h2>
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          borderRadius: 4, 
          background: "#fef2f2", 
          color: "#b91c1c",
          border: "1px solid #fecaca"
        }}>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
                 <div style={{ textAlign: "center" }}>
           <Link 
             href="/" 
             style={{ 
               color: '#2563eb', 
               textDecoration: 'none', 
               fontSize: 14,
               fontWeight: 500
             }}
           >
             Back to Sign In
           </Link>
         </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Update Password</h2>
      
      {!isSuccess ? (
        <>
          <p style={{ textAlign: "center", marginBottom: 24, color: "#6b7280" }}>
            Enter your new password below.
          </p>
          
          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: 16 }}>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: 10, 
                borderRadius: 4, 
                background: "#2563eb", 
                color: "#fff", 
                border: "none", 
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
          
                     <div style={{ marginTop: 16, textAlign: "center" }}>
             <Link 
               href="/" 
               style={{ 
                 color: '#2563eb', 
                 textDecoration: 'none', 
                 fontSize: 14,
                 fontWeight: 500
               }}
             >
               Back to Sign In
             </Link>
           </div>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            borderRadius: 4, 
            background: "#d1fae5", 
            color: "#065f46",
            border: "1px solid #a7f3d0"
          }}>
            <p style={{ margin: 0 }}>✅ {message}</p>
          </div>
          
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Redirecting to dashboard...
          </p>
        </div>
      )}
      
      {message && !isSuccess && (
        <div style={{ 
          marginTop: 16, 
          color: "#b91c1c", 
          textAlign: "center",
          padding: 12,
          borderRadius: 4,
          background: "#fef2f2",
          border: "1px solid #fecaca"
        }}>
          {message}
        </div>
      )}
    </div>
  );
} 