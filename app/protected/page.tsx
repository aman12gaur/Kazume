"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowserClient";

export default function ProtectedPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: 80 }}>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Protected Page</h2>
      <div style={{ textAlign: "center", marginBottom: 24 }}>Welcome, {user.email}</div>
      <button
        onClick={handleSignOut}
        style={{ width: "100%", padding: 10, borderRadius: 4, background: "#b91c1c", color: "#fff", border: "none", fontWeight: 600 }}
      >
        Sign Out
      </button>
    </div>
  );
}
