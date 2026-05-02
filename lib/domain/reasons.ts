export const DELAY_REASONS = new Set([
  "approvals_regulation",
  "planning",
  "tender_procurement",
  "contractor_supplier",
  "budget_management_decision",
  "external_dependency",
  "site_asset_issue",
  "change_in_requirements",
  "other"
]);

export const FREEZE_REASONS = new Set([
  "regulation_approvals",
  "management_decision",
  "budget",
  "external_party_or_owner",
  "contractor_supplier",
  "operational_business_constraint",
  "other"
]);

export function isOtherReason(value: string | null | undefined): boolean {
  return value === "other";
}
