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

export interface ManagedOption {
  id: string;
  fullName: string;
}

export interface ProjectWarning {
  code: string;
  message: string;
}

export interface ProjectContractor {
  domain: string;
  contractorId: string | null;
  contractorName: string | null;
}

export interface ProjectDetails {
  id: string;
  code: string;
  name: string;
  internalPmId: string | null;
  additionalOwnerId: string | null;
  expectedAssetReceiptDate: string;
  occupancyTarget: string;
  occupancyForecast: string | null;
  priority: "high" | "medium" | "low";
  architectId: string | null;
  externalPmSupervisorId: string | null;
  requiresManagementAction: boolean;
  warnings: ProjectWarning[];
  contractors: ProjectContractor[];
}
