import { sampleForwardView } from "@/lib/domain/sample-data";

export default function ForwardViewPage() {
  return (
    <main className="container">
      <h1>מבט 30 יום</h1>
      <section className="card table-scroll" aria-label="מבט 30 יום בטבלה">
        <table className="table">
          <thead>
            <tr>
              <th>תאריך יעד</th>
              <th>פרויקט</th>
              <th>אבן דרך</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {sampleForwardView.map((i) => (
              <tr key={i.id}>
                <td>{i.targetDate}</td>
                <td>{i.projectName}</td>
                <td>{i.milestone}</td>
                <td>{i.statusHe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
