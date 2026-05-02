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
        <section className="card">פרויקט לא נמצא: {id}</section>
      </main>
    );
  }

  return (
    <main className="container grid">
      <h1>כרטיס פרויקט</h1>
      <section className="card">
        <strong>{project.code} - {project.name}</strong>
        <p>צפי קבלת נכס: {project.expectedAssetReceiptDate}</p>
        <p>יעד אכלוס: {project.occupancyTarget}</p>
        <p>תחזית אכלוס: {project.occupancyForecast ?? "--"}</p>
        <p>עדיפות: {project.priority}</p>
      </section>

      <section className="card">
        <h2>אזהרות הקצאה (לא חוסמות)</h2>
        <ul>
          {project.warnings.length === 0 ? <li>אין אזהרות</li> : project.warnings.map((w) => <li key={w.code}>{w.message}</li>)}
        </ul>
      </section>

      <section className="card">
        <h2>קבלנים נבחרים</h2>
        <ul>
          {project.contractors.length === 0 ? <li>לא הוגדרו קבלנים</li> : project.contractors.map((c) => (
            <li key={c.domain}>{c.domain}: {c.contractorName ?? "--"}</li>
          ))}
        </ul>
      </section>

      <SchedulePanel
        projectId={project.id}
        initialSchedule={project.schedule}
      />

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
