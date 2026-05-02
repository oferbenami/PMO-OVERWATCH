"use client";

import { ProjectMilestone, ProjectStatus, ProjectWarning, Topic4Progress } from "@/types/domain";
import { useMemo, useState } from "react";

type Props = {
  projectId: string;
  initialMilestones: ProjectMilestone[];
  initialProgress: Topic4Progress;
};

const statuses: Array<{ value: ProjectStatus; label: string }> = [
  { value: "on_track", label: "תקין" },
  { value: "at_risk", label: "בסיכון" },
  { value: "delayed", label: "באיחור" },
  { value: "completed", label: "הושלם" },
  { value: "frozen", label: "מוקפא" },
  { value: "not_relevant", label: "לא רלוונטי" }
];

export function Topic4Panel({ projectId, initialMilestones, initialProgress }: Props) {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(initialMilestones);
  const [progress, setProgress] = useState<Topic4Progress>(initialProgress);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(initialMilestones[0]?.id ?? "");
  const [message, setMessage] = useState("");

  const selectedMilestone = useMemo(
    () => milestones.find((m) => m.id === selectedMilestoneId) ?? milestones[0] ?? null,
    [milestones, selectedMilestoneId]
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMilestone) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      status: String(form.get("status") ?? "on_track"),
      targetDate: String(form.get("targetDate") ?? "") || null,
      forecastDate: String(form.get("forecastDate") ?? "") || null,
      actualDate: String(form.get("actualDate") ?? "") || null,
      note: String(form.get("note") ?? "") || null,
      isNotRelevant: form.get("isNotRelevant") === "on"
    };

    const response = await fetch(`/api/projects/${projectId}/topic4/milestones/${selectedMilestone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await response.json();

    if (response.status === 409) {
      setMessage(body.error ?? "לא ניתן להשלים את פרק 4 לפני השלמת אבן דרך 18");
      return;
    }
    if (!response.ok) {
      setMessage(body.error ?? "עדכון אבן דרך נכשל");
      return;
    }

    if (body.milestone) {
      setMilestones((prev) => prev.map((m) => (m.id === body.milestone.id ? body.milestone : m)));
    }
    if (body.topic4Progress) setProgress(body.topic4Progress);

    const warnings = (body.warnings ?? []) as ProjectWarning[];
    if (warnings.length) {
      setMessage(`נשמר בהצלחה. ${warnings.map((w) => w.message).join(" | ")}`);
    } else {
      setMessage("נשמר בהצלחה");
    }
  };

  return (
    <section className="card grid">
      <h2>פרק 4 - ביצוע עד אכלוס</h2>
      <p>מצב פרק 4: <strong>{progress.isComplete ? "הושלם" : "בתהליך"}</strong></p>
      <p>אבן דרך 18: <strong>{progress.hasMilestone18Completed ? "הושלמה" : "טרם הושלמה"}</strong></p>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>אבן דרך</th>
              <th>סטטוס</th>
              <th>יעד</th>
              <th>תחזית</th>
              <th>בפועל</th>
              <th>הערה</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m) => (
              <tr key={m.id}>
                <td>{m.milestoneIndex ?? "--"}</td>
                <td>{m.name}</td>
                <td>{statuses.find((s) => s.value === m.status)?.label ?? m.status}</td>
                <td>{m.targetDate ?? "--"}</td>
                <td>{m.forecastDate ?? "--"}</td>
                <td>{m.actualDate ?? "--"}</td>
                <td>{m.note ?? "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMilestone ? (
        <form className="grid" onSubmit={onSubmit}>
          <label>
            <div className="field-label">אבן דרך לעדכון</div>
            <select value={selectedMilestoneId} onChange={(e) => setSelectedMilestoneId(e.target.value)}>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.milestoneIndex ?? "--"} - {m.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div className="field-label">סטטוס</div>
            <select name="status" defaultValue={selectedMilestone.status} key={`${selectedMilestone.id}-status`}>
              {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label><div className="field-label">תאריך יעד</div><input name="targetDate" type="date" defaultValue={selectedMilestone.targetDate ?? ""} key={`${selectedMilestone.id}-target`} /></label>
          <label><div className="field-label">תאריך תחזית</div><input name="forecastDate" type="date" defaultValue={selectedMilestone.forecastDate ?? ""} key={`${selectedMilestone.id}-forecast`} /></label>
          <label><div className="field-label">תאריך בפועל</div><input name="actualDate" type="date" defaultValue={selectedMilestone.actualDate ?? ""} key={`${selectedMilestone.id}-actual`} /></label>
          <label><div className="field-label">הערה</div><input name="note" defaultValue={selectedMilestone.note ?? ""} key={`${selectedMilestone.id}-note`} /></label>
          <label><input name="isNotRelevant" type="checkbox" defaultChecked={selectedMilestone.isNotRelevant} key={`${selectedMilestone.id}-nr`} /><span style={{ marginInlineStart: 8 }}>לא רלוונטי</span></label>
          <button type="submit" className="menu-toggle" style={{ display: "inline-flex" }}>שמירת אבן דרך</button>
          {message ? <p>{message}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
