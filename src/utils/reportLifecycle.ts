export const LIFECYCLE = {
  ACTIVE: 'ACTIVE',
  DECAYING: 'DECAYING',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED',
  RESOLVED: 'RESOLVED'
} as const;

export function getReportAge(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
}

export function getExpectedStatus(report: { created_at: string; last_activity_at?: string }): string {
  const lastActivity = (Date.now() - new Date(report.last_activity_at || report.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (lastActivity > 30) return LIFECYCLE.ARCHIVED;
  if (lastActivity > 15) return LIFECYCLE.INACTIVE;
  if (lastActivity > 7) return LIFECYCLE.DECAYING;
  return LIFECYCLE.ACTIVE;
}

export function updateLifecycle<T extends { created_at: string; last_activity_at?: string; status: string }>(reports: T[]): T[] {
  return reports.map(r => ({
    ...r,
    status: getExpectedStatus(r)
  }));
}

export function resetToActive<T extends { status: string; last_activity_at?: string }>(report: T): T {
  return {
    ...report,
    status: LIFECYCLE.ACTIVE,
    last_activity_at: new Date().toISOString()
  };
}
