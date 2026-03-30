import { useAuth } from '@/contexts/AuthContext';
import { PLAN_LIMITS } from '@/data/mockData';

type PlanFeature = 'charts' | 'pdf_download' | 'municipi_dashboard' | 'export_data' | 'paseo_seguro' | 'push_notifications' | 'saved_zones' | 'video_upload';

const FEATURE_MAP: Record<PlanFeature, keyof typeof PLAN_LIMITS['free']> = {
  charts: 'weekly_pdf',
  pdf_download: 'weekly_pdf',
  municipi_dashboard: 'municipality_dashboard',
  export_data: 'data_export',
  paseo_seguro: 'paseo_seguro',
  push_notifications: 'push_notifications',
  saved_zones: 'saved_zones',
  video_upload: 'video_upload',
};

export const usePlanFeature = () => {
  const { user } = useAuth();
  const plan = (user?.plan || 'free') as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const canAccess = (feature: PlanFeature): boolean => {
    const key = FEATURE_MAP[feature];
    if (!key) return false;
    const val = limits[key];
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val !== 0;
    return false;
  };

  return { canAccess, plan, limits };
};
