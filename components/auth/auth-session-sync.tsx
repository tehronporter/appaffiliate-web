"use client";

import { useEffect } from "react";

import { syncSessionCookie } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";

export function AuthSessionSync() {
  useEffect(() => {
    let isActive = true;

    async function syncCurrentSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      await syncSessionCookie(session);
    }

    void syncCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSessionCookie(session);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
