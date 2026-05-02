import { NextResponse } from "next/server";
import { calculateProjectWarnings, getDashboardProjects, writeProjectWarnings } from "@/lib/domain/projects";
import { buildTopicBaselineDate } from "@/lib/domain/schedule";
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

const topic3MilestonesTemplate = [
  { milestone_index: 1, subtopic_index: 1, subtopic_name_he: "בינוי, חשמל ואינסטלציה", milestone_name_he: "פרסום" },
  { milestone_index: 2, subtopic_index: 1, subtopic_name_he: "בינוי, חשמל ואינסטלציה", milestone_name_he: "קבלת הצעות" },
  { milestone_index: 3, subtopic_index: 1, subtopic_name_he: "בינוי, חשמל ואינסטלציה", milestone_name_he: "מו\"מ" },
  { milestone_index: 4, subtopic_index: 1, subtopic_name_he: "בינוי, חשמל ואינסטלציה", milestone_name_he: "אישור ועדת רכש" },
  { milestone_index: 5, subtopic_index: 2, subtopic_name_he: "מיזוג אוויר", milestone_name_he: "פרסום" },
  { milestone_index: 6, subtopic_index: 2, subtopic_name_he: "מיזוג אוויר", milestone_name_he: "קבלת הצעות" },
  { milestone_index: 7, subtopic_index: 2, subtopic_name_he: "מיזוג אוויר", milestone_name_he: "מו\"מ" },
  { milestone_index: 8, subtopic_index: 2, subtopic_name_he: "מיזוג אוויר", milestone_name_he: "אישור ועדת רכש" },
  { milestone_index: 9, subtopic_index: 3, subtopic_name_he: "ריהוט", milestone_name_he: "פרסום" },
  { milestone_index: 10, subtopic_index: 3, subtopic_name_he: "ריהוט", milestone_name_he: "קבלת הצעות" },
  { milestone_index: 11, subtopic_index: 3, subtopic_name_he: "ריהוט", milestone_name_he: "מו\"מ" },
  { milestone_index: 12, subtopic_index: 3, subtopic_name_he: "ריהוט", milestone_name_he: "אישור ועדת רכש" },
  { milestone_index: 13, subtopic_index: 4, subtopic_name_he: "מיתוג ושילוט", milestone_name_he: "פרסום" },
  { milestone_index: 14, subtopic_index: 4, subtopic_name_he: "מיתוג ושילוט", milestone_name_he: "קבלת הצעות" },
  { milestone_index: 15, subtopic_index: 4, subtopic_name_he: "מיתוג ושילוט", milestone_name_he: "מו\"מ" },
  { milestone_index: 16, subtopic_index: 4, subtopic_name_he: "מיתוג ושילוט", milestone_name_he: "אישור ועדת רכש" }
];

const topic4MilestonesTemplate = [
  { milestone_index: 1, milestone_name_he: "חתימת קבלן והתניידות" },
  { milestone_index: 2, milestone_name_he: "ביצוע מערכות תקרה" },
  { milestone_index: 3, milestone_name_he: "סגירת תקרה" },
  { milestone_index: 4, milestone_name_he: "ריצוף" },
  { milestone_index: 5, milestone_name_he: "שירותים" },
  { milestone_index: 6, milestone_name_he: "מטבח" },
  { milestone_index: 7, milestone_name_he: "לוח חשמל" },
  { milestone_index: 8, milestone_name_he: "ריהוט" },
  { milestone_index: 9, milestone_name_he: "תשתית תקשורת" },
  { milestone_index: 10, milestone_name_he: "תשתית ביטחון" },
  { milestone_index: 11, milestone_name_he: "חדר ממ\"ד" },
  { milestone_index: 12, milestone_name_he: "התקנת עמדות שירות עצמי" },
  { milestone_index: 13, milestone_name_he: "שילוט חוץ" },
  { milestone_index: 14, milestone_name_he: "מיתוג פנים" },
  { milestone_index: 15, milestone_name_he: "גינון / צמחייה" },
  { milestone_index: 16, milestone_name_he: "אספקת כיסאות" },
  { milestone_index: 17, milestone_name_he: "אספקת ציוד מטבח" },
  { milestone_index: 18, milestone_name_he: "מסירה פנימית מוכנה לאישורים" }
];

const topic5MilestonesTemplate = [
  { milestone_index: 1, milestone_name_he: "אישור יועץ בטיחות" },
  { milestone_index: 2, milestone_name_he: "אישור כיבוי אש" },
  { milestone_index: 3, milestone_name_he: "אישור נגישות" },
  { milestone_index: 4, milestone_name_he: "אישור פיקוח" },
  { milestone_index: 5, milestone_name_he: "אישור מתכנן מיזוג" },
  { milestone_index: 6, milestone_name_he: "אישור מתכנן חשמל" },
  { milestone_index: 7, milestone_name_he: "אישור אדריכל" },
  { milestone_index: 8, milestone_name_he: "אישור אכלוס עירייה" },
  { milestone_index: 9, milestone_name_he: "נשלחו הודעות ללקוחות" },
  { milestone_index: 10, milestone_name_he: "פורסמו הנחיות ביצוע פנימיות" },
  { milestone_index: 11, milestone_name_he: "כניסה בפועל לאכלוס" }
];

const topic6MilestonesTemplate = [
  { milestone_index: 1, subtopic_index: 1, subtopic_name_he: "מסירה ותיעוד", milestone_name_he: "מסירה ותיעוד" },
  { milestone_index: 2, subtopic_index: 2, subtopic_name_he: "בדק ואחריות", milestone_name_he: "בדק ואחריות" },
  { milestone_index: 3, subtopic_index: 3, subtopic_name_he: "העברה לאחזקה", milestone_name_he: "העברה לאחזקה" },
  { milestone_index: 4, subtopic_index: 4, subtopic_name_he: "סגירה אדמיניסטרטיבית", milestone_name_he: "סגירה אדמיניסטרטיבית" },
  { milestone_index: 5, subtopic_index: 5, subtopic_name_he: "החזרת הנכס הקודם", milestone_name_he: "תיאום פינוי" },
  { milestone_index: 6, subtopic_index: 5, subtopic_name_he: "החזרת הנכס הקודם", milestone_name_he: "תיקונים / השבה למצב נדרש" },
  { milestone_index: 7, subtopic_index: 5, subtopic_name_he: "החזרת הנכס הקודם", milestone_name_he: "מסירה לגורם מקבל / בעל הנכס" }
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
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

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
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });

  const topicsPayload = defaultTopics.map((topic) => ({
    project_id: data.id,
    topic_index: topic.topic_index,
    topic_name_he: topic.topic_name_he,
    status: "on_track",
    target_date: buildTopicBaselineDate(body.expectedAssetReceiptDate!, topic.topic_index),
    original_target_date: buildTopicBaselineDate(body.expectedAssetReceiptDate!, topic.topic_index),
    forecast_date: buildTopicBaselineDate(body.expectedAssetReceiptDate!, topic.topic_index)
  }));
  const { data: insertedTopics } = await supabase.from("project_topics").insert(topicsPayload).select("id, topic_index");

  const topic3 = (insertedTopics ?? []).find((t) => t.topic_index === 3);
  const topic4 = (insertedTopics ?? []).find((t) => t.topic_index === 4);
  const topic5 = (insertedTopics ?? []).find((t) => t.topic_index === 5);
  const topic6 = (insertedTopics ?? []).find((t) => t.topic_index === 6);

  if (topic3?.id) {
    await supabase.from("milestones").insert(
      topic3MilestonesTemplate.map((m) => ({
        topic_id: topic3.id,
        milestone_index: m.milestone_index,
        subtopic_index: m.subtopic_index,
        subtopic_name_he: m.subtopic_name_he,
        milestone_name_he: m.milestone_name_he,
        status: "on_track"
      }))
    );
  }
  if (topic4?.id) {
    await supabase.from("milestones").insert(
      topic4MilestonesTemplate.map((m) => ({
        topic_id: topic4.id,
        milestone_index: m.milestone_index,
        milestone_name_he: m.milestone_name_he,
        status: "on_track"
      }))
    );
  }
  if (topic5?.id) {
    await supabase.from("milestones").insert(
      topic5MilestonesTemplate.map((m) => ({
        topic_id: topic5.id,
        milestone_index: m.milestone_index,
        milestone_name_he: m.milestone_name_he,
        status: "on_track"
      }))
    );
  }
  if (topic6?.id) {
    await supabase.from("milestones").insert(
      topic6MilestonesTemplate.map((m) => ({
        topic_id: topic6.id,
        milestone_index: m.milestone_index,
        subtopic_index: m.subtopic_index,
        subtopic_name_he: m.subtopic_name_he,
        milestone_name_he: m.milestone_name_he,
        status: "on_track"
      }))
    );
  }

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
