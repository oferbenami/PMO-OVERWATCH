import Link from "next/link";
import { getDashboardProjects } from "@/lib/domain/projects";

export default async function DashboardPage() {
  const projects = await getDashboardProjects();

  return (
    <main className="container">
      <h1>{"\u05d3\u05e9\u05d1\u05d5\u05e8\u05d3 \u05e4\u05e8\u05d5\u05d9\u05e7\u05d8\u05d9\u05dd"}</h1>

      <section
        className="mobile-only mobile-list"
        aria-label={"\u05d3\u05e9\u05d1\u05d5\u05e8\u05d3 \u05de\u05d5\u05d1\u05d9\u05d9\u05dc"}
      >
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/project/${p.id}`}
            className="dashboard-mobile-link"
            aria-label={`${"\u05e4\u05ea\u05d9\u05d7\u05ea \u05e4\u05e8\u05d5\u05d9\u05e7\u05d8"} ${p.name} ${"\u05dc\u05e2\u05d3\u05db\u05d5\u05df \u05de\u05d4\u05d9\u05e8"}`}
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
                  <div className="field-label">{"\u05e0\u05d9\u05d4\u05d5\u05dc: \u05d9\u05d3\u05e0\u05d9"}</div>
                ) : null}
              </div>
              <div className="mobile-meta">
                <div>
                  <div className="field-label">{"\u05de\u05e0\u05d4\u05dc \u05e4\u05e8\u05d5\u05d9\u05e7\u05d8"}</div>
                  <div>{p.pmName}</div>
                </div>
                <div>
                  <div className="field-label">{"\u05d9\u05e2\u05d3 \u05d0\u05db\u05dc\u05d5\u05e1"}</div>
                  <div>{p.occupancyTarget}</div>
                </div>
                <div>
                  <div className="field-label">{"\u05ea\u05d7\u05d6\u05d9\u05ea \u05d0\u05db\u05dc\u05d5\u05e1"}</div>
                  <div>{p.occupancyForecast}</div>
                </div>
              </div>
              <div className="field-label dashboard-open-hint">{"\u05e4\u05ea\u05d7 \u05dc\u05e2\u05d3\u05db\u05d5\u05df"}</div>
            </article>
          </Link>
        ))}
      </section>

      <section
        className="desktop-only card"
        aria-label={"\u05d3\u05e9\u05d1\u05d5\u05e8\u05d3 \u05d3\u05e1\u05e7\u05d8\u05d5\u05e4"}
      >
        <table className="table">
          <thead>
            <tr>
              <th>{"\u05e7\u05d5\u05d3"}</th>
              <th>{"\u05e9\u05dd"}</th>
              <th>{"\u05de\u05e0\u05d4\u05dc \u05e4\u05e8\u05d5\u05d9\u05e7\u05d8"}</th>
              <th>{"\u05e1\u05d8\u05d8\u05d5\u05e1"}</th>
              <th>{"\u05d9\u05e2\u05d3 \u05d0\u05db\u05dc\u05d5\u05e1"}</th>
              <th>{"\u05ea\u05d7\u05d6\u05d9\u05ea \u05d0\u05db\u05dc\u05d5\u05e1"}</th>
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
                    aria-label={`${"\u05e4\u05ea\u05d9\u05d7\u05ea \u05e4\u05e8\u05d5\u05d9\u05e7\u05d8"} ${p.name} ${"\u05dc\u05e2\u05d3\u05db\u05d5\u05df \u05de\u05d4\u05d9\u05e8"}`}
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
                    <div className="field-label">{"\u05e0\u05d9\u05d4\u05d5\u05dc: \u05d9\u05d3\u05e0\u05d9"}</div>
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
