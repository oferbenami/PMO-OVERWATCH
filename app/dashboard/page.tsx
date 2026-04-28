import { getDashboardProjects } from "@/lib/domain/projects";

export default async function DashboardPage() {
  const projects = await getDashboardProjects();

  return (
    <main className="container">
      <h1>דשבורד פרויקטים</h1>
      <table className="table card">
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
              <td>{p.name}</td>
              <td>{p.pmName}</td>
              <td>
                <span className="badge" style={{ background: p.statusColor }}>
                  {p.statusHe}
                </span>
              </td>
              <td>{p.occupancyTarget}</td>
              <td>{p.occupancyForecast}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
