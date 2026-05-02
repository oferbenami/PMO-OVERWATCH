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
  requiresManagementActionManual?: boolean;
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
  delayReason?: string | null;
  isNotRelevant: boolean;
}

export interface FreezePeriod {
  id: string;
  reason: string;
  note: string | null;
  startDate: string;
  endDate: string | null;
}

export interface ProjectTopic {
  id: string;
  topicIndex: number;
  name: string;
  status: ProjectStatus;
  targetDate?: string | null;
  originalTargetDate?: string | null;
  forecastDate?: string | null;
  actualDate?: string | null;
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

export interface Topic3DomainProgress {
  domainIndex: number;
  domainName: string;
  isRelevant: boolean;
  isComplete: boolean;
}

export interface Topic3Progress {
  isComplete: boolean;
  domains: Topic3DomainProgress[];
}

export interface Topic4Progress {
  isComplete: boolean;
  hasMilestone18Completed: boolean;
}

export interface ProjectTopicSchedule {
  topicIndex: number;
  topicName: string;
  targetDate: string | null;
  originalTargetDate: string | null;
  forecastDate: string | null;
  actualDate: string | null;
  isManualTargetOverride: boolean;
}

export interface TopicScheduleChangeEvent {
  projectId: string;
  topicIndex: number;
  previousForecastDate: string | null;
  nextForecastDate: string | null;
  changedAt: string;
}

export interface ProjectScheduleState {
  projectId: string;
  expectedAssetReceiptDate: string;
  occupancyTarget: string;
  occupancyForecast: string | null;
  occupancyActual?: string | null;
  topics: ProjectTopicSchedule[];
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
  requiresManagementActionManual?: boolean;
  isFrozen?: boolean;
  freezeReason?: string | null;
  freezeNote?: string | null;
  freezePeriods?: FreezePeriod[];
  warnings: ProjectWarning[];
  contractors: ProjectContractor[];
  topics: ProjectTopic[];
  schedule: ProjectScheduleState;
  topic3Progress: Topic3Progress;
  topic4Progress: Topic4Progress;
  topic5Readiness: Topic5Readiness;
  topic6Progress: Topic6Progress;
}
