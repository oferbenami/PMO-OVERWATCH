import { sampleProjectCard } from "@/lib/domain/sample-data";

export default function ProjectCardPage() {
  return (
    <main className="container grid">
      <h1>כרטיס פרויקט</h1>
      <section className="card">
        <strong>{sampleProjectCard.name}</strong>
        <p>מנהל פרויקט: {sampleProjectCard.pmName}</p>
        <p>צפי קבלת נכס: {sampleProjectCard.expectedAssetReceipt}</p>
      </section>
      <section className="card">
        <h2>נושאים</h2>
        <ul>
          {sampleProjectCard.topics.map((t) => (
            <li key={t.name}>
              {t.name} - {t.statusHe}
            </li>
          ))}
        </ul>
      </section>
      <section className="card">
        <h2>סיכום Snapshot אחרון</h2>
        <p>{sampleProjectCard.lastSnapshotSummary}</p>
      </section>
    </main>
  );
}
