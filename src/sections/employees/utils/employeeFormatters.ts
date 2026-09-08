/**
 * Reusable employee formatting and UX helpers for People Hub and Bulk Import
 */

export function isArchiveEmail(email?: string): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith("@archive.local");
}

export function formatEmployeeEmail(email?: string): string {
  if (!email || isArchiveEmail(email)) {
    return "—";
  }
  return email;
}

export function isExEmployee(status?: string, isActive?: boolean): boolean {
  if (isActive === false) return true;
  const upper = (status || "").toUpperCase();
  return upper === "RESIGNED" || upper === "TERMINATED" || upper === "INACTIVE";
}

export function formatEmployeeCodeMeta(code?: string): {
  displayCode: string;
  isArchive: boolean;
  badgeLabel?: string;
} {
  const c = (code || "").trim();
  if (!c) {
    return { displayCode: "—", isArchive: false };
  }
  if (c.includes("-EX-") || c.startsWith("EX-")) {
    return { displayCode: c, isArchive: true, badgeLabel: "Archive" };
  }
  return { displayCode: c, isArchive: false };
}
