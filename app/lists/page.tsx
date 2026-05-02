"use client";

import { createSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";

type ListKey =
  | "architects"
  | "externalSupervisors"
  | "contractors"
  | "planners"
  | "delayReasons"
  | "freezeReasons"
  | "planningDomains"
  | "tenderDomains";

type ListItem = {
  id: string;
  code: string;
  label_he: string;
  label_en: string | null;
  sort_order: number;
  is_active: boolean;
};

const SECTIONS: Array<{ key: ListKey; title: string }> = [
  { key: "architects", title: "אדריכלים" },
  { key: "externalSupervisors", title: "מפקחים חיצוניים" },
  { key: "contractors", title: "קבלנים" },
  { key: "planners", title: "מתכננים" },
  { key: "delayReasons", title: "סיבות איחור" },
  { key: "freezeReasons", title: "סיבות הקפאה" },
  { key: "planningDomains", title: "תחומי תכנון" },
  { key: "tenderDomains", title: "תחומי מכרז" }
];

const EMPTY_FORM = { code: "", label_he: "", sort_order: 1000 };

export default function ListsPage() {
  const [data, setData] = useState<Record<ListKey, ListItem[]>>({
    architects: [],
    externalSupervisors: [],
    contractors: [],
    planners: [],
    delayReasons: [],
    freezeReasons: [],
    planningDomains: [],
    tenderDomains: []
  });
  const [forms, setForms] = useState<Record<ListKey, typeof EMPTY_FORM>>({
    architects: { ...EMPTY_FORM },
    externalSupervisors: { ...EMPTY_FORM },
    contractors: { ...EMPTY_FORM },
    planners: { ...EMPTY_FORM },
    delayReasons: { ...EMPTY_FORM },
    freezeReasons: { ...EMPTY_FORM },
    planningDomains: { ...EMPTY_FORM },
    tenderDomains: { ...EMPTY_FORM }
  });
  const [token, setToken] = useState<string>("");
  const [canEdit, setCanEdit] = useState(false);
  const [message, setMessage] = useState("");

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  const load = async () => {
    const rootRes = await fetch("/api/managed-lists", { headers: authHeaders });
    const rootPayload = await rootRes.json();
    if (rootPayload?.canEdit) setCanEdit(true);

    await Promise.all(
      SECTIONS.map(async (section) => {
        const response = await fetch(`/api/managed-lists/${section.key}`, { headers: authHeaders });
        const payload = await response.json();
        setData((prev) => ({ ...prev, [section.key]: payload.items ?? [] }));
      })
    );
  };

  useEffect(() => {
    const boot = async () => {
      if (hasSupabaseEnv()) {
        const supabase = createSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        setToken(sessionData.session?.access_token ?? "");
      }
    };
    boot();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateForm = (key: ListKey, patch: Partial<typeof EMPTY_FORM>) => {
    setForms((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const createItem = async (key: ListKey) => {
    if (!canEdit) return;
    const body = forms[key];
    const response = await fetch(`/api/managed-lists/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (!response.ok) return setMessage(payload.error ?? "שמירה נכשלה");
    setForms((prev) => ({ ...prev, [key]: { ...EMPTY_FORM } }));
    setMessage("נשמר בהצלחה");
    await load();
  };

  const toggleActive = async (key: ListKey, item: ListItem) => {
    if (!canEdit) return;
    const response = await fetch(`/api/managed-lists/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active })
    });
    const payload = await response.json();
    if (!response.ok) return setMessage(payload.error ?? "עדכון נכשל");
    setMessage("עודכן בהצלחה");
    await load();
  };

  return (
    <main className="container">
      <h1>ניהול רשימות ברירת מחדל (PMO)</h1>
      <div className="card">
        <p>ניהול מלא של קבלנים, מתכננים, סיבות ותחומים.</p>
        {!canEdit ? <p className="status-chip">תצוגה בלבד: עריכה מותרת למנהל או PMO.</p> : null}
        {message ? <p>{message}</p> : null}
      </div>

      {SECTIONS.map((section) => (
        <section key={section.key} className="card" style={{ marginTop: 14 }}>
          <h2>{section.title}</h2>

          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "right" }}>קוד</th>
                <th style={{ textAlign: "right" }}>תווית</th>
                <th style={{ textAlign: "right" }}>סדר</th>
                <th style={{ textAlign: "right" }}>סטטוס</th>
                <th style={{ textAlign: "right" }}>פעולה</th>
              </tr>
            </thead>
            <tbody>
              {data[section.key].map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.label_he}</td>
                  <td>{item.sort_order}</td>
                  <td>{item.is_active ? "פעיל" : "לא פעיל"}</td>
                  <td>
                    <button type="button" className="btn-secondary" onClick={() => toggleActive(section.key, item)} disabled={!canEdit}>
                      {item.is_active ? "השבת" : "הפעל"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid" style={{ marginTop: 12 }}>
            <label>
              <div className="field-label">קוד</div>
              <input value={forms[section.key].code} onChange={(e) => updateForm(section.key, { code: e.target.value })} disabled={!canEdit} />
            </label>
            <label>
              <div className="field-label">תווית בעברית</div>
              <input value={forms[section.key].label_he} onChange={(e) => updateForm(section.key, { label_he: e.target.value })} disabled={!canEdit} />
            </label>
            <label>
              <div className="field-label">סדר תצוגה</div>
              <input
                type="number"
                value={forms[section.key].sort_order}
                onChange={(e) => updateForm(section.key, { sort_order: Number(e.target.value || 0) })}
                disabled={!canEdit}
              />
            </label>
          </div>

          <button type="button" className="btn-primary" onClick={() => createItem(section.key)} disabled={!canEdit}>
            הוספת פריט
          </button>
        </section>
      ))}
    </main>
  );
}
