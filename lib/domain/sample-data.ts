import { ProjectDashboardRow } from "@/types/domain";

export const sampleProjects: ProjectDashboardRow[] = [
  {
    id: "p1",
    code: "PRJ-001",
    name: "סניף ירושלים מרכז",
    pmName: "נועה כהן",
    occupancyTarget: "2026-09-01",
    occupancyForecast: "2026-09-10",
    status: "at_risk",
    statusHe: "בסיכון",
    statusColor: "#C05621",
    exceptionMilestone: "אישור ועדת התקשרויות",
    requiresManagementAction: false
  },
  {
    id: "p2",
    code: "PRJ-002",
    name: "סניף חיפה מזרח",
    pmName: "יוסי לוי",
    occupancyTarget: "2026-07-15",
    occupancyForecast: "2026-08-02",
    status: "delayed",
    statusHe: "באיחור",
    statusColor: "#C53030",
    exceptionMilestone: "אישור אכלוס עירייה",
    requiresManagementAction: true
  }
];

export const sampleProjectCard = {
  name: "סניף ירושלים מרכז",
  pmName: "נועה כהן",
  expectedAssetReceipt: "2026-06-01",
  topics: [
    { name: "איתור ואישור נכס", statusHe: "הושלם" },
    { name: "תכנון", statusHe: "בסיכון" },
    { name: "מכרזים", statusHe: "תקין" },
    { name: "ביצוע עד אכלוס", statusHe: "תקין" },
    { name: "אישורים ואכלוס", statusHe: "לא התחיל" }
  ],
  lastSnapshotSummary: "שינוי תחזית אכלוס: +3 ימים מול שבוע קודם"
};

export const sampleForwardView = [
  { id: "f1", targetDate: "2026-05-03", projectName: "סניף חיפה מזרח", milestone: "אישור בטיחות", statusHe: "באיחור" },
  { id: "f2", targetDate: "2026-05-06", projectName: "סניף ירושלים מרכז", milestone: "סגירת תקרה", statusHe: "בסיכון" }
];
