import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CONFIG_KEY = "memora_supabase_config";

let client;

export function getSupabaseConfig() {
  const runtimeConfig = window.MEMORA_SUPABASE_CONFIG;
  if (runtimeConfig?.url && runtimeConfig?.publishableKey) return runtimeConfig;

  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSupabaseConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  client = null;
}

export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config?.url && config?.publishableKey);
}

export function getSupabaseClient() {
  if (client) return client;
  const config = getSupabaseConfig();
  if (!config?.url || !config?.publishableKey) return null;
  client = createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return client;
}

export function getAuthRedirectUrl() {
  const config = getSupabaseConfig();
  const configuredUrl = config?.siteUrl || config?.redirectTo;
  const currentUrl = window.location.origin;
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(window.location.host);
  const canUseCurrentUrl = window.location.protocol.startsWith("http") && !isLocal;
  const url = canUseCurrentUrl ? currentUrl : configuredUrl || currentUrl;
  return url.endsWith("/") ? url : `${url}/`;
}

export async function getSessionUser() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return mapSupabaseUser(data.session.user);
}

export async function signInWithGoogle() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthRedirectUrl()
    }
  });
  if (error) throw error;
}

export async function sendEmailOtp(email) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: getAuthRedirectUrl()
    }
  });
  if (error) throw error;
}

export async function verifyEmailOtp(email, token) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email"
  });
  if (error) throw error;
  return mapSupabaseUser(data.user);
}

export async function signOutSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function mapSupabaseUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Memora user",
    email: user.email || "",
    provider: user.app_metadata?.provider || "supabase",
    avatarUrl: user.user_metadata?.avatar_url || "",
    createdAt: user.created_at || new Date().toISOString()
  };
}
