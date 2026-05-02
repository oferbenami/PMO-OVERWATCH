import Link from "next/link";
import { getDashboardProjects } from "@/lib/domain/projects";

export default async function DashboardPage() {
  const projects = await getDashboardProjects();

  return (
    <main className="container">
      <h1>?????? ????????</h1>

      <section className="mobile-only mobile-list" aria-label="?????? ??????">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/project/${p.id}`}
            className="dashboard-mobile-link"
            aria-label={`????? ?????? ${p.name} ?????? ????`}
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
                  <div className="field-label">?????: ????</div>
                ) : null}
              </div>
              <div className="mobile-meta">
                <div>
                  <div className="field-label">???? ??????</div>
                  <div>{p.pmName}</div>
                </div>
                <div>
                  <div className="field-label">??? ?????</div>
                  <div>{p.occupancyTarget}</div>
                </div>
                <div>
                  <div className="field-label">????? ?????</div>
                  <div>{p.occupancyForecast}</div>
                </div>
              </div>
              <div className="field-label dashboard-open-hint">??? ??????</div>
            </article>
          </Link>
        ))}
      </section>

      <section className="desktop-only card" aria-label="?????? ??????">
        <table className="table">
          <thead>
            <tr>
              <th>???</th>
              <th>??</th>
              <th>???? ??????</th>
              <th>?????</th>
              <th>??? ?????</th>
              <th>????? ?????</th>
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
                    aria-label={`????? ?????? ${p.name} ?????? ????`}
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
                    <div className="field-label">?????: ????</div>
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
