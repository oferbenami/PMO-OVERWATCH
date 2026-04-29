"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProjectPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [expectedAssetReceiptDate, setExpectedAssetReceiptDate] = useState("");
  const [occupancyTarget, setOccupancyTarget] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName,
        expectedAssetReceiptDate,
        occupancyTarget,
        priority
      })
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error ?? "שמירה נכשלה");
      return;
    }

    setMessage("הפרויקט נשמר בהצלחה");
    router.push("/dashboard");
  };

  return (
    <main className="container">
      <h1>פרויקט חדש</h1>
      <form className="card grid" onSubmit={submit}>
        <label>
          <div className="field-label">שם פרויקט</div>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
        </label>
        <label>
          <div className="field-label">צפי קבלת נכס</div>
          <input type="date" value={expectedAssetReceiptDate} onChange={(e) => setExpectedAssetReceiptDate(e.target.value)} required />
        </label>
        <label>
          <div className="field-label">יעד אכלוס</div>
          <input type="date" value={occupancyTarget} onChange={(e) => setOccupancyTarget(e.target.value)} required />
        </label>
        <label>
          <div className="field-label">עדיפות</div>
          <select value={priority} onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low") }>
            <option value="high">גבוהה</option>
            <option value="medium">בינונית</option>
            <option value="low">נמוכה</option>
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
