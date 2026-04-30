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
  topic5NotReady?: boolean;
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

export interface ProjectContractor {
  domain: string;
  contractorId: string | null;
  contractorName: string | null;
}

export interface ProjectMilestone {
  id: string;
  milestoneIndex: number | null;
  subtopicIndex?: number | null;
  subtopicName?: string | null;
  name: string;
  status: ProjectStatus;
  targetDate: string | null;
  forecastDate: string | null;
  actualDate: string | null;
  note: string | null;
  isNotRelevant: boolean;
}

export interface ProjectTopic {
  id: string;
  topicIndex: number;
  name: string;
  status: ProjectStatus;
  milestones: ProjectMilestone[];
}

export interface Topic5Readiness {
  canCompleteMilestone11: boolean;
  missingPrerequisites: Array<{ milestoneIndex: number; name: string }>;
}

export interface Topic6SubtopicProgress {
  subtopicIndex: number;
  subtopicName: string;
  isRequired: boolean;
  isComplete: boolean;
}

export interface Topic6Progress {
  isTrackingComplete: boolean;
  subtopics: Topic6SubtopicProgress[];
}

export interface ProjectWarning {
  code: string;
  message: string;
  missingPrerequisites?: Array<{ milestoneIndex: number; name: string }>;
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
  topics: ProjectTopic[];
  topic5Readiness: Topic5Readiness;
  topic6Progress: Topic6Progress;
}
