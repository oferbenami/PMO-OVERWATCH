"use client";

import { createSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const signIn = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  return (
    <main className="container">
      <section className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
        <h1>כניסה למערכת PMO-OVERWATCH</h1>
        <p>יש להתחבר עם חשבון Google מאושר.</p>
        <button type="button" className="menu-toggle" style={{ display: "inline-flex", marginTop: 12 }} onClick={signIn}>
          התחברות עם Google
        </button>
      </section>
    </main>
  );
}
