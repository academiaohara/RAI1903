/** Scopes pedidos a X en el consentimiento OAuth (perfil + email si la cuenta lo permite). */
export const X_OAUTH_SCOPES = "users.read users.email offline.access";

export function isXProfileProviderError(reason: string | undefined): boolean {
  if (!reason) return false;
  const lower = reason.toLowerCase();
  return lower.includes("user profile") || lower.includes("user email") || lower.includes("external provider");
}
