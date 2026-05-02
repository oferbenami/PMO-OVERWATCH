import { NextResponse } from "next/server";
import { canEditManagedLists, mapLabel, resolveRequestRole } from "@/lib/domain/managed-lists";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();

  const [architects, supervisors, contractors, planners, delayReasons, freezeReasons, planningDomains, tenderDomains, projectManagers] = await Promise.all([
    supabase.from("managed_architects").select("id, code, label_he, full_name, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("managed_external_supervisors").select("id, code, label_he, full_name, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("managed_contractors").select("id, code, label_he, full_name, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("managed_planners").select("id, code, label_he, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("managed_delay_reasons").select("id, code, label_he, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("managed_freeze_reasons").select("id, code, label_he, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("managed_planning_domains").select("id, code, label_he, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("managed_tender_domains").select("id, code, label_he, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("users_profile").select("id, full_name").eq("state", "active").in("role", ["project_manager", "pmo", "admin"]).order("full_name", { ascending: true })
  ]);

  const role = await resolveRequestRole(request);

  return NextResponse.json({
    canEdit: canEditManagedLists(role),
    architects: (architects.data ?? []).map((item) => ({ ...item, full_name: mapLabel(item) })),
    externalSupervisors: (supervisors.data ?? []).map((item) => ({ ...item, full_name: mapLabel(item) })),
    contractors: (contractors.data ?? []).map((item) => ({ ...item, full_name: mapLabel(item) })),
    planners: planners.data ?? [],
    delayReasons: delayReasons.data ?? [],
    freezeReasons: freezeReasons.data ?? [],
    planningDomains: planningDomains.data ?? [],
    tenderDomains: tenderDomains.data ?? [],
    projectManagers: projectManagers.data ?? []
  });
}
