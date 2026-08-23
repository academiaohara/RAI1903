import { createClient } from "@/lib/supabase/client";
import { syncUserProfile } from "@/lib/auth/sync-profile";

const USERNAME_EMAIL_DOMAIN = "users.rai1903.local";
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/;

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  const normalized = normalizeUsername(username);
  if (!normalized) return "El nombre de usuario es obligatorio.";
  if (!USERNAME_PATTERN.test(normalized)) {
    return "Usa entre 3 y 24 caracteres: letras, números o guion bajo.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
  return null;
}

export function usernameToAuthEmail(username: string): string {
  return `${normalizeUsername(username)}@${USERNAME_EMAIL_DOMAIN}`;
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Usuario o contraseña incorrectos.";
  }
  if (lower.includes("user already registered")) {
    return "Ese nombre de usuario ya está en uso.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirma tu cuenta antes de entrar.";
  }
  return message;
}

export async function signUpWithUsername(
  username: string,
  password: string,
): Promise<{ error: string | null; needsEmailConfirmation: boolean }> {
  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError, needsEmailConfirmation: false };

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError, needsEmailConfirmation: false };

  const supabase = createClient();
  const normalized = normalizeUsername(username);
  const email = usernameToAuthEmail(normalized);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_name: normalized,
        preferred_username: normalized,
        display_name: normalized,
      },
    },
  });

  if (error) {
    return { error: mapAuthError(error.message), needsEmailConfirmation: false };
  }

  if (data.user && !data.session) {
    return {
      error: null,
      needsEmailConfirmation: true,
    };
  }

  if (data.user) {
    await syncUserProfile(supabase, data.user);
  }

  return { error: null, needsEmailConfirmation: false };
}

export async function signInWithUsername(username: string, password: string): Promise<{ error: string | null }> {
  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError };

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  const supabase = createClient();
  const email = usernameToAuthEmail(username);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  if (data.user) {
    await syncUserProfile(supabase, data.user);
  }

  return { error: null };
}
