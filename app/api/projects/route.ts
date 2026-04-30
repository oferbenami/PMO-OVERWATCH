import { NextResponse } from "next/server";
import { calculateProjectWarnings, getDashboardProjects, writeProjectWarnings } from "@/lib/domain/projects";
import { createSupabaseServerClient } from "@/lib/supabase";

type CreateProjectBody = {
  projectName?: string;
  internalPmId?: string;
  additionalOwnerId?: string;
  expectedAssetReceiptDate?: string;
  occupancyTarget?: string;
  priority?: "high" | "medium" | "low";
  architectId?: string;
  externalPmSupervisorId?: string;
};

function parseProjectCode(code: string): number {
  const match = code.match(/PRJ-(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

const defaultTopics = [
  { topic_index: 1, topic_name_he: "איתור ואישור נכס ופרויקט" },
  { topic_index: 2, topic_name_he: "תכנון" },
  { topic_index: 3, topic_name_he: "מכרזים" },
  { topic_index: 4, topic_name_he: "ביצוע עד אכלוס" },
  { topic_index: 5, topic_name_he: "אישורים ואכלוס" },
  { topic_index: 6, topic_name_he: "אחרי האכלוס" }
];

export async function GET() {
  const projects = await getDashboardProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateProjectBody;

  if (!body.projectName || !body.expectedAssetReceiptDate || !body.occupancyTarget || !body.priority || !body.internalPmId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("project_code")
    .order("project_code", { ascending: false })
    .limit(1);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const nextNumber = (existing?.[0]?.project_code ? parseProjectCode(existing[0].project_code) : 0) + 1;
  const projectCode = `PRJ-${String(nextNumber).padStart(3, "0")}`;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      project_code: projectCode,
      project_name: body.projectName,
      internal_pm_id: body.internalPmId,
      additional_owner_id: body.additionalOwnerId ?? null,
      expected_asset_receipt_date: body.expectedAssetReceiptDate,
      occupancy_target: body.occupancyTarget,
      occupancy_forecast: body.occupancyTarget,
      priority: body.priority,
      architect_id: body.architectId ?? null,
      external_pm_supervisor_id: body.externalPmSupervisorId ?? null,
      computed_project_status: "on_track",
      system_open_date: new Date().toISOString(),
      last_updated_at: new Date().toISOString()
    })
    .select("id, project_code")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  }

  const topicsPayload = defaultTopics.map((topic) => ({
    project_id: data.id,
    topic_index: topic.topic_index,
    topic_name_he: topic.topic_name_he,
    status: "on_track"
  }));
  await supabase.from("project_topics").insert(topicsPayload);

  const warnings = calculateProjectWarnings({
    internalPmId: body.internalPmId,
    externalPmSupervisorId: body.externalPmSupervisorId ?? null,
    architectId: body.architectId ?? null
  });
  await writeProjectWarnings(data.id, warnings);

  return NextResponse.json(
    { ok: true, projectId: data.id, projectCode: data.project_code, topicsCreated: 6, warnings },
    { status: 201 }
  );
}
