import { ProjectDashboardRow, ProjectStatus } from "@/types/domain";
import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { sampleProjects } from "@/lib/domain/sample-data";
import { toPresentation } from "@/lib/domain/status";

type DbProjectRow = {
  id: string;
  project_code: string;
  project_name: string;
  occupancy_target: string;
  occupancy_forecast: string | null;
  computed_project_status: ProjectStatus;
  requires_management_action: boolean;
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

export async function getDashboardProjects(): Promise<ProjectDashboardRow[]> {
  if (!hasSupabaseEnv()) {
    return sampleProjects;
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, project_code, project_name, occupancy_target, occupancy_forecast, computed_project_status, requires_management_action")
    .order("project_code", { ascending: true });

  if (error || !data) {
    return sampleProjects;
  }

  return (data as DbProjectRow[]).map(mapProjectRow);
}
