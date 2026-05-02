import { NextResponse } from "next/server";
import {
  buildTopic5Milestone11Warning,
  computeTopic5Readiness,
  getProjectTopic5Milestones
} from "@/lib/domain/projects";
import { recomputeAndPersistProjectStatus } from "@/lib/domain/project-status";
import { createSupabaseServerClient } from "@/lib/supabase";
import { ProjectStatus } from "@/types/domain";

type UpdateMilestoneBody = {
  status?: ProjectStatus;
  targetDate?: string | null;
  forecastDate?: string | null;
  actualDate?: string | null;
  note?: string | null;
  isNotRelevant?: boolean;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { id: projectId, milestoneId } = await context.params;
  const body = (await request.json()) as UpdateMilestoneBody;
  const supabase = createSupabaseServerClient();

  const { data: topic } = await supabase
    .from("project_topics")
    .select("id")
    .eq("project_id", projectId)
    .eq("topic_index", 5)
    .maybeSingle();

  if (!topic?.id) {
    return NextResponse.json({ error: "Topic 5 not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("milestones")
    .select("id, milestone_index")
    .eq("id", milestoneId)
    .eq("topic_id", topic.id)
    .maybeSingle();

  if (!existing?.id) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.targetDate !== undefined) updates.target_date = body.targetDate;
  if (body.forecastDate !== undefined) updates.forecast_date = body.forecastDate;
  if (body.actualDate !== undefined) updates.actual_date = body.actualDate;
  if (body.note !== undefined) updates.note = body.note;
  if (body.isNotRelevant !== undefined) updates.is_not_relevant = body.isNotRelevant;

  const { error } = await supabase.from("milestones").update(updates).eq("id", milestoneId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const topic5Milestones = await getProjectTopic5Milestones(projectId);
  const topic5Readiness = computeTopic5Readiness(topic5Milestones);
  const warnings = existing.milestone_index === 11 ? buildTopic5Milestone11Warning(topic5Milestones) : [];
  const recalculated = await recomputeAndPersistProjectStatus(projectId);
  if (!recalculated.ok) {
    return NextResponse.json({ error: recalculated.error ?? "Status recalculation failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    warnings,
    topic5Readiness,
    milestone: topic5Milestones.find((m) => m.id === milestoneId) ?? null,
    computedProjectStatus: recalculated.computedProjectStatus,
    requiresManagementAction: recalculated.requiresManagementAction
  });
}
