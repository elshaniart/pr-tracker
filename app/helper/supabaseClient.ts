import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY + "";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Ensures session is saved in localStorage
    autoRefreshToken: true, // Automatically refresh token
    detectSessionInUrl: true, // Needed for OAuth callbacks
  },
});

export default supabase;
