import { supabase } from '@/integrations/supabase/client';
import type { AlertTypeKey } from '@/data/mockData';

// ═══════════════════════════════
// REPORTS
// ═══════════════════════════════

export interface Report {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  description: string;
  status: string;
  danger_score: number;
  validation_count: number;
  photos: string[];
  comarca: string | null;
  alert_type: AlertTypeKey;
  created_at: string;
  updated_at?: string;
  last_activity_at?: string;
}

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
  return (data || []) as Report[];
}

export async function fetchUserReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }
  return (data || []) as Report[];
}

export async function createReport(report: {
  user_id: string;
  lat: number;
  lng: number;
  description: string;
  alert_type: string;
  photos?: string[];
  comarca?: string;
  danger_score?: number;
}): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      ...report,
      status: 'ACTIVE',
      danger_score: report.danger_score || 50,
      validation_count: 0,
      photos: report.photos || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating report:', error);
    return null;
  }
  return data as Report;
}

export async function updateReport(id: string, updates: Partial<Report>): Promise<boolean> {
  const { error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating report:', error);
    return false;
  }
  return true;
}

// ═══════════════════════════════
// VALIDATIONS
// ═══════════════════════════════

export interface Validation {
  id: string;
  report_id: string;
  user_id: string;
  trust_score: number;
  distance_meters: number;
  validation_type: string;
  gps_accuracy: number | null;
  created_at: string;
}

export async function createValidation(validation: {
  report_id: string;
  user_id: string;
  trust_score: number;
  distance_meters: number;
  validation_type: string;
  gps_accuracy?: number | null;
}): Promise<Validation | null> {
  const { data, error } = await supabase
    .from('report_validations')
    .insert(validation)
    .select()
    .single();

  if (error) {
    console.error('Error creating validation:', error);
    return null;
  }
  return data as Validation;
}

export async function fetchValidationsForReport(reportId: string): Promise<Validation[]> {
  const { data, error } = await supabase
    .from('report_validations')
    .select('*')
    .eq('report_id', reportId);

  if (error) {
    console.error('Error fetching validations:', error);
    return [];
  }
  return (data || []) as Validation[];
}

// ═══════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data || [];
}

export async function markNotificationRead(id: string) {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
}

export async function markAllNotificationsRead(userId: string) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
}

// ═══════════════════════════════
// SAVED ZONES
// ═══════════════════════════════

export async function fetchSavedZones(userId: string) {
  const { data, error } = await supabase
    .from('saved_zones')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching saved zones:', error);
    return [];
  }
  return data || [];
}

export async function createSavedZone(zone: {
  user_id: string;
  name: string;
  lat: number;
  lng: number;
  radius_km?: number;
  alert_threshold?: number;
}) {
  const { data, error } = await supabase
    .from('saved_zones')
    .insert(zone)
    .select()
    .single();

  if (error) {
    console.error('Error creating saved zone:', error);
    return null;
  }
  return data;
}

// ═══════════════════════════════
// RANKING (from profiles)
// ═══════════════════════════════

export async function fetchRanking(limit = 50) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, rank, points, weekly_points, avatar_url, municipality_id')
    .order('points', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching ranking:', error);
    return [];
  }
  return data || [];
}

// ═══════════════════════════════
// USER BADGES
// ═══════════════════════════════

export async function fetchUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
  return data || [];
}

// ═══════════════════════════════
// PROFILES
// ═══════════════════════════════

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}
