// src/lib/supabaseServer.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;

/** 서버 전용 Admin 클라이언트 (프론트에서 import 금지) */
export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;

  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    // 빌드/엣지에서 env를 못 읽을 때 원인 파악용 로그
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("Supabase env missing");
  }

  _admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}
