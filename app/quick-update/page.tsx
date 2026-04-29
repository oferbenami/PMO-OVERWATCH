"use client";

import { ProjectStatus } from "@/types/domain";
import { useEffect, useState } from "react";

type ProjectOption = {
  id: string;
  code: string;
  name: string;
  status: ProjectStatus;
  occupancyForecast: string;
  requiresManagementAction: boolean;
};

export default function QuickUpdatePage() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [occupancyForecast, setOccupancyForecast] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("on_track");
  const [requiresManagementAction, setRequiresManagementAction] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/projects");
      const payload = await response.json();
      const rows: ProjectOption[] = payload.projects ?? [];
      setProjects(rows);
      if (rows[0]) {
        setProjectId(rows[0].id);
        setOccupancyForecast(rows[0].occupancyForecast === "--" ? "" : rows[0].occupancyForecast);
        setStatus(rows[0].status);
        setRequiresManagementAction(rows[0].requiresManagementAction);
      }
    };
    load();
  }, []);

  const onProjectChange = (id: string) => {
    setProjectId(id);
    const selected = projects.find((item) => item.id === id);
    if (!selected) return;
    setOccupancyForecast(selected.occupancyForecast === "--" ? "" : selected.occupancyForecast);
    setStatus(selected.status);
    setRequiresManagementAction(selected.requiresManagementAction);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        occupancyForecast,
        computedProjectStatus: status,
        requiresManagementAction
      })
    });

    if (!response.ok) {
      const payload = await response.json();
      setMessage(payload.error ?? "עדכון נכשל");
      return;
    }

    setMessage("העדכון נשמר בהצלחה");
  };

  return (
    <main className="container">
      <h1>עדכון מהיר</h1>
      <form className="card grid" onSubmit={submit}>
        <label>
          <div className="field-label">פרויקט</div>
          <select value={projectId} onChange={(e) => onProjectChange(e.target.value)} required>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.code} - {project.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div className="field-label">תחזית אכלוס</div>
          <input type="date" value={occupancyForecast} onChange={(e) => setOccupancyForecast(e.target.value)} required />
        </label>

        <label>
          <div className="field-label">סטטוס</div>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            <option value="on_track">תקין</option>
            <option value="at_risk">בסיכון</option>
            <option value="delayed">באיחור</option>
            <option value="completed">הושלם</option>
            <option value="frozen">מוקפא</option>
            <option value="not_relevant">לא רלוונטי</option>
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={requiresManagementAction}
            onChange={(e) => setRequiresManagementAction(e.target.checked)}
          />
          <span style={{ marginInlineStart: 8 }}>נדרש טיפול הנהלה</span>
        </label>

        <button type="submit" className="menu-toggle" style={{ display: "inline-flex" }}>
          שמירת עדכון
        </button>

        {message ? <p>{message}</p> : null}
      </form>
    </main>
  );
}
