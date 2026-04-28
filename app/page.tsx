import Link from "next/link";

const screens = [
  ["/dashboard", "דשבורד פרויקטים"],
  ["/project/sample", "כרטיס פרויקט"],
  ["/quick-update", "עדכון מהיר"],
  ["/management-report", "דוח הנהלה"],
  ["/forward-view", "מבט 30 יום"],
  ["/lists", "ניהול רשימות"],
  ["/users", "ניהול משתמשים"]
] as const;

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <h1>PMO-OVERWATCH | גרסת בטא</h1>
        <p>מערכת לניהול לו"ז פרויקטי בינוי ושיפוץ - Phase 1</p>
      </div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        {screens.map(([href, label]) => (
          <Link key={href} className="card" href={href}>
            {label}
          </Link>
        ))}
      </div>
    </main>
  );
}
