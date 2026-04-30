import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const [architects, supervisors, contractors, projectManagers] = await Promise.all([
    supabase.from("managed_architects").select("id, full_name").eq("is_active", true).order("full_name", { ascending: true }),
    supabase.from("managed_external_supervisors").select("id, full_name").eq("is_active", true).order("full_name", { ascending: true }),
    supabase.from("managed_contractors").select("id, full_name").eq("is_active", true).order("full_name", { ascending: true }),
    supabase.from("users_profile").select("id, full_name").eq("state", "active").in("role", ["project_manager", "pmo", "admin"]).order("full_name", { ascending: true })
  ]);

  return NextResponse.json({
    architects: architects.data ?? [],
    externalSupervisors: supervisors.data ?? [],
    contractors: contractors.data ?? [],
    projectManagers: projectManagers.data ?? []
  });
}
