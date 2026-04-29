import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

type UpdateProjectBody = {
  occupancyForecast?: string;
  computedProjectStatus?: "on_track" | "at_risk" | "delayed" | "completed" | "frozen" | "not_relevant";
  requiresManagementAction?: boolean;
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json()) as UpdateProjectBody;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (body.occupancyForecast) updates.occupancy_forecast = body.occupancyForecast;
  if (body.computedProjectStatus) updates.computed_project_status = body.computedProjectStatus;
  if (typeof body.requiresManagementAction === "boolean") {
    updates.requires_management_action = body.requiresManagementAction;
    updates.requires_management_action_manual = body.requiresManagementAction;
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("projects").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
