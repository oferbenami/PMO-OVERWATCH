import { NextResponse } from "next/server";
import { getProjectDetails } from "@/lib/domain/projects";
import { buildTopicBaselineDate, isValidDateInput } from "@/lib/domain/schedule";
import { createSupabaseServerClient } from "@/lib/supabase";

type UpdateProjectScheduleBody = {
  expectedAssetReceiptDate?: string;
  occupancyTarget?: string;
  occupancyForecast?: string | null;
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const details = await getProjectDetails(id);
  if (!details) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ schedule: details.schedule });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json()) as UpdateProjectScheduleBody;
  const current = await getProjectDetails(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.expectedAssetReceiptDate && !isValidDateInput(body.expectedAssetReceiptDate)) {
    return NextResponse.json({ error: "Invalid expectedAssetReceiptDate" }, { status: 400 });
  }
  if (body.occupancyTarget && !isValidDateInput(body.occupancyTarget)) {
    return NextResponse.json({ error: "Invalid occupancyTarget" }, { status: 400 });
  }
  if (body.occupancyForecast && !isValidDateInput(body.occupancyForecast)) {
    return NextResponse.json({ error: "Invalid occupancyForecast" }, { status: 400 });
  }

  const nextExpectedAssetReceiptDate = body.expectedAssetReceiptDate ?? current.expectedAssetReceiptDate;
  const supabase = createSupabaseServerClient();

  const projectUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString()
  };
  if (body.expectedAssetReceiptDate !== undefined) projectUpdates.expected_asset_receipt_date = body.expectedAssetReceiptDate;
  if (body.occupancyTarget !== undefined) projectUpdates.occupancy_target = body.occupancyTarget;
  if (body.occupancyForecast !== undefined) projectUpdates.occupancy_forecast = body.occupancyForecast;

  const { error: projectError } = await supabase.from("projects").update(projectUpdates).eq("id", id);
  if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 });

  if (body.expectedAssetReceiptDate !== undefined) {
    for (const topic of current.schedule.topics) {
      const baseline = buildTopicBaselineDate(nextExpectedAssetReceiptDate, topic.topicIndex);
      if (!baseline) continue;
      const isManual = topic.isManualTargetOverride;
      if (!isManual) {
        const { error: topicError } = await supabase
          .from("project_topics")
          .update({ target_date: baseline, original_target_date: baseline })
          .eq("project_id", id)
          .eq("topic_index", topic.topicIndex);
        if (topicError) {
          return NextResponse.json({ error: topicError.message }, { status: 500 });
        }
      } else if (!topic.originalTargetDate) {
        const { error: topicError } = await supabase
          .from("project_topics")
          .update({ original_target_date: baseline })
          .eq("project_id", id)
          .eq("topic_index", topic.topicIndex);
        if (topicError) {
          return NextResponse.json({ error: topicError.message }, { status: 500 });
        }
      }
    }
  }

  const details = await getProjectDetails(id);
  return NextResponse.json({ ok: true, schedule: details?.schedule ?? null });
}
