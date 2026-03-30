export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          banner_color: string;
          banner_image: string | null;
          language: string;
          plan: string;
          points: number;
          weekly_points: number;
          rank: string;
          pet_name: string | null;
          pet_type: string | null;
          referral_code: string | null;
          municipality_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      reports: {
        Row: {
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
          alert_type: string;
          created_at: string;
          updated_at: string;
          last_activity_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reports']['Row']> & {
          user_id: string; lat: number; lng: number; description: string; alert_type: string;
        };
        Update: Partial<Database['public']['Tables']['reports']['Row']>;
      };
      report_validations: {
        Row: {
          id: string;
          report_id: string;
          user_id: string;
          trust_score: number;
          distance_meters: number;
          validation_type: string;
          gps_accuracy: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['report_validations']['Row']> & {
          report_id: string; user_id: string; trust_score: number; distance_meters: number; validation_type: string;
        };
        Update: Partial<Database['public']['Tables']['report_validations']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title_es: string;
          title_ca: string;
          body_es: string;
          body_ca: string;
          read: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          user_id: string; type: string; title_es: string; title_ca: string; body_es: string; body_ca: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
      saved_zones: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          lat: number;
          lng: number;
          radius_km: number;
          alert_threshold: number;
          current_danger_score: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['saved_zones']['Row']> & {
          user_id: string; name: string; lat: number; lng: number;
        };
        Update: Partial<Database['public']['Tables']['saved_zones']['Row']>;
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
          progress: number;
          total: number;
        };
        Insert: Partial<Database['public']['Tables']['user_badges']['Row']> & {
          user_id: string; badge_id: string;
        };
        Update: Partial<Database['public']['Tables']['user_badges']['Row']>;
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'moderator' | 'user' | 'municipi';
        };
        Insert: { user_id: string; role: 'admin' | 'moderator' | 'user' | 'municipi' };
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>;
      };
    };
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'admin' | 'moderator' | 'user' | 'municipi';
    };
  };
}
