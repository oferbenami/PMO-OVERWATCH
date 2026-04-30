"use client";

import { ProjectMilestone, ProjectStatus, Topic5Readiness, ProjectWarning } from "@/types/domain";
import { useMemo, useState } from "react";

type Props = {
  projectId: string;
  initialMilestones: ProjectMilestone[];
  initialReadiness: Topic5Readiness;
};

const statuses: Array<{ value: ProjectStatus; label: string }> = [
  { value: "on_track", label: "תקין" },
  { value: "at_risk", label: "בסיכון" },
  { value: "delayed", label: "באיחור" },
  { value: "completed", label: "הושלם" },
  { value: "frozen", label: "מוקפא" },
  { value: "not_relevant", label: "לא רלוונטי" }
];

export function Topic5Panel({ projectId, initialMilestones, initialReadiness }: Props) {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(initialMilestones);
  const [readiness, setReadiness] = useState<Topic5Readiness>(initialReadiness);
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

    const response = await fetch(`/api/projects/${projectId}/milestones/${selectedMilestone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error ?? "עדכון אבן דרך נכשל");
      return;
    }

    if (body.milestone) {
      setMilestones((prev) => prev.map((m) => (m.id === body.milestone.id ? body.milestone : m)));
    }
    if (body.topic5Readiness) setReadiness(body.topic5Readiness);

    const warnings = (body.warnings ?? []) as ProjectWarning[];
    if (warnings.length) {
      const warningText = warnings
        .map((w) =>
          w.missingPrerequisites?.length
            ? `${w.message}: ${w.missingPrerequisites.map((x) => `${x.milestoneIndex} ${x.name}`).join(", ")}`
            : w.message
        )
        .join(" | ");
      setMessage(`נשמר בהצלחה. ${warningText}`);
    } else {
      setMessage("נשמר בהצלחה");
    }
  };

  return (
    <section className="card grid">
      <h2>פרק 5 - אישורים ואכלוס</h2>
      <p>
        מוכנות לכניסה בפועל:{" "}
        <strong>{readiness.canCompleteMilestone11 ? "מוכן" : "לא מוכן"}</strong>
      </p>
      {!readiness.canCompleteMilestone11 && readiness.missingPrerequisites.length > 0 ? (
        <ul>
          {readiness.missingPrerequisites.map((m) => (
            <li key={m.milestoneIndex}>חסר תנאי סף {m.milestoneIndex}: {m.name}</li>
          ))}
        </ul>
      ) : null}

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
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>

          <label>
            <div className="field-label">תאריך יעד</div>
            <input name="targetDate" type="date" defaultValue={selectedMilestone.targetDate ?? ""} key={`${selectedMilestone.id}-target`} />
          </label>
          <label>
            <div className="field-label">תאריך תחזית</div>
            <input name="forecastDate" type="date" defaultValue={selectedMilestone.forecastDate ?? ""} key={`${selectedMilestone.id}-forecast`} />
          </label>
          <label>
            <div className="field-label">תאריך בפועל</div>
            <input name="actualDate" type="date" defaultValue={selectedMilestone.actualDate ?? ""} key={`${selectedMilestone.id}-actual`} />
          </label>
          <label>
            <div className="field-label">הערה</div>
            <input name="note" defaultValue={selectedMilestone.note ?? ""} key={`${selectedMilestone.id}-note`} />
          </label>
          <label>
            <input name="isNotRelevant" type="checkbox" defaultChecked={selectedMilestone.isNotRelevant} key={`${selectedMilestone.id}-nr`} />
            <span style={{ marginInlineStart: 8 }}>לא רלוונטי</span>
          </label>

          <button type="submit" className="menu-toggle" style={{ display: "inline-flex" }}>שמירת אבן דרך</button>
          {message ? <p>{message}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
