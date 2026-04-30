"use client";

import { ProjectMilestone, ProjectStatus, ProjectWarning } from "@/types/domain";
import { useEffect, useMemo, useState } from "react";

type ProjectOption = {
  id: string;
  code: string;
  name: string;
  status: ProjectStatus;
  occupancyForecast: string;
  requiresManagementAction: boolean;
};

type Option = { id: string; full_name: string };

const contractorDomains = [
  { value: "construction_electrical_plumbing", label: "בינוי+חשמל+אינסטלציה" },
  { value: "hvac", label: "מיזוג אוויר" },
  { value: "furniture", label: "ריהוט" },
  { value: "branding_signage", label: "מיתוג ושילוט" }
] as const;

const milestoneStatuses: Array<{ value: ProjectStatus; label: string }> = [
  { value: "on_track", label: "תקין" },
  { value: "at_risk", label: "בסיכון" },
  { value: "delayed", label: "באיחור" },
  { value: "completed", label: "הושלם" },
  { value: "frozen", label: "מוקפא" },
  { value: "not_relevant", label: "לא רלוונטי" }
];

export default function QuickUpdatePage() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [occupancyForecast, setOccupancyForecast] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("on_track");
  const [requiresManagementAction, setRequiresManagementAction] = useState(false);
  const [freezeReason, setFreezeReason] = useState("");
  const [freezeNote, setFreezeNote] = useState("");
  const [contractors, setContractors] = useState<Option[]>([]);
  const [selectedContractors, setSelectedContractors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const [topic5Milestones, setTopic5Milestones] = useState<ProjectMilestone[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [milestoneStatus, setMilestoneStatus] = useState<ProjectStatus>("on_track");
  const [milestoneTargetDate, setMilestoneTargetDate] = useState("");
  const [milestoneForecastDate, setMilestoneForecastDate] = useState("");
  const [milestoneActualDate, setMilestoneActualDate] = useState("");
  const [milestoneNote, setMilestoneNote] = useState("");
  const [milestoneIsNotRelevant, setMilestoneIsNotRelevant] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState("");

  const [topic6Milestones, setTopic6Milestones] = useState<ProjectMilestone[]>([]);
  const [selectedTopic6MilestoneId, setSelectedTopic6MilestoneId] = useState("");
  const [topic6Status, setTopic6Status] = useState<ProjectStatus>("on_track");
  const [topic6TargetDate, setTopic6TargetDate] = useState("");
  const [topic6ForecastDate, setTopic6ForecastDate] = useState("");
  const [topic6ActualDate, setTopic6ActualDate] = useState("");
  const [topic6Note, setTopic6Note] = useState("");
  const [topic6IsNotRelevant, setTopic6IsNotRelevant] = useState(false);
  const [topic6Message, setTopic6Message] = useState("");

  const selectedMilestone = useMemo(
    () => topic5Milestones.find((m) => m.id === selectedMilestoneId) ?? null,
    [topic5Milestones, selectedMilestoneId]
  );

  const selectedTopic6Milestone = useMemo(
    () => topic6Milestones.find((m) => m.id === selectedTopic6MilestoneId) ?? null,
    [topic6Milestones, selectedTopic6MilestoneId]
  );

  const loadTopic5Milestones = async (targetProjectId: string) => {
    const response = await fetch(`/api/projects/${targetProjectId}`);
    const payload = await response.json();
    const project = payload.project;
    const milestones: ProjectMilestone[] = project?.topics?.find((t: { topicIndex: number }) => t.topicIndex === 5)?.milestones ?? [];
    setTopic5Milestones(milestones);
    const first = milestones[0];
    setSelectedMilestoneId(first?.id ?? "");
  };

  const loadTopic6Milestones = async (targetProjectId: string) => {
    const response = await fetch(`/api/projects/${targetProjectId}`);
    const payload = await response.json();
    const project = payload.project;
    const milestones: ProjectMilestone[] = project?.topics?.find((t: { topicIndex: number }) => t.topicIndex === 6)?.milestones ?? [];
    setTopic6Milestones(milestones);
    const first = milestones[0];
    setSelectedTopic6MilestoneId(first?.id ?? "");
  };

  const hydrateMilestoneForm = (milestone: ProjectMilestone | null) => {
    setMilestoneStatus(milestone?.status ?? "on_track");
    setMilestoneTargetDate(milestone?.targetDate ?? "");
    setMilestoneForecastDate(milestone?.forecastDate ?? "");
    setMilestoneActualDate(milestone?.actualDate ?? "");
    setMilestoneNote(milestone?.note ?? "");
    setMilestoneIsNotRelevant(Boolean(milestone?.isNotRelevant));
  };

  const hydrateTopic6MilestoneForm = (milestone: ProjectMilestone | null) => {
    setTopic6Status(milestone?.status ?? "on_track");
    setTopic6TargetDate(milestone?.targetDate ?? "");
    setTopic6ForecastDate(milestone?.forecastDate ?? "");
    setTopic6ActualDate(milestone?.actualDate ?? "");
    setTopic6Note(milestone?.note ?? "");
    setTopic6IsNotRelevant(Boolean(milestone?.isNotRelevant));
  };

  useEffect(() => {
    const load = async () => {
      const [projectsResponse, listsResponse] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/managed-lists")
      ]);
      const projectsPayload = await projectsResponse.json();
      const rows: ProjectOption[] = projectsPayload.projects ?? [];
      setProjects(rows);

      const listsPayload = await listsResponse.json();
      setContractors(listsPayload.contractors ?? []);

      if (rows[0]) {
        setProjectId(rows[0].id);
        setOccupancyForecast(rows[0].occupancyForecast === "--" ? "" : rows[0].occupancyForecast);
        setStatus(rows[0].status);
        setRequiresManagementAction(rows[0].requiresManagementAction);
        await loadTopic5Milestones(rows[0].id);
        await loadTopic6Milestones(rows[0].id);
      }
    };
    load();
  }, []);

  useEffect(() => {
    hydrateMilestoneForm(selectedMilestone);
  }, [selectedMilestoneId, selectedMilestone]);

  useEffect(() => {
    hydrateTopic6MilestoneForm(selectedTopic6Milestone);
  }, [selectedTopic6MilestoneId, selectedTopic6Milestone]);

  const onProjectChange = async (id: string) => {
    setProjectId(id);
    const selected = projects.find((item) => item.id === id);
    if (!selected) return;
    setOccupancyForecast(selected.occupancyForecast === "--" ? "" : selected.occupancyForecast);
    setStatus(selected.status);
    setRequiresManagementAction(selected.requiresManagementAction);
    setMilestoneMessage("");
    setTopic6Message("");
    await loadTopic5Milestones(id);
    await loadTopic6Milestones(id);
  };

  const setContractor = (domain: string, contractorId: string) => {
    setSelectedContractors((prev) => ({ ...prev, [domain]: contractorId }));
  };

  const submitProjectUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        occupancyForecast,
        computedProjectStatus: status,
        requiresManagementAction,
        freezeReason: freezeReason || null,
        freezeNote: freezeNote || null,
        contractors: contractorDomains.map((domain) => ({
          domain: domain.value,
          contractorId: selectedContractors[domain.value] || null
        }))
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "עדכון נכשל");
      return;
    }

    const warningText = Array.isArray(payload.warnings) && payload.warnings.length
      ? ` | אזהרות: ${payload.warnings.map((w: { message: string }) => w.message).join("; ")}`
      : "";
    setMessage(`העדכון נשמר בהצלחה${warningText}`);
  };

  const submitMilestoneUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !selectedMilestoneId) return;
    setMilestoneMessage("");

    const response = await fetch(`/api/projects/${projectId}/milestones/${selectedMilestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: milestoneStatus,
        targetDate: milestoneTargetDate || null,
        forecastDate: milestoneForecastDate || null,
        actualDate: milestoneActualDate || null,
        note: milestoneNote || null,
        isNotRelevant: milestoneIsNotRelevant
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setMilestoneMessage(payload.error ?? "עדכון אבן דרך נכשל");
      return;
    }

    if (payload.milestone) {
      setTopic5Milestones((prev) => prev.map((m) => (m.id === payload.milestone.id ? payload.milestone : m)));
    }

    const warnings = (payload.warnings ?? []) as ProjectWarning[];
    if (warnings.length) {
      const warningText = warnings
        .map((w) =>
          w.missingPrerequisites?.length
            ? `${w.message}: ${w.missingPrerequisites.map((x) => `${x.milestoneIndex} ${x.name}`).join(", ")}`
            : w.message
        )
        .join(" | ");
      setMilestoneMessage(`אבן הדרך נשמרה. ${warningText}`);
    } else {
      setMilestoneMessage("אבן הדרך נשמרה בהצלחה");
    }
  };

  const submitTopic6MilestoneUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !selectedTopic6MilestoneId) return;
    setTopic6Message("");

    const response = await fetch(`/api/projects/${projectId}/topic6/milestones/${selectedTopic6MilestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: topic6Status,
        targetDate: topic6TargetDate || null,
        forecastDate: topic6ForecastDate || null,
        actualDate: topic6ActualDate || null,
        note: topic6Note || null,
        isNotRelevant: topic6IsNotRelevant
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setTopic6Message(payload.error ?? "עדכון אבן דרך פרק 6 נכשל");
      return;
    }
    if (payload.milestone) {
      setTopic6Milestones((prev) => prev.map((m) => (m.id === payload.milestone.id ? payload.milestone : m)));
    }
    setTopic6Message("אבן הדרך נשמרה בהצלחה");
  };

  return (
    <main className="container">
      <h1>עדכון מהיר</h1>

      <form className="card grid" onSubmit={submitProjectUpdate}>
        <h2>עדכון פרויקט</h2>
        <label>
          <div className="field-label">פרויקט</div>
          <select value={projectId} onChange={(e) => onProjectChange(e.target.value)} required>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.code} - {project.name}</option>
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
            {milestoneStatuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label>
          <input type="checkbox" checked={requiresManagementAction} onChange={(e) => setRequiresManagementAction(e.target.checked)} />
          <span style={{ marginInlineStart: 8 }}>נדרש טיפול הנהלה</span>
        </label>

        <label>
          <div className="field-label">סיבת הקפאה (אופציונלי)</div>
          <input value={freezeReason} onChange={(e) => setFreezeReason(e.target.value)} />
        </label>

        <label>
          <div className="field-label">הערת הקפאה (אופציונלי)</div>
          <input value={freezeNote} onChange={(e) => setFreezeNote(e.target.value)} />
        </label>

        {contractorDomains.map((domain) => (
          <label key={domain.value}>
            <div className="field-label">קבלן {domain.label}</div>
            <select value={selectedContractors[domain.value] ?? ""} onChange={(e) => setContractor(domain.value, e.target.value)}>
              <option value="">ללא</option>
              {contractors.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>{contractor.full_name}</option>
              ))}
            </select>
          </label>
        ))}

        <button type="submit" className="menu-toggle" style={{ display: "inline-flex" }}>שמירת עדכון</button>
        {message ? <p>{message}</p> : null}
      </form>

      <form className="card grid" onSubmit={submitMilestoneUpdate} style={{ marginTop: 16 }}>
        <h2>עדכון אבן דרך פרק 5</h2>
        <label>
          <div className="field-label">אבן דרך</div>
          <select value={selectedMilestoneId} onChange={(e) => setSelectedMilestoneId(e.target.value)} required>
            {topic5Milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.milestoneIndex ?? "--"} - {m.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div className="field-label">סטטוס</div>
          <select value={milestoneStatus} onChange={(e) => setMilestoneStatus(e.target.value as ProjectStatus)}>
            {milestoneStatuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label>
          <div className="field-label">תאריך יעד</div>
          <input type="date" value={milestoneTargetDate} onChange={(e) => setMilestoneTargetDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">תאריך תחזית</div>
          <input type="date" value={milestoneForecastDate} onChange={(e) => setMilestoneForecastDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">תאריך בפועל</div>
          <input type="date" value={milestoneActualDate} onChange={(e) => setMilestoneActualDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">הערה</div>
          <input value={milestoneNote} onChange={(e) => setMilestoneNote(e.target.value)} />
        </label>

        <label>
          <input type="checkbox" checked={milestoneIsNotRelevant} onChange={(e) => setMilestoneIsNotRelevant(e.target.checked)} />
          <span style={{ marginInlineStart: 8 }}>לא רלוונטי</span>
        </label>

        <button type="submit" className="menu-toggle" style={{ display: "inline-flex" }}>שמירת אבן דרך</button>
        {milestoneMessage ? <p>{milestoneMessage}</p> : null}
      </form>

      <form className="card grid" onSubmit={submitTopic6MilestoneUpdate} style={{ marginTop: 16 }}>
        <h2>עדכון אבן דרך פרק 6</h2>
        <label>
          <div className="field-label">אבן דרך</div>
          <select value={selectedTopic6MilestoneId} onChange={(e) => setSelectedTopic6MilestoneId(e.target.value)} required>
            {topic6Milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.milestoneIndex ?? "--"} - {m.subtopicName ?? "--"} - {m.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div className="field-label">סטטוס</div>
          <select value={topic6Status} onChange={(e) => setTopic6Status(e.target.value as ProjectStatus)}>
            {milestoneStatuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <label>
          <div className="field-label">תאריך יעד</div>
          <input type="date" value={topic6TargetDate} onChange={(e) => setTopic6TargetDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">תאריך תחזית</div>
          <input type="date" value={topic6ForecastDate} onChange={(e) => setTopic6ForecastDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">תאריך בפועל</div>
          <input type="date" value={topic6ActualDate} onChange={(e) => setTopic6ActualDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">הערה</div>
          <input value={topic6Note} onChange={(e) => setTopic6Note(e.target.value)} />
        </label>

        <label>
          <input type="checkbox" checked={topic6IsNotRelevant} onChange={(e) => setTopic6IsNotRelevant(e.target.checked)} />
          <span style={{ marginInlineStart: 8 }}>לא רלוונטי</span>
        </label>

        <button type="submit" className="menu-toggle" style={{ display: "inline-flex" }}>שמירת אבן דרך</button>
        {topic6Message ? <p>{topic6Message}</p> : null}
      </form>
    </main>
  );
}
