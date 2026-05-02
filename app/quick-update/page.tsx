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

const delayReasons = [
  { value: "approvals_regulation", label: "אישורים / רגולציה" },
  { value: "planning", label: "תכנון" },
  { value: "tender_procurement", label: "מכרז / רכש" },
  { value: "contractor_supplier", label: "קבלן / ספק" },
  { value: "budget_management_decision", label: "תקציב / החלטת הנהלה" },
  { value: "external_dependency", label: "תלות חיצונית" },
  { value: "site_asset_issue", label: "בעיית אתר / נכס" },
  { value: "change_in_requirements", label: "שינוי דרישות" },
  { value: "other", label: "אחר" }
] as const;

const freezeReasons = [
  { value: "regulation_approvals", label: "רגולציה / אישורים" },
  { value: "management_decision", label: "החלטת הנהלה" },
  { value: "budget", label: "תקציב" },
  { value: "external_party_or_owner", label: "גורם חיצוני / בעל נכס" },
  { value: "contractor_supplier", label: "קבלן / ספק" },
  { value: "operational_business_constraint", label: "אילוץ תפעולי / עסקי" },
  { value: "other", label: "אחר" }
] as const;

function MsgP({ msg }: { msg: string }) {
  if (!msg) return null;
  const isError = msg.includes("נכשל") || msg.includes("שגיאה") || msg.includes("לא ניתן");
  return <p className={`form-message ${isError ? "error" : "success"}`}>{msg}</p>;
}

export default function QuickUpdatePage() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [occupancyForecast, setOccupancyForecast] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("on_track");
  const [requiresManagementAction, setRequiresManagementAction] = useState(false);
  const [freezeReason, setFreezeReason] = useState("");
  const [freezeNote, setFreezeNote] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);
  const [contractors, setContractors] = useState<Option[]>([]);
  const [selectedContractors, setSelectedContractors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const [topic3Milestones, setTopic3Milestones] = useState<ProjectMilestone[]>([]);
  const [selectedTopic3MilestoneId, setSelectedTopic3MilestoneId] = useState("");
  const [topic3Status, setTopic3Status] = useState<ProjectStatus>("on_track");
  const [topic3TargetDate, setTopic3TargetDate] = useState("");
  const [topic3ForecastDate, setTopic3ForecastDate] = useState("");
  const [topic3ActualDate, setTopic3ActualDate] = useState("");
  const [topic3Note, setTopic3Note] = useState("");
  const [topic3DelayReason, setTopic3DelayReason] = useState("");
  const [topic3IsNotRelevant, setTopic3IsNotRelevant] = useState(false);
  const [topic3Message, setTopic3Message] = useState("");

  const [topic4Milestones, setTopic4Milestones] = useState<ProjectMilestone[]>([]);
  const [selectedTopic4MilestoneId, setSelectedTopic4MilestoneId] = useState("");
  const [topic4Status, setTopic4Status] = useState<ProjectStatus>("on_track");
  const [topic4TargetDate, setTopic4TargetDate] = useState("");
  const [topic4ForecastDate, setTopic4ForecastDate] = useState("");
  const [topic4ActualDate, setTopic4ActualDate] = useState("");
  const [topic4Note, setTopic4Note] = useState("");
  const [topic4DelayReason, setTopic4DelayReason] = useState("");
  const [topic4IsNotRelevant, setTopic4IsNotRelevant] = useState(false);
  const [topic4Message, setTopic4Message] = useState("");

  const [topic5Milestones, setTopic5Milestones] = useState<ProjectMilestone[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [milestoneStatus, setMilestoneStatus] = useState<ProjectStatus>("on_track");
  const [milestoneTargetDate, setMilestoneTargetDate] = useState("");
  const [milestoneForecastDate, setMilestoneForecastDate] = useState("");
  const [milestoneActualDate, setMilestoneActualDate] = useState("");
  const [milestoneNote, setMilestoneNote] = useState("");
  const [milestoneDelayReason, setMilestoneDelayReason] = useState("");
  const [milestoneIsNotRelevant, setMilestoneIsNotRelevant] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState("");

  const [topic6Milestones, setTopic6Milestones] = useState<ProjectMilestone[]>([]);
  const [selectedTopic6MilestoneId, setSelectedTopic6MilestoneId] = useState("");
  const [topic6Status, setTopic6Status] = useState<ProjectStatus>("on_track");
  const [topic6TargetDate, setTopic6TargetDate] = useState("");
  const [topic6ForecastDate, setTopic6ForecastDate] = useState("");
  const [topic6ActualDate, setTopic6ActualDate] = useState("");
  const [topic6Note, setTopic6Note] = useState("");
  const [topic6DelayReason, setTopic6DelayReason] = useState("");
  const [topic6IsNotRelevant, setTopic6IsNotRelevant] = useState(false);
  const [topic6Message, setTopic6Message] = useState("");

  const [topicSchedules, setTopicSchedules] = useState<Array<{
    topicIndex: number;
    topicName: string;
    targetDate: string | null;
    forecastDate: string | null;
    actualDate: string | null;
  }>>([]);
  const [scheduleTopicIndex, setScheduleTopicIndex] = useState("1");
  const [scheduleTargetDate, setScheduleTargetDate] = useState("");
  const [scheduleForecastDate, setScheduleForecastDate] = useState("");
  const [scheduleActualDate, setScheduleActualDate] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");

  const selectedTopic3Milestone = useMemo(() => topic3Milestones.find((m) => m.id === selectedTopic3MilestoneId) ?? null, [topic3Milestones, selectedTopic3MilestoneId]);
  const selectedTopic4Milestone = useMemo(() => topic4Milestones.find((m) => m.id === selectedTopic4MilestoneId) ?? null, [topic4Milestones, selectedTopic4MilestoneId]);
  const selectedMilestone = useMemo(() => topic5Milestones.find((m) => m.id === selectedMilestoneId) ?? null, [topic5Milestones, selectedMilestoneId]);
  const selectedTopic6Milestone = useMemo(() => topic6Milestones.find((m) => m.id === selectedTopic6MilestoneId) ?? null, [topic6Milestones, selectedTopic6MilestoneId]);

  const loadProjectTopics = async (targetProjectId: string) => {
    const response = await fetch(`/api/projects/${targetProjectId}`);
    const payload = await response.json();
    const project = payload.project;
    const t3: ProjectMilestone[] = project?.topics?.find((t: { topicIndex: number }) => t.topicIndex === 3)?.milestones ?? [];
    const t4: ProjectMilestone[] = project?.topics?.find((t: { topicIndex: number }) => t.topicIndex === 4)?.milestones ?? [];
    const t5: ProjectMilestone[] = project?.topics?.find((t: { topicIndex: number }) => t.topicIndex === 5)?.milestones ?? [];
    const t6: ProjectMilestone[] = project?.topics?.find((t: { topicIndex: number }) => t.topicIndex === 6)?.milestones ?? [];
    const scheduleRows = (project?.topics ?? []).map((t: {
      topicIndex: number;
      name: string;
      targetDate?: string | null;
      forecastDate?: string | null;
      actualDate?: string | null;
    }) => ({
      topicIndex: t.topicIndex,
      topicName: t.name,
      targetDate: t.targetDate ?? null,
      forecastDate: t.forecastDate ?? null,
      actualDate: t.actualDate ?? null
    }));
    setTopic3Milestones(t3);
    setTopic4Milestones(t4);
    setTopic5Milestones(t5);
    setTopic6Milestones(t6);
    setTopicSchedules(scheduleRows);
    setSelectedTopic3MilestoneId(t3[0]?.id ?? "");
    setSelectedTopic4MilestoneId(t4[0]?.id ?? "");
    setSelectedMilestoneId(t5[0]?.id ?? "");
    setSelectedTopic6MilestoneId(t6[0]?.id ?? "");
    setScheduleTopicIndex(String(scheduleRows[0]?.topicIndex ?? 1));
    setIsFrozen(Boolean(project?.isFrozen));
    setFreezeReason(project?.freezeReason ?? "");
    setFreezeNote(project?.freezeNote ?? "");
  };

  useEffect(() => {
    const load = async () => {
      const [projectsResponse, listsResponse] = await Promise.all([fetch("/api/projects"), fetch("/api/managed-lists")]);
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
        await loadProjectTopics(rows[0].id);
      }
    };
    load();
  }, []);

  // Load selected milestone data into form fields
  useEffect(() => {
    setTopic3Status(selectedTopic3Milestone?.status ?? "on_track");
    setTopic3TargetDate(selectedTopic3Milestone?.targetDate ?? "");
    setTopic3ForecastDate(selectedTopic3Milestone?.forecastDate ?? "");
    setTopic3ActualDate(selectedTopic3Milestone?.actualDate ?? "");
    setTopic3Note(selectedTopic3Milestone?.note ?? "");
    setTopic3DelayReason(selectedTopic3Milestone?.delayReason ?? "");
    setTopic3IsNotRelevant(Boolean(selectedTopic3Milestone?.isNotRelevant));
  }, [selectedTopic3MilestoneId, selectedTopic3Milestone]);

  useEffect(() => {
    setTopic4Status(selectedTopic4Milestone?.status ?? "on_track");
    setTopic4TargetDate(selectedTopic4Milestone?.targetDate ?? "");
    setTopic4ForecastDate(selectedTopic4Milestone?.forecastDate ?? "");
    setTopic4ActualDate(selectedTopic4Milestone?.actualDate ?? "");
    setTopic4Note(selectedTopic4Milestone?.note ?? "");
    setTopic4DelayReason(selectedTopic4Milestone?.delayReason ?? "");
    setTopic4IsNotRelevant(Boolean(selectedTopic4Milestone?.isNotRelevant));
  }, [selectedTopic4MilestoneId, selectedTopic4Milestone]);

  useEffect(() => {
    setMilestoneStatus(selectedMilestone?.status ?? "on_track");
    setMilestoneTargetDate(selectedMilestone?.targetDate ?? "");
    setMilestoneForecastDate(selectedMilestone?.forecastDate ?? "");
    setMilestoneActualDate(selectedMilestone?.actualDate ?? "");
    setMilestoneNote(selectedMilestone?.note ?? "");
    setMilestoneDelayReason(selectedMilestone?.delayReason ?? "");
    setMilestoneIsNotRelevant(Boolean(selectedMilestone?.isNotRelevant));
  }, [selectedMilestoneId, selectedMilestone]);

  useEffect(() => {
    setTopic6Status(selectedTopic6Milestone?.status ?? "on_track");
    setTopic6TargetDate(selectedTopic6Milestone?.targetDate ?? "");
    setTopic6ForecastDate(selectedTopic6Milestone?.forecastDate ?? "");
    setTopic6ActualDate(selectedTopic6Milestone?.actualDate ?? "");
    setTopic6Note(selectedTopic6Milestone?.note ?? "");
    setTopic6DelayReason(selectedTopic6Milestone?.delayReason ?? "");
    setTopic6IsNotRelevant(Boolean(selectedTopic6Milestone?.isNotRelevant));
  }, [selectedTopic6MilestoneId, selectedTopic6Milestone]);

  useEffect(() => {
    const selected = topicSchedules.find((t) => String(t.topicIndex) === scheduleTopicIndex);
    setScheduleTargetDate(selected?.targetDate ?? "");
    setScheduleForecastDate(selected?.forecastDate ?? "");
    setScheduleActualDate(selected?.actualDate ?? "");
  }, [scheduleTopicIndex, topicSchedules]);

  // Auto-clear target/forecast when status switches to completed
  useEffect(() => {
    if (topic3Status === "completed") { setTopic3TargetDate(""); setTopic3ForecastDate(""); }
  }, [topic3Status]);
  useEffect(() => {
    if (topic4Status === "completed") { setTopic4TargetDate(""); setTopic4ForecastDate(""); }
  }, [topic4Status]);
  useEffect(() => {
    if (milestoneStatus === "completed") { setMilestoneTargetDate(""); setMilestoneForecastDate(""); }
  }, [milestoneStatus]);
  useEffect(() => {
    if (topic6Status === "completed") { setTopic6TargetDate(""); setTopic6ForecastDate(""); }
  }, [topic6Status]);

  // Auto-set completed + clear target/forecast when actualDate is entered
  useEffect(() => {
    if (topic3ActualDate) { setTopic3Status("completed"); setTopic3TargetDate(""); setTopic3ForecastDate(""); }
  }, [topic3ActualDate]);
  useEffect(() => {
    if (topic4ActualDate) { setTopic4Status("completed"); setTopic4TargetDate(""); setTopic4ForecastDate(""); }
  }, [topic4ActualDate]);
  useEffect(() => {
    if (milestoneActualDate) { setMilestoneStatus("completed"); setMilestoneTargetDate(""); setMilestoneForecastDate(""); }
  }, [milestoneActualDate]);
  useEffect(() => {
    if (topic6ActualDate) { setTopic6Status("completed"); setTopic6TargetDate(""); setTopic6ForecastDate(""); }
  }, [topic6ActualDate]);

  const onProjectChange = async (id: string) => {
    setProjectId(id);
    const selected = projects.find((item) => item.id === id);
    if (!selected) return;
    setOccupancyForecast(selected.occupancyForecast === "--" ? "" : selected.occupancyForecast);
    setStatus(selected.status);
    setRequiresManagementAction(selected.requiresManagementAction);
    setTopic3Message("");
    setTopic4Message("");
    setMilestoneMessage("");
    setTopic6Message("");
    await loadProjectTopics(id);
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
        isFrozen,
        freezeReason: freezeReason || null,
        freezeNote: freezeNote || null,
        contractors: contractorDomains.map((domain) => ({ domain: domain.value, contractorId: selectedContractors[domain.value] || null }))
      })
    });
    const payload = await response.json();
    if (!response.ok) return setMessage(payload.error ?? "עדכון נכשל");
    const warningText = Array.isArray(payload.warnings) && payload.warnings.length ? ` | אזהרות: ${payload.warnings.map((w: { message: string }) => w.message).join("; ")}` : "";
    setMessage(`העדכון נשמר בהצלחה${warningText}`);
  };

  const submitTopic3MilestoneUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !selectedTopic3MilestoneId) return;
    const response = await fetch(`/api/projects/${projectId}/topic3/milestones/${selectedTopic3MilestoneId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: topic3Status, targetDate: topic3TargetDate || null, forecastDate: topic3ForecastDate || null, actualDate: topic3ActualDate || null, delayReason: topic3DelayReason || null, note: topic3Note || null, isNotRelevant: topic3IsNotRelevant })
    });
    const payload = await response.json();
    if (!response.ok) return setTopic3Message(payload.error ?? "עדכון פרק 3 נכשל");
    if (payload.milestone) setTopic3Milestones((prev) => prev.map((m) => (m.id === payload.milestone.id ? payload.milestone : m)));
    setTopic3Message("אבן הדרך נשמרה בהצלחה");
  };

  const submitTopic4MilestoneUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !selectedTopic4MilestoneId) return;
    const response = await fetch(`/api/projects/${projectId}/topic4/milestones/${selectedTopic4MilestoneId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: topic4Status, targetDate: topic4TargetDate || null, forecastDate: topic4ForecastDate || null, actualDate: topic4ActualDate || null, delayReason: topic4DelayReason || null, note: topic4Note || null, isNotRelevant: topic4IsNotRelevant })
    });
    const payload = await response.json();
    if (response.status === 409) return setTopic4Message(payload.error ?? "לא ניתן להשלים את פרק 4 ללא אבן דרך 18");
    if (!response.ok) return setTopic4Message(payload.error ?? "עדכון פרק 4 נכשל");
    if (payload.milestone) setTopic4Milestones((prev) => prev.map((m) => (m.id === payload.milestone.id ? payload.milestone : m)));
    const warnings = (payload.warnings ?? []) as ProjectWarning[];
    setTopic4Message(warnings.length ? `אבן הדרך נשמרה. ${warnings.map((w) => w.message).join(" | ")}` : "אבן הדרך נשמרה בהצלחה");
  };

  const submitMilestoneUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !selectedMilestoneId) return;
    const response = await fetch(`/api/projects/${projectId}/milestones/${selectedMilestoneId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: milestoneStatus, targetDate: milestoneTargetDate || null, forecastDate: milestoneForecastDate || null, actualDate: milestoneActualDate || null, delayReason: milestoneDelayReason || null, note: milestoneNote || null, isNotRelevant: milestoneIsNotRelevant })
    });
    const payload = await response.json();
    if (!response.ok) return setMilestoneMessage(payload.error ?? "עדכון אבן דרך נכשל");
    if (payload.milestone) setTopic5Milestones((prev) => prev.map((m) => (m.id === payload.milestone.id ? payload.milestone : m)));
    const warnings = (payload.warnings ?? []) as ProjectWarning[];
    setMilestoneMessage(warnings.length ? `אבן הדרך נשמרה. ${warnings.map((w) => w.message).join(" | ")}` : "אבן הדרך נשמרה בהצלחה");
  };

  const submitTopic6MilestoneUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !selectedTopic6MilestoneId) return;
    const response = await fetch(`/api/projects/${projectId}/topic6/milestones/${selectedTopic6MilestoneId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: topic6Status, targetDate: topic6TargetDate || null, forecastDate: topic6ForecastDate || null, actualDate: topic6ActualDate || null, delayReason: topic6DelayReason || null, note: topic6Note || null, isNotRelevant: topic6IsNotRelevant })
    });
    const payload = await response.json();
    if (!response.ok) return setTopic6Message(payload.error ?? "עדכון פרק 6 נכשל");
    if (payload.milestone) setTopic6Milestones((prev) => prev.map((m) => (m.id === payload.milestone.id ? payload.milestone : m)));
    setTopic6Message("אבן הדרך נשמרה בהצלחה");
  };

  const submitTopicScheduleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId) return;
    const response = await fetch(`/api/projects/${projectId}/topics/${scheduleTopicIndex}/schedule`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetDate: scheduleTargetDate || null,
        forecastDate: scheduleForecastDate || null,
        actualDate: scheduleActualDate || null
      })
    });
    const payload = await response.json();
    if (!response.ok) return setScheduleMessage(payload.error ?? "עדכון לו\"ז נושא נכשל");
    const warnings = (payload.warnings ?? []) as Array<{ message: string }>;
    if (payload.schedule?.topics) {
      setTopicSchedules(payload.schedule.topics);
    }
    setScheduleMessage(warnings.length ? `נשמר. ${warnings.map((w) => w.message).join(" | ")}` : "נשמר בהצלחה");
  };

  return (
    <main className="container">
      <h1>עדכון מהיר</h1>

      <form className="card grid topic-project" onSubmit={submitProjectUpdate}>
        <h2>עדכון פרויקט</h2>
        <label>
          <div className="field-label">פרויקט</div>
          <select value={projectId} onChange={(e) => onProjectChange(e.target.value)} required>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.code} - {project.name}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">תחזית אכלוס</div>
          <input type="date" value={occupancyForecast} onChange={(e) => setOccupancyForecast(e.target.value)} required />
        </label>
        <label>
          <div className="field-label">סטטוס</div>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {milestoneStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={requiresManagementAction} onChange={(e) => setRequiresManagementAction(e.target.checked)} />
          <span>נדרש טיפול הנהלה</span>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={isFrozen} onChange={(e) => setIsFrozen(e.target.checked)} />
          <span>פרויקט מוקפא</span>
        </label>
        <label>
          <div className="field-label">סיבת הקפאה</div>
          <select value={freezeReason} onChange={(e) => setFreezeReason(e.target.value)}>
            <option value="">ללא</option>
            {freezeReasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
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
              {contractors.map((contractor) => <option key={contractor.id} value={contractor.id}>{contractor.full_name}</option>)}
            </select>
          </label>
        ))}
        <button type="submit" className="btn-primary">שמירת עדכון</button>
        <MsgP msg={message} />
      </form>

      <form className="card grid topic-3" onSubmit={submitTopic3MilestoneUpdate} style={{ marginTop: 16 }}>
        <h2>עדכון אבן דרך – פרק 3</h2>
        <label>
          <div className="field-label">אבן דרך</div>
          <select value={selectedTopic3MilestoneId} onChange={(e) => setSelectedTopic3MilestoneId(e.target.value)} required>
            {topic3Milestones.map((m) => <option key={m.id} value={m.id}>{m.milestoneIndex ?? "--"} - {m.subtopicName ?? "--"} - {m.name}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">סטטוס</div>
          <select value={topic3Status} onChange={(e) => setTopic3Status(e.target.value as ProjectStatus)}>
            {milestoneStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">
            תאריך יעד
            {topic3Status === "completed" && <span className="not-relevant-tag">לא רלוונטי</span>}
          </div>
          <input type="date" value={topic3TargetDate} onChange={(e) => setTopic3TargetDate(e.target.value)} disabled={topic3Status === "completed"} />
        </label>
        <label>
          <div className="field-label">
            תאריך תחזית
            {topic3Status === "completed" && <span className="not-relevant-tag">לא רלוונטי</span>}
          </div>
          <input type="date" value={topic3ForecastDate} onChange={(e) => setTopic3ForecastDate(e.target.value)} disabled={topic3Status === "completed"} />
        </label>
        <label>
          <div className="field-label">תאריך בפועל</div>
          <input type="date" value={topic3ActualDate} onChange={(e) => setTopic3ActualDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">סיבת עיכוב</div>
          <select value={topic3DelayReason} onChange={(e) => setTopic3DelayReason(e.target.value)}>
            <option value="">ללא</option>
            {delayReasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">הערה</div>
          <input value={topic3Note} onChange={(e) => setTopic3Note(e.target.value)} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={topic3IsNotRelevant} onChange={(e) => setTopic3IsNotRelevant(e.target.checked)} />
          <span>לא רלוונטי</span>
        </label>
        <button type="submit" className="btn-primary">שמירת אבן דרך</button>
        <MsgP msg={topic3Message} />
      </form>

      <form className="card grid topic-4" onSubmit={submitTopic4MilestoneUpdate} style={{ marginTop: 16 }}>
        <h2>עדכון אבן דרך – פרק 4</h2>
        <label>
          <div className="field-label">אבן דרך</div>
          <select value={selectedTopic4MilestoneId} onChange={(e) => setSelectedTopic4MilestoneId(e.target.value)} required>
            {topic4Milestones.map((m) => <option key={m.id} value={m.id}>{m.milestoneIndex ?? "--"} - {m.name}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">סטטוס</div>
          <select value={topic4Status} onChange={(e) => setTopic4Status(e.target.value as ProjectStatus)}>
            {milestoneStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">
            תאריך יעד
            {topic4Status === "completed" && <span className="not-relevant-tag">לא רלוונטי</span>}
          </div>
          <input type="date" value={topic4TargetDate} onChange={(e) => setTopic4TargetDate(e.target.value)} disabled={topic4Status === "completed"} />
        </label>
        <label>
          <div className="field-label">
            תאריך תחזית
            {topic4Status === "completed" && <span className="not-relevant-tag">לא רלוונטי</span>}
          </div>
          <input type="date" value={topic4ForecastDate} onChange={(e) => setTopic4ForecastDate(e.target.value)} disabled={topic4Status === "completed"} />
        </label>
        <label>
          <div className="field-label">תאריך בפועל</div>
          <input type="date" value={topic4ActualDate} onChange={(e) => setTopic4ActualDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">סיבת עיכוב</div>
          <select value={topic4DelayReason} onChange={(e) => setTopic4DelayReason(e.target.value)}>
            <option value="">ללא</option>
            {delayReasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">הערה</div>
          <input value={topic4Note} onChange={(e) => setTopic4Note(e.target.value)} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={topic4IsNotRelevant} onChange={(e) => setTopic4IsNotRelevant(e.target.checked)} />
          <span>לא רלוונטי</span>
        </label>
        <button type="submit" className="btn-primary">שמירת אבן דרך</button>
        <MsgP msg={topic4Message} />
      </form>

      <form className="card grid topic-5" onSubmit={submitMilestoneUpdate} style={{ marginTop: 16 }}>
        <h2>עדכון אבן דרך – פרק 5</h2>
        <label>
          <div className="field-label">אבן דרך</div>
          <select value={selectedMilestoneId} onChange={(e) => setSelectedMilestoneId(e.target.value)} required>
            {topic5Milestones.map((m) => <option key={m.id} value={m.id}>{m.milestoneIndex ?? "--"} - {m.name}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">סטטוס</div>
          <select value={milestoneStatus} onChange={(e) => setMilestoneStatus(e.target.value as ProjectStatus)}>
            {milestoneStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">
            תאריך יעד
            {milestoneStatus === "completed" && <span className="not-relevant-tag">לא רלוונטי</span>}
          </div>
          <input type="date" value={milestoneTargetDate} onChange={(e) => setMilestoneTargetDate(e.target.value)} disabled={milestoneStatus === "completed"} />
        </label>
        <label>
          <div className="field-label">
            תאריך תחזית
            {milestoneStatus === "completed" && <span className="not-relevant-tag">לא רלוונטי</span>}
          </div>
          <input type="date" value={milestoneForecastDate} onChange={(e) => setMilestoneForecastDate(e.target.value)} disabled={milestoneStatus === "completed"} />
        </label>
        <label>
          <div className="field-label">תאריך בפועל</div>
          <input type="date" value={milestoneActualDate} onChange={(e) => setMilestoneActualDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">סיבת עיכוב</div>
          <select value={milestoneDelayReason} onChange={(e) => setMilestoneDelayReason(e.target.value)}>
            <option value="">ללא</option>
            {delayReasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">הערה</div>
          <input value={milestoneNote} onChange={(e) => setMilestoneNote(e.target.value)} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={milestoneIsNotRelevant} onChange={(e) => setMilestoneIsNotRelevant(e.target.checked)} />
          <span>לא רלוונטי</span>
        </label>
        <button type="submit" className="btn-primary">שמירת אבן דרך</button>
        <MsgP msg={milestoneMessage} />
      </form>

      <form className="card grid topic-6" onSubmit={submitTopic6MilestoneUpdate} style={{ marginTop: 16 }}>
        <h2>עדכון אבן דרך – פרק 6</h2>
        <label>
          <div className="field-label">אבן דרך</div>
          <select value={selectedTopic6MilestoneId} onChange={(e) => setSelectedTopic6MilestoneId(e.target.value)} required>
            {topic6Milestones.map((m) => <option key={m.id} value={m.id}>{m.milestoneIndex ?? "--"} - {m.subtopicName ?? "--"} - {m.name}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">סטטוס</div>
          <select value={topic6Status} onChange={(e) => setTopic6Status(e.target.value as ProjectStatus)}>
            {milestoneStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">
            תאריך יעד
            {topic6Status === "completed" && <span className="not-relevant-tag">לא רלוונטי</span>}
          </div>
          <input type="date" value={topic6TargetDate} onChange={(e) => setTopic6TargetDate(e.target.value)} disabled={topic6Status === "completed"} />
        </label>
        <label>
          <div className="field-label">
            תאריך תחזית
            {topic6Status === "completed" && <span className="not-relevant-tag">לא רלוונטי</span>}
          </div>
          <input type="date" value={topic6ForecastDate} onChange={(e) => setTopic6ForecastDate(e.target.value)} disabled={topic6Status === "completed"} />
        </label>
        <label>
          <div className="field-label">תאריך בפועל</div>
          <input type="date" value={topic6ActualDate} onChange={(e) => setTopic6ActualDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">סיבת עיכוב</div>
          <select value={topic6DelayReason} onChange={(e) => setTopic6DelayReason(e.target.value)}>
            <option value="">ללא</option>
            {delayReasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">הערה</div>
          <input value={topic6Note} onChange={(e) => setTopic6Note(e.target.value)} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={topic6IsNotRelevant} onChange={(e) => setTopic6IsNotRelevant(e.target.checked)} />
          <span>לא רלוונטי</span>
        </label>
        <button type="submit" className="btn-primary">שמירת אבן דרך</button>
        <MsgP msg={topic6Message} />
      </form>

      <form className="card grid topic-schedule" onSubmit={submitTopicScheduleUpdate} style={{ marginTop: 16 }}>
        <h2>עדכון לו"ז נושא</h2>
        <label>
          <div className="field-label">נושא</div>
          <select value={scheduleTopicIndex} onChange={(e) => setScheduleTopicIndex(e.target.value)}>
            {topicSchedules.map((t) => <option key={t.topicIndex} value={t.topicIndex}>{t.topicName}</option>)}
          </select>
        </label>
        <label>
          <div className="field-label">תאריך יעד</div>
          <input type="date" value={scheduleTargetDate} onChange={(e) => setScheduleTargetDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">תאריך תחזית</div>
          <input type="date" value={scheduleForecastDate} onChange={(e) => setScheduleForecastDate(e.target.value)} />
        </label>
        <label>
          <div className="field-label">תאריך בפועל</div>
          <input type="date" value={scheduleActualDate} onChange={(e) => setScheduleActualDate(e.target.value)} />
        </label>
        <button type="submit" className="btn-primary">שמירת לו"ז נושא</button>
        <MsgP msg={scheduleMessage} />
      </form>
    </main>
  );
}
