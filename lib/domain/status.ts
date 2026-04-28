import { ProjectStatus, TopicState } from "@/types/domain";

const HEBREW_STATUS: Record<ProjectStatus, string> = {
  on_track: "תקין",
  at_risk: "בסיכון",
  delayed: "באיחור",
  completed: "הושלם",
  frozen: "מוקפא",
  not_relevant: "לא רלוונטי"
};

const STATUS_COLOR: Record<ProjectStatus, string> = {
  on_track: "#1A7F4B",
  at_risk: "#C05621",
  delayed: "#C53030",
  completed: "#2E6DA4",
  frozen: "#718096",
  not_relevant: "#CBD5E0"
};

export function topicStatus(topic: TopicState): ProjectStatus {
  if (topic.isCompleted) return "completed";
  if (topic.anyDelayedMilestone || topic.forecastLateDays > 7) return "delayed";
  if (topic.anyAtRiskMilestone || (topic.forecastLateDays >= 1 && topic.forecastLateDays <= 7)) return "at_risk";
  return "on_track";
}

export function projectStatus(topics: TopicState[]): ProjectStatus {
  const rank: Record<ProjectStatus, number> = { delayed: 5, at_risk: 4, on_track: 3, completed: 2, frozen: 1, not_relevant: 0 };
  let current: ProjectStatus = "completed";
  for (const t of topics) {
    const s = topicStatus(t);
    if (rank[s] > rank[current]) current = s;
  }
  return current;
}

export function toPresentation(status: ProjectStatus) {
  return { statusHe: HEBREW_STATUS[status], statusColor: STATUS_COLOR[status] };
}

export function requiresManagementAction(status: ProjectStatus, delayedForDays: number, manualOverride: boolean): boolean {
  if (manualOverride) return true;
  return status === "delayed" && delayedForDays >= 14;
}
