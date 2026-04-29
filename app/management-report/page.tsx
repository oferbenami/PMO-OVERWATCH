import { sampleProjects } from "@/lib/domain/sample-data";

export default function ManagementReportPage() {
  return (
    <main className="container">
      <h1>דוח הנהלה</h1>
      <section className="card table-scroll" aria-label="דוח הנהלה בטבלה">
        <table className="table">
          <thead>
            <tr>
              <th>פרויקט</th>
              <th>מנהל</th>
              <th>סטטוס</th>
              <th>אבן חריגה</th>
              <th>נדרש טיפול הנהלה</th>
            </tr>
          </thead>
          <tbody>
            {sampleProjects.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.pmName}</td>
                <td>{p.statusHe}</td>
                <td>{p.exceptionMilestone}</td>
                <td>{p.requiresManagementAction ? "כן" : "לא"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
