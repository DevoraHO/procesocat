import DOMPurify from 'dompurify';

export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
  PERMANENT_LOCKOUT_ATTEMPTS: 20,
  SESSION_TIMEOUT_HOURS: 1,
  REFRESH_TOKEN_DAYS: 7,
  MAX_DEVICES: 3,
  MIN_PASSWORD_LENGTH: 8,
  RATE_LIMITS: {
    auth: { requests: 10, windowMinutes: 1 },
    reportCreate: { requests: 5, windowMinutes: 1 },
    validation: { requests: 20, windowMinutes: 1 },
    general: { requests: 100, windowMinutes: 1 }
  },
  GPS_BOUNDS_SPAIN: {
    minLat: 36.0, maxLat: 43.9,
    minLng: -9.5, maxLng: 4.6
  },
  MAX_SPEED_KMH: 50,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],
  MAX_IMAGE_SIZE_MB: 5,
  MAX_VIDEO_SIZE_MB: 50,
  MAX_TEXT_LENGTH: 500,
  XSS_ALLOWED_TAGS: [] as string[]
};

export function sanitizeText(input: string): string {
  if (!input) return '';
  const cleaned = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  return cleaned.slice(0, SECURITY_CONFIG.MAX_TEXT_LENGTH).trim();
}

export function sanitizeHTML(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
}

export function isValidGPSCoords(lat: number, lng: number): boolean {
  const { minLat, maxLat, minLng, maxLng } = SECURITY_CONFIG.GPS_BOUNDS_SPAIN;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

export function detectImpossibleMovement(
  prevLat: number, prevLng: number, prevTime: number,
  newLat: number, newLng: number, newTime: number
): boolean {
  const R = 6371;
  const dLat = (newLat - prevLat) * Math.PI / 180;
  const dLng = (newLng - prevLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(prevLat * Math.PI / 180) * Math.cos(newLat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const timeHours = (newTime - prevTime) / 3600000;
  if (timeHours <= 0) return true;
  const speedKmh = distanceKm / timeHours;
  return speedKmh > SECURITY_CONFIG.MAX_SPEED_KMH;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!SECURITY_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato no permitido. Solo JPG, PNG, WEBP.' };
  }
  if (file.size > SECURITY_CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Imagen demasiado grande. Máx ${SECURITY_CONFIG.MAX_IMAGE_SIZE_MB}MB.` };
  }
  return { valid: true };
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!SECURITY_CONFIG.ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato no permitido. Solo MP4, MOV.' };
  }
  if (file.size > SECURITY_CONFIG.MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Vídeo demasiado grande. Máx ${SECURITY_CONFIG.MAX_VIDEO_SIZE_MB}MB.` };
  }
  return { valid: true };
}

export async function validateMimeType(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      arr.forEach(byte => header += byte.toString(16).padStart(2, '0'));
      const validHeaders: Record<string, string[]> = {
        'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffdb'],
        'image/png': ['89504e47'],
        'image/webp': ['52494646'],
        'video/mp4': ['00000020', '00000018', '66747970'],
        'video/quicktime': ['00000014', '6d6f6f76']
      };
      const allowed = Object.values(validHeaders).flat();
      resolve(allowed.some(h => header.startsWith(h.slice(0, 8))));
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

export function validatePassword(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  if (password.length < 8) errors.push('min8');
  if (!/[A-Z]/.test(password)) errors.push('uppercase');
  if (!/[0-9]/.test(password)) errors.push('number');
  const strength = password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password) ? 'strong' :
    errors.length === 0 ? 'medium' : 'weak';
  return { valid: errors.length === 0, strength, errors };
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recent = requests.filter(t => now - t < windowMs);
    if (recent.length >= limit) return false;
    this.requests.set(key, [...recent, now]);
    return true;
  }

  getWaitTime(key: string, limit: number, windowMs: number): number {
    const requests = this.requests.get(key) || [];
    if (requests.length < limit) return 0;
    const oldest = Math.min(...requests);
    return Math.max(0, windowMs - (Date.now() - oldest));
  }
}

export const rateLimiter = new RateLimiter();

export function getLoginAttempts(email: string): number {
  const data = JSON.parse(safeStorage.getItem('login_attempts') || '{}');
  return data[email]?.count || 0;
}

export function recordLoginAttempt(email: string, success: boolean): void {
  const data = JSON.parse(safeStorage.getItem('login_attempts') || '{}');
  if (success) {
    delete data[email];
  } else {
    data[email] = {
      count: (data[email]?.count || 0) + 1,
      lastAttempt: Date.now()
    };
  }
  safeStorage.setItem('login_attempts', JSON.stringify(data));
}

export function isAccountLocked(email: string): {
  locked: boolean;
  permanent: boolean;
  remainingMinutes: number;
} {
  const data = JSON.parse(safeStorage.getItem('login_attempts') || '{}');
  const record = data[email];
  if (!record) return { locked: false, permanent: false, remainingMinutes: 0 };

  if (record.count >= SECURITY_CONFIG.PERMANENT_LOCKOUT_ATTEMPTS) {
    return { locked: true, permanent: true, remainingMinutes: 0 };
  }

  if (record.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    const lockoutMs = SECURITY_CONFIG.LOCKOUT_MINUTES * 60 * 1000;
    const elapsed = Date.now() - record.lastAttempt;
    if (elapsed < lockoutMs) {
      return {
        locked: true,
        permanent: false,
        remainingMinutes: Math.ceil((lockoutMs - elapsed) / 60000)
      };
    }
  }

  return { locked: false, permanent: false, remainingMinutes: 0 };
}

export interface SessionInfo {
  id: string;
  device: string;
  ip: string;
  location: string;
  createdAt: string;
  lastActive: string;
  current: boolean;
}

export function getActiveSessions(): SessionInfo[] {
  return JSON.parse(safeStorage.getItem('active_sessions') || '[]');
}

export function addSession(deviceInfo: string): string {
  const sessions = getActiveSessions();
  const sessionId = Math.random().toString(36).substring(2);
  const newSession: SessionInfo = {
    id: sessionId,
    device: deviceInfo,
    ip: '192.168.1.1',
    location: 'Barcelona, España',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    current: true
  };
  const updatedSessions = [newSession,
    ...sessions.map(s => ({ ...s, current: false }))]
    .slice(0, SECURITY_CONFIG.MAX_DEVICES);
  localStorage.setItem('active_sessions', JSON.stringify(updatedSessions));
  return sessionId;
}

export function removeSession(sessionId: string): void {
  const sessions = getActiveSessions();
  localStorage.setItem('active_sessions',
    JSON.stringify(sessions.filter(s => s.id !== sessionId)));
}

export interface SecurityLog {
  id: string;
  type: string;
  details: Record<string, unknown>;
  timestamp: string;
  ip: string;
}

export function logSecurityEvent(type: string, details: Record<string, unknown>): void {
  const logs: SecurityLog[] = JSON.parse(localStorage.getItem('security_logs') || '[]');
  logs.unshift({
    id: Math.random().toString(36).substring(2),
    type,
    details,
    timestamp: new Date().toISOString(),
    ip: '192.168.1.1'
  });
  localStorage.setItem('security_logs', JSON.stringify(logs.slice(0, 100)));
}

export function getSecurityLogs(): SecurityLog[] {
  return JSON.parse(localStorage.getItem('security_logs') || '[]');
}

export const mockSessions: SessionInfo[] = [
  {
    id: 'sess1',
    device: 'Chrome — MacBook Pro',
    ip: '192.168.1.1',
    location: 'Barcelona, España',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    current: true
  },
  {
    id: 'sess2',
    device: 'Safari — iPhone 15',
    ip: '192.168.1.2',
    location: 'Mollet del Vallès, España',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    current: false
  }
];
