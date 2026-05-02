import { createSupabaseServerClient } from "@/lib/supabase";
import { ProjectStatus, TopicState } from "@/types/domain";
import { projectStatus, requiresManagementAction, topicStatus } from "@/lib/domain/status";

type ProjectRow = {
  id: string;
  requires_management_action_manual: boolean;
  delayed_since: string | null;
};

type TopicRow = {
  id: string;
  topic_index: number;
  status: ProjectStatus;
  target_date: string | null;
  forecast_date: string | null;
  actual_date: string | null;
};

type MilestoneRow = {
  topic_id: string;
  milestone_index: number | null;
  subtopic_index: number | null;
  status: ProjectStatus;
  actual_date: string | null;
  is_not_relevant: boolean | null;
};

function isCompletedStatus(status: ProjectStatus, actualDate: string | null): boolean {
  return status === "completed" || Boolean(actualDate);
}

function dateDiffDays(left: string, right: string): number {
  const leftDate = new Date(`${left}T00:00:00Z`);
  const rightDate = new Date(`${right}T00:00:00Z`);
  return Math.floor((leftDate.getTime() - rightDate.getTime()) / (1000 * 60 * 60 * 24));
}

function lateDays(targetDate: string | null, forecastDate: string | null): number {
  if (!targetDate || !forecastDate) return 0;
  return Math.max(dateDiffDays(forecastDate, targetDate), 0);
}

function milestoneRank(status: ProjectStatus): number {
  if (status === "delayed") return 3;
  if (status === "at_risk") return 2;
  return 0;
}

function computeTopicState(topic: TopicRow, milestones: MilestoneRow[]): TopicState {
  const relevant = milestones.filter((m) => !(m.status === "not_relevant" || m.is_not_relevant));
  const anyDelayedMilestone = relevant.some((m) => milestoneRank(m.status) === 3);
  const anyAtRiskMilestone = relevant.some((m) => milestoneRank(m.status) === 2);
  const forecastLateDays = lateDays(topic.target_date, topic.forecast_date);

  let isCompleted = isCompletedStatus(topic.status, topic.actual_date);
  if (relevant.length > 0) {
    isCompleted = relevant.every((m) => isCompletedStatus(m.status, m.actual_date));
  }

  // Topic 4 hard completion condition: milestone 18 must be completed.
  if (topic.topic_index === 4) {
    const m18 = milestones.find((m) => m.milestone_index === 18);
    isCompleted = isCompleted && Boolean(m18 && isCompletedStatus(m18.status, m18.actual_date));
  }
  // Topic 5 completion condition: milestone 11 must be completed.
  if (topic.topic_index === 5) {
    const m11 = milestones.find((m) => m.milestone_index === 11);
    isCompleted = isCompleted && Boolean(m11 && isCompletedStatus(m11.status, m11.actual_date));
  }

  return {
    name: `topic-${topic.topic_index}`,
    isCompleted,
    anyDelayedMilestone,
    anyAtRiskMilestone,
    forecastLateDays
  };
}

function toProjectStatusTopics(topicStates: Array<{ topicIndex: number; state: TopicState }>): TopicState[] {
  return topicStates
    .filter((t) => t.topicIndex >= 1 && t.topicIndex <= 5)
    .map((t) => t.state);
}

export async function recomputeAndPersistProjectStatus(projectId: string) {
  const supabase = createSupabaseServerClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, requires_management_action_manual, delayed_since")
    .eq("id", projectId)
    .single();
  if (projectError || !project) return { ok: false, error: projectError?.message ?? "Project not found" };

  const { data: topics, error: topicsError } = await supabase
    .from("project_topics")
    .select("id, topic_index, status, target_date, forecast_date, actual_date")
    .eq("project_id", projectId)
    .order("topic_index", { ascending: true });
  if (topicsError || !topics) return { ok: false, error: topicsError?.message ?? "Topics query failed" };

  const topicIds = (topics as TopicRow[]).map((t) => t.id);
  const { data: milestones, error: milestonesError } = topicIds.length
    ? await supabase
      .from("milestones")
      .select("topic_id, milestone_index, subtopic_index, status, actual_date, is_not_relevant")
      .in("topic_id", topicIds)
    : { data: [] as MilestoneRow[], error: null };
  if (milestonesError) return { ok: false, error: milestonesError.message };

  const byTopic = new Map<string, MilestoneRow[]>();
  for (const milestone of (milestones ?? []) as MilestoneRow[]) {
    const current = byTopic.get(milestone.topic_id) ?? [];
    current.push(milestone);
    byTopic.set(milestone.topic_id, current);
  }

  const topicStates = (topics as TopicRow[]).map((topic) => {
    const topicMilestones = byTopic.get(topic.id) ?? [];
    const state = computeTopicState(topic, topicMilestones);
    return {
      topicId: topic.id,
      topicIndex: topic.topic_index,
      state,
      status: topicStatus(state)
    };
  });

  for (const t of topicStates) {
    const { error } = await supabase.from("project_topics").update({ status: t.status }).eq("id", t.topicId);
    if (error) return { ok: false, error: error.message };
  }

  const nextProjectStatus = projectStatus(toProjectStatusTopics(topicStates.map((t) => ({ topicIndex: t.topicIndex, state: t.state }))));

  const nowIso = new Date().toISOString();
  const currentDelayedSince = (project as ProjectRow).delayed_since;
  const nextDelayedSince = nextProjectStatus === "delayed" ? (currentDelayedSince ?? nowIso) : null;
  const delayedForDays = nextDelayedSince ? Math.floor((Date.now() - new Date(nextDelayedSince).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const manualOverride = Boolean((project as ProjectRow).requires_management_action_manual);
  const nextRequiresManagement = requiresManagementAction(nextProjectStatus, delayedForDays, manualOverride);

  const { error: updateProjectError } = await supabase
    .from("projects")
    .update({
      computed_project_status: nextProjectStatus,
      delayed_since: nextDelayedSince,
      requires_management_action: nextRequiresManagement
    })
    .eq("id", projectId);
  if (updateProjectError) return { ok: false, error: updateProjectError.message };

  return {
    ok: true,
    computedProjectStatus: nextProjectStatus,
    requiresManagementAction: nextRequiresManagement,
    delayedSince: nextDelayedSince
  };
}
