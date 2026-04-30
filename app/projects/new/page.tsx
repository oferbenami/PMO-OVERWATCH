"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; full_name: string };

type ManagedLists = {
  architects: Option[];
  externalSupervisors: Option[];
  contractors: Option[];
  projectManagers: Option[];
};

const EMPTY_LISTS: ManagedLists = {
  architects: [],
  externalSupervisors: [],
  contractors: [],
  projectManagers: []
};

export default function NewProjectPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ManagedLists>(EMPTY_LISTS);
  const [projectName, setProjectName] = useState("");
  const [internalPmId, setInternalPmId] = useState("");
  const [additionalOwnerId, setAdditionalOwnerId] = useState("");
  const [expectedAssetReceiptDate, setExpectedAssetReceiptDate] = useState("");
  const [occupancyTarget, setOccupancyTarget] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [architectId, setArchitectId] = useState("");
  const [externalPmSupervisorId, setExternalPmSupervisorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/managed-lists");
      if (!response.ok) return;
      const payload = (await response.json()) as ManagedLists;
      setLists(payload);
      if (payload.projectManagers[0]) {
        setInternalPmId(payload.projectManagers[0].id);
      }
    };
    load();
  }, []);

  const hasOptions = useMemo(() => lists.projectManagers.length > 0, [lists.projectManagers]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName,
        internalPmId,
        additionalOwnerId: additionalOwnerId || undefined,
        expectedAssetReceiptDate,
        occupancyTarget,
        priority,
        architectId: architectId || undefined,
        externalPmSupervisorId: externalPmSupervisorId || undefined
      })
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error ?? "שמירה נכשלה");
      return;
    }

    const warningText = Array.isArray(payload.warnings) && payload.warnings.length
      ? ` | אזהרות: ${payload.warnings.map((w: { message: string }) => w.message).join("; ")}`
      : "";
    setMessage(`הפרויקט נשמר בהצלחה${warningText}`);
    router.push(`/project/${payload.projectId}`);
  };

  return (
    <main className="container">
      <h1>פתיחת פרויקט חדש</h1>
      <form className="card grid" onSubmit={submit}>
        <label>
          <div className="field-label">שם פרויקט *</div>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
        </label>

        <label>
          <div className="field-label">מנהל פרויקט פנימי *</div>
          <select value={internalPmId} onChange={(e) => setInternalPmId(e.target.value)} required disabled={!hasOptions}>
            {lists.projectManagers.map((item) => (
              <option key={item.id} value={item.id}>{item.full_name}</option>
            ))}
          </select>
        </label>

        <label>
          <div className="field-label">אחראי פנימי נוסף</div>
          <select value={additionalOwnerId} onChange={(e) => setAdditionalOwnerId(e.target.value)}>
            <option value="">ללא</option>
            {lists.projectManagers.map((item) => (
              <option key={item.id} value={item.id}>{item.full_name}</option>
            ))}
          </select>
        </label>

        <label>
          <div className="field-label">צפי קבלת נכס *</div>
          <input type="date" value={expectedAssetReceiptDate} onChange={(e) => setExpectedAssetReceiptDate(e.target.value)} required />
        </label>

        <label>
          <div className="field-label">יעד אכלוס *</div>
          <input type="date" value={occupancyTarget} onChange={(e) => setOccupancyTarget(e.target.value)} required />
        </label>

        <label>
          <div className="field-label">רמת עדיפות *</div>
          <select value={priority} onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low") }>
            <option value="high">גבוהה</option>
            <option value="medium">בינונית</option>
            <option value="low">נמוכה</option>
          </select>
        </label>

        <label>
          <div className="field-label">אדריכל</div>
          <select value={architectId} onChange={(e) => setArchitectId(e.target.value)}>
            <option value="">טרם שויך</option>
            {lists.architects.map((item) => (
              <option key={item.id} value={item.id}>{item.full_name}</option>
            ))}
          </select>
        </label>

        <label>
          <div className="field-label">מפקח / PM חיצוני</div>
          <select value={externalPmSupervisorId} onChange={(e) => setExternalPmSupervisorId(e.target.value)}>
            <option value="">טרם שויך</option>
            {lists.externalSupervisors.map((item) => (
              <option key={item.id} value={item.id}>{item.full_name}</option>
            ))}
          </select>
        </label>

        <button type="submit" className="menu-toggle" style={{ display: "inline-flex" }} disabled={loading}>
          {loading ? "שומר..." : "שמירה"}
        </button>

        {message ? <p>{message}</p> : null}
      </form>
    </main>
  );
}
