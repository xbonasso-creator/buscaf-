import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://xoddmbesiurqcxftjpqh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yWKdhqMHHt8PRWQfdIDLcQ_oJeLMq7O";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type { User, Session } from "@supabase/supabase-js";
