import Link from "next/link";
import { getDashboardProjects } from "@/lib/domain/projects";

export default async function DashboardPage() {
  const projects = await getDashboardProjects();

  return (
    <main className="container">
      <h1>דשבורד פרויקטים</h1>

      <section className="mobile-only mobile-list" aria-label="דשבורד מובייל">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/project/${p.id}`}
            className="dashboard-mobile-link"
            aria-label={`פתיחת פרויקט ${p.name} לעדכון מהיר`}
          >
            <article className="card mobile-project-card">
              <div>
                <div className="field-label">{p.code}</div>
                <strong>{p.name}</strong>
              </div>
              <div>
                <span className="badge" style={{ background: p.statusColor }}>
                  {p.statusHe}
                </span>
                {p.requiresManagementAction && p.requiresManagementActionManual ? (
                  <div className="field-label">ניהול: ידני</div>
                ) : null}
              </div>
              <div className="mobile-meta">
                <div>
                  <div className="field-label">מנהל פרויקט</div>
                  <div>{p.pmName}</div>
                </div>
                <div>
                  <div className="field-label">יעד אכלוס</div>
                  <div>{p.occupancyTarget}</div>
                </div>
                <div>
                  <div className="field-label">תחזית אכלוס</div>
                  <div>{p.occupancyForecast}</div>
                </div>
              </div>
              <div className="field-label dashboard-open-hint">פתח לעדכון</div>
            </article>
          </Link>
        ))}
      </section>

      <section className="desktop-only card" aria-label="דשבורד דסקטופ">
        <table className="table">
          <thead>
            <tr>
              <th>קוד</th>
              <th>שם</th>
              <th>מנהל פרויקט</th>
              <th>סטטוס</th>
              <th>יעד אכלוס</th>
              <th>תחזית אכלוס</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>
                  <Link
                    href={`/project/${p.id}`}
                    className="dashboard-project-link"
                    aria-label={`פתיחת פרויקט ${p.name} לעדכון מהיר`}
                  >
                    {p.name}
                  </Link>
                </td>
                <td>{p.pmName}</td>
                <td>
                  <span className="badge" style={{ background: p.statusColor }}>
                    {p.statusHe}
                  </span>
                  {p.requiresManagementAction && p.requiresManagementActionManual ? (
                    <div className="field-label">ניהול: ידני</div>
                  ) : null}
                </td>
                <td>{p.occupancyTarget}</td>
                <td>{p.occupancyForecast}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
