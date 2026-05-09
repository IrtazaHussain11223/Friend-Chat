import { createClient } from "@supabase/supabase-js";
import type { Message } from "@/lib/types";

export interface MessageRow {
  id: string;
  username: string;
  text: string;
  created_at: string;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseServer() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    username: row.username,
    text: row.text,
    timestamp: row.created_at
  };
}
