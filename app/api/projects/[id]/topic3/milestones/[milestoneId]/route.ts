import { NextResponse } from "next/server";
import { computeTopic3Progress } from "@/lib/domain/projects";
import { recomputeAndPersistProjectStatus } from "@/lib/domain/project-status";
import { DELAY_REASONS, isOtherReason } from "@/lib/domain/reasons";
import { createSupabaseServerClient } from "@/lib/supabase";
import { ProjectStatus } from "@/types/domain";

type UpdateMilestoneBody = {
  status?: ProjectStatus;
  targetDate?: string | null;
  forecastDate?: string | null;
  actualDate?: string | null;
  delayReason?: string | null;
  note?: string | null;
  isNotRelevant?: boolean;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { id: projectId, milestoneId } = await context.params;
  const body = (await request.json()) as UpdateMilestoneBody;
  if ((body.status === "at_risk" || body.status === "delayed") && !body.delayReason) {
    return NextResponse.json({ error: "Delay reason is required for At Risk/Delayed status" }, { status: 400 });
  }
  if (body.delayReason && !DELAY_REASONS.has(body.delayReason)) {
    return NextResponse.json({ error: "Invalid delay reason" }, { status: 400 });
  }
  if (isOtherReason(body.delayReason) && !body.note) {
    return NextResponse.json({ error: "Note is required when delay reason is Other" }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();

  const { data: topic } = await supabase
    .from("project_topics")
    .select("id")
    .eq("project_id", projectId)
    .eq("topic_index", 3)
    .maybeSingle();

  if (!topic?.id) return NextResponse.json({ error: "Topic 3 not found" }, { status: 404 });

  const { data: existing } = await supabase
    .from("milestones")
    .select("id")
    .eq("id", milestoneId)
    .eq("topic_id", topic.id)
    .maybeSingle();

  if (!existing?.id) return NextResponse.json({ error: "Milestone not found" }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.targetDate !== undefined) updates.target_date = body.targetDate;
  if (body.forecastDate !== undefined) updates.forecast_date = body.forecastDate;
  if (body.actualDate !== undefined) updates.actual_date = body.actualDate;
  if (body.delayReason !== undefined) updates.delay_reason = body.delayReason;
  if (body.note !== undefined) updates.note = body.note;
  if (body.isNotRelevant !== undefined) updates.is_not_relevant = body.isNotRelevant;

  const { error } = await supabase.from("milestones").update(updates).eq("id", milestoneId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: milestones } = await supabase
    .from("milestones")
    .select("id, milestone_index, subtopic_index, subtopic_name_he, milestone_name_he, status, target_date, forecast_date, actual_date, note, delay_reason, is_not_relevant")
    .eq("topic_id", topic.id)
    .order("milestone_index", { ascending: true, nullsFirst: false });

  const mapped = (milestones ?? []).map((m) => ({
    id: m.id as string,
    milestoneIndex: m.milestone_index as number | null,
    subtopicIndex: (m.subtopic_index as number | null) ?? null,
    subtopicName: (m.subtopic_name_he as string | null) ?? null,
    name: m.milestone_name_he as string,
    status: m.status as ProjectStatus,
    targetDate: (m.target_date as string | null) ?? null,
    forecastDate: (m.forecast_date as string | null) ?? null,
    actualDate: (m.actual_date as string | null) ?? null,
    delayReason: (m.delay_reason as string | null) ?? null,
    note: (m.note as string | null) ?? null,
    isNotRelevant: Boolean(m.is_not_relevant)
  }));

  const recalculated = await recomputeAndPersistProjectStatus(projectId);
  if (!recalculated.ok) {
    return NextResponse.json({ error: recalculated.error ?? "Status recalculation failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    warnings: [],
    topic3Progress: computeTopic3Progress(mapped),
    milestone: mapped.find((m) => m.id === milestoneId) ?? null,
    computedProjectStatus: recalculated.computedProjectStatus,
    requiresManagementAction: recalculated.requiresManagementAction
  });
}
