import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const SUPABASE_URL = "https://xoddmbesiurqcxftjpqh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yWKdhqMHHt8PRWQfdIDLcQ_oJeLMq7O";

// Browser: localStorage / Native: AsyncStorage / SSR Node.js: no-op
function makeStorage() {
  if (typeof localStorage !== "undefined") {
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
    };
  }
  if (Platform.OS !== "web") {
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    return AsyncStorage;
  }
  // SSR / Node.js — no-op
  return {
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, _value: string) => Promise.resolve(undefined),
    removeItem: (_key: string) => Promise.resolve(undefined),
  };
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: makeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type { User, Session } from "@supabase/supabase-js";
