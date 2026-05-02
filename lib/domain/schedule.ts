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

export function diffDays(leftDateIso: string, rightDateIso: string): number {
  const left = new Date(`${leftDateIso}T00:00:00Z`);
  const right = new Date(`${rightDateIso}T00:00:00Z`);
  return Math.floor((left.getTime() - right.getTime()) / (1000 * 60 * 60 * 24));
}

export function isMaterialForecastChange(previousForecastDate: string | null, nextForecastDate: string | null): boolean {
  if (!previousForecastDate || !nextForecastDate) return false;
  return Math.abs(diffDays(nextForecastDate, previousForecastDate)) > 3;
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
