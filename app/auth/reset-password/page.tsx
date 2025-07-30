"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabaseBrowserClient";
import Link from "next/link";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        setMessage(error.message);
        setIsSuccess(false);
      } else {
        setMessage("Check your email for a password reset link.");
        setIsSuccess(true);
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
      setIsSuccess(false);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Reset Password</h2>
      
      {!isSuccess ? (
        <>
          <p style={{ textAlign: "center", marginBottom: 24, color: "#6b7280" }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleResetPassword}>
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
              {loading ? "Sending..." : "Send Reset Link"}
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
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
                     <div style={{ marginTop: 16 }}>
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