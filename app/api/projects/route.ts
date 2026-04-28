import { NextResponse } from "next/server";
import { getDashboardProjects } from "@/lib/domain/projects";

export async function GET() {
  const projects = await getDashboardProjects();
  return NextResponse.json({ projects });
}
