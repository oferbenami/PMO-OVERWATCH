export type ProjectStatus = "on_track" | "at_risk" | "delayed" | "completed" | "frozen" | "not_relevant";

export interface ProjectDashboardRow {
  id: string;
  code: string;
  name: string;
  pmName: string;
  occupancyTarget: string;
  occupancyForecast: string;
  status: ProjectStatus;
  statusHe: string;
  statusColor: string;
  exceptionMilestone: string;
  requiresManagementAction: boolean;
}

export interface TopicState {
  name: string;
  isCompleted: boolean;
  anyDelayedMilestone: boolean;
  anyAtRiskMilestone: boolean;
  forecastLateDays: number;
}
