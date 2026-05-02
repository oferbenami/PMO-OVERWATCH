import { createSupabaseServerClient } from "@/lib/supabase";

export type ManagedListKey =
  | "architects"
  | "externalSupervisors"
  | "contractors"
  | "planners"
  | "delayReasons"
  | "freezeReasons"
  | "planningDomains"
  | "tenderDomains";

export type ManagedListItem = {
  id: string;
  code: string;
  label_he: string;
  label_en: string | null;
  sort_order: number;
  is_active: boolean;
};

type TableConfig = {
  table: string;
  hasFullName: boolean;
};

const TABLE_BY_KEY: Record<ManagedListKey, TableConfig> = {
  architects: { table: "managed_architects", hasFullName: true },
  externalSupervisors: { table: "managed_external_supervisors", hasFullName: true },
  contractors: { table: "managed_contractors", hasFullName: true },
  planners: { table: "managed_planners", hasFullName: false },
  delayReasons: { table: "managed_delay_reasons", hasFullName: false },
  freezeReasons: { table: "managed_freeze_reasons", hasFullName: false },
  planningDomains: { table: "managed_planning_domains", hasFullName: false },
  tenderDomains: { table: "managed_tender_domains", hasFullName: false }
};

const WRITER_ROLES = new Set(["admin", "pmo"]);

export function isManagedListKey(input: string): input is ManagedListKey {
  return input in TABLE_BY_KEY;
}

async function getRoleFromAuthHeader(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return null;
  const { data: profile } = await supabase
    .from("users_profile")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();
  return profile?.role ?? null;
}

export async function resolveRequestRole(request: Request): Promise<string | null> {
  const headerRole = request.headers.get("x-app-role");
  if (headerRole) return headerRole;
  return getRoleFromAuthHeader(request.headers.get("authorization"));
}

export function canEditManagedLists(role: string | null): boolean {
  if (!role) return false;
  return WRITER_ROLES.has(role);
}

export function getListTable(key: ManagedListKey): TableConfig {
  return TABLE_BY_KEY[key];
}

export function mapLabel(item: { label_he: string; full_name?: string | null }): string {
  return item.label_he || item.full_name || "";
}
