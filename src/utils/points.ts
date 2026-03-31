import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const POINTS = {
  REPORT: 50,
  VALIDATION_IN_SITU: 15,
  VALIDATION_REMOTE: 10,
  PHOTO: 10,
  REACTIVATE: 25,
  RESOLVE: 10,
} as const;

const RANKS = [
  { name: 'Observador', min: 0 },
  { name: 'Explorador', min: 501 },
  { name: 'Reportador', min: 1501 },
  { name: 'Verificador', min: 3001 },
  { name: 'Protector', min: 5001 },
  { name: 'Guardián', min: 8001 },
  { name: 'Vigilante', min: 12001 },
  { name: 'Defensor', min: 18001 },
  { name: 'Experto', min: 25001 },
  { name: 'Investigador', min: 35001 },
  { name: 'Guardián Sénior', min: 50001 },
  { name: 'Maestro', min: 65001 },
  { name: 'Élite de Cataluña', min: 80001 },
  { name: 'Héroe de Cataluña', min: 90001 },
  { name: 'Leyenda de Cataluña', min: 100000 },
];

function getRankForPoints(pts: number): string {
  let rank = 'Observador';
  for (const r of RANKS) {
    if (pts >= r.min) rank = r.name;
  }
  return rank;
}

export async function awardPoints(
  userId: string,
  amount: number,
  lang: string = 'es'
): Promise<number | null> {
  const { data: profile, error: fetchErr } = await supabase
    .from('profiles')
    .select('points, weekly_points')
    .eq('id', userId)
    .single();

  if (fetchErr || !profile) {
    console.error('Error fetching profile for points:', fetchErr);
    return null;
  }

  const newPoints = (profile.points || 0) + amount;
  const newWeekly = (profile.weekly_points || 0) + amount;
  const newRank = getRankForPoints(newPoints);

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ points: newPoints, weekly_points: newWeekly, rank: newRank })
    .eq('id', userId);

  if (updateErr) {
    console.error('Error updating points:', updateErr);
    return null;
  }

  // Show animated toast
  const label = lang === 'ca' ? 'punts' : 'puntos';
  toast.success(`🎉 +${amount} ${label}!`, {
    duration: 3000,
    style: { fontSize: '16px', fontWeight: 'bold' },
  });

  return newPoints;
}
