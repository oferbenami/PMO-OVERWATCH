import { Topic3Panel } from "@/components/topic3-panel";
import { Topic4Panel } from "@/components/topic4-panel";
import { Topic5Panel } from "@/components/topic5-panel";
import { Topic6Panel } from "@/components/topic6-panel";
import { SchedulePanel } from "@/components/schedule-panel";
import { getProjectDetails } from "@/lib/domain/projects";

export default async function ProjectCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectDetails(id);

  if (!project) {
    return (
      <main className="container">
        <section className="card">Project not found: {id}</section>
      </main>
    );
  }

  const activeFreeze = (project.freezePeriods ?? []).find((p) => !p.endDate) ?? null;

  return (
    <main className="container grid">
      <h1>Project Card</h1>

      <section className="card">
        <strong>{project.code} - {project.name}</strong>
        <p>Expected Asset Receipt: {project.expectedAssetReceiptDate}</p>
        <p>Occupancy Target: {project.occupancyTarget}</p>
        <p>Occupancy Forecast: {project.occupancyForecast ?? "--"}</p>
        <p>Priority: {project.priority}</p>
        <p>
          Management Action: {project.requiresManagementAction ? "Yes" : "No"}
          {project.requiresManagementAction && project.requiresManagementActionManual ? " (Manual)" : ""}
        </p>
        <p>Freeze Status: {project.isFrozen ? "Frozen" : "Active"}</p>
        {project.isFrozen ? (
          <>
            <p>Freeze Reason: {activeFreeze?.reason ?? project.freezeReason ?? "--"}</p>
            <p>Freeze Note: {activeFreeze?.note ?? project.freezeNote ?? "--"}</p>
          </>
        ) : null}
      </section>

      <section className="card">
        <h2>Warnings (Non-blocking)</h2>
        <ul>
          {project.warnings.length === 0 ? <li>No warnings</li> : project.warnings.map((w) => <li key={w.code}>{w.message}</li>)}
        </ul>
      </section>

      <section className="card">
        <h2>Freeze History</h2>
        <ul>
          {(project.freezePeriods ?? []).length === 0 ? (
            <li>No freeze periods</li>
          ) : (
            project.freezePeriods!.map((p) => (
              <li key={p.id}>
                {p.reason} | {p.startDate} - {p.endDate ?? "Open"} {p.note ? `| ${p.note}` : ""}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="card">
        <h2>Selected Contractors</h2>
        <ul>
          {project.contractors.length === 0 ? <li>No contractors selected</li> : project.contractors.map((c) => (
            <li key={c.domain}>{c.domain}: {c.contractorName ?? "--"}</li>
          ))}
        </ul>
      </section>

      <SchedulePanel projectId={project.id} initialSchedule={project.schedule} />

      <Topic3Panel
        projectId={project.id}
        initialMilestones={project.topics.find((t) => t.topicIndex === 3)?.milestones ?? []}
        initialProgress={project.topic3Progress}
      />

      <Topic4Panel
        projectId={project.id}
        initialMilestones={project.topics.find((t) => t.topicIndex === 4)?.milestones ?? []}
        initialProgress={project.topic4Progress}
      />

      <Topic5Panel
        projectId={project.id}
        initialMilestones={project.topics.find((t) => t.topicIndex === 5)?.milestones ?? []}
        initialReadiness={project.topic5Readiness}
      />

      <Topic6Panel
        projectId={project.id}
        initialMilestones={project.topics.find((t) => t.topicIndex === 6)?.milestones ?? []}
        initialProgress={project.topic6Progress}
      />
    </main>
  );
}
