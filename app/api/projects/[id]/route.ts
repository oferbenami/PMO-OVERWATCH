import { NextResponse } from "next/server";
import { calculateProjectWarnings, getProjectDetails, writeProjectWarnings } from "@/lib/domain/projects";
import { createSupabaseServerClient } from "@/lib/supabase";

type UpdateProjectBody = {
  occupancyForecast?: string;
  computedProjectStatus?: "on_track" | "at_risk" | "delayed" | "completed" | "frozen" | "not_relevant";
  requiresManagementAction?: boolean;
  architectId?: string | null;
  externalPmSupervisorId?: string | null;
  internalPmId?: string | null;
  additionalOwnerId?: string | null;
  freezeReason?: string | null;
  freezeNote?: string | null;
  notUpdatedThisWeek?: boolean;
  contractors?: Array<{ domain: string; contractorId?: string | null; contractorName?: string | null }>;
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const details = await getProjectDetails(id);
  if (!details) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project: details });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json()) as UpdateProjectBody;

  const existing = await getProjectDetails(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString()
  };

  if (body.occupancyForecast) updates.occupancy_forecast = body.occupancyForecast;
  if (body.computedProjectStatus) updates.computed_project_status = body.computedProjectStatus;
  if (typeof body.requiresManagementAction === "boolean") {
    updates.requires_management_action = body.requiresManagementAction;
    updates.requires_management_action_manual = body.requiresManagementAction;
  }
  if (typeof body.notUpdatedThisWeek === "boolean") updates.not_updated_this_week = body.notUpdatedThisWeek;
  if (body.freezeReason !== undefined) updates.freeze_reason = body.freezeReason;
  if (body.freezeNote !== undefined) updates.freeze_note = body.freezeNote;
  if (body.architectId !== undefined) updates.architect_id = body.architectId;
  if (body.externalPmSupervisorId !== undefined) updates.external_pm_supervisor_id = body.externalPmSupervisorId;
  if (body.internalPmId !== undefined) updates.internal_pm_id = body.internalPmId;
  if (body.additionalOwnerId !== undefined) updates.additional_owner_id = body.additionalOwnerId;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("projects").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (Array.isArray(body.contractors)) {
    for (const contractor of body.contractors) {
      await supabase.from("project_contractors").upsert(
        {
          project_id: id,
          domain: contractor.domain,
          contractor_id: contractor.contractorId ?? null,
          contractor_name: contractor.contractorName ?? null
        },
        { onConflict: "project_id,domain" }
      );
    }
  }

  const warnings = calculateProjectWarnings({
    internalPmId: body.internalPmId ?? existing.internalPmId,
    externalPmSupervisorId: body.externalPmSupervisorId ?? existing.externalPmSupervisorId,
    architectId: body.architectId ?? existing.architectId
  });
  await writeProjectWarnings(id, warnings);

  return NextResponse.json({ ok: true, warnings });
}
