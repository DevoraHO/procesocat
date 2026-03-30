import { VALIDATION_CONFIG as VC } from '../data/mockData';

export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getValidationType(distanceMeters: number): 'in_situ' | 'remote' | 'blocked' {
  if (distanceMeters <= VC.MAX_DISTANCE_INSITU) return 'in_situ';
  if (distanceMeters <= VC.MAX_DISTANCE_REMOTE) return 'remote';
  return 'blocked';
}

export function getValidationPoints(type: string): number {
  if (type === 'in_situ') return VC.POINTS_INSITU;
  if (type === 'remote') return VC.POINTS_REMOTE;
  return 0;
}

export function getTrustScore(type: string): number {
  if (type === 'in_situ') return VC.TRUST_SCORE_INSITU;
  if (type === 'remote') return VC.TRUST_SCORE_REMOTE;
  return 0;
}

export function checkBurstFraud(
  userValidations: any[],
  windowMinutes: number,
  maxCount: number
): boolean {
  const windowMs = windowMinutes * 60 * 1000;
  const now = Date.now();
  const recent = userValidations.filter(v =>
    now - new Date(v.created_at).getTime() < windowMs
  );
  return recent.length >= maxCount;
}

export function checkDailyLimit(
  userValidations: any[],
  plan: string
): boolean {
  const today = new Date().toDateString();
  const todayCount = userValidations.filter(v =>
    new Date(v.created_at).toDateString() === today
  ).length;
  const limit = plan === 'free'
    ? VC.MAX_VALIDATIONS_PER_DAY_FREE
    : VC.MAX_VALIDATIONS_PER_DAY_FAMILIAR;
  return todayCount >= limit;
}

export function checkSuspiciousPattern(
  userValidations: any[]
): boolean {
  if (userValidations.length < 5) return false;
  const lastFive = userValidations.slice(-5);
  const uniqueCoords = new Set(
    lastFive.map(v =>
      `${Math.round(v.user_lat * 1000)},${Math.round(v.user_lng * 1000)}`
    )
  );
  return uniqueCoords.size === 1;
}

export function formatDistance(meters: number, lang: string): string {
  if (meters < 1000) {
    return lang === 'ca'
      ? `${Math.round(meters)}m de distància`
      : `${Math.round(meters)}m de distancia`;
  }
  return lang === 'ca'
    ? `${(meters / 1000).toFixed(1)}km de distància`
    : `${(meters / 1000).toFixed(1)}km de distancia`;
}
