import { NextResponse } from "next/server";
import { getDashboardProjects } from "@/lib/domain/projects";
import { createSupabaseServerClient } from "@/lib/supabase";

type CreateProjectBody = {
  projectName?: string;
  expectedAssetReceiptDate?: string;
  occupancyTarget?: string;
  priority?: "high" | "medium" | "low";
};

function parseProjectCode(code: string): number {
  const match = code.match(/PRJ-(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

export async function GET() {
  const projects = await getDashboardProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateProjectBody;

  if (!body.projectName || !body.expectedAssetReceiptDate || !body.occupancyTarget || !body.priority) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("project_code")
    .order("project_code", { ascending: false })
    .limit(1);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const nextNumber = (existing?.[0]?.project_code ? parseProjectCode(existing[0].project_code) : 0) + 1;
  const projectCode = `PRJ-${String(nextNumber).padStart(3, "0")}`;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      project_code: projectCode,
      project_name: body.projectName,
      expected_asset_receipt_date: body.expectedAssetReceiptDate,
      occupancy_target: body.occupancyTarget,
      occupancy_forecast: body.occupancyTarget,
      priority: body.priority,
      computed_project_status: "on_track"
    })
    .select("id, project_code")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, project: data }, { status: 201 });
}
