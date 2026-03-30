import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface DangerBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const getLevel = (score: number) => {
  if (score <= 20) return { key: 'green', bg: 'bg-green-500', text: 'text-white' };
  if (score <= 40) return { key: 'yellow', bg: 'bg-yellow-400', text: 'text-yellow-900' };
  if (score <= 60) return { key: 'orange', bg: 'bg-orange-500', text: 'text-white' };
  if (score <= 80) return { key: 'red', bg: 'bg-red-600', text: 'text-white' };
  return { key: 'purple', bg: 'bg-purple-700', text: 'text-white' };
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5'
};

const DangerBadge = ({ score, size = 'md' }: DangerBadgeProps) => {
  const { t } = useTranslation();
  const level = getLevel(score);

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-medium', level.bg, level.text, sizeClasses[size])}>
      {score} — {t(`danger.${level.key}`)}
    </span>
  );
};

export default DangerBadge;
