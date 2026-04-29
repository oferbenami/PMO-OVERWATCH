"use client";

import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PUBLIC_PATHS = new Set(["/login"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const supabase = useMemo(() => {
    if (!hasSupabaseEnv()) return null;
    return createSupabaseClient();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsReady(true);
      return;
    }

    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const hasSession = Boolean(data.session);
      const isPublic = PUBLIC_PATHS.has(pathname);

      if (!hasSession && !isPublic) {
        router.replace("/login");
      }

      if (hasSession && pathname === "/login") {
        router.replace("/dashboard");
      }

      if (mounted) setIsReady(true);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const isPublic = PUBLIC_PATHS.has(pathname);
      if (!session && !isPublic) {
        router.replace("/login");
      }
      if (session && pathname === "/login") {
        router.replace("/dashboard");
      }
    });

    check();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router, supabase]);

  if (!isReady) {
    return (
      <main className="container">
        <div className="card">טוען...</div>
      </main>
    );
  }

  return <>{children}</>;
}
