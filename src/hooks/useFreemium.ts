import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const MONTHLY_REPORT_LIMIT = 3;
const PHOTOS_PER_REPORT = 2;

export const useFreemium = () => {
  const { user } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState<string | undefined>();

  const isFree = user?.plan === 'free';
  const isPremium = !isFree;

  const getMonthlyReportCount = useCallback((): number => {
    const key = `reports_${new Date().getFullYear()}_${new Date().getMonth()}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  }, []);

  const incrementReportCount = useCallback(() => {
    const key = `reports_${new Date().getFullYear()}_${new Date().getMonth()}`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(current + 1));
  }, []);

  const canReport = isPremium || getMonthlyReportCount() < MONTHLY_REPORT_LIMIT;
  const reportsRemaining = MONTHLY_REPORT_LIMIT - getMonthlyReportCount();
  const maxPhotos = PHOTOS_PER_REPORT;

  const showUpgrade = useCallback((trigger?: string) => {
    setUpgradeTrigger(trigger);
    setUpgradeOpen(true);
  }, []);

  const closeUpgrade = useCallback(() => {
    setUpgradeOpen(false);
    setUpgradeTrigger(undefined);
  }, []);

  return {
    isFree,
    isPremium,
    canReport,
    reportsRemaining,
    maxPhotos,
    incrementReportCount,
    upgradeOpen,
    upgradeTrigger,
    showUpgrade,
    closeUpgrade,
  };
};
