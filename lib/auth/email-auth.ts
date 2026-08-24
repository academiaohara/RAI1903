import type { User } from "@supabase/supabase-js";
import { syncUserProfile } from "@/lib/auth/sync-profile";
import { createClient } from "@/lib/supabase/client";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return "El correo electrónico es obligatorio.";
  if (!EMAIL_PATTERN.test(normalized)) return "Introduce un correo electrónico válido.";
  return null;
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

export function userHasEmailPasswordIdentity(user: User): boolean {
  return user.identities?.some((identity) => identity.provider === "email") ?? false;
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (lower.includes("user already registered")) {
    return "Ese correo ya está registrado.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirma tu correo antes de entrar.";
  }
  if (lower.includes("same as the old password")) {
    return "La nueva contraseña debe ser distinta de la actual.";
  }
  return message;
}

export async function signUpWithEmail(
  email: string,
  username: string,
  password: string,
): Promise<{ error: string | null; needsEmailConfirmation: boolean }> {
  const emailError = validateEmail(email);
  if (emailError) return { error: emailError, needsEmailConfirmation: false };

  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError, needsEmailConfirmation: false };

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError, needsEmailConfirmation: false };

  const supabase = createClient();
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        user_name: normalizedUsername,
        preferred_username: normalizedUsername,
        display_name: normalizedUsername,
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

export async function signInWithEmail(email: string, password: string): Promise<{ error: string | null }> {
  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
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

export async function requestPasswordReset(email: string): Promise<{ error: string | null }> {
  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { error: null };
}

export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ error: string | null }> {
  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  const currentPasswordError = validatePassword(currentPassword);
  if (currentPasswordError) return { error: currentPasswordError };

  const newPasswordError = validatePassword(newPassword);
  if (newPasswordError) return { error: newPasswordError };

  if (currentPassword === newPassword) {
    return { error: "La nueva contraseña debe ser distinta de la actual." };
  }

  const supabase = createClient();
  const normalizedEmail = normalizeEmail(email);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "La contraseña actual no es correcta." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { error: null };
}

export async function updatePasswordAfterRecovery(newPassword: string): Promise<{ error: string | null }> {
  const passwordError = validatePassword(newPassword);
  if (passwordError) return { error: passwordError };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { error: null };
}
