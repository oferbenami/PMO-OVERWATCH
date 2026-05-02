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
        <section className="card">?????? ?? ????: {id}</section>
      </main>
    );
  }

  return (
    <main className="container grid">
      <h1>????? ??????</h1>
      <section className="card">
        <strong>{project.code} - {project.name}</strong>
        <p>??? ???? ???: {project.expectedAssetReceiptDate}</p>
        <p>??? ?????: {project.occupancyTarget}</p>
        <p>????? ?????: {project.occupancyForecast ?? "--"}</p>
        <p>??????: {project.priority}</p>
        <p>
          ????? ????? ?????: {project.requiresManagementAction ? "??" : "??"}
          {project.requiresManagementAction && project.requiresManagementActionManual ? " (????)" : ""}
        </p>
      </section>

      <section className="card">
        <h2>?????? ????? (?? ??????)</h2>
        <ul>
          {project.warnings.length === 0 ? <li>??? ??????</li> : project.warnings.map((w) => <li key={w.code}>{w.message}</li>)}
        </ul>
      </section>

      <section className="card">
        <h2>?????? ??????</h2>
        <ul>
          {project.contractors.length === 0 ? <li>?? ?????? ??????</li> : project.contractors.map((c) => (
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
