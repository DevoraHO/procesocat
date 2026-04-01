import React, { createContext, useContext, useState, useCallback } from 'react';
import { safeStorage } from '@/utils/safeStorage';
import { VALIDATION_CONFIG as VC } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import {
  calculateDistance,
  getValidationType,
  getValidationPoints,
  getTrustScore,
  checkBurstFraud,
  checkDailyLimit,
  checkSuspiciousPattern,
} from '@/utils/validation';

export interface ValidationRecord {
  id: string;
  report_id: string;
  user_id: string;
  trust_score: number;
  distance_meters: number;
  type: 'in_situ' | 'remote';
  user_lat: number;
  user_lng: number;
  created_at: string;
  flagged?: boolean;
}

export interface ValidationResult {
  status: 'allowed' | 'remote' | 'blocked' | 'already_validated' | 'own_report' | 'daily_limit' | 'burst_limit' | 'gps_required' | 'gps_inaccurate';
  distance: number;
  validationType: 'in_situ' | 'remote' | null;
  points: number;
  trustScore: number;
  message_es: string;
  message_ca: string;
}

interface ValidationContextType {
  userValidations: ValidationRecord[];
  canValidate: (reportId: string, reportUserId: string, userLat: number | null, userLng: number | null, reportLat: number, reportLng: number, gpsAccuracy: number | null) => ValidationResult;
  submitValidation: (reportId: string, userLat: number, userLng: number, reportLat: number, reportLng: number) => ValidationRecord | null;
  cooldownRemaining: number;
  dailyCount: number;
  dailyLimit: number;
  mockGPS: { lat: number; lng: number } | null;
  setMockGPS: (gps: { lat: number; lng: number } | null) => void;
  fraudLog: ValidationRecord[];
}

const STORAGE_KEY = 'mock_validations';

function loadValidations(): ValidationRecord[] {
  try {
    const stored = safeStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  // Initial mock validations
  return [
    { id: 'v1', report_id: 'r2', user_id: '1', trust_score: 1.0, distance_meters: 45, type: 'in_situ', user_lat: 41.512, user_lng: 2.080, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'v2', report_id: 'r3', user_id: '1', trust_score: 0.5, distance_meters: 320, type: 'remote', user_lat: 41.388, user_lng: 2.168, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  ];
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export const ValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userValidations, setUserValidations] = useState<ValidationRecord[]>(loadValidations);
  const [mockGPS, setMockGPS] = useState<{ lat: number; lng: number } | null>(null);
  const [fraudLog, setFraudLog] = useState<ValidationRecord[]>([]);
  const { user } = useAuth();

  const plan = user?.plan || 'free';
  const dailyLimit = plan === 'free' ? VC.MAX_VALIDATIONS_PER_DAY_FREE : VC.MAX_VALIDATIONS_PER_DAY_FAMILIAR;
  const today = new Date().toDateString();
  const dailyCount = userValidations.filter(v => new Date(v.created_at).toDateString() === today).length;

  const cooldownRemaining = (() => {
    if (userValidations.length === 0) return 0;
    const last = userValidations[userValidations.length - 1];
    const elapsed = (Date.now() - new Date(last.created_at).getTime()) / 1000;
    const remaining = VC.COOLDOWN_MINUTES * 60 - elapsed;
    return remaining > 0 ? Math.ceil(remaining) : 0;
  })();

  const canValidate = useCallback((
    reportId: string,
    reportUserId: string,
    userLat: number | null,
    userLng: number | null,
    reportLat: number,
    reportLng: number,
    gpsAccuracy: number | null
  ): ValidationResult => {
    const noResult = (status: ValidationResult['status'], msg_es: string, msg_ca: string): ValidationResult => ({
      status, distance: 0, validationType: null, points: 0, trustScore: 0, message_es: msg_es, message_ca: msg_ca,
    });

    // Own report
    if (user && reportUserId === user.id) {
      return noResult('own_report', 'No puedes confirmar tu propio reporte', 'No pots confirmar el teu propi report');
    }

    // Already validated
    if (userValidations.some(v => v.report_id === reportId)) {
      return noResult('already_validated', 'Ya has confirmado este avistamiento', 'Ja has confirmat aquest avistament');
    }

    // GPS not available
    if (userLat === null || userLng === null) {
      return noResult('gps_required', 'Activa el GPS para confirmar', 'Activa el GPS per confirmar');
    }

    // GPS inaccurate
    if (gpsAccuracy !== null && gpsAccuracy > VC.GPS_MAX_ACCURACY_METERS) {
      return noResult('gps_inaccurate', `GPS poco preciso (${Math.round(gpsAccuracy)}m)`, `GPS poc precís (${Math.round(gpsAccuracy)}m)`);
    }

    // Daily limit
    if (checkDailyLimit(userValidations, plan)) {
      return noResult('daily_limit', `Límite diario alcanzado (${dailyCount}/${dailyLimit})`, `Límit diari assolit (${dailyCount}/${dailyLimit})`);
    }

    // Burst limit
    if (checkBurstFraud(userValidations, VC.BURST_WINDOW_MINUTES, VC.MAX_VALIDATIONS_BURST)) {
      return noResult('burst_limit', 'Espera un momento entre validaciones', 'Espera un moment entre validacions');
    }

    const distance = calculateDistance(userLat, userLng, reportLat, reportLng);
    const vType = getValidationType(distance);

    if (vType === 'blocked') {
      return {
        status: 'blocked',
        distance,
        validationType: null,
        points: 0,
        trustScore: 0,
        message_es: `Estás a ${distance < 1000 ? Math.round(distance) + 'm' : (distance / 1000).toFixed(1) + 'km'} del avistamiento`,
        message_ca: `Estàs a ${distance < 1000 ? Math.round(distance) + 'm' : (distance / 1000).toFixed(1) + 'km'} de l'avistament`,
      };
    }

    return {
      status: vType === 'in_situ' ? 'allowed' : 'remote',
      distance,
      validationType: vType,
      points: getValidationPoints(vType),
      trustScore: getTrustScore(vType),
      message_es: vType === 'in_situ'
        ? `Estás a ${Math.round(distance)}m · Verificación presencial`
        : `Estás a ${Math.round(distance)}m del avistamiento`,
      message_ca: vType === 'in_situ'
        ? `Estàs a ${Math.round(distance)}m · Verificació presencial`
        : `Estàs a ${Math.round(distance)}m de l'avistament`,
    };
  }, [userValidations, plan, dailyCount, dailyLimit]);

  const submitValidation = useCallback((
    reportId: string,
    userLat: number,
    userLng: number,
    reportLat: number,
    reportLng: number
  ): ValidationRecord | null => {
    const distance = calculateDistance(userLat, userLng, reportLat, reportLng);
    const vType = getValidationType(distance);
    if (vType === 'blocked') return null;

    let trustScore = getTrustScore(vType);
    const isSuspicious = checkSuspiciousPattern([...userValidations, { user_lat: userLat, user_lng: userLng }]);
    if (isSuspicious) trustScore = 0.3;

    const record: ValidationRecord = {
      id: `v${Date.now()}`,
      report_id: reportId,
      user_id: user?.id || 'anonymous',
      trust_score: trustScore,
      distance_meters: Math.round(distance),
      type: vType,
      user_lat: userLat,
      user_lng: userLng,
      created_at: new Date().toISOString(),
      flagged: isSuspicious,
    };

    const updated = [...userValidations, record];
    setUserValidations(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (isSuspicious) {
      setFraudLog(prev => [...prev, record]);
    }

    return record;
  }, [userValidations]);

  return (
    <ValidationContext.Provider value={{
      userValidations,
      canValidate,
      submitValidation,
      cooldownRemaining,
      dailyCount,
      dailyLimit,
      mockGPS,
      setMockGPS,
      fraudLog,
    }}>
      {children}
    </ValidationContext.Provider>
  );
};

export const useValidation = () => {
  const ctx = useContext(ValidationContext);
  if (!ctx) throw new Error('useValidation must be used within ValidationProvider');
  return ctx;
};
