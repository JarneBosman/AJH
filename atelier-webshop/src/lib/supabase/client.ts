import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

let clientInstance: ReturnType<typeof createClient> | null = null;

export const getBrowserSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables.");
  }

  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return clientInstance;
};
