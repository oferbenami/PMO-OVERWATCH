const TOPIC_BASELINE_OFFSETS: Record<number, number> = {
  1: -210,
  2: -150,
  3: -120,
  4: -90,
  5: -30,
  6: 30
};

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function addDays(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateOnly(date);
}

export function buildTopicBaselineDate(expectedAssetReceiptDate: string, topicIndex: number): string | null {
  const offset = TOPIC_BASELINE_OFFSETS[topicIndex];
  if (offset === undefined) return null;
  return addDays(expectedAssetReceiptDate, offset);
}

export function isValidDateInput(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
