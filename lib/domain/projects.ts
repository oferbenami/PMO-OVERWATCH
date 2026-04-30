import { ProjectDashboardRow, ProjectDetails, ProjectStatus, ProjectWarning } from "@/types/domain";
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
    requiresManagementAction: row.requires_management_action
  };
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

  return (data as DbProjectRow[]).map(mapProjectRow);
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
    }))
  };
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
