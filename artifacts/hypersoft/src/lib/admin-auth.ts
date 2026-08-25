const TOKEN_KEY = "hs_admin_token";
const USERNAME_KEY = "hs_admin_user";
const ROLE_KEY = "hs_admin_role";
const DISPLAY_KEY = "hs_admin_display";
const USERID_KEY = "hs_admin_uid";

export const ADMIN_BASE_PATH = "/control-9k2x-portal";

export type AdminRole = "admin" | "employee" | "captain" | "client";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getUsername(): string | null {
  try {
    return localStorage.getItem(USERNAME_KEY);
  } catch {
    return null;
  }
}

export function getRole(): AdminRole | null {
  try {
    const r = localStorage.getItem(ROLE_KEY);
    return r as AdminRole | null;
  } catch {
    return null;
  }
}

export function getDisplayName(): string | null {
  try {
    return localStorage.getItem(DISPLAY_KEY);
  } catch {
    return null;
  }
}

export function getUserId(): string | null {
  try {
    return localStorage.getItem(USERID_KEY);
  } catch {
    return null;
  }
}

export function setSession(
  token: string,
  username: string,
  role?: string,
  displayName?: string,
  userId?: string,
): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
  if (role) localStorage.setItem(ROLE_KEY, role);
  if (displayName) localStorage.setItem(DISPLAY_KEY, displayName);
  if (userId) localStorage.setItem(USERID_KEY, userId);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(DISPLAY_KEY);
  localStorage.removeItem(USERID_KEY);
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  admin: "مدير",
  employee: "موظف",
  captain: "كابتن",
  client: "عميل",
};

export const ROLE_BADGE_CLASS: Record<AdminRole, string> = {
  admin: "bg-red-500/15 text-red-400 border-red-500/30",
  employee: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  captain: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  client: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export function canAccess(role: AdminRole | null, allowed: AdminRole[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}

export async function adminFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
