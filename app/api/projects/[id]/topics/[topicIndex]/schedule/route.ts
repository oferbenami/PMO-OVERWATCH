import { NextResponse } from "next/server";
import { getProjectDetails } from "@/lib/domain/projects";
import { isValidDateInput } from "@/lib/domain/schedule";
import { createSupabaseServerClient } from "@/lib/supabase";
import { ProjectWarning } from "@/types/domain";

type UpdateTopicScheduleBody = {
  targetDate?: string | null;
  forecastDate?: string | null;
  actualDate?: string | null;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; topicIndex: string }> }
) {
  const { id, topicIndex } = await context.params;
  const topicIndexNum = Number.parseInt(topicIndex, 10);
  if (!Number.isInteger(topicIndexNum) || topicIndexNum < 1 || topicIndexNum > 6) {
    return NextResponse.json({ error: "Invalid topicIndex" }, { status: 400 });
  }

  const body = (await request.json()) as UpdateTopicScheduleBody;
  for (const value of [body.targetDate, body.forecastDate, body.actualDate]) {
    if (value && !isValidDateInput(value)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }
  }

  const current = await getProjectDetails(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const topic = current.schedule.topics.find((t) => t.topicIndex === topicIndexNum);
  const topicRef = current.topics.find((t) => t.topicIndex === topicIndexNum);
  if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  if (!topicRef) return NextResponse.json({ error: "Topic reference not found" }, { status: 404 });

  const warnings: ProjectWarning[] = [];
  const nextTargetDate = body.targetDate !== undefined ? body.targetDate : topic.targetDate;
  const nextActualDate = body.actualDate !== undefined ? body.actualDate : topic.actualDate;
  if (nextTargetDate && nextActualDate && nextActualDate < nextTargetDate) {
    warnings.push({ code: "actual_before_target", message: "אזהרה: תאריך בפועל מוקדם מתאריך יעד" });
  }

  const supabase = createSupabaseServerClient();
  const updates: Record<string, unknown> = {};
  if (body.targetDate !== undefined) updates.target_date = body.targetDate;
  if (body.forecastDate !== undefined) updates.forecast_date = body.forecastDate;
  if (body.actualDate !== undefined) updates.actual_date = body.actualDate;
  if (body.targetDate !== undefined && topic.originalTargetDate && body.targetDate !== topic.originalTargetDate) {
    // manual override detected; preserve original_target_date
  } else if (body.targetDate !== undefined && !topic.originalTargetDate) {
    updates.original_target_date = body.targetDate;
  }

  const { error } = await supabase
    .from("project_topics")
    .update(updates)
    .eq("project_id", id)
    .eq("topic_index", topicIndexNum);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.forecastDate !== undefined && body.forecastDate !== topic.forecastDate) {
    const { error: historyError } = await supabase.from("topic_forecast_history").insert({
      project_id: id,
      topic_id: topicRef.id,
      topic_index: topicIndexNum,
      previous_forecast_date: topic.forecastDate,
      next_forecast_date: body.forecastDate
    });
    if (historyError) return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  const details = await getProjectDetails(id);
  return NextResponse.json({ ok: true, warnings, schedule: details?.schedule ?? null });
}
