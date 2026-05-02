import { NextResponse } from "next/server";
import { calculateProjectWarnings, getProjectDetails, writeProjectWarnings } from "@/lib/domain/projects";
import { recomputeAndPersistProjectStatus } from "@/lib/domain/project-status";
import { FREEZE_REASONS, isOtherReason } from "@/lib/domain/reasons";
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
  freezeStartDate?: string | null;
  freezeEndDate?: string | null;
  isFrozen?: boolean;
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
  if (body.freezeReason && !FREEZE_REASONS.has(body.freezeReason)) {
    return NextResponse.json({ error: "Invalid freeze reason" }, { status: 400 });
  }
  if (isOtherReason(body.freezeReason) && !body.freezeNote) {
    return NextResponse.json({ error: "Freeze note is required when reason is Other" }, { status: 400 });
  }

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
  if (typeof body.isFrozen === "boolean") updates.is_frozen = body.isFrozen;
  if (body.architectId !== undefined) updates.architect_id = body.architectId;
  if (body.externalPmSupervisorId !== undefined) updates.external_pm_supervisor_id = body.externalPmSupervisorId;
  if (body.internalPmId !== undefined) updates.internal_pm_id = body.internalPmId;
  if (body.additionalOwnerId !== undefined) updates.additional_owner_id = body.additionalOwnerId;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("projects").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (typeof body.isFrozen === "boolean") {
    if (body.isFrozen) {
      const startDate = body.freezeStartDate ?? new Date().toISOString().slice(0, 10);
      const { data: existingOpen } = await supabase
        .from("freeze_periods")
        .select("id")
        .eq("project_id", id)
        .is("end_date", null)
        .maybeSingle();
      if (!existingOpen?.id) {
        await supabase.from("freeze_periods").insert({
          project_id: id,
          reason: body.freezeReason ?? "management_decision",
          note: body.freezeNote ?? null,
          start_date: startDate,
          end_date: null
        });
      }
    } else {
      const endDate = body.freezeEndDate ?? new Date().toISOString().slice(0, 10);
      await supabase
        .from("freeze_periods")
        .update({ end_date: endDate })
        .eq("project_id", id)
        .is("end_date", null);
    }
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

  const recalculated = await recomputeAndPersistProjectStatus(id);
  if (!recalculated.ok) {
    return NextResponse.json({ error: recalculated.error ?? "Status recalculation failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    warnings,
    computedProjectStatus: recalculated.computedProjectStatus,
    requiresManagementAction: recalculated.requiresManagementAction
  });
}
