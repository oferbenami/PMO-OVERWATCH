import {
  ProjectDashboardRow,
  ProjectDetails,
  ProjectStatus,
  ProjectWarning,
  Topic5Readiness,
  ProjectTopic,
  ProjectMilestone
} from "@/types/domain";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import { sampleProjects } from "@/lib/domain/sample-data";
import { toPresentation } from "@/lib/domain/status";

type DbProjectRow = {
  id: string;
  project_code: string;
  project_name: string;
  internal_pm_id: string | null;
  additional_owner_id: string | null;
  expected_asset_receipt_date: string;
  occupancy_target: string;
  occupancy_forecast: string | null;
  priority: "high" | "medium" | "low";
  architect_id: string | null;
  external_pm_supervisor_id: string | null;
  computed_project_status: ProjectStatus;
  requires_management_action: boolean;
};

type DbProjectContractorRow = {
  domain: string;
  contractor_id: string | null;
  contractor_name: string | null;
};

type DbTopicRow = {
  id: string;
  topic_index: number;
  topic_name_he: string;
  status: ProjectStatus;
};

type DbMilestoneRow = {
  id: string;
  topic_id: string;
  milestone_index: number | null;
  subtopic_index?: number | null;
  subtopic_name_he?: string | null;
  milestone_name_he: string;
  status: ProjectStatus;
  target_date: string | null;
  forecast_date: string | null;
  actual_date: string | null;
  note: string | null;
  is_not_relevant: boolean | null;
};

const TOPIC5_REQUIRED_MILESTONES = new Set([1, 8, 9, 10]);

function mapProjectRow(row: DbProjectRow): ProjectDashboardRow {
  const { statusHe, statusColor } = toPresentation(row.computed_project_status);
  return {
    id: row.id,
    code: row.project_code,
    name: row.project_name,
    pmName: "--",
    occupancyTarget: row.occupancy_target,
    occupancyForecast: row.occupancy_forecast ?? "--",
    status: row.computed_project_status,
    statusHe,
    statusColor,
    exceptionMilestone: "--",
    requiresManagementAction: row.requires_management_action,
    topic5NotReady: false
  };
}

function mapMilestoneRow(row: DbMilestoneRow): ProjectMilestone {
  return {
    id: row.id,
    milestoneIndex: row.milestone_index,
    subtopicIndex: row.subtopic_index ?? null,
    subtopicName: row.subtopic_name_he ?? null,
    name: row.milestone_name_he,
    status: row.status,
    targetDate: row.target_date,
    forecastDate: row.forecast_date,
    actualDate: row.actual_date,
    note: row.note,
    isNotRelevant: Boolean(row.is_not_relevant)
  };
}

function isMilestoneCompleted(m: ProjectMilestone): boolean {
  return m.status === "completed" || Boolean(m.actualDate);
}

export function computeTopic5Readiness(topic5Milestones: ProjectMilestone[]): Topic5Readiness {
  const missingPrerequisites = topic5Milestones
    .filter((m) => m.milestoneIndex !== null && TOPIC5_REQUIRED_MILESTONES.has(m.milestoneIndex))
    .filter((m) => !isMilestoneCompleted(m))
    .sort((a, b) => (a.milestoneIndex ?? 999) - (b.milestoneIndex ?? 999))
    .map((m) => ({ milestoneIndex: m.milestoneIndex ?? 0, name: m.name }));

  return {
    canCompleteMilestone11: missingPrerequisites.length === 0,
    missingPrerequisites
  };
}

export function buildTopic5Milestone11Warning(topic5Milestones: ProjectMilestone[]): ProjectWarning[] {
  const readiness = computeTopic5Readiness(topic5Milestones);
  if (readiness.canCompleteMilestone11) return [];
  return [
    {
      code: "topic5_prerequisites_missing",
      message: "אזהרה: לפני כניסה בפועל לאכלוס מומלץ להשלים את תנאי הסף בפרק 5",
      missingPrerequisites: readiness.missingPrerequisites
    }
  ];
}

export function computeTopic6Progress(topic6Milestones: ProjectMilestone[]) {
  const subtopicMap = new Map<number, { name: string; milestones: ProjectMilestone[] }>();
  for (const m of topic6Milestones) {
    const idx = m.subtopicIndex ?? 0;
    if (!idx) continue;
    const current = subtopicMap.get(idx) ?? { name: m.subtopicName ?? `תת נושא ${idx}`, milestones: [] };
    current.milestones.push(m);
    subtopicMap.set(idx, current);
  }

  const subtopics = [1, 2, 3, 4, 5].map((idx) => {
    const entry = subtopicMap.get(idx);
    const milestones = entry?.milestones ?? [];
    const allNotRelevant = milestones.length > 0 && milestones.every((m) => m.status === "not_relevant" || m.isNotRelevant);
    const isRequired = idx !== 5 || !allNotRelevant;
    const isComplete = milestones.length > 0 && milestones.every((m) => m.status === "completed" || Boolean(m.actualDate) || m.status === "not_relevant" || m.isNotRelevant);
    return {
      subtopicIndex: idx,
      subtopicName: entry?.name ?? `תת נושא ${idx}`,
      isRequired,
      isComplete
    };
  });

  const isTrackingComplete = subtopics.filter((s) => s.isRequired).every((s) => s.isComplete);
  return { isTrackingComplete, subtopics };
}

function buildProjectWarnings(project: DbProjectRow): ProjectWarning[] {
  const warnings: ProjectWarning[] = [];
  if (!project.architect_id) {
    warnings.push({ code: "missing_architect", message: "אזהרה: טרם שויך אדריכל לפרויקט" });
  }
  if (!project.internal_pm_id || !project.external_pm_supervisor_id) {
    warnings.push({
      code: "missing_pm_assignments",
      message: "אזהרה: חסר שיוך מנהל פרויקט פנימי או מפקח/מנהל פרויקט חיצוני"
    });
  }
  return warnings;
}

export async function getDashboardProjects(): Promise<ProjectDashboardRow[]> {
  if (!hasSupabaseEnv()) {
    return sampleProjects;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, project_code, project_name, internal_pm_id, additional_owner_id, expected_asset_receipt_date, occupancy_target, occupancy_forecast, priority, architect_id, external_pm_supervisor_id, computed_project_status, requires_management_action")
    .order("project_code", { ascending: true });

  if (error || !data) {
    return sampleProjects;
  }

  const rows = (data as DbProjectRow[]).map(mapProjectRow);
  const projectIds = rows.map((r) => r.id);
  if (projectIds.length === 0) return rows;

  const { data: topic5Rows } = await supabase
    .from("project_topics")
    .select("id, project_id")
    .in("project_id", projectIds)
    .eq("topic_index", 5);

  const topicRows = (topic5Rows ?? []) as Array<{ id: string; project_id: string }>;
  const topicByProject = new Map(topicRows.map((t) => [t.project_id, t.id]));
  const topicIds = topicRows.map((t) => t.id);

  if (topicIds.length > 0) {
    const { data: milestoneRows } = await supabase
      .from("milestones")
      .select("topic_id, milestone_index, status, actual_date")
      .in("topic_id", topicIds)
      .in("milestone_index", [1, 8, 9, 10]);

    const readinessByTopic = new Map<string, boolean>();
    for (const topicId of topicIds) readinessByTopic.set(topicId, false);

    const grouped = new Map<string, Array<{ milestone_index: number | null; status: ProjectStatus; actual_date: string | null }>>();
    for (const row of (milestoneRows ?? []) as Array<{ topic_id: string; milestone_index: number | null; status: ProjectStatus; actual_date: string | null }>) {
      const list = grouped.get(row.topic_id) ?? [];
      list.push(row);
      grouped.set(row.topic_id, list);
    }

    for (const topicId of topicIds) {
      const list = grouped.get(topicId) ?? [];
      const ready = [1, 8, 9, 10].every((idx) => {
        const found = list.find((m) => m.milestone_index === idx);
        if (!found) return false;
        return found.status === "completed" || Boolean(found.actual_date);
      });
      readinessByTopic.set(topicId, ready);
    }

    for (const row of rows) {
      const topicId = topicByProject.get(row.id);
      if (!topicId) continue;
      row.topic5NotReady = !readinessByTopic.get(topicId);
    }
  }

  return rows;
}

export async function getProjectDetails(projectId: string): Promise<ProjectDetails | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, project_code, project_name, internal_pm_id, additional_owner_id, expected_asset_receipt_date, occupancy_target, occupancy_forecast, priority, architect_id, external_pm_supervisor_id, computed_project_status, requires_management_action")
    .eq("id", projectId)
    .single();

  if (error || !data) return null;

  const { data: contractors } = await supabase
    .from("project_contractors")
    .select("domain, contractor_id, contractor_name")
    .eq("project_id", projectId)
    .order("domain", { ascending: true });

  const { data: topicsData } = await supabase
    .from("project_topics")
    .select("id, topic_index, topic_name_he, status")
    .eq("project_id", projectId)
    .order("topic_index", { ascending: true });

  const topicsRows = (topicsData ?? []) as DbTopicRow[];
  const topicIds = topicsRows.map((t) => t.id);

  const { data: milestonesData } = topicIds.length
    ? await supabase
      .from("milestones")
      .select("id, topic_id, milestone_index, subtopic_index, subtopic_name_he, milestone_name_he, status, target_date, forecast_date, actual_date, note, is_not_relevant")
      .in("topic_id", topicIds)
      .order("milestone_index", { ascending: true, nullsFirst: false })
    : { data: [] as DbMilestoneRow[] };

  const milestonesRows = (milestonesData ?? []) as DbMilestoneRow[];
  const milestonesByTopic = new Map<string, ProjectMilestone[]>();
  for (const row of milestonesRows) {
    const current = milestonesByTopic.get(row.topic_id) ?? [];
    current.push(mapMilestoneRow(row));
    milestonesByTopic.set(row.topic_id, current);
  }

  const topics: ProjectTopic[] = topicsRows.map((t) => ({
    id: t.id,
    topicIndex: t.topic_index,
    name: t.topic_name_he,
    status: t.status,
    milestones: milestonesByTopic.get(t.id) ?? []
  }));

  const topic5 = topics.find((t) => t.topicIndex === 5);
  const topic5Readiness = computeTopic5Readiness(topic5?.milestones ?? []);
  const topic6 = topics.find((t) => t.topicIndex === 6);
  const topic6Progress = computeTopic6Progress(topic6?.milestones ?? []);

  const project = data as DbProjectRow;
  return {
    id: project.id,
    code: project.project_code,
    name: project.project_name,
    internalPmId: project.internal_pm_id,
    additionalOwnerId: project.additional_owner_id,
    expectedAssetReceiptDate: project.expected_asset_receipt_date,
    occupancyTarget: project.occupancy_target,
    occupancyForecast: project.occupancy_forecast,
    priority: project.priority,
    architectId: project.architect_id,
    externalPmSupervisorId: project.external_pm_supervisor_id,
    requiresManagementAction: project.requires_management_action,
    warnings: buildProjectWarnings(project),
    contractors: ((contractors ?? []) as DbProjectContractorRow[]).map((c) => ({
      domain: c.domain,
      contractorId: c.contractor_id,
      contractorName: c.contractor_name
    })),
    topics,
    topic5Readiness,
    topic6Progress
  };
}

export async function getProjectTopic5Milestones(projectId: string): Promise<ProjectMilestone[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createSupabaseServerClient();
  const { data: topic } = await supabase
    .from("project_topics")
    .select("id")
    .eq("project_id", projectId)
    .eq("topic_index", 5)
    .maybeSingle();

  if (!topic?.id) return [];

  const { data: milestones } = await supabase
    .from("milestones")
    .select("id, topic_id, milestone_index, subtopic_index, subtopic_name_he, milestone_name_he, status, target_date, forecast_date, actual_date, note, is_not_relevant")
    .eq("topic_id", topic.id)
    .order("milestone_index", { ascending: true, nullsFirst: false });

  return ((milestones ?? []) as DbMilestoneRow[]).map(mapMilestoneRow);
}

export async function writeProjectWarnings(projectId: string, warnings: ProjectWarning[]) {
  if (!hasSupabaseEnv() || warnings.length === 0) return;
  const supabase = createSupabaseServerClient();
  await supabase.from("project_warning_events").insert(
    warnings.map((w) => ({ project_id: projectId, warning_code: w.code, warning_message: w.message }))
  );
}

export function calculateProjectWarnings(input: {
  internalPmId: string | null;
  externalPmSupervisorId: string | null;
  architectId: string | null;
}): ProjectWarning[] {
  const warnings: ProjectWarning[] = [];
  if (!input.architectId) warnings.push({ code: "missing_architect", message: "אזהרה: טרם שויך אדריכל לפרויקט" });
  if (!input.internalPmId || !input.externalPmSupervisorId) {
    warnings.push({ code: "missing_pm_assignments", message: "אזהרה: חסר שיוך PM פנימי או מפקח/PM חיצוני" });
  }
  return warnings;
}
