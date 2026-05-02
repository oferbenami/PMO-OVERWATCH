"use client";

import { ProjectScheduleState } from "@/types/domain";
import { useMemo, useState } from "react";

type Props = {
  projectId: string;
  initialSchedule: ProjectScheduleState;
};

export function SchedulePanel({ projectId, initialSchedule }: Props) {
  const [schedule, setSchedule] = useState<ProjectScheduleState>(initialSchedule);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(initialSchedule.topics[0]?.topicIndex ?? 1);
  const [message, setMessage] = useState("");

  const selectedTopic = useMemo(
    () => schedule.topics.find((t) => t.topicIndex === selectedTopicIndex) ?? schedule.topics[0],
    [schedule.topics, selectedTopicIndex]
  );

  const updateProjectSchedule = async (formData: FormData) => {
    const response = await fetch(`/api/projects/${projectId}/schedule`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expectedAssetReceiptDate: String(formData.get("expectedAssetReceiptDate") ?? ""),
        occupancyTarget: String(formData.get("occupancyTarget") ?? ""),
        occupancyForecast: String(formData.get("occupancyForecast") ?? "") || null
      })
    });
    const payload = await response.json();
    if (!response.ok) return setMessage(payload.error ?? "Schedule update failed");
    if (payload.schedule) setSchedule(payload.schedule);
    setMessage("Project schedule saved");
  };

  const updateTopicSchedule = async (formData: FormData) => {
    const topicIndex = Number.parseInt(String(formData.get("topicIndex") ?? "0"), 10);
    const response = await fetch(`/api/projects/${projectId}/topics/${topicIndex}/schedule`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetDate: String(formData.get("targetDate") ?? "") || null,
        forecastDate: String(formData.get("forecastDate") ?? "") || null,
        actualDate: String(formData.get("actualDate") ?? "") || null
      })
    });
    const payload = await response.json();
    if (!response.ok) return setMessage(payload.error ?? "Topic update failed");
    if (payload.schedule) setSchedule(payload.schedule);
    const warnings = (payload.warnings ?? []) as Array<{ message: string }>;
    setMessage(warnings.length ? `Saved. ${warnings.map((w) => w.message).join(" | ")}` : "Saved");
  };

  return (
    <section className="card grid">
      <h2>??"? ????????</h2>
      <form
        className="grid"
        onSubmit={(e) => {
          e.preventDefault();
          updateProjectSchedule(new FormData(e.currentTarget));
        }}
      >
        <label><div className="field-label">Expected Asset Receipt</div><input name="expectedAssetReceiptDate" type="date" defaultValue={schedule.expectedAssetReceiptDate} /></label>
        <label><div className="field-label">Occupancy Target</div><input name="occupancyTarget" type="date" defaultValue={schedule.occupancyTarget} /></label>
        <label><div className="field-label">Occupancy Forecast</div><input name="occupancyForecast" type="date" defaultValue={schedule.occupancyForecast ?? ""} /></label>
        <button type="submit" className="menu-toggle" style={{ display: "inline-flex" }}>????? ??"? ??????</button>
      </form>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>????</th><th>??? ????</th><th>???</th><th>?????</th><th>?????</th><th>Override</th>
            </tr>
          </thead>
          <tbody>
            {schedule.topics.map((t) => (
              <tr key={t.topicIndex}>
                <td>{t.topicName}</td>
                <td>{t.originalTargetDate ?? "--"}</td>
                <td>{t.targetDate ?? "--"}</td>
                <td>{t.forecastDate ?? "--"}</td>
                <td>{t.actualDate ?? "--"}</td>
                <td>{t.isManualTargetOverride ? "??" : "??"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        className="grid"
        onSubmit={(e) => {
          e.preventDefault();
          updateTopicSchedule(new FormData(e.currentTarget));
        }}
      >
        <label>
          <div className="field-label">????</div>
          <select
            name="topicIndex"
            value={String(selectedTopicIndex)}
            onChange={(e) => setSelectedTopicIndex(Number.parseInt(e.target.value, 10))}
          >
            {schedule.topics.map((t) => <option key={t.topicIndex} value={t.topicIndex}>{t.topicName}</option>)}
          </select>
        </label>
        <label><div className="field-label">Target</div><input name="targetDate" type="date" key={`${selectedTopic?.topicIndex ?? 0}-target`} defaultValue={selectedTopic?.targetDate ?? ""} /></label>
        <label><div className="field-label">Forecast</div><input name="forecastDate" type="date" key={`${selectedTopic?.topicIndex ?? 0}-forecast`} defaultValue={selectedTopic?.forecastDate ?? ""} /></label>
        <label><div className="field-label">Actual</div><input name="actualDate" type="date" key={`${selectedTopic?.topicIndex ?? 0}-actual`} defaultValue={selectedTopic?.actualDate ?? ""} /></label>
        <button type="submit" className="menu-toggle" style={{ display: "inline-flex" }}>????? ????</button>
        {message ? <p>{message}</p> : null}
      </form>
    </section>
  );
}
