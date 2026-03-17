/** Hook for fetching the current user's admin session role. */

import { useState, useEffect } from "react";

interface UseAdminAuthResult {
  role: string | null;
  loading: boolean;
}

export function useAdminAuth(): UseAdminAuthResult {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/get-session", {
          credentials: "include",
        });
        if (response.ok) {
          const session = await response.json();
          if (session?.user?.role) {
            setRole(session.user.role);
          }
        }
      } catch (err) {
        console.error("[useAdminAuth] Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  return { role, loading };
}
